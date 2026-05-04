"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, ChevronRight, Languages, Lightbulb, Loader2, Send, Sparkles } from "lucide-react"
import Image from "next/image"

// ── Types ──────────────────────────────────────────────────────────────────
type Exercise = {
  id: string
  vietnameseSentence: string
  correctTranslation: string
  difficulty: "easy" | "medium" | "hard"
  hints: string[]
}

type FeedbackData = {
  score: number
  isCorrect: boolean
  feedback: string
  encouragement: string
  suggestions?: string[]
}

// ── Sample exercises ───────────────────────────────────────────────────────
const EXERCISES: Exercise[] = [
  {
    id: "1",
    vietnameseSentence: "Tôi thích học tiếng Anh",
    correctTranslation: "I like learning English",
    difficulty: "easy",
    hints: ["Sử dụng 'like' + V-ing", "Động từ 'học' là 'learn'"],
  },
  {
    id: "2",
    vietnameseSentence: "Cô ấy đang đọc sách ở thư viện",
    correctTranslation: "She is reading a book in the library",
    difficulty: "medium",
    hints: ["Thì hiện tại tiếp diễn", "Giới từ chỉ nơi chốn: 'in'"],
  },
  {
    id: "3",
    vietnameseSentence: "Chúng tôi đã đi du lịch Đà Nẵng vào mùa hè năm ngoái",
    correctTranslation: "We traveled to Da Nang last summer",
    difficulty: "hard",
    hints: ["Thì quá khứ đơn", "Giới từ 'to' với địa điểm"],
  },
  {
    id: "4",
    vietnameseSentence: "Bố tôi làm việc ở bệnh viện",
    correctTranslation: "My father works at the hospital",
    difficulty: "easy",
    hints: ["Thì hiện tại đơn", "Giới từ 'at' với địa điểm làm việc"],
  },
  {
    id: "5",
    vietnameseSentence: "Họ sẽ tổ chức một bữa tiệc vào cuối tuần này",
    correctTranslation: "They will have a party this weekend",
    difficulty: "medium",
    hints: ["Thì tương lai đơn", "'have a party' = tổ chức tiệc"],
  },
]

const spring = { type: "spring" as const, stiffness: 240, damping: 22 }

// ── Nobita Character Component ────────────────────────────────────────────
function NobitaCharacter({ message, isThinking }: { message?: string; isThinking?: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative">
        <Image
          src="/nobita.png"
          alt="Nobita"
          width={80}
          height={80}
          className="rounded-2xl"
        />
        {isThinking && (
          <motion.div
            className="absolute -right-2 -top-2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Sparkles className="size-5 text-yellow-400" fill="currentColor" />
          </motion.div>
        )}
      </div>
      {message && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 rounded-2xl p-4"
          style={{
            background: "oklch(0.18 0.06 285/0.5)",
            border: "1px solid oklch(0.5 0.15 285/0.2)",
          }}
        >
          <p className="text-sm font-semibold text-[oklch(0.82_0.2_200)]">Nobita:</p>
          <p className="mt-1 text-sm leading-relaxed text-white/80">{message}</p>
        </motion.div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────
export function TranslateWithNobitaMode() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [nobitaMessage, setNobitaMessage] = useState<string>(
    "Xin chào! Mình là Nobita. Hãy dịch câu tiếng Việt sang tiếng Anh nhé! Mình sẽ giúp bạn nếu bạn cần gợi ý đấy! 😊"
  )

  const currentExercise = EXERCISES[currentIndex]

  const handleCheck = async () => {
    if (!userInput.trim()) return

    setIsChecking(true)
    setNobitaMessage("Để mình kiểm tra xem... 🤔")

    try {
      const response = await fetch("/api/writing/check-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSentence: userInput.trim(),
          correctSentence: currentExercise.correctTranslation,
          mode: "translate",
          vietnameseSentence: currentExercise.vietnameseSentence,
        }),
      })

      const data = await response.json() as FeedbackData
      setFeedback(data)

      // Update Nobita's message based on result
      if (data.isCorrect) {
        setNobitaMessage("Tuyệt vời! Bạn dịch đúng rồi! Mình rất tự hào về bạn! 🎉")
      } else {
        setNobitaMessage("Chưa hoàn toàn chính xác, nhưng đừng nản lòng nhé! Hãy xem gợi ý của mình và thử lại! 💪")
      }
    } catch (error) {
      console.error("Error checking translation:", error)
      // Fallback to simple check
      const isCorrect = userInput.trim().toLowerCase() === currentExercise.correctTranslation.toLowerCase()
      setFeedback({
        score: isCorrect ? 100 : 50,
        isCorrect,
        feedback: isCorrect
          ? "Chính xác! Bạn đã dịch đúng câu."
          : `Câu dịch chuẩn: "${currentExercise.correctTranslation}"`,
        encouragement: isCorrect ? "Xuất sắc! 🎉" : "Cố gắng thêm nhé! 💪",
      })
      setNobitaMessage(
        isCorrect
          ? "Tuyệt vời! Bạn dịch đúng rồi! 🎉"
          : "Chưa đúng lắm, nhưng đừng lo! Hãy xem câu đúng và học hỏi nhé! 😊"
      )
    } finally {
      setIsChecking(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < EXERCISES.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
    setUserInput("")
    setFeedback(null)
    setShowHints(false)
    setNobitaMessage("Câu tiếp theo đây! Bạn làm được mà! 💪")
  }

  const handleShowHints = () => {
    setShowHints(!showHints)
    if (!showHints) {
      setNobitaMessage("Đây là những gợi ý của mình! Hy vọng sẽ giúp ích cho bạn! 😊")
    }
  }

  const difficultyColor = {
    easy: "oklch(0.72 0.2 165)",
    medium: "oklch(0.78 0.2 55)",
    hard: "oklch(0.72 0.28 15)",
  }

  const difficultyLabel = {
    easy: "Dễ",
    medium: "Trung bình",
    hard: "Khó",
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="grid size-12 place-items-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg,oklch(0.48 0.22 285),oklch(0.44 0.24 305))",
              boxShadow: "0 0 24px oklch(0.65 0.22 285/0.4)",
            }}
          >
            <Languages className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Dịch câu cùng Nobita</h2>
            <p className="text-sm text-white/45">
              Câu {currentIndex + 1} / {EXERCISES.length}
            </p>
          </div>
        </div>
        <div
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: `${difficultyColor[currentExercise.difficulty]}/0.2`,
            border: `1px solid ${difficultyColor[currentExercise.difficulty]}`,
            color: difficultyColor[currentExercise.difficulty],
          }}
        >
          {difficultyLabel[currentExercise.difficulty]}
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

      {/* Nobita character */}
      <div className="mb-6">
        <NobitaCharacter message={nobitaMessage} isThinking={isChecking} />
      </div>

      {/* Vietnamese sentence */}
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
        <p className="text-lg font-semibold text-white">{currentExercise.vietnameseSentence}</p>
      </div>

      {/* Hints button */}
      {!feedback && (
        <button
          type="button"
          onClick={handleShowHints}
          className="mb-4 flex items-center gap-2 text-sm text-[oklch(0.72_0.2_200)] transition-colors hover:text-[oklch(0.82_0.2_200)]"
        >
          <Lightbulb className="size-4" />
          {showHints ? "Ẩn gợi ý" : "Xem gợi ý từ Nobita"}
        </button>
      )}

      {/* Hints */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2 overflow-hidden"
          >
            {currentExercise.hints.map((hint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm text-white/70"
                style={{
                  background: "oklch(0.18 0.06 285/0.5)",
                  border: "1px solid oklch(0.5 0.15 285/0.2)",
                }}
              >
                <span className="text-yellow-400">💡</span>
                {hint}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/40">
          Câu dịch của bạn:
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !feedback) {
                void handleCheck()
              }
            }}
            disabled={feedback !== null}
            placeholder="Nhập câu dịch tiếng Anh..."
            className="flex-1 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: "oklch(0.12 0.04 280/0.8)",
              border: "1px solid oklch(0.45 0.12 280/0.3)",
              outline: "none",
            }}
          />
          {!feedback && (
            <motion.button
              type="button"
              onClick={handleCheck}
              disabled={!userInput.trim() || isChecking}
              whileHover={userInput.trim() ? { scale: 1.05 } : {}}
              whileTap={userInput.trim() ? { scale: 0.95 } : {}}
              transition={spring}
              className="grid size-14 shrink-0 place-items-center rounded-2xl disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg,oklch(0.55 0.24 200),oklch(0.72 0.22 55))",
                boxShadow: userInput.trim() ? "0 0 24px oklch(0.68 0.22 200/0.4)" : "none",
              }}
            >
              {isChecking ? (
                <Loader2 className="size-5 animate-spin text-white" />
              ) : (
                <Send className="size-5 text-white" />
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 space-y-4"
          >
            <div
              className="rounded-2xl p-5"
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
            </div>

            {feedback.suggestions && feedback.suggestions.length > 0 && (
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "oklch(0.18 0.06 285/0.5)",
                  border: "1px solid oklch(0.5 0.15 285/0.2)",
                }}
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/40">
                  Gợi ý cải thiện:
                </p>
                <ul className="space-y-1">
                  {feedback.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-white/70">
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next button */}
      {feedback && (
        <motion.button
          type="button"
          onClick={handleNext}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={spring}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white"
          style={{
            background: "linear-gradient(135deg,oklch(0.48 0.22 285),oklch(0.44 0.24 305))",
            boxShadow: "0 0 22px oklch(0.65 0.22 280/0.4)",
          }}
        >
          Câu tiếp theo
          <ChevronRight className="size-4" />
        </motion.button>
      )}
    </div>
  )
}
