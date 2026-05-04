"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { Trophy, CheckCircle, XCircle, ArrowLeft, Share2 } from "lucide-react"
import confetti from "canvas-confetti"

interface TestSubmission {
  _id: string
  testId: string
  userId: string
  userName: string
  answers: any[]
  totalScore: number
  aiTeacherFeedback: string
  screenshot?: string
  submittedAt: string
  gradedBy: string
}

interface WeeklyTest {
  _id: string
  title: string
  description: string
  week: number
  year: number
  questions: any[]
  totalPoints: number
}

export default function TestResultPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.testId as string
  
  const [session, setSession] = useState<any>(null)
  const [submission, setSubmission] = useState<TestSubmission | null>(null)
  const [test, setTest] = useState<WeeklyTest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionData = localStorage.getItem("doremi_session")
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData)
        setSession(parsedSession)
        fetchResult(parsedSession)
      } catch (error) {
        console.error("Error parsing session:", error)
        router.push("/auth/login")
      }
    } else {
      router.push("/auth/login")
    }
  }, [testId])

  async function fetchResult(sessionData: any) {
    try {
      // Fetch submission
      const subResponse = await fetch(
        `/api/weekly-tests/submit?testId=${testId}&userId=${sessionData.email}`
      )
      const subData = await subResponse.json()

      if (subData.success && subData.submission) {
        setSubmission(subData.submission)

        // Trigger confetti if score is high
        if (subData.submission.totalScore >= 8) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            })
          }, 500)
        }
      }

      // Fetch test details
      const testResponse = await fetch(`/api/weekly-tests?role=${sessionData.role}`)
      const testData = await testResponse.json()

      if (testData.success) {
        const foundTest = testData.tests.find((t: any) => t._id === testId)
        if (foundTest) {
          setTest(foundTest)
        }
      }
    } catch (error) {
      console.error("Error fetching result:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400"
    if (score >= 6) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 9) return "🌟"
    if (score >= 8) return "🎉"
    if (score >= 6) return "👍"
    return "💪"
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,oklch(0.28_0.1_290/0.55),transparent_42rem),linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.18_0.08_275),oklch(0.18_0.08_245))]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[oklch(0.72_0.28_320)] border-t-transparent" />
      </div>
    )
  }

  if (!submission || !test) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,oklch(0.28_0.1_290/0.55),transparent_42rem),linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.18_0.08_275),oklch(0.18_0.08_245))]">
        <div className="text-center">
          <p className="text-white">Không tìm thấy kết quả bài thi</p>
          <button
            onClick={() => router.push("/weekly-tests")}
            className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-white hover:bg-white/20"
          >
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  const correctCount = submission.answers.filter((a) => a.isCorrect).length
  const totalQuestions = test.questions.length

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,oklch(0.28_0.1_290/0.55),transparent_42rem),linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.18_0.08_275),oklch(0.18_0.08_245))] p-8 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.push("/weekly-tests")}
          className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          Quay lại danh sách bài thi
        </button>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass mb-8 overflow-hidden rounded-[2rem]"
        >
          <div className="relative bg-gradient-to-br from-[oklch(0.72_0.28_320)] via-[oklch(0.65_0.25_300)] to-[oklch(0.58_0.22_280)] p-8 text-center">
            <div className="absolute inset-0 bg-[url('/chuong.png')] bg-cover opacity-5" />
            <div className="relative">
              <div className="mb-4 text-6xl">{getScoreEmoji(submission.totalScore)}</div>
              <h1 
                className="mb-2 text-4xl text-white"
                style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900 }}
              >
                Kết Quả Bài Thi
              </h1>
              <p className="text-lg text-white/80">{test.title}</p>
              
              <div className="mt-6">
                <div className={`text-7xl font-black ${getScoreColor(submission.totalScore)}`}>
                  {submission.totalScore}
                  <span className="text-4xl">/10</span>
                </div>
                <p className="mt-2 text-white/80">
                  Đúng {correctCount}/{totalQuestions} câu
                </p>
              </div>
            </div>
          </div>

          {/* AI Teacher Feedback */}
          <div className="p-8">
            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-6">
              <Image
                src="/doremi1.png"
                alt="Cô Doremi"
                width={64}
                height={64}
                className="rounded-full"
              />
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-black text-white">
                  💜 Lời nhận xét từ Cô Doremi
                </h3>
                <p className="leading-relaxed text-white/80">
                  {submission.aiTeacherFeedback}
                </p>
                <p className="mt-3 text-sm text-white/60">
                  Chấm bởi: {submission.gradedBy}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-[2rem] p-8"
        >
          <h2 className="mb-6 text-2xl font-black text-white">
            Chi Tiết Từng Câu
          </h2>

          <div className="space-y-4">
            {test.questions.map((question, index) => {
              const answer = submission.answers.find(
                (a) => a.questionIndex === index
              )
              const isCorrect = answer?.isCorrect || false
              const userAnswerIndex = answer?.userAnswer ?? -1
              const correctAnswerIndex = question.correctAnswer

              return (
                <div
                  key={index}
                  className={[
                    "rounded-xl border-2 p-6",
                    isCorrect
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-red-500/30 bg-red-500/10",
                  ].join(" ")}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <p className="flex-1 font-bold text-white">
                      Câu {index + 1}: {question.question}
                    </p>
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-400" />
                    ) : (
                      <XCircle className="h-6 w-6 flex-shrink-0 text-red-400" />
                    )}
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option: string, oIndex: number) => {
                      const isUserAnswer = userAnswerIndex === oIndex
                      const isCorrectAnswer = correctAnswerIndex === oIndex

                      return (
                        <div
                          key={oIndex}
                          className={[
                            "rounded-lg p-3 text-sm",
                            isCorrectAnswer
                              ? "bg-green-500/20 font-bold text-green-300"
                              : isUserAnswer
                              ? "bg-red-500/20 font-bold text-red-300"
                              : "text-white/60",
                          ].join(" ")}
                        >
                          {option}
                          {isCorrectAnswer && " ✓ (Đáp án đúng)"}
                          {isUserAnswer && !isCorrectAnswer && " ✗ (Bạn chọn)"}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex gap-4"
        >
          <button
            onClick={() => router.push("/weekly-tests")}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-4 font-bold text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
            Quay lại
          </button>
          
          {submission.totalScore >= 8 && (
            <button
              onClick={() => router.push("/")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.72_0.28_320)] to-[oklch(0.58_0.22_280)] px-6 py-4 font-bold text-white transition-transform hover:scale-105"
            >
              <Trophy className="h-5 w-5" />
              Xem Bảng Vàng
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
