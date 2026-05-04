"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Trophy,
  Volume2,
  X,
  XCircle,
  Edit3,
} from "lucide-react"
import { DirectInputModal } from "@/components/lessons/DirectInputModal"
import { parseRagIntoUnits, smartStart1Units, type LessonUnit, type VocabItem } from "@/lib/lesson-seed"
import { parseVocabOffline } from "@/lib/parse-rag-client"
import {
  buildMeaningPool,
  buildWordPool,
  cleanMeaning,
  cleanWord,
  getNumberDistractors,
  isNumberContextSentence,
  pickDistractors,
} from "@/lib/vocab-cleaner"
import { CompletionCelebration } from "@/components/lessons/CompletionCelebration"

// ── IDB loader ─────────────────────────────────────────────────────────────
type RagResource = {
  id: string
  fileName: string
  ragText: string
  schoolLevel: string
  namespace: "primary_data" | "secondary_data" | "highschool_data"
}

async function loadAllUnitsWithRag(): Promise<LessonUnit[]> {
  const rag: RagResource[] = await new Promise((resolve) => {
    const req = indexedDB.open("doremi_rag_database", 1)
    req.onerror = () => resolve([])
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains("rag_resources")) {
        const store = db.createObjectStore("rag_resources", { keyPath: "id" })
        store.createIndex("by-namespace", "namespace")
        store.createIndex("by-created-at", "createdAt")
      }
    }
    req.onsuccess = () => {
      const db = req.result
      if (!db.objectStoreNames.contains("rag_resources")) { resolve([]); return }
      const getAllReq = db.transaction("rag_resources", "readonly").objectStore("rag_resources").getAll()
      getAllReq.onsuccess = () => resolve(getAllReq.result as RagResource[])
      getAllReq.onerror = () => resolve([])
    }
  })

  const idbUnits: LessonUnit[] = []

  for (const r of rag) {
    // Extract grade from filename for consistency
    const gradeMatch = r.fileName.match(/lop\s*(\d+)/i) || r.fileName.match(/grade\s*(\d+)/i)
    const grade = gradeMatch ? parseInt(gradeMatch[1], 10) : undefined

    const parsed = parseRagIntoUnits(r.ragText, r.namespace, r.id)
    if (parsed.length > 0) {
      // Fill in missing vocab via offline parser
      const offlineVocab = parseVocabOffline(r.ragText)
      // FIXED: Use same ID format as list page: ${res.id}-${unitIndex}
      parsed.forEach((u, unitIndex) => {
        idbUnits.push({
          ...(u.vocabulary.length === 0 ? { ...u, vocabulary: offlineVocab } : u),
          id: `${r.id}-${unitIndex}`,
          title: u.title || `${r.fileName} - Phần ${unitIndex + 1}`,
          topic: grade ? `Lớp ${grade} - ${r.fileName}` : r.fileName,
          grade,
        })
      })
    } else if (r.ragText?.trim()) {
      const vocabulary = parseVocabOffline(r.ragText)
      const unit: LessonUnit = {
        id: `${r.id}-0`, // FIXED: Add -0 suffix for consistency
        unitNumber: idbUnits.length + 1,
        title: r.fileName.replace(/\.[^.]+$/, ""),
        topic: grade ? `Lớp ${grade} - ${r.fileName}` : r.schoolLevel,
        namespace: r.namespace,
        vocabulary,
        sentences: r.ragText
          .split("\n")
          .filter((l) => /[.!?]$/.test(l.trim()) && l.trim().length > 8)
          .slice(0, 4)
          .map((l) => l.trim()),
        skillTags: ["Từ vựng"],
        source: "idb",
        grade,
      }
      idbUnits.push(unit)
    }
  }

  const idbIds = new Set(idbUnits.map((u) => u.id))
  return [...idbUnits, ...smartStart1Units.filter((u) => !idbIds.has(u.id))]
}

// ── TTS ────────────────────────────────────────────────────────────────────
function speak(text: string, rate = 0.82) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = "en-US"
  utt.rate = rate
  window.speechSynthesis.speak(utt)
}

// ── Question types ─────────────────────────────────────────────────────────
type Part = 1 | 2 | 3 | 4

type P1Q = { part: 1; id: string; word: string; phonetic: string; options: string[]; correctIndex: number }
type P2Q = { part: 2; id: string; meaning: string; phonetic: string; word: string; options: string[]; correctIndex: number }
type P3Q = { part: 3; id: string; word: string; phonetic: string; meaning: string }
type P4Q = { part: 4; id: string; word: string; phonetic: string; displayMeaning: string; isCorrect: boolean }
type LQ = P1Q | P2Q | P3Q | P4Q

type AnswerRecord = { questionId: string; correct: boolean }

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

function buildPart1(vocab: VocabItem[], allVocab: VocabItem[]): P1Q[] {
  // Fallback distractors for small vocabulary sets
  const fallbackMeanings = [
    "con chó", "con mèo", "quả táo", "quả chuối", "màu đỏ", "màu xanh",
    "ngôi nhà", "chiếc xe", "quyển sách", "cái bàn", "cái ghế", "cửa sổ",
    "người mẹ", "người cha", "em bé", "học sinh", "giáo viên", "bác sĩ",
    "ăn", "uống", "chạy", "nhảy", "đọc", "viết", "nói", "nghe"
  ]
  
  return vocab
    .map((v) => {
      const correctMeaning = cleanMeaning(v.meaning)
      if (!correctMeaning) return null
      const pool = buildMeaningPool(allVocab.map((a) => a.meaning), correctMeaning)
      let wrongs = pickDistractors(correctMeaning, pool)
      
      // FIXED: If not enough distractors, use fallback meanings
      if (wrongs.length < 3) {
        const availableFallbacks = fallbackMeanings.filter(f => 
          f !== correctMeaning && !wrongs.includes(f)
        )
        while (wrongs.length < 3 && availableFallbacks.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableFallbacks.length)
          wrongs.push(availableFallbacks.splice(randomIndex, 1)[0])
        }
      }
      
      // Still not enough? Skip this question
      if (wrongs.length < 3) return null
      
      const options = shuffle([correctMeaning, ...wrongs.slice(0, 3)])
      return { part: 1 as const, id: `p1-${v.word}`, word: v.word, phonetic: v.phonetic ?? "", options, correctIndex: options.indexOf(correctMeaning) }
    })
    .filter(Boolean) as P1Q[]
}

function buildPart2(vocab: VocabItem[], allVocab: VocabItem[]): P2Q[] {
  // Fallback distractors for small vocabulary sets
  const fallbackWords = [
    "dog", "cat", "apple", "banana", "red", "blue", "green", "yellow",
    "house", "car", "book", "table", "chair", "window", "door", "pen",
    "mother", "father", "baby", "student", "teacher", "doctor", "nurse",
    "eat", "drink", "run", "jump", "read", "write", "speak", "listen"
  ]
  
  return vocab
    .map((v) => {
      const correctMeaning = cleanMeaning(v.meaning)
      const correctWord = cleanWord(v.word)
      if (!correctMeaning || !correctWord) return null
      const pool = buildWordPool(allVocab.map((a) => a.word), correctWord)
      let wrongs = pickDistractors(correctWord, pool)
      
      // FIXED: If not enough distractors, use fallback words
      if (wrongs.length < 3) {
        const availableFallbacks = fallbackWords.filter(f => 
          f.toLowerCase() !== correctWord.toLowerCase() && !wrongs.includes(f)
        )
        while (wrongs.length < 3 && availableFallbacks.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableFallbacks.length)
          wrongs.push(availableFallbacks.splice(randomIndex, 1)[0])
        }
      }
      
      // Still not enough? Skip this question
      if (wrongs.length < 3) return null
      
      const options = shuffle([correctWord, ...wrongs.slice(0, 3)])
      return { part: 2 as const, id: `p2-${v.word}`, meaning: correctMeaning, phonetic: v.phonetic ?? "", word: correctWord, options, correctIndex: options.indexOf(correctWord) }
    })
    .filter(Boolean) as P2Q[]
}

function buildPart3(vocab: VocabItem[]): P3Q[] {
  return vocab
    .map((v) => {
      const word = cleanWord(v.word)
      if (!word) return null
      return { part: 3 as const, id: `p3-${v.word}`, word, phonetic: v.phonetic ?? "", meaning: cleanMeaning(v.meaning) ?? "" }
    })
    .filter(Boolean) as P3Q[]
}

function buildPart4(vocab: VocabItem[], allVocab: VocabItem[]): P4Q[] {
  // Fallback meanings for wrong answers
  const fallbackMeanings = [
    "con chó", "con mèo", "quả táo", "quả chuối", "màu đỏ", "màu xanh",
    "ngôi nhà", "chiếc xe", "quyển sách", "cái bàn", "cái ghế", "cửa sổ",
    "người mẹ", "người cha", "em bé", "học sinh", "giáo viên", "bác sĩ",
    "ăn", "uống", "chạy", "nhảy", "đọc", "viết", "nói", "nghe"
  ]
  
  return vocab
    .map((v, i) => {
      const word = cleanWord(v.word)
      const correctMeaning = cleanMeaning(v.meaning)
      if (!word || !correctMeaning) return null
      const isCorrect = i % 2 === 0
      let displayMeaning: string
      if (isCorrect) {
        displayMeaning = correctMeaning
      } else {
        // Pick a cleaned wrong meaning from the pool
        const wrongPool = buildMeaningPool(allVocab.map((a) => a.meaning), correctMeaning)
        if (wrongPool.length > 0) {
          displayMeaning = wrongPool[Math.floor(Math.random() * wrongPool.length)]
        } else {
          // FIXED: Use fallback if no wrong meanings available
          const availableFallbacks = fallbackMeanings.filter(f => f !== correctMeaning)
          displayMeaning = availableFallbacks.length > 0
            ? availableFallbacks[Math.floor(Math.random() * availableFallbacks.length)]
            : correctMeaning
        }
      }
      return { part: 4 as const, id: `p4-${v.word}`, word, phonetic: v.phonetic ?? "", displayMeaning, isCorrect }
    })
    .filter(Boolean) as P4Q[]
}

// Grammar-blank builder used in Part 3 (sentence drill variant not in lessons, kept for completeness)
function buildGrammarBlank(sentence: string, allVocab: VocabItem[]) {
  const stripped = sentence.replace(/[.!?]$/, "")
  const words = stripped.split(" ")
  const SKIP = new Set(["i","you","he","she","it","we","they","a","an","the","is","am","are","my","your","this","that","to","of","in","on"])
  const candidates = words.filter((w) => !SKIP.has(w.toLowerCase()) && w.length > 2)
  if (candidates.length === 0) return null
  const target = candidates[Math.floor(Math.random() * candidates.length)]
  const targetLow = target.toLowerCase()
  const isNumCtx = isNumberContextSentence(sentence, targetLow)
  const wrongs = isNumCtx
    ? getNumberDistractors(targetLow)
    : pickDistractors(targetLow, buildWordPool(allVocab.map((v) => v.word), targetLow))
  if (wrongs.length < 3) return null
  return { blanked: sentence.replace(target, "_____"), target: targetLow, options: shuffle([targetLow, ...wrongs]) }
}
// suppress unused warning — kept for future sentence-drill features
void buildGrammarBlank

const PART_LABELS: Record<Part, string> = {
  1: "Anh → Việt",
  2: "Việt → Anh",
  3: "Nghe & Gõ",
  4: "Đúng / Sai",
}
const PART_COLORS: Record<Part, string> = {
  1: "oklch(0.68 0.22 200)",
  2: "oklch(0.72 0.26 285)",
  3: "oklch(0.72 0.24 55)",
  4: "oklch(0.72 0.28 320)",
}

const spring = { type: "spring" as const, stiffness: 250, damping: 22 }

// ── Reusable answer button ─────────────────────────────────────────────────
function OptionButton({
  label,
  index,
  revealed,
  isCorrect,
  isSelected,
  onSelect,
}: {
  label: string
  index: number
  revealed: boolean
  isCorrect: boolean
  isSelected: boolean
  onSelect: () => void
}) {
  const showCorrect = revealed && isCorrect
  const showWrong = revealed && isSelected && !isCorrect

  return (
    <motion.button
      type="button"
      disabled={revealed}
      onClick={onSelect}
      whileHover={!revealed ? { scale: 1.025, y: -2 } : {}}
      whileTap={!revealed ? { scale: 0.97 } : {}}
      transition={spring}
      className="flex items-center gap-3 rounded-xl p-4 text-left text-sm font-semibold disabled:cursor-default"
      style={
        showCorrect
          ? { background: "oklch(0.26 0.1 165/0.6)", border: "1px solid oklch(0.62 0.2 165)", color: "oklch(0.88 0.15 165)", boxShadow: "0 0 16px oklch(0.62 0.2 165/0.3)" }
          : showWrong
            ? { background: "oklch(0.22 0.1 0/0.5)", border: "1px solid oklch(0.62 0.2 15)", color: "oklch(0.82 0.15 15)" }
            : isSelected && !revealed
              ? { background: "oklch(0.25 0.08 285/0.7)", border: "1px solid oklch(0.65 0.22 300)", color: "white" }
              : { background: "oklch(0.18 0.06 280/0.6)", border: "1px solid oklch(0.4 0.1 280/0.3)", color: "oklch(0.78 0.08 280)" }
      }
    >
      <span
        className="grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-black"
        style={{
          background: showCorrect ? "oklch(0.62 0.2 165)" : showWrong ? "oklch(0.58 0.2 15)" : "oklch(0.25 0.07 280)",
          color: showCorrect || showWrong ? "white" : "oklch(0.65 0.15 280)",
        }}
      >
        {showCorrect ? <CheckCircle2 className="size-3.5" /> : showWrong ? <XCircle className="size-3.5" /> : ["A", "B", "C", "D"][index]}
      </span>
      {label}
    </motion.button>
  )
}

// ── Vocab review panel ─────────────────────────────────────────────────────
function VocabPanel({ vocab, onClose }: { vocab: VocabItem[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ background: "rgba(4,3,18,0.65)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col overflow-hidden"
        style={{
          background: "linear-gradient(160deg,oklch(0.17 0.07 280/0.97),oklch(0.13 0.05 265/0.98))",
          borderLeft: "1px solid oklch(0.5 0.15 300/0.25)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <BookOpen className="size-4 text-[oklch(0.72_0.22_200)]" />
            Từ vựng bài học ({vocab.length} từ)
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-xl text-white/35 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {vocab.map((v) => (
              <div
                key={v.word}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: "oklch(0.18 0.06 280/0.5)", border: "1px solid oklch(0.4 0.1 280/0.2)" }}
              >
                <button
                  type="button"
                  onClick={() => speak(v.word)}
                  className="grid size-8 shrink-0 place-items-center rounded-xl text-[oklch(0.72_0.22_200)] transition-colors hover:bg-white/10"
                  aria-label={`Phát âm ${v.word}`}
                >
                  <Volume2 className="size-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-white">{v.word}</span>
                    {v.phonetic && <span className="text-xs text-[oklch(0.7_0.18_200)]">{v.phonetic}</span>}
                  </div>
                  {v.meaning && <span className="text-sm text-white/55">{v.meaning}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Results screen ─────────────────────────────────────────────────────────
function ResultsScreen({
  unit,
  answers,
  totalQuestions,
  onRetry,
  onBack,
}: {
  unit: LessonUnit
  answers: AnswerRecord[]
  totalQuestions: number
  onRetry: () => void
  onBack: () => void
}) {
  const correct = answers.filter((a) => a.correct).length
  const pct = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0

  const badge =
    pct >= 90
      ? { label: "Xuất sắc! 🏆", color: "oklch(0.82_0.2_85)" }
      : pct >= 70
        ? { label: "Tốt lắm! 🌟", color: "oklch(0.78_0.2_165)" }
        : pct >= 50
          ? { label: "Cố thêm nào! 💪", color: "oklch(0.78_0.17_200)" }
          : { label: "Luyện tập thêm nhé! 📚", color: "oklch(0.72_0.28_320)" }

  // Save progress to localStorage and mark as complete if score >= 70%
  useEffect(() => {
    localStorage.setItem(`doremi_lesson_progress_${unit.id}`, String(pct))
    
    // Mark unit as complete if score is 70% or higher
    if (pct >= 70) {
      fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId: unit.id }),
      }).catch((err) => {
        console.error("Failed to mark unit complete:", err);
        // Fallback to localStorage
        const stored = localStorage.getItem("doremi_progress_guest");
        const progress = stored ? JSON.parse(stored) : { completedUnits: [] };
        if (!progress.completedUnits.includes(unit.id)) {
          progress.completedUnits.push(unit.id);
          localStorage.setItem("doremi_progress_guest", JSON.stringify(progress));
        }
      });
    }
  }, [unit.id, pct])

  const partBreakdown = ([1, 2, 3, 4] as Part[]).map((p) => {
    const partAnswers = answers.filter((a) => a.questionId.startsWith(`p${p}-`))
    const partCorrect = partAnswers.filter((a) => a.correct).length
    return { part: p, correct: partCorrect, total: partAnswers.length }
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      {/* Score ring */}
      <div className="relative grid size-32 place-items-center">
        <svg className="absolute inset-0 size-32" viewBox="0 0 128 128" fill="none">
          <circle cx="64" cy="64" r="54" stroke="white" strokeOpacity="0.08" strokeWidth="9" />
          <motion.circle
            cx="64" cy="64" r="54"
            stroke="url(#resGrad)" strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
            animate={{ strokeDashoffset: (2 * Math.PI * 54) * (1 - pct / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            transform="rotate(-90 64 64)"
          />
          <defs>
            <linearGradient id="resGrad" x1="0" y1="0" x2="128" y2="0">
              <stop offset="0%" stopColor="oklch(68% 0.22 200)" />
              <stop offset="100%" stopColor="oklch(72% 0.22 55)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="z-10">
          <p className="text-4xl font-black text-white">{pct}%</p>
          <p className="text-[10px] text-white/40">{correct}/{totalQuestions}</p>
        </div>
      </div>

      <div>
        <p className="text-2xl font-black" style={{ color: badge.color }}>{badge.label}</p>
        <p className="mt-1 text-sm text-white/45">{unit.title}</p>
      </div>

      {/* Part breakdown */}
      <div className="grid w-full grid-cols-4 gap-2">
        {partBreakdown.map(({ part, correct: c, total: t }) => (
          <div
            key={part}
            className="flex flex-col items-center gap-1 rounded-xl p-3"
            style={{ background: "oklch(0.17 0.06 280/0.5)", border: `1px solid ${PART_COLORS[part]}33` }}
          >
            <span className="text-[9px] font-bold uppercase tracking-wide text-white/35">Part {part}</span>
            <span className="text-lg font-black text-white">{t > 0 ? Math.round((c / t) * 100) : 0}%</span>
            <span className="text-[9px] text-white/35">{c}/{t}</span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <motion.button
          type="button"
          onClick={onRetry}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white"
          style={{
            background: "linear-gradient(135deg,oklch(0.55 0.24 200),oklch(0.72 0.22 55))",
            boxShadow: "0 0 24px oklch(0.68 0.22 200/0.4)",
          }}
        >
          <RotateCcw className="size-4" /> Làm lại bài
        </motion.button>
        <motion.button
          type="button"
          onClick={onBack}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 font-semibold text-white/70 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Danh sách bài học
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function LessonDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [unit, setUnit] = useState<LessonUnit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showVocab, setShowVocab] = useState(false)
  const [showDirectInput, setShowDirectInput] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Question sets (built once per load)
  const [p1, setP1] = useState<P1Q[]>([])
  const [p2, setP2] = useState<P2Q[]>([])
  const [p3, setP3] = useState<P3Q[]>([])
  const [p4, setP4] = useState<P4Q[]>([])

  // Progress state
  const [currentPart, setCurrentPart] = useState<Part>(1)
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [answers, setAnswers] = useState<AnswerRecord[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [allUnits, setAllUnits] = useState<LessonUnit[]>([])

  // Part 3 typing state
  const [typedAnswer, setTypedAnswer] = useState("")
  const [typingChecked, setTypingChecked] = useState(false)
  const [typingCorrect, setTypingCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function applyVocab(foundUnit: LessonUnit, vocab: VocabItem[]) {
    const enriched = { ...foundUnit, vocabulary: vocab }
    setUnit(enriched)
    setP1(buildPart1(vocab, vocab))
    setP2(buildPart2(vocab, vocab))
    setP3(buildPart3(vocab))
    setP4(buildPart4(vocab, vocab))
  }

  useEffect(() => {
    // Check if user is admin
    const session = localStorage.getItem("doremi_session")
    if (session) {
      try {
        const parsed = JSON.parse(session)
        setIsAdmin(parsed.role === "ADMIN")
      } catch {
        setIsAdmin(false)
      }
    }

    loadAllUnitsWithRag().then((units) => {
      setAllUnits(units)
      const found = units.find((u) => u.id === id)
      if (!found) { setIsLoading(false); return }
      applyVocab(found, found.vocabulary)
      setIsLoading(false)
    })
  }, [id])

  // Handle direct input save
  async function handleDirectInputSave(data: { vocabulary: VocabItem[]; sentences: string[] }) {
    if (!unit) return

    try {
      // Save to IndexedDB
      const req = indexedDB.open("doremi_rag_database", 1)
      
      req.onsuccess = () => {
        const db = req.result
        const tx = db.transaction("rag_resources", "readwrite")
        const store = tx.objectStore("rag_resources")
        
        // Extract base ID (remove -0, -1 suffix)
        const baseId = unit.id.replace(/-\d+$/, "")
        
        // Get existing resource
        const getReq = store.get(baseId)
        
        getReq.onsuccess = () => {
          const existing = getReq.result
          
          if (existing) {
            // Update existing resource with new data
            const updatedRagText = `
# ${unit.title}

## Vocabulary
${data.vocabulary.map(v => `- ${v.word} ${v.phonetic ? `(${v.phonetic})` : ''}: ${v.meaning}`).join('\n')}

## Sentences
${data.sentences.map(s => `- ${s}`).join('\n')}
            `.trim()
            
            existing.ragText = updatedRagText
            store.put(existing)
            
            tx.oncomplete = () => {
              // FIXED: Update unit state immediately with new data
              const updatedUnit = {
                ...unit,
                vocabulary: data.vocabulary,
                sentences: data.sentences,
              }
              setUnit(updatedUnit)
              
              // Rebuild question sets with new vocabulary
              applyVocab(updatedUnit, data.vocabulary)
              
              // Close modal
              setShowDirectInput(false)
              
              // Show success message
              alert("✅ Đã lưu bài học thành công! Dữ liệu đã được cập nhật.")
            }
            
            tx.onerror = () => {
              alert("❌ Lỗi khi lưu vào IndexedDB!")
            }
          } else {
            alert("❌ Không tìm thấy bài học trong database!")
          }
        }
        
        getReq.onerror = () => {
          alert("❌ Lỗi khi đọc dữ liệu từ IndexedDB!")
        }
      }
      
      req.onerror = () => {
        alert("❌ Lỗi khi mở IndexedDB!")
      }
    } catch (error) {
      console.error("Error saving lesson:", error)
      alert("❌ Có lỗi xảy ra: " + (error as Error).message)
      throw error
    }
  }

  // Focus input when entering part 3
  useEffect(() => {
    if (currentPart === 3) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [currentPart, currentQIdx])

  function resetLesson() {
    if (!unit) return
    const allVocab = unit.vocabulary
    setP1(buildPart1(allVocab, allVocab))
    setP2(buildPart2(allVocab, allVocab))
    setP3(buildPart3(allVocab))
    setP4(buildPart4(allVocab, allVocab))
    setCurrentPart(1)
    setCurrentQIdx(0)
    setAnswers([])
    setSelectedOption(null)
    setRevealed(false)
    setIsDone(false)
    setTypedAnswer("")
    setTypingChecked(false)
  }

  // Current question
  const partQuestions: LQ[] = currentPart === 1 ? p1 : currentPart === 2 ? p2 : currentPart === 3 ? p3 : p4
  const totalQuestions = p1.length + p2.length + p3.length + p4.length
  const completedBefore = (currentPart === 1 ? 0 : currentPart === 2 ? p1.length : currentPart === 3 ? p1.length + p2.length : p1.length + p2.length + p3.length)
  const progressPct = totalQuestions > 0 ? Math.round(((completedBefore + currentQIdx) / totalQuestions) * 100) : 0
  const currentQ = partQuestions[currentQIdx]

  function handleSelectOption(i: number) {
    if (revealed) return
    setSelectedOption(i)
    setRevealed(true)
    const isCorrect = i === (currentQ as P1Q | P2Q).correctIndex
    setAnswers((prev) => [...prev, { questionId: currentQ.id, correct: isCorrect }])
  }

  function handleTFAnswer(answer: boolean) {
    if (revealed) return
    const q = currentQ as P4Q
    const isCorrect = answer === q.isCorrect
    setSelectedOption(answer ? 1 : 0)
    setRevealed(true)
    setAnswers((prev) => [...prev, { questionId: currentQ.id, correct: isCorrect }])
  }

  function handleCheckTyping() {
    if (typingChecked) return
    const q = currentQ as P3Q
    const correct = typedAnswer.trim().toLowerCase() === q.word.toLowerCase()
    setTypingCorrect(correct)
    setTypingChecked(true)
    setRevealed(true)
    setAnswers((prev) => [...prev, { questionId: currentQ.id, correct }])
  }

  function handleNext() {
    if (currentQIdx + 1 < partQuestions.length) {
      setCurrentQIdx((i) => i + 1)
      setSelectedOption(null)
      setRevealed(false)
      setTypedAnswer("")
      setTypingChecked(false)
    } else {
      // Advance part
      const nextPart = (currentPart + 1) as Part
      if (nextPart > 4) {
        setIsDone(true)
      } else {
        setCurrentPart(nextPart)
        setCurrentQIdx(0)
        setSelectedOption(null)
        setRevealed(false)
        setTypedAnswer("")
        setTypingChecked(false)
      }
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-[oklch(0.72_0.22_200)]" />
          <p className="text-sm text-white/45">Đang tải bài học...</p>
        </div>
      </div>
    )
  }

  if (!unit) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <p className="text-xl font-bold text-white/60">Không tìm thấy bài học</p>
        <button
          type="button"
          onClick={() => router.push("/lessons")}
          className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:text-white"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách
        </button>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-4 pt-6 text-white md:p-8"
      style={{
        background:
          "radial-gradient(circle at 25% 15%,oklch(0.28 0.1 290/0.4),transparent 38rem)," +
          "radial-gradient(circle at 75% 85%,oklch(0.22 0.08 200/0.2),transparent 28rem)",
      }}
    >
      <div className="mx-auto max-w-2xl">
        {/* ── Header ── */}
        <div className="mb-6 flex items-start gap-4">
          <button
            type="button"
            onClick={() => router.push("/lessons")}
            className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[oklch(0.72_0.2_285)]">
              {unit.topic}
            </p>
            <h1 className="truncate text-xl font-black text-white md:text-2xl">{unit.title}</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowVocab(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <BookOpen className="size-3.5" />
            <span className="hidden sm:inline">Xem lại </span>từ vựng
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowDirectInput(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.68 0.22 280))",
                boxShadow: "0 0 12px oklch(0.65 0.22 200/0.35)",
              }}
            >
              <Edit3 className="size-3.5" />
              <span className="hidden sm:inline">Nhập bài</span>
            </button>
          )}
        </div>

        {/* ── Main card ── */}
        <div
          className="overflow-hidden rounded-[2rem] p-6 md:p-8"
          style={{
            background: "linear-gradient(145deg,oklch(0.17 0.07 280/0.92),oklch(0.13 0.05 265/0.96))",
            border: "1px solid oklch(0.55 0.18 300/0.25)",
            boxShadow: "0 0 0 1px oklch(0.5 0.15 285/0.12) inset, 0 32px 80px rgba(0,0,0,0.45)",
          }}
        >
          <AnimatePresence mode="wait">
            {/* ── RESULTS ── */}
            {isDone ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
              >
                <ResultsScreen
                  unit={unit}
                  answers={answers}
                  totalQuestions={totalQuestions}
                  onRetry={resetLesson}
                  onBack={() => router.push("/lessons")}
                />
              </motion.div>
            ) : partQuestions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 py-10 text-center"
              >
                <BookOpen className="size-10 text-white/25" />
                <p className="text-white/50">Bài học này chưa có từ vựng để luyện tập.</p>
                <button
                  type="button"
                  onClick={() => router.push("/lessons")}
                  className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/60 hover:text-white"
                >
                  ← Quay lại
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`part${currentPart}-q${currentQIdx}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex flex-col gap-5"
              >
                {/* Part indicator + progress */}
                <div className="flex items-center gap-3">
                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                    style={{
                      background: `${PART_COLORS[currentPart]}22`,
                      border: `1px solid ${PART_COLORS[currentPart]}55`,
                      color: PART_COLORS[currentPart],
                    }}
                  >
                    Part {currentPart} · {PART_LABELS[currentPart]}
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 flex justify-between text-[10px] text-white/35">
                      <span>Câu {completedBefore + currentQIdx + 1}/{totalQuestions}</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg,${PART_COLORS[currentPart]},oklch(0.72 0.22 55))`,
                        }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.35 }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── PART 1: English → Vietnamese ── */}
                {currentQ.part === 1 && (
                  <div className="flex flex-col gap-5">
                    <div
                      className="flex items-center gap-4 rounded-2xl p-5"
                      style={{ background: "oklch(0.15 0.05 200/0.5)", border: "1px solid oklch(0.5 0.15 200/0.25)" }}
                    >
                      <button
                        type="button"
                        onClick={() => speak((currentQ as P1Q).word)}
                        className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[oklch(0.72_0.22_200)] transition-colors hover:bg-white/15"
                        aria-label="Phát âm"
                      >
                        <Volume2 className="size-5" />
                      </button>
                      <div>
                        <p className="text-2xl font-black text-white">{(currentQ as P1Q).word}</p>
                        {(currentQ as P1Q).phonetic && (
                          <p className="mt-0.5 text-sm text-[oklch(0.7_0.18_200)]">{(currentQ as P1Q).phonetic}</p>
                        )}
                        <p className="mt-1 text-xs text-white/35">Chọn nghĩa đúng</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(currentQ as P1Q).options.map((opt, i) => (
                        <OptionButton
                          key={i}
                          label={opt}
                          index={i}
                          revealed={revealed}
                          isCorrect={i === (currentQ as P1Q).correctIndex}
                          isSelected={selectedOption === i}
                          onSelect={() => handleSelectOption(i)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ── PART 2: Vietnamese → English ── */}
                {currentQ.part === 2 && (
                  <div className="flex flex-col gap-5">
                    <div
                      className="rounded-2xl p-5"
                      style={{ background: "oklch(0.15 0.05 285/0.5)", border: "1px solid oklch(0.5 0.15 285/0.25)" }}
                    >
                      <p className="text-xs text-white/35">Từ tiếng Anh của cụm sau là gì?</p>
                      <p className="mt-2 text-2xl font-black text-white">{(currentQ as P2Q).meaning}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(currentQ as P2Q).options.map((opt, i) => (
                        <OptionButton
                          key={i}
                          label={opt}
                          index={i}
                          revealed={revealed}
                          isCorrect={i === (currentQ as P2Q).correctIndex}
                          isSelected={selectedOption === i}
                          onSelect={() => handleSelectOption(i)}
                        />
                      ))}
                    </div>
                    {revealed && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl px-4 py-2 text-sm text-white/55"
                        style={{ background: "oklch(0.15 0.05 200/0.4)", border: "1px solid oklch(0.5 0.12 200/0.2)" }}
                      >
                        💡 {(currentQ as P2Q).word} — {(currentQ as P2Q).phonetic}
                      </motion.p>
                    )}
                  </div>
                )}

                {/* ── PART 3: Listen & Type ── */}
                {currentQ.part === 3 && (
                  <div className="flex flex-col gap-5">
                    <div
                      className="flex flex-col items-center gap-4 rounded-2xl p-6 text-center"
                      style={{ background: "oklch(0.16 0.06 55/0.4)", border: "1px solid oklch(0.65 0.2 55/0.25)" }}
                    >
                      <motion.button
                        type="button"
                        onClick={() => speak((currentQ as P3Q).word, 0.7)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        transition={spring}
                        className="grid size-16 place-items-center rounded-2xl text-white"
                        style={{
                          background: "linear-gradient(135deg,oklch(0.55 0.22 200),oklch(0.72 0.22 55))",
                          boxShadow: "0 0 24px oklch(0.65 0.2 200/0.4)",
                        }}
                        aria-label="Phát âm từ"
                      >
                        <Volume2 className="size-7" />
                      </motion.button>
                      <div>
                        <p className="font-bold text-white">Nghe và gõ lại từ bạn vừa nghe</p>
                        <p className="mt-1 text-xs text-white/40">Nhấn nút loa để nghe, sau đó nhập từ</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !typingChecked) handleCheckTyping() }}
                        disabled={typingChecked}
                        placeholder="Gõ từ bạn nghe được..."
                        className="h-12 flex-1 rounded-xl border border-white/10 bg-white/[0.07] px-4 text-white placeholder:text-white/30 outline-none transition-all focus:border-[oklch(0.65_0.2_55/0.6)] disabled:opacity-60"
                        style={
                          typingChecked
                            ? { borderColor: typingCorrect ? "oklch(0.62 0.2 165)" : "oklch(0.62 0.2 15)" }
                            : {}
                        }
                      />
                      <motion.button
                        type="button"
                        onClick={handleCheckTyping}
                        disabled={!typedAnswer.trim() || typingChecked}
                        whileHover={!typingChecked ? { scale: 1.04 } : {}}
                        whileTap={!typingChecked ? { scale: 0.96 } : {}}
                        transition={spring}
                        className="h-12 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.72 0.22 55))" }}
                      >
                        Kiểm tra
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {typingChecked && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
                          style={{
                            background: typingCorrect ? "oklch(0.26 0.1 165/0.5)" : "oklch(0.22 0.1 0/0.4)",
                            border: `1px solid ${typingCorrect ? "oklch(0.62 0.2 165)" : "oklch(0.62 0.2 15)"}`,
                            color: typingCorrect ? "oklch(0.85 0.15 165)" : "oklch(0.82 0.15 15)",
                          }}
                        >
                          {typingCorrect
                            ? <><CheckCircle2 className="size-4" /> Chính xác!</>
                            : <><XCircle className="size-4" /> Đáp án đúng: <strong className="text-white ml-1">{(currentQ as P3Q).word}</strong> &nbsp;{(currentQ as P3Q).phonetic}</>}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ── PART 4: True / False ── */}
                {currentQ.part === 4 && (
                  <div className="flex flex-col gap-5">
                    <div
                      className="rounded-2xl p-5 text-center"
                      style={{ background: "oklch(0.16 0.06 320/0.35)", border: "1px solid oklch(0.6 0.2 320/0.25)" }}
                    >
                      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/35">
                        Cặp từ sau Đúng hay Sai?
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => speak((currentQ as P4Q).word)}
                          className="grid size-8 place-items-center rounded-xl bg-white/10 text-[oklch(0.72_0.22_200)] hover:bg-white/15"
                        >
                          <Volume2 className="size-4" />
                        </button>
                        <p className="text-2xl font-black text-white">{(currentQ as P4Q).word}</p>
                      </div>
                      {(currentQ as P4Q).phonetic && (
                        <p className="mt-1 text-sm text-[oklch(0.7_0.18_200)]">{(currentQ as P4Q).phonetic}</p>
                      )}
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <span className="text-white/35 text-sm">=</span>
                        <span
                          className="rounded-xl px-3 py-1 text-base font-bold text-white"
                          style={{ background: "oklch(0.2 0.07 320/0.6)", border: "1px solid oklch(0.6 0.2 320/0.3)" }}
                        >
                          {(currentQ as P4Q).displayMeaning}
                        </span>
                      </div>
                    </div>

                    {!revealed ? (
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                          onClick={() => handleTFAnswer(true)}
                          whileHover={{ scale: 1.04, y: -3 }}
                          whileTap={{ scale: 0.96 }}
                          transition={spring}
                          className="flex items-center justify-center gap-2 rounded-2xl py-5 text-lg font-black text-white"
                          style={{
                            background: "linear-gradient(135deg,oklch(0.4 0.18 165),oklch(0.5 0.2 165))",
                            boxShadow: "0 0 20px oklch(0.55 0.2 165/0.4)",
                          }}
                        >
                          <CheckCircle2 className="size-5" /> ĐÚNG
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => handleTFAnswer(false)}
                          whileHover={{ scale: 1.04, y: -3 }}
                          whileTap={{ scale: 0.96 }}
                          transition={spring}
                          className="flex items-center justify-center gap-2 rounded-2xl py-5 text-lg font-black text-white"
                          style={{
                            background: "linear-gradient(135deg,oklch(0.4 0.2 15),oklch(0.5 0.22 10))",
                            boxShadow: "0 0 20px oklch(0.55 0.2 15/0.4)",
                          }}
                        >
                          <XCircle className="size-5" /> SAI
                        </motion.button>
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
                        style={{
                          background: answers.at(-1)?.correct ? "oklch(0.26 0.1 165/0.5)" : "oklch(0.22 0.1 0/0.4)",
                          border: `1px solid ${answers.at(-1)?.correct ? "oklch(0.62 0.2 165)" : "oklch(0.62 0.2 15)"}`,
                          color: answers.at(-1)?.correct ? "oklch(0.85 0.15 165)" : "oklch(0.82 0.15 15)",
                        }}
                      >
                        {answers.at(-1)?.correct
                          ? <><CheckCircle2 className="size-4" /> Chính xác! Cặp từ này <strong>{(currentQ as P4Q).isCorrect ? "ĐÚNG" : "SAI"}</strong>.</>
                          : <><XCircle className="size-4" /> Cặp từ này thực ra <strong>{(currentQ as P4Q).isCorrect ? "ĐÚNG" : "SAI"}</strong> — {(currentQ as P4Q).isCorrect ? `"${(currentQ as P4Q).word}" = "${(currentQ as P4Q).displayMeaning}"` : `nghĩa đúng không phải "${(currentQ as P4Q).displayMeaning}"`}.</>}
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Next button */}
                <AnimatePresence>
                  {revealed && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={handleNext}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={spring}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white"
                      style={{
                        background:
                          completedBefore + currentQIdx + 1 >= totalQuestions
                            ? "linear-gradient(135deg,oklch(0.55 0.24 200),oklch(0.72 0.22 55))"
                            : `linear-gradient(135deg,${PART_COLORS[currentPart]}cc,oklch(0.68 0.22 280)cc)`,
                        boxShadow: "0 0 22px oklch(0.65 0.22 280/0.4)",
                      }}
                    >
                      {completedBefore + currentQIdx + 1 >= totalQuestions ? (
                        <><Trophy className="size-4" /> Xem kết quả</>
                      ) : currentQIdx + 1 >= partQuestions.length ? (
                        <>Part {(currentPart as number) + 1}: {PART_LABELS[(currentPart + 1) as Part]} <ChevronRight className="size-4" /></>
                      ) : (
                        <>Câu tiếp theo <ChevronRight className="size-4" /></>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Vocab panel overlay */}
      <AnimatePresence>
        {showVocab && unit.vocabulary.length > 0 && (
          <VocabPanel vocab={unit.vocabulary} onClose={() => setShowVocab(false)} />
        )}
      </AnimatePresence>

      {/* Direct input modal for Admin */}
      <DirectInputModal
        isOpen={showDirectInput}
        onClose={() => setShowDirectInput(false)}
        unitId={unit.id}
        unitTitle={unit.title}
        onSave={handleDirectInputSave}
      />
    </div>
  )
}
