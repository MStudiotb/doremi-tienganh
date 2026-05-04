"use client"

import { FormEvent, useEffect, useState } from "react"
import { Bot, Loader2, Send, User, X } from "lucide-react"
import Image from "next/image"
import { usePathname } from "next/navigation"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function ChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentLevel, setCurrentLevel] = useState("Cơ bản")
  const [userGender, setUserGender] = useState<"male" | "female" | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem("doremi_session")
      setIsAuthenticated(!!session)
    }
    
    checkAuth()
    
    // Listen for auth changes
    window.addEventListener("doremi-auth-change", checkAuth)
    return () => window.removeEventListener("doremi-auth-change", checkAuth)
  }, [])

  // Load current level and user gender from localStorage on mount
  useEffect(() => {
    const level = localStorage.getItem("doremi_current_level") || "Cơ bản"
    setCurrentLevel(level)
    
    const gender = localStorage.getItem("doremi_user_gender") as "male" | "female" | null
    console.log("🎭 [ChatWidget] Gender loaded from localStorage:", gender)
    console.log("🎭 [ChatWidget] Avatar will be:", gender === "male" ? "Nobita (/nobita.png)" : gender === "female" ? "Xuka (/xuka.png)" : "Default (/placeholder-user.jpg)")
    setUserGender(gender)
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isLoading) {
      return
    }

    setError("")
    setQuestion("")
    setIsLoading(true)
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", content: trimmedQuestion },
    ])

    try {
      const currentLevel = localStorage.getItem("doremi_current_level") || "Cấp 1"
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          question: trimmedQuestion,
          currentLevel: currentLevel 
        }),
      })

      const data = (await response.json()) as {
        answer?: string
        error?: string
      }

      if (!response.ok) {
        throw new Error(data.error || "Khong the nhan cau tra loi tu AI.")
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: data.answer || "AI chua co cau tra loi.",
        },
      ])
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Da co loi xay ra khi gui cau hoi.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Hide ChatWidget on auth pages or when not authenticated
  if (pathname === "/auth" || !isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-br from-[oklch(0.78_0.17_200)] to-[oklch(0.62_0.2_260)] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_48px_rgba(0,0,0,0.6)]"
        aria-label="Open chat"
      >
        <img
          src="/chuong.png?v=2"
          alt="Chat"
          width="48"
          height="48"
          className="h-full w-full object-contain drop-shadow-lg"
        />
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col rounded-2xl border border-white/10 bg-black/30 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/chuong.png"
                  alt="DOREMI TEACHER"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight text-white">
                  DOREMI TEACHER
                </h2>
                <p className="text-xs text-white/55">
                  Cấp độ: <span className="font-semibold text-[oklch(0.85_0.18_85)]">{currentLevel}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="grid min-h-[200px] place-items-center rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-4 text-center">
                <div>
                  <div className="mx-auto h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src="/chuong.png"
                      alt="DOREMI TEACHER"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">
                    Hay dat cau hoi dau tien.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isUser = message.role === "user"
                const avatarSrc = userGender === "male" ? "/nobita.png" : userGender === "female" ? "/xuka.png" : "/placeholder-user.jpg"
                
                // Log avatar info for user messages
                if (isUser && index === messages.length - 1) {
                  console.log(`🎭 [ChatWidget] Rendering user message #${index + 1} with avatar:`, avatarSrc, `(gender: ${userGender})`)
                }

                return (
                  <article
                    key={`${message.role}-${index}`}
                    className={[
                      "flex gap-2",
                      isUser ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    {!isUser ? (
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src="/chuong.png"
                          alt="AI"
                          width={28}
                          height={28}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div
                      className={[
                        "max-w-[75%] whitespace-pre-wrap rounded-lg px-3 py-2 text-xs leading-5",
                        isUser
                          ? "bg-[oklch(0.62_0.2_260)] text-white"
                          : "border border-white/10 bg-white/10 text-white/90",
                      ].join(" ")}
                    >
                      {message.content}
                    </div>
                    {isUser ? (
                      <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={avatarSrc}
                          alt="User"
                          width={28}
                          height={28}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                  </article>
                )
              })
            )}

            {isLoading ? (
              <div className="flex items-center gap-2 text-xs text-white/55">
                <Loader2 className="h-3 w-3 animate-spin" />
                AI dang tra loi...
              </div>
            ) : null}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-4"
          >
            {error ? (
              <p className="mb-2 rounded-md border border-red-400/30 bg-red-500/10 px-2 py-1.5 text-xs text-red-100">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2">
              <label htmlFor="chat-widget-question" className="sr-only">
                Cau hoi
              </label>
              <textarea
                id="chat-widget-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={2}
                placeholder="Nhap cau hoi cua ban..."
                className="min-h-12 flex-1 resize-none rounded-md border border-white/10 bg-white/10 px-3 py-2 text-xs text-white placeholder:text-white/35 outline-none transition focus:border-[oklch(0.78_0.17_200)]"
              />
              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[oklch(0.78_0.17_200)] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
