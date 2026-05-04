"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageCircle, Trophy, Sparkles } from "lucide-react"

interface HallOfFameEntry {
  _id: string
  testTitle: string
  week: number
  year: number
  userId: string
  userName: string
  userAvatar?: string
  score: number
  imageUrl: string
  aiTeacherComment: string
  likes: string[]
  comments: Array<{
    id: string
    userId: string
    userName: string
    userAvatar?: string
    content: string
    createdAt: string
  }>
  featuredAt: string
}

export function HallOfFameCard() {
  const [entry, setEntry] = useState<HallOfFameEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [currentUserName, setCurrentUserName] = useState<string>("")
  const [hasLiked, setHasLiked] = useState(false)

  useEffect(() => {
    // Get current user from session
    const sessionData = localStorage.getItem("doremi_session")
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData)
        setCurrentUserId(session.email)
        setCurrentUserName(session.name)
      } catch (error) {
        console.error("Error parsing session:", error)
      }
    }

    // Fetch latest Hall of Fame entry
    fetchHallOfFame()
  }, [])

  useEffect(() => {
    if (entry && currentUserId) {
      setHasLiked(entry.likes?.includes(currentUserId) || false)
    }
  }, [entry, currentUserId])

  async function fetchHallOfFame() {
    try {
      const response = await fetch("/api/hall-of-fame?limit=1")
      const data = await response.json()

      if (data.success && data.entries.length > 0) {
        setEntry(data.entries[0])
      }
    } catch (error) {
      console.error("Error fetching Hall of Fame:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLike() {
    if (!entry || !currentUserId) return

    try {
      const response = await fetch("/api/hall-of-fame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "like",
          entryId: entry._id,
          userId: currentUserId,
          userName: currentUserName,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setHasLiked(data.liked)
        // Update likes count
        setEntry((prev) => {
          if (!prev) return prev
          const newLikes = data.liked
            ? [...(prev.likes || []), currentUserId]
            : (prev.likes || []).filter((id) => id !== currentUserId)
          return { ...prev, likes: newLikes }
        })
      }
    } catch (error) {
      console.error("Error liking entry:", error)
    }
  }

  async function handleComment() {
    if (!entry || !currentUserId || !newComment.trim()) return

    try {
      const response = await fetch("/api/hall-of-fame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          entryId: entry._id,
          userId: currentUserId,
          userName: currentUserName,
          content: newComment.trim(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setEntry((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            comments: [...(prev.comments || []), data.comment],
          }
        })
        setNewComment("")
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="glass rounded-[2rem] p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[oklch(0.72_0.28_320)] border-t-transparent" />
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="glass rounded-[2rem] p-8">
        <div className="text-center">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              filter: [
                "drop-shadow(0 0 8px rgba(255, 215, 0, 0.3))",
                "drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))",
                "drop-shadow(0 0 8px rgba(255, 215, 0, 0.3))",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mx-auto mb-4"
          >
            <img
              src="/cup.png"
              alt="Cup Vinh Danh"
              className="w-24 h-24 mx-auto object-contain"
            />
          </motion.div>
          <p className="text-lg font-bold text-white/60">
            Chưa có Thủ Khoa tuần này
          </p>
          <p className="mt-2 text-sm text-white/40">
            Hãy làm bài thi để trở thành người đầu tiên!
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass overflow-hidden rounded-[2rem]"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[oklch(0.72_0.28_320)] via-[oklch(0.65_0.25_300)] to-[oklch(0.58_0.22_280)] p-6">
        <div className="absolute inset-0 bg-[url('/animation.png')] opacity-10" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 backdrop-blur-xl">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <h2 className="text-2xl font-black text-white">
                Vinh Danh Thủ Khoa Tuần
              </h2>
            </div>
            <p className="mt-1 text-sm font-medium text-white/80">
              Tuần {entry.week} - {entry.year}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Student Info */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-[oklch(0.72_0.28_320)] bg-white/10">
            {entry.userAvatar ? (
              <Image
                src={entry.userAvatar}
                alt={entry.userName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[oklch(0.72_0.28_320)] to-[oklch(0.58_0.22_280)] text-2xl font-black text-white">
                {entry.userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white">{entry.userName}</h3>
            <p className="mt-1 text-sm font-medium text-white/60">
              {entry.testTitle}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-sm font-black text-white shadow-lg">
                🌟 {entry.score}/10 điểm
              </div>
            </div>
          </div>
        </div>

        {/* AI Teacher Comment */}
        <div className="mb-6 rounded-2xl border border-[oklch(0.72_0.28_320/0.3)] bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Image
              src="/doremi1.png"
              alt="Cô Doremi"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-bold text-[oklch(0.85_0.18_85)]">
              Lời nhận xét của Cô Doremi:
            </span>
          </div>
          <p className="text-sm leading-relaxed text-white/80">
            {entry.aiTeacherComment}
          </p>
        </div>

        {/* Interactions */}
        <div className="flex items-center gap-4 border-t border-white/10 pt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={[
              "flex items-center gap-2 rounded-xl px-4 py-2 font-bold transition-colors",
              hasLiked
                ? "bg-red-500/20 text-red-400"
                : "bg-white/10 text-white/60 hover:bg-white/20",
            ].join(" ")}
          >
            <Heart
              className={["h-5 w-5", hasLiked ? "fill-current" : ""].join(" ")}
            />
            <span>{entry.likes?.length || 0}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 font-bold text-white/60 transition-colors hover:bg-white/20"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{entry.comments?.length || 0}</span>
          </motion.button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4 border-t border-white/10 pt-4"
            >
              {/* Comment Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleComment()}
                  placeholder="Viết lời chúc mừng..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 focus:border-[oklch(0.72_0.28_320)] focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  className="rounded-xl bg-[oklch(0.72_0.28_320)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  Gửi
                </motion.button>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {entry.comments?.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl bg-white/5 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-white/10">
                        {comment.userAvatar ? (
                          <Image
                            src={comment.userAvatar}
                            alt={comment.userName}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[oklch(0.72_0.28_320)] to-[oklch(0.58_0.22_280)] text-xs font-black text-white">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                          {comment.userName}
                        </p>
                        <p className="mt-1 text-sm text-white/70">
                          {comment.content}
                        </p>
                        <p className="mt-1 text-xs text-white/40">
                          {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
