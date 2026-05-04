"use client"

import { FormEvent, useEffect, useState } from "react"
import { Bot, Loader2, Send, User } from "lucide-react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentLevel, setCurrentLevel] = useState("Cơ bản")

  // Load current level from localStorage on mount
  useEffect(() => {
    const level = localStorage.getItem("doremi_current_level") || "Cơ bản"
    console.log("📚 Current level loaded from localStorage:", level)
    setCurrentLevel(level)
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
      // Get current level from localStorage
      const currentLevel = localStorage.getItem("doremi_current_level") || "Cơ bản"
      console.log("🎯 Sending question with level:", currentLevel)
      
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

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.16_0.06_245),oklch(0.12_0.04_180))] px-4 py-6 text-white sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col rounded-lg border border-white/10 bg-black/25 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <header className="border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Chat AI
              </h1>
              <p className="mt-1 text-sm text-white/55">
                Nhap cau hoi va nhan cau tra loi tu AI qua 9Router.
              </p>
            </div>
            <div className="rounded-lg border border-[oklch(0.72_0.28_320/0.4)] bg-[oklch(0.72_0.28_320/0.15)] px-3 py-1.5">
              <p className="text-xs font-semibold text-white/60">Cấp độ</p>
              <p className="text-sm font-black text-[oklch(0.85_0.18_85)]">
                {currentLevel}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 sm:px-6">
          {messages.length === 0 ? (
            <div className="grid min-h-[18rem] place-items-center rounded-lg border border-dashed border-white/15 bg-white/[0.04] p-6 text-center">
              <div>
                <Bot className="mx-auto h-10 w-10 text-[oklch(0.78_0.17_200)]" />
                <p className="mt-4 text-base font-semibold text-white">
                  Hay dat cau hoi dau tien.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isUser = message.role === "user"
              const Icon = isUser ? User : Bot

              return (
                <article
                  key={`${message.role}-${index}`}
                  className={[
                    "flex gap-3",
                    isUser ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  {!isUser ? (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[oklch(0.78_0.17_200/0.18)] text-[oklch(0.78_0.17_200)]">
                      <Icon className="h-5 w-5" />
                    </div>
                  ) : null}
                  <div
                    className={[
                      "max-w-[min(42rem,82%)] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6",
                      isUser
                        ? "bg-[oklch(0.62_0.2_260)] text-white"
                        : "border border-white/10 bg-white/10 text-white/90",
                    ].join(" ")}
                  >
                    {message.content}
                  </div>
                  {isUser ? (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10 text-white/70">
                      <Icon className="h-5 w-5" />
                    </div>
                  ) : null}
                </article>
              )
            })
          )}

          {isLoading ? (
            <div className="flex items-center gap-3 text-sm text-white/55">
              <Loader2 className="h-4 w-4 animate-spin" />
              AI dang tra loi...
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-white/10 p-4 sm:p-5"
        >
          {error ? (
            <p className="mb-3 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor="chat-question" className="sr-only">
              Cau hoi
            </label>
            <textarea
              id="chat-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={2}
              placeholder="Nhap cau hoi cua ban..."
              className="min-h-14 flex-1 resize-none rounded-md border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[oklch(0.78_0.17_200)]"
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-[oklch(0.78_0.17_200)] px-5 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Gui
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
