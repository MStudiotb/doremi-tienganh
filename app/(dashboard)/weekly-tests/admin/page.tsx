"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function AdminWeeklyTestsPage() {
  const [session, setSession] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [week, setWeek] = useState("")
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  useEffect(() => {
    const sessionData = localStorage.getItem("doremi_session")
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData)
        setSession(parsedSession)
        
        if (parsedSession.role !== "ADMIN") {
          window.location.href = "/weekly-tests"
        }
      } catch (error) {
        console.error("Error parsing session:", error)
        window.location.href = "/auth/login"
      }
    } else {
      window.location.href = "/auth/login"
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith(".docx") || selectedFile.name.endsWith(".pdf")) {
        setFile(selectedFile)
        setUploadStatus({ type: null, message: "" })
      } else {
        setUploadStatus({
          type: "error",
          message: "Chỉ chấp nhận file .docx hoặc .pdf",
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !title || !week || !year || !startDate || !endDate) {
      setUploadStatus({
        type: "error",
        message: "Vui lòng điền đầy đủ thông tin",
      })
      return
    }

    setIsUploading(true)
    setUploadStatus({ type: null, message: "" })

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("week", week)
      formData.append("year", year)
      formData.append("startDate", startDate)
      formData.append("endDate", endDate)
      formData.append("role", session.role)
      formData.append("createdBy", session.email)

      const response = await fetch("/api/weekly-tests/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUploadStatus({
          type: "success",
          message: `Đã tạo bài thi thành công với ${data.questions.length} câu hỏi!`,
        })
        
        // Reset form
        setFile(null)
        setTitle("")
        setDescription("")
        setWeek("")
        setStartDate("")
        setEndDate("")
        
        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = "/weekly-tests"
        }, 2000)
      } else {
        setUploadStatus({
          type: "error",
          message: data.error || "Có lỗi xảy ra khi tạo bài thi",
        })
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadStatus({
        type: "error",
        message: "Có lỗi xảy ra khi upload file",
      })
    } finally {
      setIsUploading(false)
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[oklch(0.72_0.28_320)] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,oklch(0.28_0.1_290/0.55),transparent_42rem),linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.18_0.08_275),oklch(0.18_0.08_245))] p-8 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[oklch(0.72_0.28_320)] to-[oklch(0.58_0.22_280)]">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Tạo Bài Thi Tuần</h1>
              <p className="mt-1 text-white/60">
                Upload file Word/PDF để AI tự động tạo câu hỏi
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-[2rem] p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Upload File (.docx hoặc .pdf) *
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".docx,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 transition-colors hover:border-white/40 hover:bg-white/10"
                >
                  <FileText className="h-8 w-8 text-white/60" />
                  <div className="text-center">
                    <p className="font-bold text-white">
                      {file ? file.name : "Chọn file để upload"}
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      Hỗ trợ .docx và .pdf
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Tiêu đề bài thi *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Bài Thi Tuần 1 - Grammar Basics"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-white/40 focus:bg-white/10"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về nội dung bài thi..."
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-white/40 focus:bg-white/10"
              />
            </div>

            {/* Week and Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Tuần *
                </label>
                <input
                  type="number"
                  value={week}
                  onChange={(e) => setWeek(e.target.value)}
                  placeholder="1-52"
                  min="1"
                  max="52"
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-white/40 focus:bg-white/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Năm *
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-white/40 focus:bg-white/10"
                />
              </div>
            </div>

            {/* Start and End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Ngày bắt đầu *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-white/40 focus:bg-white/10"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-white">
                  Ngày kết thúc *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-white/40 focus:bg-white/10"
                />
              </div>
            </div>

            {/* Status Message */}
            {uploadStatus.type && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={[
                  "flex items-center gap-3 rounded-xl p-4",
                  uploadStatus.type === "success"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300",
                ].join(" ")}
              >
                {uploadStatus.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <p className="text-sm font-medium">{uploadStatus.message}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[oklch(0.72_0.28_320)] to-[oklch(0.58_0.22_280)] px-6 py-4 font-bold text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Tạo Bài Thi
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass mt-6 rounded-[2rem] p-6"
        >
          <h3 className="mb-3 text-lg font-black text-white">
            💡 Hướng dẫn sử dụng
          </h3>
          <ul className="space-y-2 text-sm text-white/70">
            <li>• Upload file Word (.docx) hoặc PDF chứa nội dung bài học</li>
            <li>• AI sẽ tự động phân tích và tạo 10 câu hỏi trắc nghiệm</li>
            <li>• Mỗi câu hỏi có 4 đáp án và được chấm 1 điểm</li>
            <li>• Bài thi sẽ được thông báo đến tất cả học viên</li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
