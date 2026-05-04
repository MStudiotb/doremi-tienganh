import type { VocabItem } from "./lesson-seed"

// ── Offline vocabulary parser ──────────────────────────────────────────────
// Parses raw RAG text into VocabItem[] without any network call.
// Handles common vocab-list formats found in PDF/DOCX extracts:
//   • word /phonetic/ meaning
//   • word [phonetic] meaning
//   • word - meaning
//   • word: meaning
//   • word\tmeaning
//   • word\tphonetic\tmeaning

const IPA_RE = /\/[^\s/]{1,20}\/|\[[^\]]{1,20}\]/
const VI_DIACRITIC = /[àáảãạăắặằẳẵâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i

function parseLine(line: string): VocabItem | null {
  const t = line.trim()
  if (!t || t.length > 160) return null
  if (!/[a-zA-Z]/.test(t)) return null

  let word = ""
  let phonetic = ""
  let meaning = ""

  const ipaMatch = t.match(IPA_RE)
  if (ipaMatch) {
    // Pattern: word /phonetic/ meaning
    const idx = t.indexOf(ipaMatch[0])
    word = t.slice(0, idx).trim()
    phonetic = ipaMatch[0]
    meaning = t.slice(idx + ipaMatch[0].length).trim()
  } else if (t.includes("\t")) {
    // Pattern: tab-separated columns
    const parts = t.split("\t").map((p) => p.trim()).filter(Boolean)
    word = parts[0] ?? ""
    if (parts.length >= 3) {
      phonetic = parts[1]
      meaning = parts[2]
    } else if (parts.length === 2) {
      // Decide if second column is meaning (Vietnamese) or phonetic
      if (VI_DIACRITIC.test(parts[1]) || /\s/.test(parts[1])) {
        meaning = parts[1]
      } else {
        phonetic = parts[1]
      }
    }
  } else {
    // Pattern: word [-–—:=] meaning
    const sep = t.match(/^([a-zA-Z][a-zA-Z\s''.-]{0,30}?)\s*[-–—:=]\s*(.{2,80})$/)
    if (sep) {
      word = sep[1].trim()
      meaning = sep[2].trim()
    }
  }

  if (!word) return null
  const wordClean = word.toLowerCase().replace(/[^a-z\s'-]/g, "").trim()
  if (!wordClean) return null
  const wordParts = wordClean.split(/\s+/).filter(Boolean)
  if (wordParts.length === 0 || wordParts.length > 3) return null
  if (!meaning && !phonetic) return null

  return { word: wordClean, phonetic, meaning: meaning.slice(0, 80).trim() }
}

export function parseVocabOffline(ragText: string): VocabItem[] {
  const seen = new Set<string>()
  const items: VocabItem[] = []
  for (const line of ragText.split("\n")) {
    const item = parseLine(line)
    if (!item || seen.has(item.word)) continue
    seen.add(item.word)
    items.push(item)
    if (items.length >= 60) break
  }
  return items
}

// ── localStorage cache ─────────────────────────────────────────────────────
const CACHE_PREFIX = "doremi_vocab_parse_"

function fnv1a(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(36)
}

type CacheEntry = { vocabulary: VocabItem[]; cachedAt: number }

function readCache(ragText: string): VocabItem[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + fnv1a(ragText))
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    return Array.isArray(entry.vocabulary) ? entry.vocabulary : null
  } catch {
    return null
  }
}

function writeCache(ragText: string, vocabulary: VocabItem[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      CACHE_PREFIX + fnv1a(ragText),
      JSON.stringify({ vocabulary, cachedAt: Date.now() }),
    )
  } catch {
    // quota exceeded — skip
  }
}

// ── Public API (kept synchronous — no network involved) ────────────────────
export type ParseResult =
  | { ok: true; vocabulary: VocabItem[]; fromCache: boolean }
  | { ok: false; error: string; vocabulary: VocabItem[] }

export function parseRagVocabulary(ragText: string): ParseResult {
  if (!ragText.trim()) return { ok: true, vocabulary: [], fromCache: false }

  const cached = readCache(ragText)
  if (cached !== null) return { ok: true, vocabulary: cached, fromCache: true }

  const vocabulary = parseVocabOffline(ragText)
  writeCache(ragText, vocabulary)
  return { ok: true, vocabulary, fromCache: false }
}

export function clearVocabParseCache(): void {
  if (typeof window === "undefined") return
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(CACHE_PREFIX)) toRemove.push(k)
  }
  toRemove.forEach((k) => localStorage.removeItem(k))
}
