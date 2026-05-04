"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Trophy,
  Calendar,
  ArrowRight,
  Upload,
  Edit,
  X
} from "lucide-react"
import { EditTestModal } from "@/components/weekly-tests/EditTestModal"

interface WeeklyTest {
  _id: string
  title: string
  description: string
  week: number
  year: number
  questions: any[]
  status: string
  startDate: string
  endDate: string
  totalPoints: number
}

interface TestSubmission {
  _id: string
  testId: string
  totalScore: number
  status: string
  submittedAt: string
}

export default function WeeklyTestsPage() {
  const [tests, setTests] = useState<WeeklyTest[]>([])
  const [submissions, setSubmissions] = useState<Record<string, TestSubmission>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<WeeklyTest | null>(null)
  const [longPressTest, setLongPressTest] = useState<string | null>(null)
  const [showDeleteButton, setShowDeleteButton] = useState<string | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const [deleteConfirmTest, setDeleteConfirmTest] = useState<string | null>(null)

  useEffect(() => {
    // Get session
    const sessionData = localStorage.getItem("doremi_session")
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData)
        setSession(parsedSession)
        setIsAdmin(parsedSession.role === "ADMIN")
        fetchTests(parsedSession)
      } catch (error) {
        console.error("Error parsing session:", error)
      }
    }
  }, [])

  async function fetchTests(sessionData: any) {
    try {
      const response = await fetch(`/api/weekly-tests?role=${sessionData.role}`)
      const data = await response.json()

      if (data.success) {
        setTests(data.tests)
        
        // Fetch submissions for each test
        const submissionsMap: Record<string, TestSubmission> = {}
        for (const test of data.tests) {
          const subResponse = await fetch(
            `/api/weekly-tests/submit?testId=${test._id}&userId=${sessionData.email}`
          )
          const subData = await subResponse.json()
          if (subData.success && subData.submission) {
            submissionsMap[test._id] = subData.submission
          }
        }
        setSubmissions(submissionsMap)
      }
    } catch (error) {
      console.error("Error fetching tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function getTestStatus(test: WeeklyTest) {
    const now = new Date()
    const startDate = new Date(test.startDate)
    const endDate = new Date(test.endDate)

    if (submissions[test._id]) {
      return { label: "Đã hoàn thành", color: "green", icon: CheckCircle }
    }

    if (now < startDate) {
      return { label: "Sắp diễn ra", color: "blue", icon: Clock }
    }

    if (now > endDate) {
      return { label: "Đã kết thúc", color: "gray", icon: AlertCircle }
    }

    return { label: "Đang diễn ra", color: "yellow", icon: FileText }
  }

  // Handle Edit
  const handleEdit = (test: WeeklyTest) => {
    setSelectedTest(test)
    setEditModalOpen(true)
  }

  const handleSaveEdit = async (updatedData: any) => {
    if (!selectedTest || !session) return

    try {
      const response = await fetch("/api/weekly-tests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: selectedTest._id,
          role: session.role,
          ...updatedData,
        }),
      })

      const data = await response.json()
      if (data.success) {
        // Refresh tests
        await fetchTests(session)
        setEditModalOpen(false)
        setSelectedTest(null)
      } else {
        throw new Error(data.error || "Failed to update test")
      }
    } catch (error) {
      console.error("Error updating test:", error)
      throw error
    }
  }

  // Handle Long Press for Delete
  const handleLongPressStart = (testId: string) => {
    setLongPressTest(testId)
    longPressTimer.current = setTimeout(() => {
      setShowDeleteButton(testId)
      setLongPressTest(null)
    }, 3000) // 3 seconds
  }

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setLongPressTest(null)
  }

  const handleDeleteClick = (testId: string) => {
    setDeleteConfirmTest(testId)
  }

  const handleConfirmDelete = async (testId: string) => {
    if (!session) return

    try {
      // Delete test
      const response = await fetch(`/api/weekly-tests?testId=${testId}&role=${session.role}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        // Delete related submissions
        await fetch(`/api/weekly-tests/submit?testId=${testId}`, {
          method: "DELETE",
        })

        // Refresh tests
        await fetchTests(session)
        setShowDeleteButton(null)
        setDeleteConfirmTest(null)
      } else {
        throw new Error(data.error || "Failed to delete test")
      }
    } catch (error) {
      console.error("Error deleting test:", error)
      alert("Lỗi khi xóa bài thi. Vui lòng thử lại!")
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmTest(null)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[oklch(0.72_0.28_320)] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,oklch(0.28_0.1_290/0.55),transparent_42rem),linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.18_0.08_275),oklch(0.18_0.08_245))] p-8 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[oklch(0.72_0.28_320)] to-[oklch(0.58_0.22_280)]">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">Bài Thi Tuần</h1>
                <p className="mt-1 text-white/60">
                  Kiểm tra kiến thức và nhận phản hồi từ Cô Doremi
                </p>
              </div>
            </div>
            
            {/* Admin Button */}
            {session?.role === "ADMIN" && (
              <Link
                href="/weekly-tests/admin"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.72_0.28_320)] to-[oklch(0.58_0.22_280)] px-6 py-3 font-bold text-white transition-transform hover:scale-105"
              >
                <Upload className="h-5 w-5" />
                Tạo Bài Thi
              </Link>
            )}
          </div>
        </motion.div>

        {/* Tests Grid */}
        {tests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-[2rem] p-12 text-center"
          >
            <Trophy className="mx-auto mb-4 h-16 w-16 text-white/30" />
            <h2 className="text-2xl font-black text-white">
              Chưa có bài thi nào
            </h2>
            <p className="mt-2 text-white/60">
              Các bài thi mới sẽ được cập nhật hàng tuần
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {tests.map((test, index) => {
              const status = getTestStatus(test)
              const StatusIcon = status.icon
              const submission = submissions[test._id]

              return (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass overflow-hidden rounded-[2rem] relative"
                  onMouseDown={() => isAdmin && handleLongPressStart(test._id)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => isAdmin && handleLongPressStart(test._id)}
                  onTouchEnd={handleLongPressEnd}
                >
                  {/* Long Press Progress Indicator */}
                  {isAdmin && longPressTest === test._id && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                      className="absolute top-0 left-0 h-1 bg-red-500 z-10"
                    />
                  )}

                  {/* Delete Button (appears after long press) */}
                  {isAdmin && showDeleteButton === test._id && (
                    <motion.button
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={() => handleDeleteClick(test._id)}
                      className="absolute top-4 right-4 z-20 grid size-10 place-items-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="size-5" />
                    </motion.button>
                  )}

                  {/* Edit Button (always visible for admin) */}
                  {isAdmin && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(test)
                      }}
                      className="absolute top-4 right-16 z-20 grid size-10 place-items-center rounded-full bg-[oklch(0.72_0.28_320)] text-white shadow-lg hover:bg-[oklch(0.65_0.25_300)] transition-colors"
                    >
                      <Edit className="size-4" />
                    </motion.button>
                  )}
                  {/* Card Header */}
                  <div className="relative bg-gradient-to-br from-[oklch(0.72_0.28_320)] via-[oklch(0.65_0.25_300)] to-[oklch(0.58_0.22_280)] p-6">
                    <div className="absolute inset-0 bg-[url('/chuong.png')] bg-cover opacity-5" />
                    <div className="relative">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-xl">
                          Tuần {test.week} - {test.year}
                        </span>
                        <div
                          className={[
                            "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-xl",
                            status.color === "green"
                              ? "bg-green-500/20 text-green-300"
                              : status.color === "yellow"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : status.color === "blue"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-gray-500/20 text-gray-300",
                          ].join(" ")}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </div>
                      </div>
                      <h3 className="text-xl font-black text-white">
                        {test.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/80">
                        {test.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-white/60">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs font-medium">Số câu hỏi</span>
                        </div>
                        <p className="mt-1 text-lg font-black text-white">
                          {test.questions.length}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <div className="flex items-center gap-2 text-white/60">
                          <Trophy className="h-4 w-4" />
                          <span className="text-xs font-medium">Tổng điểm</span>
                        </div>
                        <p className="mt-1 text-lg font-black text-white">
                          {test.totalPoints}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(test.startDate).toLocaleDateString("vi-VN")} -{" "}
                        {new Date(test.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    {submission ? (
                      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-300">
                              Điểm của bạn
                            </p>
                            <p className="mt-1 text-2xl font-black text-green-400">
                              {submission.totalScore}/10
                            </p>
                          </div>
                          <Link
                            href={`/weekly-tests/${test._id}/result`}
                            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20"
                          >
                            Xem kết quả
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/weekly-tests/${test._id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.72_0.28_320)] to-[oklch(0.58_0.22_280)] px-6 py-3 font-bold text-white transition-transform hover:scale-105"
                      >
                        Làm bài thi
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass mt-8 rounded-[2rem] p-6"
        >
          <div className="flex items-start gap-4">
            <Image
              src="/doremi1.png"
              alt="Cô Doremi"
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <h3 className="text-lg font-black text-white">
                💡 Lời khuyên từ Cô Doremi
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Hãy làm bài thi một cách cẩn thận và trung thực. Cô sẽ chấm điểm
                và đưa ra nhận xét chi tiết để giúp em tiến bộ. Những bài làm
                xuất sắc sẽ được vinh danh trên Bảng Vàng!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Edit Modal */}
        {selectedTest && (
          <EditTestModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false)
              setSelectedTest(null)
            }}
            test={selectedTest}
            onSave={handleSaveEdit}
          />
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirmTest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(4,3,18,0.9)" }}
              onClick={handleCancelDelete}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl p-6"
                style={{
                  background: "linear-gradient(145deg,oklch(0.17 0.07 280/0.97),oklch(0.13 0.05 265/0.98))",
                  border: "1px solid oklch(0.5 0.15 300/0.25)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
              >
                <div className="text-center">
                  <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-red-500/20">
                    <AlertCircle className="size-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">
                    Xác nhận xóa bài thi
                  </h3>
                  <p className="text-white/60 mb-6">
                    Anh có chắc muốn xóa bài thi tuần này không? Hành động này không thể hoàn tác và sẽ xóa cả kết quả thi của học sinh.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelDelete}
                      className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(deleteConfirmTest)}
                      className="flex-1 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-600"
                    >
                      Xóa bài thi
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
