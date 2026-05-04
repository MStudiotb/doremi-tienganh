"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, BookText, Image as ImageIcon, Languages, PenLine, Sparkles } from "lucide-react"
import { ArrangeWordsMode } from "@/components/writing/ArrangeWordsMode"
import { TranslateWithNobitaMode } from "@/components/writing/TranslateWithNobitaMode"
import { DescribeImageMode } from "@/components/writing/DescribeImageMode"

// ── Types ──────────────────────────────────────────────────────────────────
type WritingMode = "select" | "arrange" | "translate" | "describe"

// ── Spring transition preset ──────────────────────────────────────────────
const spring = { type: "spring" as const, stiffness: 240, damping: 22 }

// ── Mode Card Component ───────────────────────────────────────────────────
function ModeCard({
  title,
  description,
  icon: Icon,
  gradient,
  onClick,
}: {
  title: string
  description: string
  icon: React.ElementType
  gradient: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={spring}
      className="group relative overflow-hidden rounded-3xl p-6 text-left"
      style={{
        background: "oklch(0.15 0.05 280/0.7)",
        border: "1px solid oklch(0.45 0.12 280/0.25)",
      }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: gradient,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div
          className="mb-4 inline-grid size-14 place-items-center rounded-2xl"
          style={{
            background: gradient,
            boxShadow: "0 0 24px oklch(0.65 0.22 200/0.3)",
          }}
        >
          <Icon className="size-7 text-white" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-white/60">{description}</p>
      </div>

      {/* Arrow indicator */}
      <div className="absolute bottom-6 right-6 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white">
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  )
}

// ── Main Page Component ───────────────────────────────────────────────────
export default function WritingPracticePage() {
  const [mode, setMode] = useState<WritingMode>("select")

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
        className="w-full max-w-4xl"
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {/* ── MODE SELECTION ── */}
          {mode === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center gap-4">
                <div
                  className="grid size-16 place-items-center rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.72 0.22 55))",
                    boxShadow: "0 0 32px oklch(0.65 0.22 200/0.5)",
                  }}
                >
                  <PenLine className="size-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white">Viết Câu</h1>
                  <p className="text-sm text-white/50">
                    Chọn chế độ luyện tập để bắt đầu
                  </p>
                </div>
              </div>

              {/* Info banner */}
              <div
                className="flex items-start gap-3 rounded-2xl p-5"
                style={{
                  background: "oklch(0.18 0.06 285/0.5)",
                  border: "1px solid oklch(0.5 0.15 285/0.2)",
                }}
              >
                <Sparkles className="mt-0.5 size-5 shrink-0 text-[oklch(0.82_0.2_85)]" />
                <div className="text-sm text-white/70">
                  <p className="font-semibold text-white">AI sẽ chấm điểm và đưa ra lời khuyên!</p>
                  <p className="mt-1">
                    Sau mỗi câu viết, bạn sẽ nhận được điểm số và những lời khuyên vui vẻ từ AI để cải thiện kỹ năng viết của mình.
                  </p>
                </div>
              </div>

              {/* Mode cards */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ModeCard
                  title="Xếp từ thành câu"
                  description="Sắp xếp các từ đã cho theo đúng thứ tự để tạo thành câu hoàn chỉnh."
                  icon={BookText}
                  gradient="linear-gradient(135deg,oklch(0.55 0.24 200),oklch(0.5 0.26 220))"
                  onClick={() => setMode("arrange")}
                />
                <ModeCard
                  title="Dịch câu cùng Nobita"
                  description="Dịch câu tiếng Việt sang tiếng Anh với sự trợ giúp của Nobita."
                  icon={Languages}
                  gradient="linear-gradient(135deg,oklch(0.48 0.22 285),oklch(0.44 0.24 305))"
                  onClick={() => setMode("translate")}
                />
                <ModeCard
                  title="Mô tả hình ảnh"
                  description="Viết câu mô tả hình ảnh bằng tiếng Anh một cách sáng tạo."
                  icon={ImageIcon}
                  gradient="linear-gradient(135deg,oklch(0.58 0.22 165),oklch(0.52 0.24 145))"
                  onClick={() => setMode("describe")}
                />
              </div>
            </motion.div>
          )}

          {/* ── ARRANGE WORDS MODE ── */}
          {mode === "arrange" && (
            <motion.div
              key="arrange"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                onClick={() => setMode("select")}
                className="mb-6 flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Quay lại
              </button>
              <ArrangeWordsMode />
            </motion.div>
          )}

          {/* ── TRANSLATE MODE ── */}
          {mode === "translate" && (
            <motion.div
              key="translate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                onClick={() => setMode("select")}
                className="mb-6 flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Quay lại
              </button>
              <TranslateWithNobitaMode />
            </motion.div>
          )}

          {/* ── DESCRIBE IMAGE MODE ── */}
          {mode === "describe" && (
            <motion.div
              key="describe"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                onClick={() => setMode("select")}
                className="mb-6 flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Quay lại
              </button>
              <DescribeImageMode />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
