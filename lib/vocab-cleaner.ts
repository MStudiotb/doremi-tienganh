/**
 * Vocab cleaner — strips noise from RAG-parsed vocabulary before
 * it is shown in multiple-choice answer options.
 *
 * Problems solved:
 *  1. Phonetic notation leaking into option labels (/ænt/, [kap])
 *  2. Full RAG paragraph used as a meaning (too long)
 *  3. Grammar blanks using unrelated distractors (e.g. "banana" for "___ years old")
 */

// ── Regex patterns ─────────────────────────────────────────────────────────

/** Matches IPA between / / or [ ] */
const PHONETIC_RE = /\/[^\s/]{1,20}\/|\[[^\]]{1,20}\]/g

/** Matches parenthetical annotations like (adj.), (n.), (informal), (US) */
const ANNOTATION_RE = /\([^)]{0,30}\)/g

/** Matches leftover punctuation clusters after stripping */
const NOISE_RE = /[—–·•●▸▪»« -⁯﻿]+/g

// ── Core cleaners ──────────────────────────────────────────────────────────

function stripNoise(raw: string): string {
  return raw
    .replace(PHONETIC_RE, "")
    .replace(ANNOTATION_RE, "")
    .replace(NOISE_RE, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Clean a Vietnamese/English meaning for display as an answer option.
 * Returns null when the result is unusable (empty or > maxWords words).
 */
export function cleanMeaning(raw: string | undefined, maxWords = 5): string | null {
  if (!raw) return null
  const text = stripNoise(raw)
  if (!text) return null

  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return null

  // Truncate to maxWords — keeps the most informative first words
  return words.slice(0, maxWords).join(" ")
}

/**
 * Clean an English word/short phrase for use as an answer option.
 * Returns null when the result is unusable (empty or > 3 words).
 */
export function cleanWord(raw: string | undefined, maxWords = 3): string | null {
  if (!raw) return null
  const text = stripNoise(raw).toLowerCase()
  if (!text) return null

  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0 || words.length > maxWords) return null

  return words.join(" ")
}

/**
 * Build a clean meaning pool from an array of raw meanings.
 * Deduplicates and removes nulls.
 */
export function buildMeaningPool(
  rawMeanings: (string | undefined)[],
  exclude: string,
): string[] {
  const seen = new Set<string>([exclude.toLowerCase()])
  const pool: string[] = []
  for (const raw of rawMeanings) {
    const cleaned = cleanMeaning(raw)
    if (!cleaned) continue
    const key = cleaned.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      pool.push(cleaned)
    }
  }
  return pool
}

/**
 * Build a clean word pool from an array of raw words.
 * Deduplicates and removes nulls.
 */
export function buildWordPool(
  rawWords: (string | undefined)[],
  exclude: string,
): string[] {
  const seen = new Set<string>([exclude.toLowerCase()])
  const pool: string[] = []
  for (const raw of rawWords) {
    const cleaned = cleanWord(raw)
    if (!cleaned) continue
    if (!seen.has(cleaned)) {
      seen.add(cleaned)
      pool.push(cleaned)
    }
  }
  return pool
}

// ── Number-context logic ───────────────────────────────────────────────────

export const NUMBER_WORDS: readonly string[] = [
  "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
]

const NUMBER_WORD_SET = new Set(NUMBER_WORDS)

/** True when the target word itself is a cardinal number */
export function isNumberWord(word: string): boolean {
  return NUMBER_WORD_SET.has(word.toLowerCase())
}

/**
 * True when the sentence's blank likely requires a number.
 * Triggers on sentences about age, quantity, or counting.
 */
export function isNumberContextSentence(sentence: string, blankWord: string): boolean {
  if (isNumberWord(blankWord)) return true
  const lower = sentence.toLowerCase()
  const triggers = ["years old", "how many", "how old", "count", "number", "years", "months", "days"]
  return triggers.some((t) => lower.includes(t))
}

/**
 * Return n number words to use as distractors, excluding the correct answer.
 */
export function getNumberDistractors(correct: string, n = 3): string[] {
  return NUMBER_WORDS.filter((w) => w !== correct.toLowerCase())
    .sort(() => Math.random() - 0.5)
    .slice(0, n)
}

// ── Generic safe-pick helper ───────────────────────────────────────────────

/**
 * Pick n wrong answers from a pre-cleaned pool.
 * Falls back to number words if the pool is too small and the context demands it.
 */
export function pickDistractors(
  correct: string,
  cleanPool: string[],
  n = 3,
  isNumberCtx = false,
): string[] {
  const filtered = cleanPool.filter((x) => x.toLowerCase() !== correct.toLowerCase())
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  const taken = shuffled.slice(0, n)

  // Pad with number words if context says so and pool was too small
  if (taken.length < n && isNumberCtx) {
    const extra = getNumberDistractors(correct, n - taken.length)
    return [...taken, ...extra].slice(0, n)
  }

  return taken
}
