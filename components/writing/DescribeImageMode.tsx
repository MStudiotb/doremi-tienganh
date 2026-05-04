"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, ChevronRight, Image as ImageIcon, Loader2, Send, Sparkles, Star } from "lucide-react"
import Image from "next/image"

// ── Types ──────────────────────────────────────────────────────────────────
type ImageExercise = {
  id: string
  imageUrl: string
  suggestedWords: string[]
  sampleDescriptions: string[]
  theme: string
}

type FeedbackData = {
  score: number
  creativity: number
  grammar: number
  vocabulary: number
  feedback: string
  encouragement: string
  highlights: string[]
}

// ── Sample exercises (templates) ───────────────────────────────────────────
const EXERCISE_TEMPLATES: Omit<ImageExercise, "id" | "imageUrl">[] = [
  {
    theme: "Gia đình",
    suggestedWords: ["family", "happy", "together", "love", "home"],
    sampleDescriptions: [
      "A happy family is sitting together",
      "The family loves spending time at home",
      "They are smiling and enjoying their time together",
    ],
  },
  {
    theme: "Trường học",
    suggestedWords: ["school", "students", "learning", "classroom", "teacher"],
    sampleDescriptions: [
      "Students are studying in the classroom",
      "The teacher is helping students learn",
      "Children are reading books at school",
    ],
  },
  {
    theme: "Thiên nhiên",
    suggestedWords: ["nature", "beautiful", "trees", "flowers", "sky"],
    sampleDescriptions: [
      "The nature is beautiful with many trees",
      "Colorful flowers are blooming in the garden",
      "The blue sky looks amazing today",
    ],
  },
  {
    theme: "Thể thao",
    suggestedWords: ["sport", "playing", "ball", "running", "team"],
    sampleDescriptions: [
      "Children are playing football together",
      "The team is running on the field",
      "They are having fun with the ball",
    ],
  },
  {
    theme: "Thức ăn",
    suggestedWords: ["food", "delicious", "eating", "cooking", "meal"],
    sampleDescriptions: [
      "The food looks delicious and fresh",
      "People are enjoying their meal together",
      "Someone is cooking a wonderful dish",
    ],
  },
]

// Hàm lấy ảnh cho một câu hỏi cụ thể (Hybrid: Local → AI → Fallback)
async function fetchImageForQuestion(
  questionId: string,
  theme: string,
  description: string
): Promise<string> {
  try {
    const themeSlug = theme
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/\s+/g, "-")

    console.log(`[fetchImageForQuestion] Starting - QuestionId: ${questionId}, Theme: ${theme}, Slug: ${themeSlug}`)

    // Priority 1: Check for local image with matching questionId
    const checkLocalResponse = await fetch(
      `/api/lessons/images?theme=${themeSlug}&questionId=${questionId}`
    )
    const localData = await checkLocalResponse.json()

    console.log(`[fetchImageForQuestion] Local check response:`, localData)

    if (localData.localImage) {
      console.log(`✓ Using local image for question ${questionId}: ${localData.localImage}`)
      return localData.localImage
    }

    // Priority 2: Generate image using AI
    console.log(`⚡ Generating AI image for question ${questionId}`)
    const generateResponse = await fetch("/api/lessons/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        theme,
        questionId,
      }),
    })

    console.log(`[fetchImageForQuestion] Generate response status: ${generateResponse.status}`)

    if (generateResponse.ok) {
      const generateData = await generateResponse.json()
      console.log(`[fetchImageForQuestion] Generate data:`, generateData)

      if (generateData.success && generateData.imageUrl) {
        // Save the generated image locally for future use
        console.log(`[fetchImageForQuestion] Saving generated image locally...`)
        const saveResponse = await fetch("/api/lessons/save-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: generateData.imageUrl,
            theme,
            questionId,
          }),
        })

        console.log(`[fetchImageForQuestion] Save response status: ${saveResponse.status}`)

        if (saveResponse.ok) {
          const saveData = await saveResponse.json()
          console.log(`✓ AI image saved locally: ${saveData.localPath}`)
          return saveData.localPath
        }

        // If saving fails, still use the AI-generated URL
        console.log(`⚠ Failed to save locally, using AI URL directly`)
        return generateData.imageUrl
      }
    }

    // Priority 3: Fallback to random local image
    console.log(`⚠ Falling back to random image for question ${questionId}`)
    console.log(`[fetchImageForQuestion] Available images:`, localData.images)
    
    if (localData.images && localData.images.length > 0) {
      const randomIndex = Math.floor(Math.random() * localData.images.length)
      const selectedImage = localData.images[randomIndex]
      console.log(`[fetchImageForQuestion] Selected random image: ${selectedImage}`)
      return selectedImage
    }

    // Final fallback: placeholder
    console.log(`[fetchImageForQuestion] No images available, using placeholder`)
    return "/placeholder.jpg"
  } catch (error) {
    console.error("[fetchImageForQuestion] Error fetching image:", error)
    return "/placeholder.jpg"
  }
}

// Hàm tạo exercises với ảnh hybrid
async function createExercisesWithHybridImages(): Promise<ImageExercise[]> {
  const exercises: ImageExercise[] = []

  for (let index = 0; index < EXERCISE_TEMPLATES.length; index++) {
    const template = EXERCISE_TEMPLATES[index]
    const questionId = String(index + 1)

    // Create a description for AI generation
    const description = `${template.theme}: ${template.sampleDescriptions[0]}`

    // Fetch image using hybrid approach
    const imageUrl = await fetchImageForQuestion(questionId, template.theme, description)

    exercises.push({
      id: questionId,
      imageUrl,
      ...template,
    })
  }

  return exercises
}

const spring = { type: "spring" as const, stiffness: 240, damping: 22 }

// ── Main Component ────────────────────────────────────────────────────────
export function DescribeImageMode() {
  const [exercises, setExercises] = useState<ImageExercise[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [showSamples, setShowSamples] = useState(false)

  // Load ảnh khi component mount
  useEffect(() => {
    async function loadImages() {
      console.log("[DescribeImageMode] Starting to load images...")
      setIsLoadingImages(true)
      const newExercises = await createExercisesWithHybridImages()
      console.log("[DescribeImageMode] Loaded exercises:", newExercises)
      setExercises(newExercises)
      setIsLoadingImages(false)
    }
    loadImages()
  }, [])

  const currentExercise = exercises[currentIndex]

  // Nếu đang load hoặc chưa có exercises, hiển thị loading
  if (isLoadingImages || !currentExercise) {
    return (
      <div
        className="overflow-hidden rounded-[2rem] p-6 md:p-8"
        style={{
          background: "linear-gradient(145deg,oklch(0.17 0.07 280/0.92),oklch(0.13 0.05 265/0.96))",
          border: "1px solid oklch(0.55 0.18 300/0.25)",
          boxShadow: "0 0 0 1px oklch(0.5 0.15 285/0.12) inset, 0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 size-12 animate-spin text-white/50" />
            <p className="text-white/70">Đang tải hình ảnh...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleCheck = async () => {
    if (!userInput.trim()) return

    setIsChecking(true)

    try {
      const response = await fetch("/api/writing/check-sentence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userSentence: userInput.trim(),
          mode: "describe",
          theme: currentExercise.theme,
          suggestedWords: currentExercise.suggestedWords,
        }),
      })

      const data = await response.json() as FeedbackData
      setFeedback(data)
    } catch (error) {
      console.error("Error checking description:", error)
      // Fallback scoring
      const wordCount = userInput.trim().split(/\s+/).length
      const hasCapital = /^[A-Z]/.test(userInput.trim())
      const hasPunctuation = /[.!?]$/.test(userInput.trim())
      const usedSuggestedWords = currentExercise.suggestedWords.filter((word) =>
        userInput.toLowerCase().includes(word.toLowerCase())
      ).length

      const baseScore = Math.min(100, wordCount * 10)
      const grammarBonus = (hasCapital ? 10 : 0) + (hasPunctuation ? 10 : 0)
      const vocabBonus = usedSuggestedWords * 5

      const totalScore = Math.min(100, baseScore + grammarBonus + vocabBonus)

      setFeedback({
        score: totalScore,
        creativity: Math.min(100, wordCount * 15),
        grammar: hasCapital && hasPunctuation ? 90 : 70,
        vocabulary: Math.min(100, usedSuggestedWords * 20 + 50),
        feedback:
          totalScore >= 80
            ? "Tuyệt vời! Câu mô tả của bạn rất hay và sáng tạo!"
            : totalScore >= 60
              ? "Khá tốt! Hãy thử thêm chi tiết để câu hay hơn nhé!"
              : "Cố gắng thêm! Hãy dùng nhiều từ vựng hơn và chú ý ngữ pháp.",
        encouragement:
          totalScore >= 80 ? "Xuất sắc! 🌟" : totalScore >= 60 ? "Tốt lắm! 💪" : "Cố lên! 📚",
        highlights: [
          hasCapital ? "Viết hoa đầu câu đúng" : "Nhớ viết hoa chữ cái đầu câu",
          hasPunctuation ? "Có dấu câu cuối câu" : "Nhớ thêm dấu chấm cuối câu",
          usedSuggestedWords > 0
            ? `Sử dụng ${usedSuggestedWords} từ gợi ý`
            : "Thử dùng các từ gợi ý để câu hay hơn",
        ],
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleNext = async () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Khi hết bài, load lại exercises với hybrid images
      setIsLoadingImages(true)
      const newExercises = await createExercisesWithHybridImages()
      setExercises(newExercises)
      setCurrentIndex(0)
      setIsLoadingImages(false)
    }
    setUserInput("")
    setFeedback(null)
    setShowSamples(false)
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
          className="relative size-12 overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(135deg,oklch(0.58 0.22 165),oklch(0.52 0.24 145))",
            boxShadow: "0 0 24px oklch(0.65 0.22 165/0.4)",
          }}
        >
          <Image
            src="/motahinhanh.png"
            alt="Mô tả hình ảnh"
            width={48}
            height={48}
            className="size-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Mô tả hình ảnh</h2>
          <p className="text-sm text-white/45">
            Câu {currentIndex + 1} / {exercises.length}
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
          animate={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Theme badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-white/50">Chủ đề:</span>
        <span
          className="rounded-full px-3 py-1 text-sm font-bold"
          style={{
            background: "oklch(0.22 0.08 285/0.5)",
            border: "1px solid oklch(0.55 0.2 285/0.3)",
            color: "oklch(0.72 0.2 285)",
          }}
        >
          {currentExercise.theme}
        </span>
      </div>

      {/* Image */}
      <div
        className="mb-6"
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          border: "2px solid oklch(0.45 0.12 280/0.3)",
        }}
      >
        <div
          className="relative aspect-video w-full"
          style={{
            backgroundImage:
              currentExercise.imageUrl !== "/placeholder.jpg"
                ? `url("${currentExercise.imageUrl}")`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor:
              currentExercise.imageUrl === "/placeholder.jpg"
                ? "oklch(0.15 0.05 280)"
                : "transparent",
          }}
          onError={(e) => {
            console.error(`[DescribeImageMode] Failed to load image: ${currentExercise.imageUrl}`)
          }}
        >
          {currentExercise.imageUrl === "/placeholder.jpg" && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-blue-900/40">
              <div className="text-center">
                <ImageIcon className="mx-auto mb-2 size-12 text-white/30" />
                <p className="text-sm text-white/50">Hình ảnh về {currentExercise.theme}</p>
                <p className="mt-2 text-xs text-white/40">
                  Thêm ảnh vào /public/lessons/gia-dinh/
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested words */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="size-4 text-[oklch(0.82_0.2_85)]" />
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">
            Từ vựng gợi ý:
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentExercise.suggestedWords.map((word, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl px-3 py-1.5 text-sm font-semibold"
              style={{
                background: "oklch(0.22 0.08 285/0.5)",
                border: "1px solid oklch(0.55 0.2 285/0.3)",
                color: "oklch(0.82 0.2 200)",
              }}
            >
              {word}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sample descriptions button */}
      {!feedback && (
        <button
          type="button"
          onClick={() => setShowSamples(!showSamples)}
          className="mb-4 flex items-center gap-2 text-sm text-[oklch(0.72_0.2_200)] transition-colors hover:text-[oklch(0.82_0.2_200)]"
        >
          <Star className="size-4" />
          {showSamples ? "Ẩn câu mẫu" : "Xem câu mẫu"}
        </button>
      )}

      {/* Sample descriptions */}
      <AnimatePresence>
        {showSamples && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2 overflow-hidden"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-white/40">Câu mẫu:</p>
            {currentExercise.sampleDescriptions.map((sample, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl px-4 py-3 text-sm text-white/70"
                style={{
                  background: "oklch(0.18 0.06 285/0.5)",
                  border: "1px solid oklch(0.5 0.15 285/0.2)",
                }}
              >
                {index + 1}. {sample}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/40">
          Mô tả của bạn:
        </p>
        <div className="flex gap-3">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={feedback !== null}
            placeholder="Viết câu mô tả hình ảnh bằng tiếng Anh..."
            rows={3}
            className="flex-1 resize-none rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder:text-white/30 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: "oklch(0.12 0.04 280/0.8)",
              border: "1px solid oklch(0.45 0.12 280/0.3)",
              outline: "none",
            }}
          />
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
            {/* Main feedback */}
            <div
              className="rounded-2xl p-5"
              style={{
                background:
                  feedback.score >= 80
                    ? "oklch(0.28 0.1 165/0.5)"
                    : feedback.score >= 60
                      ? "oklch(0.25 0.1 55/0.5)"
                      : "oklch(0.22 0.1 0/0.5)",
                border:
                  feedback.score >= 80
                    ? "1px solid oklch(0.62 0.2 165)"
                    : feedback.score >= 60
                      ? "1px solid oklch(0.62 0.2 55)"
                      : "1px solid oklch(0.62 0.2 15)",
              }}
            >
              <div className="mb-3 flex items-center gap-3">
                {feedback.score >= 80 ? (
                  <CheckCircle2 className="size-6 text-[oklch(0.85_0.15_165)]" />
                ) : (
                  <Star className="size-6 text-[oklch(0.82_0.2_85)]" />
                )}
                <div>
                  <p className="text-lg font-bold text-white">{feedback.encouragement}</p>
                  <p className="text-sm text-white/70">Tổng điểm: {feedback.score}/100</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/80">{feedback.feedback}</p>
            </div>

            {/* Detailed scores */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "oklch(0.18 0.06 285/0.5)",
                border: "1px solid oklch(0.5 0.15 285/0.2)",
              }}
            >
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">
                Chi tiết điểm:
              </p>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-white/70">Sáng tạo</span>
                    <span className="font-bold text-white">{feedback.creativity}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${feedback.creativity}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-white/70">Ngữ pháp</span>
                    <span className="font-bold text-white">{feedback.grammar}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${feedback.grammar}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-white/70">Từ vựng</span>
                    <span className="font-bold text-white">{feedback.vocabulary}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${feedback.vocabulary}%` }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Highlights */}
            {feedback.highlights && feedback.highlights.length > 0 && (
              <div
                className="rounded-2xl p-4"
                style={{
                  background: "oklch(0.18 0.06 285/0.5)",
                  border: "1px solid oklch(0.5 0.15 285/0.2)",
                }}
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/40">
                  Nhận xét:
                </p>
                <ul className="space-y-1">
                  {feedback.highlights.map((highlight, index) => (
                    <li key={index} className="text-sm text-white/70">
                      • {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!feedback ? (
          <motion.button
            type="button"
            onClick={handleCheck}
            disabled={!userInput.trim() || isChecking}
            whileHover={userInput.trim() ? { scale: 1.02 } : {}}
            whileTap={userInput.trim() ? { scale: 0.98 } : {}}
            transition={spring}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg,oklch(0.55 0.24 200),oklch(0.72 0.22 55))",
              boxShadow: userInput.trim() ? "0 0 28px oklch(0.68 0.22 200/0.4)" : "none",
            }}
          >
            {isChecking ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang chấm điểm...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Gửi câu trả lời
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handleNext}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white"
            style={{
              background: "linear-gradient(135deg,oklch(0.58 0.22 165),oklch(0.52 0.24 145))",
              boxShadow: "0 0 22px oklch(0.65 0.22 165/0.4)",
            }}
          >
            Hình tiếp theo
            <ChevronRight className="size-4" />
          </motion.button>
        )}
      </div>
    </div>
  )
}
