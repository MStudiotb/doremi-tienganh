"use client"

import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BookText, CheckCircle2, ChevronRight, Loader2, RotateCcw, Sparkles, Trophy } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────
type Exercise = {
  id: string
  correctSentence: string
  translation: string
  hint?: string
}

type FeedbackData = {
  score: number
  isCorrect: boolean
  feedback: string
  encouragement: string
}

// ── Sample exercises ───────────────────────────────────────────────────────
const EXERCISES: Exercise[] = [
  {
    id: "1",
    correctSentence: "I love my family",
    translation: "Tôi yêu gia đình của tôi",
    hint: "Bắt đầu với chủ ngữ 'I'",
  },
  {
    id: "2",
    correctSentence: "She is a good student",
    translation: "Cô ấy là một học sinh giỏi",
    hint: "Chủ ngữ + động từ to be + danh từ",
  },
  {
    id: "3",
    correctSentence: "We play football every day",
    translation: "Chúng tôi chơi bóng đá mỗi ngày",
    hint: "Thì hiện tại đơn",
  },
  {
    id: "4",
    correctSentence: "The cat is sleeping on the sofa",
    translation: "Con mèo đang ngủ trên ghế sofa",
    hint: "Thì hiện tại tiếp diễn",
  },
  {
    id: "5",
    correctSentence: "My mother cooks delicious food",
    translation: "Mẹ tôi nấu những món ăn ngon",
    hint: "Chủ ngữ + động từ + tân ngữ",
  },
]

// ── Helper functions ───────────────────────────────────────────────────────
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const spring = { type: "spring" as const, stiffness: 240, damping: 22 }

// ── Main Component ────────────────────────────────────────────────────────
export function ArrangeWordsMode() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [showHint, setShowHint] = useState(false)

  const currentExercise = EXERCISES[currentIndex]

  // Shuffle words when exercise changes
  useEffect(() => {
    const words = currentExercise.correctSentence.split(" ")
    setShuffledWords(shuffleArray(words))
    setSelectedWords([])
    setFeedback(null)
    setShowHint(false)
  }, [currentIndex, currentExercise])

  const handleWordClick = (word: string, index: number) => {
    if (feedback) return // Don't allow changes after checking
    
    setSelectedWords([...selectedWords, word])
    setShuffledWords(shuffledWords.filter((_, i) => i !== index))
  }

  const handleRemoveWord = (index: number) => {
    if (feedback) return // Don't allow changes after checking
    
    const word = selectedWords[index]
    setShuffledWords([...shuffledWords, word])
    setSelectedWords(selectedWords.filter((_, i) => i !== index))
  }

  const handleCheck = async () => {
    setIsChecking(true)
    const userSentence = selectedWords.join(" ")
    
    try {
      const response = await fetch("/api/writing/check-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSentence,
          correctSentence: currentExercise.correctSentence,
          mode: "arrange",
        }),
      })

      const data = await response.json() as FeedbackData
      setFeedback(data)
    } catch (error) {
      console.error("Error checking sentence:", error)
      // Fallback to simple check
      const isCorrect = userSentence.toLowerCase() === currentExercise.correctSentence.toLowerCase()
      setFeedback({
        score: isCorrect ? 100 : 0,
        isCorrect,
        feedback: isCorrect 
          ? "Chính xác! Bạn đã sắp xếp đúng câu." 
          : `Chưa đúng. Câu đúng là: "${currentExercise.correctSentence}"`,
        encouragement: isCorrect ? "Tuyệt vời! 🎉" : "Cố gắng lần sau nhé! 💪",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < EXERCISES.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0) // Loop back to start
    }
  }

  const handleReset = () => {
    const words = currentExercise.correctSentence.split(" ")
    setShuffledWords(shuffleArray(words))
    setSelectedWords([])
    setFeedback(null)
    setShowHint(false)
  }

  return (
    <div
      className="overflow-hidden rounded-[2rem] p-6 md:p-8"
      style={{
        background: "linear-gradient(145deg,oklch(0.17 0.07 280/0.92),oklch(0.13 0.05 265/0.96))",
        border: "1px solid oklch(0.55 0.18 300/0.25)",
        boxShadow: "0 0 0 1px oklch(0.5 0.15 285/0.12) inset, 0 32px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="grid size-12 place-items-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg,oklch(0.55 0.24 200),oklch(0.5 0.26 220))",
            boxShadow: "0 0 24px oklch(0.65 0.22 200/0.4)",
          }}
        >
          <BookText className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Xếp từ thành câu</h2>
          <p className="text-sm text-white/45">
            Câu {currentIndex + 1} / {EXERCISES.length}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg,oklch(0.68 0.22 200),oklch(0.72 0.26 300),oklch(0.72 0.22 55))",
          }}
          animate={{ width: `${((currentIndex + 1) / EXERCISES.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Translation */}
      <div
        className="mb-6 rounded-2xl p-5"
        style={{
          background: "oklch(0.15 0.05 280/0.7)",
          border: "1px solid oklch(0.45 0.12 280/0.25)",
        }}
      >
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-white/40">
          Dịch câu này sang tiếng Anh:
        </p>
        <p className="text-lg font-semibold text-white">{currentExercise.translation}</p>
      </div>

      {/* Hint button */}
      {currentExercise.hint && !feedback && (
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="mb-4 flex items-center gap-2 text-sm text-[oklch(0.72_0.2_200)] transition-colors hover:text-[oklch(0.82_0.2_200)]"
        >
          <Sparkles className="size-4" />
          {showHint ? "Ẩn gợi ý" : "Xem gợi ý"}
        </button>
      )}

      {/* Hint */}
      <AnimatePresence>
        {showHint && currentExercise.hint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden rounded-xl px-4 py-3 text-sm text-white/70"
            style={{
              background: "oklch(0.18 0.06 285/0.5)",
              border: "1px solid oklch(0.5 0.15 285/0.2)",
            }}
          >
            💡 {currentExercise.hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected words area */}
      <div
        className="mb-4 min-h-[80px] rounded-2xl p-4"
        style={{
          background: "oklch(0.12 0.04 280/0.8)",
          border: "2px dashed oklch(0.45 0.12 280/0.3)",
        }}
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/40">
          Câu của bạn:
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedWords.length === 0 ? (
            <p className="text-sm text-white/30">Chọn các từ bên dưới...</p>
          ) : (
            selectedWords.map((word, index) => (
              <motion.button
                key={`selected-${index}`}
                type="button"
                onClick={() => handleRemoveWord(index)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={spring}
                disabled={feedback !== null}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-default"
                style={{
                  background: "linear-gradient(135deg,oklch(0.48 0.22 285),oklch(0.44 0.24 305))",
                  boxShadow: "0 0 16px oklch(0.65 0.28 300/0.3)",
                }}
              >
                {word}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Available words */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/40">
          Các từ có sẵn:
        </p>
        <div className="flex flex-wrap gap-2">
          {shuffledWords.map((word, index) => (
            <motion.button
              key={`word-${index}`}
              type="button"
              onClick={() => handleWordClick(word, index)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={spring}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                background: "oklch(0.18 0.06 280/0.6)",
                border: "1px solid oklch(0.4 0.1 280/0.3)",
                color: "oklch(0.78 0.08 280)",
              }}
            >
              {word}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 rounded-2xl p-5"
            style={{
              background: feedback.isCorrect
                ? "oklch(0.28 0.1 165/0.5)"
                : "oklch(0.22 0.1 0/0.5)",
              border: feedback.isCorrect
                ? "1px solid oklch(0.62 0.2 165)"
                : "1px solid oklch(0.62 0.2 15)",
            }}
          >
            <div className="mb-3 flex items-center gap-3">
              {feedback.isCorrect ? (
                <CheckCircle2 className="size-6 text-[oklch(0.85_0.15_165)]" />
              ) : (
                <div className="grid size-6 place-items-center rounded-full bg-[oklch(0.58_0.2_15)] text-white">
                  ✕
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-white">{feedback.encouragement}</p>
                <p className="text-sm text-white/70">Điểm: {feedback.score}/100</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/80">{feedback.feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!feedback ? (
          <>
            <motion.button
              type="button"
              onClick={handleCheck}
              disabled={selectedWords.length === 0 || isChecking}
              whileHover={selectedWords.length > 0 ? { scale: 1.02 } : {}}
              whileTap={selectedWords.length > 0 ? { scale: 0.98 } : {}}
              transition={spring}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg,oklch(0.55 0.24 200),oklch(0.72 0.22 55))",
                boxShadow: selectedWords.length > 0 ? "0 0 28px oklch(0.68 0.22 200/0.4)" : "none",
              }}
            >
              {isChecking ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Kiểm tra
                </>
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={spring}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-semibold text-white/70 hover:text-white"
            >
              <RotateCcw className="size-4" />
            </motion.button>
          </>
        ) : (
          <motion.button
            type="button"
            onClick={handleNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white"
            style={{
              background: "linear-gradient(135deg,oklch(0.48 0.22 285),oklch(0.44 0.24 305))",
              boxShadow: "0 0 22px oklch(0.65 0.22 280/0.4)",
            }}
          >
            {currentIndex < EXERCISES.length - 1 ? (
              <>
                Câu tiếp theo
                <ChevronRight className="size-4" />
              </>
            ) : (
              <>
                <Trophy className="size-4" />
                Bắt đầu lại
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
