"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  Headphones,
  Loader2,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react"
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

// ── Types ──────────────────────────────────────────────────────────────────
type QuestionType = "vocab-en-vi" | "vocab-vi-en" | "grammar-blank" | "phonetic"

type Question = {
  id: string
  type: QuestionType
  question: string
  hint?: string
  options: string[]
  correctIndex: number
  explanation: string
}

type PageState = "idle" | "testing" | "results"

// ── IDB loading ────────────────────────────────────────────────────────────
const RAG_DB_NAME = "doremi_rag_database"
const RAG_STORE = "rag_resources"

type RagResource = {
  id: string
  fileName: string
  ragText: string
  schoolLevel: string
  namespace: "primary_data" | "secondary_data" | "highschool_data"
  createdAt: string
}

async function loadRagResources(): Promise<RagResource[]> {
  return new Promise((resolve) => {
    const req = indexedDB.open(RAG_DB_NAME, 1)
    req.onerror = () => resolve([])
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(RAG_STORE)) {
        const store = db.createObjectStore(RAG_STORE, { keyPath: "id" })
        store.createIndex("by-namespace", "namespace")
        store.createIndex("by-created-at", "createdAt")
      }
    }
    req.onsuccess = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(RAG_STORE)) { resolve([]); return }
      const getAllReq = db.transaction(RAG_STORE, "readonly").objectStore(RAG_STORE).getAll()
      getAllReq.onsuccess = () => resolve(getAllReq.result as RagResource[])
      getAllReq.onerror = () => resolve([])
    }
  })
}

// ── Level / skill config ───────────────────────────────────────────────────
const LEVELS = ["Cấp 1", "Cấp 2", "Cấp 3", "Trung cấp & Cao đẳng", "Đại học"] as const
const SKILLS = ["Tổng hợp", "Từ vựng", "Ngữ pháp", "Nghe"] as const
type Level = (typeof LEVELS)[number]
type Skill = (typeof SKILLS)[number]

const levelToNamespace: Record<string, ("primary_data" | "secondary_data" | "highschool_data")[]> = {
  "Cấp 1": ["primary_data"],
  "Cấp 2": ["secondary_data"],
  "Cấp 3": ["highschool_data"],
  "Trung cấp & Cao đẳng": ["highschool_data"],
  "Đại học": ["highschool_data"],
}

const SKILL_ICONS: Record<Skill, React.ReactNode> = {
  "Tổng hợp": <Sparkles className="size-3.5" />,
  "Từ vựng": <BookOpen className="size-3.5" />,
  "Ngữ pháp": <Zap className="size-3.5" />,
  "Nghe": <Headphones className="size-3.5" />,
}

// ── Question generators ────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function generateVocabEnVi(vocab: VocabItem, allVocab: VocabItem[]): Question | null {
  const correctMeaning = cleanMeaning(vocab.meaning)
  if (!correctMeaning) return null

  const pool = buildMeaningPool(allVocab.map((v) => v.meaning), correctMeaning)
  const wrongs = pickDistractors(correctMeaning, pool)
  if (wrongs.length < 3) return null

  const options = shuffle([correctMeaning, ...wrongs])
  return {
    id: `vocab-en-vi-${vocab.word}`,
    type: "vocab-en-vi",
    question: `"${vocab.word}" nghĩa là gì?`,
    hint: vocab.phonetic || undefined,
    options,
    correctIndex: options.indexOf(correctMeaning),
    explanation: `${vocab.word} ${vocab.phonetic ?? ""} — ${correctMeaning}`,
  }
}

function generateVocabViEn(vocab: VocabItem, allVocab: VocabItem[]): Question | null {
  const correctMeaning = cleanMeaning(vocab.meaning)
  if (!correctMeaning) return null
  const correctWord = cleanWord(vocab.word)
  if (!correctWord) return null

  const pool = buildWordPool(allVocab.map((v) => v.word), correctWord)
  const wrongs = pickDistractors(correctWord, pool)
  if (wrongs.length < 3) return null

  const options = shuffle([correctWord, ...wrongs])
  return {
    id: `vocab-vi-en-${vocab.word}`,
    type: "vocab-vi-en",
    question: `Từ tiếng Anh của "${correctMeaning}" là gì?`,
    options,
    correctIndex: options.indexOf(correctWord),
    explanation: `"${correctMeaning}" → ${correctWord} ${vocab.phonetic ?? ""}`,
  }
}

function generateGrammarBlank(sentence: string, allVocab: VocabItem[]): Question | null {
  const stripped = sentence.replace(/[.!?]$/, "")
  const words = stripped.split(" ")
  const SKIP = new Set(["i", "you", "he", "she", "it", "we", "they", "a", "an", "the", "is", "am", "are", "my", "your", "this", "that", "to", "of", "in", "on"])
  const candidates = words.filter((w) => !SKIP.has(w.toLowerCase()) && w.length > 2)
  if (candidates.length === 0) return null

  const target = candidates[Math.floor(Math.random() * candidates.length)]
  const targetLow = target.toLowerCase()
  const blanked = sentence.replace(target, "_____")

  const isNumCtx = isNumberContextSentence(sentence, targetLow)

  let wrongs: string[]
  if (isNumCtx) {
    // Use number words as smart distractors for age/count sentences
    wrongs = getNumberDistractors(targetLow)
  } else {
    const pool = buildWordPool(allVocab.map((v) => v.word), targetLow)
    wrongs = pickDistractors(targetLow, pool, 3, false)
  }

  if (wrongs.length < 3) return null

  const options = shuffle([targetLow, ...wrongs])
  return {
    id: `grammar-${target}-${Math.random().toString(36).slice(2, 6)}`,
    type: "grammar-blank",
    question: blanked,
    hint: "Chọn từ thích hợp điền vào chỗ trống",
    options,
    correctIndex: options.indexOf(targetLow),
    explanation: `Câu hoàn chỉnh: "${sentence}"`,
  }
}

function generatePhonetic(vocab: VocabItem, allVocab: VocabItem[]): Question | null {
  if (!vocab.phonetic) return null
  const correctWord = cleanWord(vocab.word)
  if (!correctWord) return null

  const pool = buildWordPool(
    allVocab.filter((v) => v.phonetic).map((v) => v.word),
    correctWord,
  )
  const wrongs = pickDistractors(correctWord, pool)
  if (wrongs.length < 3) return null

  const options = shuffle([correctWord, ...wrongs])
  return {
    id: `phonetic-${vocab.word}`,
    type: "phonetic",
    question: `Từ nào có cách phát âm: ${vocab.phonetic}`,
    hint: cleanMeaning(vocab.meaning) ? `Nghĩa: ${cleanMeaning(vocab.meaning)}` : undefined,
    options,
    correctIndex: options.indexOf(correctWord),
    explanation: `${correctWord} đọc là ${vocab.phonetic} — ${cleanMeaning(vocab.meaning) ?? ""}`,
  }
}

/**
 * Parse pre-made MCQ questions (numbered with A/B/C/D options) from raw RAG text.
 * Skips any question without exactly 4 distinct options or a determinable correct answer.
 * Correct answer is detected via: asterisk (*), (correct) marker, or explicit answer line
 * (e.g. "Đáp án: B", "Answer: C").
 */
function parseNumberedQuestions(ragText: string): Question[] {
  const results: Question[] = []

  // Split into blocks wherever a new numbered item starts
  const blocks = ragText.split(/\n(?=\s*\d+[.)]\s)/)

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean)
    if (lines.length < 5) continue // need: 1 question + 4 options minimum

    // Strip leading number from first line to get question text
    const qText = lines[0].replace(/^\s*\d+[.)]\s*/, "").trim()
    if (!qText || qText.length < 4) continue

    const optMap = new Map<string, string>() // letter → cleaned text
    let correctLetter = ""

    for (const line of lines.slice(1)) {
      // Option line: "A. text" or "A) text"
      const optMatch = line.match(/^([A-D])[.)]\s+(.+)/)
      if (optMatch) {
        const letter = optMatch[1]
        const raw = optMatch[2]
        if (raw.includes("*") || /\(correct\)/i.test(raw)) correctLetter = letter
        optMap.set(letter, raw.replace(/\*+|\(correct\)/gi, "").trim())
        continue
      }
      // Explicit answer line: "Đáp án: A" / "Answer: B" / "Key: C"
      const ansMatch = line.match(/(?:đáp án|answer|correct answer|key)\s*[:=]\s*([A-D])/i)
      if (ansMatch) correctLetter = ansMatch[1].toUpperCase()
    }

    // Validate: need all 4 options, a known correct answer, and no duplicates
    if (!["A", "B", "C", "D"].every((l) => optMap.has(l))) continue
    if (!correctLetter) continue
    const opts = ["A", "B", "C", "D"].map((l) => optMap.get(l)!)
    if (new Set(opts.map((o) => o.toLowerCase())).size !== 4) continue

    // Shuffle options while tracking which is correct
    const tagged = opts.map((opt, i) => ({ opt, isCorrect: ["A", "B", "C", "D"][i] === correctLetter }))
    const shuffled = [...tagged].sort(() => Math.random() - 0.5)
    const correctIdx = shuffled.findIndex((x) => x.isCorrect)

    results.push({
      id: `raw-mcq-${results.length}-${Math.random().toString(36).slice(2, 5)}`,
      type: "vocab-en-vi",
      question: qText,
      options: shuffled.map((x) => x.opt),
      correctIndex: correctIdx,
      explanation: `Đáp án: ${shuffled[correctIdx].opt}`,
    })
  }

  return results
}

function buildQuestionPool(units: LessonUnit[], skill: Skill): Question[] {
  const pool: Question[] = []

  // Build per-namespace vocab pool — distractors must stay within the same namespace
  const vocabByNs = new Map<string, VocabItem[]>()
  for (const unit of units) {
    const prev = vocabByNs.get(unit.namespace) ?? []
    vocabByNs.set(unit.namespace, [...prev, ...unit.vocabulary])
  }

  for (const unit of units) {
    // Use same-namespace vocab as distractor pool; fall back to unit vocab if too small
    const nsVocab = vocabByNs.get(unit.namespace) ?? []
    const distractorPool = nsVocab.length >= 4 ? nsVocab : unit.vocabulary

    for (const v of unit.vocabulary) {
      if (skill === "Tổng hợp" || skill === "Từ vựng") {
        const q1 = generateVocabEnVi(v, distractorPool)
        const q2 = generateVocabViEn(v, distractorPool)
        if (q1) pool.push(q1)
        if (q2) pool.push(q2)
      }
      if (skill === "Tổng hợp" || skill === "Nghe") {
        const q = generatePhonetic(v, distractorPool)
        if (q) pool.push(q)
      }
    }
    if (skill === "Tổng hợp" || skill === "Ngữ pháp") {
      for (const s of unit.sentences) {
        // Grammar blanks: distractors from same namespace only
        const q = generateGrammarBlank(s, distractorPool)
        if (q) pool.push(q)
      }
    }
  }

  return pool
}

function generateTest(
  units: LessonUnit[],
  level: Level,
  skill: Skill,
  prebuiltByNs: Map<string, Question[]>,
): Question[] {
  const namespaces = levelToNamespace[level] ?? ["primary_data"]
  const filtered = units.filter((u) => namespaces.includes(u.namespace))
  const vocabPool = buildQuestionPool(filtered.length > 0 ? filtered : units, skill)

  // Include pre-parsed MCQ questions from matching namespaces
  const prebuilt = namespaces.flatMap((ns) => prebuiltByNs.get(ns) ?? [])
  const combined = shuffle([...vocabPool, ...prebuilt])

  if (combined.length === 0) return []
  if (combined.length >= 10) return combined.slice(0, 10)

  // Pad with repeats only from vocab pool (pre-built MCQs shouldn't repeat)
  const source = vocabPool.length > 0 ? vocabPool : combined
  const extra = Array.from({ length: 10 - combined.length }, () =>
    source[Math.floor(Math.random() * source.length)],
  )
  return [...combined, ...extra]
}

// ── Spring transition preset ──────────────────────────────────────────────
const spring = { type: "spring" as const, stiffness: 240, damping: 22 }

// ── Sub-components ────────────────────────────────────────────────────────
function LevelButton({ label, isSelected, onClick }: { label: string; isSelected: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      transition={spring}
      className="shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors"
      style={
        isSelected
          ? {
              background: "linear-gradient(135deg,oklch(0.55 0.24 200),oklch(0.5 0.26 220))",
              color: "white",
              boxShadow: "0 0 18px oklch(0.68 0.22 200/0.6)",
            }
          : {
              background: "oklch(0.2 0.05 280/0.6)",
              border: "1px solid oklch(0.45 0.12 280/0.3)",
              color: "oklch(0.7 0.1 280)",
            }
      }
    >
      {label}
    </motion.button>
  )
}

function SkillButton({ label, icon, isSelected, onClick }: { label: string; icon: React.ReactNode; isSelected: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.035 }}
      whileTap={{ scale: 0.96 }}
      transition={spring}
      className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
      style={
        isSelected
          ? {
              background: "linear-gradient(135deg,oklch(0.48 0.22 285),oklch(0.44 0.24 305))",
              color: "white",
              boxShadow: "0 0 16px oklch(0.65 0.28 300/0.45)",
            }
          : {
              background: "oklch(0.2 0.05 280/0.6)",
              border: "1px solid oklch(0.45 0.12 280/0.3)",
              color: "oklch(0.7 0.1 280)",
            }
      }
    >
      {icon}
      {label}
    </motion.button>
  )
}

// ── Question card ─────────────────────────────────────────────────────────
function QuestionCard({
  question,
  index,
  total,
  onAnswer,
  revealed,
  selectedAnswer,
}: {
  question: Question
  index: number
  total: number
  onAnswer: (i: number) => void
  revealed: boolean
  selectedAnswer: number | null
}) {
  const typeLabel: Record<QuestionType, string> = {
    "vocab-en-vi": "Từ vựng",
    "vocab-vi-en": "Dịch nghĩa",
    "grammar-blank": "Ngữ pháp",
    phonetic: "Phát âm",
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex flex-col gap-5"
    >
      {/* Progress header */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-white/55">
          Câu {index + 1} / {total}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg,oklch(0.68 0.22 200),oklch(0.72 0.26 300),oklch(0.72 0.22 55))",
            }}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{
            background: "oklch(0.22 0.08 285/0.5)",
            border: "1px solid oklch(0.55 0.2 285/0.3)",
            color: "oklch(0.72 0.2 285)",
          }}
        >
          {typeLabel[question.type]}
        </span>
      </div>

      {/* Question body */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "oklch(0.15 0.05 280/0.7)",
          border: "1px solid oklch(0.45 0.12 280/0.25)",
        }}
      >
        <p className="text-base font-semibold leading-relaxed text-white md:text-lg">
          {question.question}
        </p>
        {question.hint && (
          <p className="mt-1.5 text-sm text-[oklch(0.72_0.2_200)]">{question.hint}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex
          const isSelected = i === selectedAnswer
          const showCorrect = revealed && isCorrect
          const showWrong = revealed && isSelected && !isCorrect

          return (
            <motion.button
              key={`${question.id}-opt-${i}`}
              type="button"
              disabled={revealed}
              onClick={() => onAnswer(i)}
              whileHover={!revealed ? { scale: 1.025, y: -2 } : {}}
              whileTap={!revealed ? { scale: 0.97 } : {}}
              transition={spring}
              className="flex items-center gap-3 rounded-xl p-4 text-left text-sm font-semibold transition-colors disabled:cursor-default"
              style={
                showCorrect
                  ? {
                      background: "oklch(0.28 0.1 165/0.5)",
                      border: "1px solid oklch(0.62 0.2 165)",
                      color: "oklch(0.85 0.15 165)",
                      boxShadow: "0 0 16px oklch(0.62 0.2 165/0.3)",
                    }
                  : showWrong
                    ? {
                        background: "oklch(0.22 0.1 0/0.5)",
                        border: "1px solid oklch(0.62 0.2 15)",
                        color: "oklch(0.82 0.15 15)",
                      }
                    : isSelected && !revealed
                      ? {
                          background: "oklch(0.25 0.08 285/0.7)",
                          border: "1px solid oklch(0.65 0.22 300)",
                          color: "white",
                        }
                      : {
                          background: "oklch(0.18 0.06 280/0.6)",
                          border: "1px solid oklch(0.4 0.1 280/0.3)",
                          color: "oklch(0.78 0.08 280)",
                        }
              }
            >
              <span
                className="grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-black"
                style={{
                  background: showCorrect
                    ? "oklch(0.62 0.2 165)"
                    : showWrong
                      ? "oklch(0.58 0.2 15)"
                      : "oklch(0.25 0.07 280)",
                  color: showCorrect || showWrong ? "white" : "oklch(0.65 0.15 280)",
                }}
              >
                {showCorrect ? <CheckCircle2 className="size-3.5" /> : showWrong ? <XCircle className="size-3.5" /> : ["A", "B", "C", "D"][i]}
              </span>
              {opt}
            </motion.button>
          )
        })}
      </div>

      {/* Explanation after reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl px-4 py-3 text-sm text-white/65"
            style={{
              background: "oklch(0.15 0.05 200/0.5)",
              border: "1px solid oklch(0.5 0.15 200/0.2)",
            }}
          >
            💡 {question.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Results screen ────────────────────────────────────────────────────────
function ResultsScreen({
  questions,
  answers,
  onRetry,
  onReconfig,
}: {
  questions: Question[]
  answers: (number | null)[]
  onRetry: () => void
  onReconfig: () => void
}) {
  const correct = answers.filter((a, i) => a === questions[i]?.correctIndex).length
  const pct = Math.round((correct / questions.length) * 100)

  const grade =
    pct >= 90
      ? { label: "Xuất sắc! 🏆", color: "oklch(0.82_0.2_85)" }
      : pct >= 70
        ? { label: "Tốt lắm! 🌟", color: "oklch(0.78_0.2_165)" }
        : pct >= 50
          ? { label: "Cố thêm nào! 💪", color: "oklch(0.78_0.17_200)" }
          : { label: "Luyện tập thêm nhé! 📚", color: "oklch(0.72_0.28_320)" }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-6 py-4 text-center"
    >
      {/* Score ring */}
      <div className="relative grid size-36 place-items-center">
        <svg className="absolute inset-0" viewBox="0 0 144 144" fill="none">
          <circle cx="72" cy="72" r="62" stroke="white" strokeOpacity="0.08" strokeWidth="10" />
          <motion.circle
            cx="72"
            cy="72"
            r="62"
            stroke="url(#scoreGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 62}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 62 }}
            animate={{ strokeDashoffset: (2 * Math.PI * 62) * (1 - pct / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            transform="rotate(-90 72 72)"
          />
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="144" y2="0">
              <stop offset="0%" stopColor="oklch(68% 0.22 200)" />
              <stop offset="100%" stopColor="oklch(72% 0.22 55)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="z-10 flex flex-col items-center">
          <span className="text-4xl font-black text-white">{pct}%</span>
          <span className="text-xs text-white/40">{correct}/{questions.length}</span>
        </div>
      </div>

      <div>
        <p className="text-2xl font-black" style={{ color: grade.color }}>
          {grade.label}
        </p>
        <p className="mt-1 text-sm text-white/45">
          Bạn trả lời đúng {correct} trên {questions.length} câu hỏi.
        </p>
      </div>

      {/* Per-question summary */}
      <div className="w-full space-y-2 text-left">
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.correctIndex
          return (
            <div
              key={q.id}
              className="flex items-start gap-3 rounded-xl p-3 text-sm"
              style={{
                background: isCorrect ? "oklch(0.18 0.07 165/0.3)" : "oklch(0.18 0.07 10/0.25)",
                border: `1px solid ${isCorrect ? "oklch(0.55 0.18 165/0.3)" : "oklch(0.55 0.18 10/0.25)"}`,
              }}
            >
              {isCorrect
                ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[oklch(0.72_0.2_165)]" />
                : <XCircle className="mt-0.5 size-4 shrink-0 text-[oklch(0.7_0.2_15)]" />}
              <div className="min-w-0">
                <p className="truncate font-semibold text-white/80">{q.question}</p>
                {!isCorrect && (
                  <p className="mt-0.5 text-xs text-[oklch(0.72_0.2_165)]">
                    Đáp án đúng: <strong>{q.options[q.correctIndex]}</strong>
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
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
            boxShadow: "0 0 28px oklch(0.68 0.22 200/0.4)",
          }}
        >
          <RotateCcw className="size-4" />
          Làm lại (câu mới)
        </motion.button>
        <motion.button
          type="button"
          onClick={onReconfig}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          transition={spring}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 font-semibold text-white/70 hover:text-white"
        >
          Đổi cấu hình
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PracticePage() {
  const [pageState, setPageState] = useState<PageState>("idle")
  const [selectedLevel, setSelectedLevel] = useState<Level>("Cấp 1")
  const [selectedSkill, setSelectedSkill] = useState<Skill>("Tổng hợp")
  const [allUnits, setAllUnits] = useState<LessonUnit[]>([])
  const [prebuiltByNs, setPrebuiltByNs] = useState<Map<string, Question[]>>(new Map())
  const [isLoadingUnits, setIsLoadingUnits] = useState(true)

  // Testing state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  // Load units from IDB + seed on mount
  useEffect(() => {
    loadRagResources().then((ragResources) => {
      const idbUnits: LessonUnit[] = []
      const rawQsMap = new Map<string, Question[]>()

      for (const r of ragResources) {
        const offlineVocab = parseVocabOffline(r.ragText)
        const parsed = parseRagIntoUnits(r.ragText, r.namespace, r.id)

        if (parsed.length > 0) {
          idbUnits.push(...parsed.map((u) =>
            u.vocabulary.length === 0 ? { ...u, vocabulary: offlineVocab } : u,
          ))
        } else if (r.ragText?.trim()) {
          idbUnits.push({
            id: r.id,
            unitNumber: idbUnits.length + 1,
            title: r.fileName.replace(/\.[^.]+$/, ""),
            topic: r.schoolLevel,
            namespace: r.namespace,
            vocabulary: offlineVocab,
            sentences: r.ragText
              .split("\n")
              .filter((l) => /[.!?]$/.test(l.trim()) && l.trim().length > 8)
              .slice(0, 4)
              .map((l) => l.trim()),
            skillTags: ["Từ vựng"],
            source: "idb",
          })
        }

        // Parse any pre-made MCQ questions embedded in the RAG text
        const mcqs = parseNumberedQuestions(r.ragText)
        if (mcqs.length > 0) {
          const prev = rawQsMap.get(r.namespace) ?? []
          rawQsMap.set(r.namespace, [...prev, ...mcqs])
        }
      }

      const idbIds = new Set(idbUnits.map((u) => u.id))
      setAllUnits([...idbUnits, ...smartStart1Units.filter((u) => !idbIds.has(u.id))])
      setPrebuiltByNs(rawQsMap)
      setIsLoadingUnits(false)
    })
  }, [])

  const questionCount = useMemo(() => {
    if (allUnits.length === 0) return 0
    const namespaces = levelToNamespace[selectedLevel] ?? ["primary_data"]
    const filtered = allUnits.filter((u) => namespaces.includes(u.namespace))
    const pool = buildQuestionPool(filtered.length > 0 ? filtered : allUnits, selectedSkill)
    const prebuilt = namespaces.flatMap((ns) => prebuiltByNs.get(ns) ?? [])
    return pool.length + prebuilt.length
  }, [allUnits, selectedLevel, selectedSkill, prebuiltByNs])

  function handleStartTest() {
    const qs = generateTest(allUnits, selectedLevel, selectedSkill, prebuiltByNs)
    if (qs.length === 0) return
    setQuestions(qs)
    setCurrentIndex(0)
    setAnswers(new Array(qs.length).fill(null))
    setSelectedAnswer(null)
    setIsRevealed(false)
    setPageState("testing")
  }

  function handleAnswer(answerIndex: number) {
    if (isRevealed) return
    setSelectedAnswer(answerIndex)
    setIsRevealed(true)
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = answerIndex
      return next
    })
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setPageState("results")
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelectedAnswer(null)
    setIsRevealed(false)
  }

  function handleRetry() {
    const qs = generateTest(allUnits, selectedLevel, selectedSkill, prebuiltByNs)
    setQuestions(qs)
    setCurrentIndex(0)
    setAnswers(new Array(qs.length).fill(null))
    setSelectedAnswer(null)
    setIsRevealed(false)
    setPageState("testing")
  }

  return (
    <div
      className="flex min-h-screen items-start justify-center p-4 pt-10 text-white md:p-8 md:pt-12"
      style={{
        background:
          "radial-gradient(circle at 20% 20%,oklch(0.28 0.1 290/0.4),transparent 40rem)," +
          "radial-gradient(circle at 80% 80%,oklch(0.22 0.08 200/0.25),transparent 30rem)",
      }}
    >
      <motion.div
        layout
        className="w-full max-w-2xl"
        transition={{ duration: 0.3 }}
      >
        {/* ── Main card ── */}
        <div
          className="overflow-hidden rounded-[2rem] p-6 md:p-8"
          style={{
            background:
              "linear-gradient(145deg,oklch(0.17 0.07 280/0.92),oklch(0.13 0.05 265/0.96))",
            border: "1px solid oklch(0.55 0.18 300/0.25)",
            boxShadow:
              "0 0 0 1px oklch(0.5 0.15 285/0.12) inset, 0 32px 80px rgba(0,0,0,0.5)",
          }}
        >
          <AnimatePresence mode="wait">
            {/* ── IDLE / CONFIG ── */}
            {pageState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-7"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-12 place-items-center rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.72 0.22 55))",
                      boxShadow: "0 0 24px oklch(0.65 0.22 200/0.4)",
                    }}
                  >
                    <Flame className="size-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-white">Phòng Luyện Tập</h1>
                    <p className="text-sm text-white/45">Chọn cấp độ và kỹ năng để bắt đầu</p>
                  </div>
                </div>

                {/* Level selector */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Cấp độ tối đa
                  </p>
                  <div
                    className="flex gap-2 overflow-x-auto py-1"
                    style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
                  >
                    {LEVELS.map((level) => (
                      <LevelButton
                        key={level}
                        label={level}
                        isSelected={selectedLevel === level}
                        onClick={() => setSelectedLevel(level)}
                      />
                    ))}
                  </div>
                </div>

                {/* Skill selector */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                    Kỹ năng
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((skill) => (
                      <SkillButton
                        key={skill}
                        label={skill}
                        icon={SKILL_ICONS[skill]}
                        isSelected={selectedSkill === skill}
                        onClick={() => setSelectedSkill(skill)}
                      />
                    ))}
                  </div>
                </div>

                {/* Info strip */}
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "oklch(0.18 0.06 285/0.5)",
                    border: "1px solid oklch(0.5 0.15 285/0.2)",
                  }}
                >
                  <Trophy className="size-4 shrink-0 text-[oklch(0.82_0.2_85)]" />
                  <span className="text-white/60">
                    {isLoadingUnits ? (
                      "Đang tải dữ liệu..."
                    ) : questionCount === 0 ? (
                      <span className="text-orange-300">
                        Chưa đủ câu hỏi cho bộ lọc này. Thử đổi cấp độ hoặc kỹ năng.
                      </span>
                    ) : (
                      <>
                        Có <strong className="text-white">{questionCount}</strong> câu hỏi trong ngân hàng cho{" "}
                        <strong className="text-white">{selectedLevel}</strong> ·{" "}
                        <strong className="text-white">{selectedSkill}</strong>
                      </>
                    )}
                  </span>
                </div>

                {/* Start button */}
                <motion.button
                  type="button"
                  disabled={isLoadingUnits || questionCount === 0}
                  onClick={handleStartTest}
                  whileHover={questionCount > 0 ? { scale: 1.03, y: -3 } : {}}
                  whileTap={questionCount > 0 ? { scale: 0.97 } : {}}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full py-5 text-lg font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg,oklch(0.58 0.24 200) 0%,oklch(0.55 0.26 270) 45%,oklch(0.72 0.22 55) 100%)",
                    boxShadow: questionCount > 0
                      ? "0 0 32px oklch(0.68 0.22 200/0.5), 0 0 60px oklch(0.72 0.22 55/0.25)"
                      : "none",
                  }}
                >
                  {/* Animated shimmer */}
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: "linear-gradient(90deg,transparent,white/15,transparent)",
                    }}
                  />
                  {isLoadingUnits ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>
                      🚀 Bắt đầu test 10 câu
                      <ChevronRight className="size-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* ── TESTING ── */}
            {pageState === "testing" && questions.length > 0 && (
              <motion.div
                key="testing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                {/* Top bar */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="grid size-8 place-items-center rounded-xl"
                      style={{ background: "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.72 0.22 55))" }}
                    >
                      <Flame className="size-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white/70">
                      {selectedLevel} · {selectedSkill}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPageState("idle")}
                    className="text-xs text-white/35 hover:text-white/60 transition-colors"
                  >
                    Thoát
                  </button>
                </div>

                {/* Question with exit animation */}
                <AnimatePresence mode="wait">
                  <QuestionCard
                    key={`q-${currentIndex}`}
                    question={questions[currentIndex]}
                    index={currentIndex}
                    total={questions.length}
                    onAnswer={handleAnswer}
                    revealed={isRevealed}
                    selectedAnswer={selectedAnswer}
                  />
                </AnimatePresence>

                {/* Next button */}
                <AnimatePresence>
                  {isRevealed && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={handleNext}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={spring}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white"
                      style={{
                        background:
                          currentIndex + 1 >= questions.length
                            ? "linear-gradient(135deg,oklch(0.55 0.24 200),oklch(0.72 0.22 55))"
                            : "linear-gradient(135deg,oklch(0.48 0.22 285),oklch(0.44 0.24 305))",
                        boxShadow: "0 0 22px oklch(0.65 0.22 280/0.4)",
                      }}
                    >
                      {currentIndex + 1 >= questions.length ? (
                        <>
                          <Trophy className="size-4" />
                          Xem kết quả
                        </>
                      ) : (
                        <>
                          Câu tiếp theo
                          <ChevronRight className="size-4" />
                        </>
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── RESULTS ── */}
            {pageState === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <ResultsScreen
                  questions={questions}
                  answers={answers}
                  onRetry={handleRetry}
                  onReconfig={() => setPageState("idle")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
