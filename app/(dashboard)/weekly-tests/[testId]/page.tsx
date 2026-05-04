"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import html2canvas from "html2canvas"
import { Loader2, Send } from "lucide-react"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
  points: number
}

interface WeeklyTest {
  _id: string
  title: string
  description: string
  week: number
  year: number
  questions: Question[]
  totalPoints: number
}

export default function TakeTestPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string
  
  const [session, setSession] = useState<any>(null)
  const [test, setTest] = useState<WeeklyTest | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const testSheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sessionData = localStorage.getItem("doremi_session")
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData)
        setSession(parsedSession)
        fetchTest(parsedSession)
      } catch (error) {
        console.error("Error parsing session:", error)
        router.push("/auth/login")
      }
    } else {
      router.push("/auth/login")
    }
  }, [testId])

  async function fetchTest(sessionData: any) {
    try {
      const response = await fetch(`/api/weekly-tests?role=${sessionData.role}`)
      const data = await response.json()

      if (data.success) {
        const foundTest = data.tests.find((t: any) => t._id === testId)
        if (foundTest) {
          setTest(foundTest)
        } else {
          router.push("/weekly-tests")
        }
      }
    } catch (error) {
      console.error("Error fetching test:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }))
  }

  const handleSubmit = async () => {
    if (!test || !session) return

    // Check if all questions are answered
    const unansweredCount = test.questions.length - Object.keys(answers).length
    if (unansweredCount > 0) {
      if (!confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?`)) {
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Capture screenshot of the test sheet
      let screenshotDataUrl = ""
      
      try {
        if (testSheetRef.current) {
          const canvas = await html2canvas(testSheetRef.current, {
            backgroundColor: "#ffffff",
            scale: 1.5, // Reduced from 2 to optimize size
            logging: false,
            useCORS: true,
          })

          // Compress to JPEG with quality 0.7 to reduce size
          screenshotDataUrl = canvas.toDataURL("image/jpeg", 0.7)
        }
      } catch (screenshotError) {
        console.error("Screenshot error:", screenshotError)
        // Continue without screenshot - AI can still grade based on answers
      }

      // Calculate score
      let correctCount = 0
      const questionResults = test.questions.map((q, index) => {
        const userAnswer = answers[index]
        const isCorrect = userAnswer === q.correctAnswer
        if (isCorrect) correctCount++

        return {
          questionIndex: index,
          userAnswer: userAnswer ?? -1,
          correctAnswer: q.correctAnswer,
          isCorrect,
          points: isCorrect ? q.points : 0,
        }
      })

      const totalScore = (correctCount / test.questions.length) * 10

      // Submit to API with screenshot for AI grading
      const submitResponse = await fetch("/api/weekly-tests/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testId: test._id,
          userId: session.email,
          userName: session.name || session.email,
          userAvatar: session.avatar || "/placeholder-user.jpg",
          answers: questionResults,
          totalScore,
          screenshot: screenshotDataUrl,
        }),
      })

      const submitData = await submitResponse.json()

      if (submitData.success) {
        // Show success message
        alert(`✅ Nộp bài thành công! Điểm: ${submitData.score}/10\n\n${submitData.feedback}`)
        // Redirect to result page
        router.push(`/weekly-tests/${testId}/result`)
      } else {
        console.error("Submission failed:", submitData)
        alert(`❌ Lỗi nộp bài: ${submitData.error || "Vui lòng thử lại"}`)
      }
    } catch (error) {
      console.error("Error submitting test:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      alert(`❌ Có lỗi xảy ra khi nộp bài:\n${errorMessage}\n\nVui lòng kiểm tra kết nối mạng và thử lại.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,oklch(0.28_0.1_290/0.55),transparent_42rem),linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.18_0.08_275),oklch(0.18_0.08_245))]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[oklch(0.72_0.28_320)] border-t-transparent" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,oklch(0.28_0.1_290/0.55),transparent_42rem),linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.18_0.08_275),oklch(0.18_0.08_245))]">
        <p className="text-white">Không tìm thấy bài thi</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,oklch(0.28_0.1_290/0.55),transparent_42rem),linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.18_0.08_275),oklch(0.18_0.08_245))] py-4 sm:py-8 md:py-12 pb-20 sm:pb-12">
      <div className="mx-auto max-w-[210mm] px-2 sm:px-4">
        {/* A4 Test Sheet - Responsive */}
        <motion.div
          ref={testSheetRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white shadow-2xl w-full"
          style={{
            maxWidth: "210mm",
            minHeight: "297mm",
            padding: "clamp(12px, 4vw, 20mm)",
          }}
        >
          {/* Submit Button - Fixed Position - Responsive */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="fixed right-2 top-2 sm:right-4 sm:top-4 md:right-8 md:top-8 z-50 flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-[oklch(0.72_0.28_320)] to-[oklch(0.58_0.22_280)] px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 text-sm sm:text-base font-bold text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 touch-manipulation"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang nộp bài...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Nộp bài
              </>
            )}
          </button>

          {/* Header - Responsive */}
          <div className="mb-4 sm:mb-6 md:mb-8 border-b-2 border-gray-300 pb-3 sm:pb-4 md:pb-6 text-center">
            <h1 
              className="mb-1 sm:mb-2 text-lg sm:text-2xl md:text-3xl text-gray-900 leading-tight"
              style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900 }}
            >
              {test.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Tuần {test.week} - {test.year} | Tổng điểm: {test.totalPoints}
            </p>
            {test.description && (
              <p className="mt-2 text-sm italic text-gray-500">
                {test.description}
              </p>
            )}
          </div>

          {/* Student Info - Responsive */}
          <div className="mb-4 sm:mb-6 md:mb-8 rounded-lg border-2 border-gray-200 bg-gray-50 p-2 sm:p-3 md:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
              <div>
                <span className="font-bold text-gray-700">Họ và tên:</span>{" "}
                <span className="text-gray-900">{session?.name || session?.email}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700">Ngày làm bài:</span>{" "}
                <span className="text-gray-900">
                  {new Date().toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Questions - Responsive */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {test.questions.map((question, qIndex) => (
              <div key={qIndex} className="rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6">
                {/* Question */}
                <div className="mb-3 sm:mb-4">
                  <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                    Câu {qIndex + 1}: {question.question}
                  </p>
                </div>

                {/* Options with Circular Selection - Touch-friendly */}
                <div className="space-y-2 sm:space-y-3">
                  {question.options.map((option, oIndex) => {
                    const isSelected = answers[qIndex] === oIndex
                    const letter = String.fromCharCode(65 + oIndex) // A, B, C, D

                    return (
                      <div
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        className="flex cursor-pointer items-center gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 transition-colors hover:bg-gray-50 active:bg-gray-100 touch-manipulation min-h-[44px]"
                      >
                        {/* Circular Checkbox - Touch-friendly size */}
                        <div className="relative flex h-10 w-10 sm:h-9 sm:w-9 md:h-8 md:w-8 flex-shrink-0 items-center justify-center">
                          <div
                            className={[
                              "h-10 w-10 sm:h-9 sm:w-9 md:h-8 md:w-8 rounded-full border-2 transition-all",
                              isSelected
                                ? "border-[oklch(0.72_0.28_320)] bg-[oklch(0.72_0.28_320)]/10"
                                : "border-gray-300 bg-white",
                            ].join(" ")}
                          />
                          {isSelected && (
                            <Image
                              src="/chuong.png"
                              alt="Selected"
                              width={24}
                              height={24}
                              className="absolute"
                            />
                          )}
                        </div>

                        {/* Option Text - Responsive */}
                        <span
                          className={[
                            "text-xs sm:text-sm leading-snug",
                            isSelected
                              ? "font-bold text-gray-900"
                              : "text-gray-700",
                          ].join(" ")}
                        >
                          {option}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Responsive */}
          <div className="mt-6 sm:mt-8 md:mt-12 border-t-2 border-gray-300 pt-3 sm:pt-4 md:pt-6 text-center">
            <p className="text-xs sm:text-sm italic text-gray-500">
              Chúc em làm bài tốt! - Cô Doremi 💜
            </p>
          </div>
        </motion.div>

        {/* Progress Indicator - Responsive */}
        <div className="mt-4 sm:mt-6 text-center pb-4">
          <p className="text-xs sm:text-sm text-white/80">
            Đã trả lời: {Object.keys(answers).length}/{test.questions.length} câu
          </p>
        </div>
      </div>
    </div>
  )
}
