"use client"

import type { ComponentType } from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { LoginScreen } from "@/components/auth/login-screen"
import { Sidebar } from "@/components/Sidebar"
import { WelcomeBanner } from "@/components/WelcomeBanner"
import { saveCurriculumAsset } from "@/lib/idb-curriculum"
import {
  ArrowRight,
  BookOpenCheck,
  Brain,
  Database,
  HardDrive,
  Loader2,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react"

type Session = {
  email: string
  name: string
  role: "ADMIN" | "USER"
  grade?: string
  age?: string
}

type Lesson = {
  title: string
  meta: string
  progress: number
  loader: () => Promise<{ default: ComponentType }>
}

type RoadmapLevel = {
  label: string
  iconPath: string
}

type PendingResourceSync = {
  grade: string
  requestedAt: string
}

type ResourceSyncState = {
  isRunning: boolean
  progress: number
  message: string
}

const RESOURCE_SYNC_KEY = "doremi_synced_resource_packs"
const PENDING_RESOURCE_SYNC_KEY = "doremi_pending_resource_sync"

const gradeResourcePacks: Record<
  string,
  {
    title: string
    pdfFileName: string
    audioFileName: string
  }
> = Object.fromEntries(
  Array.from({ length: 12 }, (_, index) => {
    const gradeNumber = index + 1

    return [
      `Khối ${gradeNumber}`,
      {
        title: `Bộ từ vựng Smart Start ${gradeNumber}`,
        pdfFileName: `doremi-khoi-${gradeNumber}-smart-start-vocabulary.pdf`,
        audioFileName: `doremi-khoi-${gradeNumber}-pronunciation-pack.wav`,
      },
    ]
  }),
)

const stats = [
  {
    label: "Tổng số tài liệu",
    value: "1,250",
    detail: "+12 cập nhật mới",
    icon: Database,
  },
  {
    label: "Số bài tập hoàn thành",
    value: "12,480",
    detail: "38 bài học tuần này",
    icon: BookOpenCheck,
  },
  {
    label: "Tổng số thành viên",
    value: "5,600",
    detail: "214 đang trực tuyến",
    icon: Users,
  },
]

const roadmapLevels: RoadmapLevel[] = [
  { label: "Tập Sự", iconPath: "/TapSu.png" },
  { label: "Cơ Bản", iconPath: "/CoBan.png" },
  { label: "Tiến Bộ", iconPath: "/TienBo.png" },
  { label: "Hiểu Biết", iconPath: "/HieuBiet.png" },
  { label: "Thành Thạo", iconPath: "/thanhthao.png" },
  { label: "Chuyên Gia", iconPath: "/ChuyenGia.png" },
]

const lessonsByLevel: Record<string, Lesson[]> = {
  "Tập Sự": [
    {
      title: "Daily Conversation: Morning Routine",
      meta: "Speaking · 18 phút",
      progress: 72,
      loader: () => import("@/components/lessons/daily-conversation"),
    },
    {
      title: "Vocabulary Builder: Work and Study",
      meta: "Flashcards · 24 phút",
      progress: 54,
      loader: () => import("@/components/lessons/vocabulary-builder"),
    },
    {
      title: "Listening Drill: Native Speed",
      meta: "Listening · 15 phút",
      progress: 38,
      loader: () => import("@/components/lessons/listening-drill"),
    },
  ],
  "Cơ Bản": [
    {
      title: "Daily Conversation: Making Plans",
      meta: "Speaking · 22 phút",
      progress: 48,
      loader: () => import("@/components/lessons/daily-conversation"),
    },
    {
      title: "Vocabulary Builder: Travel and Food",
      meta: "Flashcards · 26 phút",
      progress: 41,
      loader: () => import("@/components/lessons/vocabulary-builder"),
    },
    {
      title: "Listening Drill: Short Interviews",
      meta: "Listening · 20 phút",
      progress: 33,
      loader: () => import("@/components/lessons/listening-drill"),
    },
  ],
  "Tiến Bộ": [
    {
      title: "Daily Conversation: Problem Solving",
      meta: "Speaking · 28 phút",
      progress: 36,
      loader: () => import("@/components/lessons/daily-conversation"),
    },
    {
      title: "Vocabulary Builder: Business English",
      meta: "Flashcards · 30 phút",
      progress: 29,
      loader: () => import("@/components/lessons/vocabulary-builder"),
    },
    {
      title: "Listening Drill: Fast Explanations",
      meta: "Listening · 24 phút",
      progress: 24,
      loader: () => import("@/components/lessons/listening-drill"),
    },
  ],
  "Hiểu Biết": [
    {
      title: "Advanced Debate: Giving Opinions",
      meta: "Speaking · 32 phút",
      progress: 21,
      loader: () => import("@/components/lessons/daily-conversation"),
    },
    {
      title: "Academic Vocabulary: Reports",
      meta: "Flashcards · 34 phút",
      progress: 18,
      loader: () => import("@/components/lessons/vocabulary-builder"),
    },
    {
      title: "Listening Drill: News Speed",
      meta: "Listening · 30 phút",
      progress: 16,
      loader: () => import("@/components/lessons/listening-drill"),
    },
  ],
  "Thành Thạo": [
    {
      title: "Fluent Speaking: Storytelling",
      meta: "Speaking · 36 phút",
      progress: 14,
      loader: () => import("@/components/lessons/daily-conversation"),
    },
    {
      title: "Vocabulary Mastery: Idioms",
      meta: "Flashcards · 38 phút",
      progress: 12,
      loader: () => import("@/components/lessons/vocabulary-builder"),
    },
    {
      title: "Listening Drill: Podcasts",
      meta: "Listening · 34 phút",
      progress: 9,
      loader: () => import("@/components/lessons/listening-drill"),
    },
  ],
  "Chuyên Gia": [
    {
      title: "Masterclass: Natural Fluency",
      meta: "Speaking · 45 phút",
      progress: 7,
      loader: () => import("@/components/lessons/daily-conversation"),
    },
    {
      title: "Lexical Range: Native Expressions",
      meta: "Flashcards · 42 phút",
      progress: 5,
      loader: () => import("@/components/lessons/vocabulary-builder"),
    },
    {
      title: "Listening Drill: Native Podcasts",
      meta: "Listening · 40 phút",
      progress: 4,
      loader: () => import("@/components/lessons/listening-drill"),
    },
  ],
}

function readSession() {
  if (typeof window === "undefined") {
    return null
  }

  const rawSession = localStorage.getItem("doremi_session")

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as Session
  } catch {
    localStorage.removeItem("doremi_session")
    return null
  }
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}


function createPdfBlob(grade: string, packTitle: string) {
  const lines = [
    "DOREMI ENG",
    packTitle,
    `Khoi: ${grade}`,
    "Resource Pack: Vocabulary + Lesson Notes",
    "This local starter file is generated after registration.",
    "Use Admin > Quan ly Du lieu to replace it with official PDF/audio resources.",
  ]
  const escapedText = lines.join("\\n").replace(/[()]/g, "")
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 180 >>
stream
BT
/F1 20 Tf
72 720 Td
(${escapedText}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000251 00000 n 
0000000481 00000 n 
trailer
<< /Root 1 0 R /Size 6 >>
startxref
551
%%EOF`

  return new Blob([pdfContent], { type: "application/pdf" })
}

function createSilentWavBlob() {
  const sampleRate = 8000
  const seconds = 1
  const samples = sampleRate * seconds
  const bytesPerSample = 2
  const dataSize = samples * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index))
    }
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * bytesPerSample, true)
  view.setUint16(32, bytesPerSample, true)
  view.setUint16(34, 16, true)
  writeString(36, "data")
  view.setUint32(40, dataSize, true)

  return new Blob([buffer], { type: "audio/wav" })
}

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [activeLessonTitle, setActiveLessonTitle] = useState("")
  const [LessonContent, setLessonContent] = useState<ComponentType | null>(null)
  const [isLoadingLesson, setIsLoadingLesson] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState("Tập Sự")
  const [resourceSync, setResourceSync] = useState<ResourceSyncState>({
    isRunning: false,
    progress: 0,
    message: "",
  })

  useEffect(() => {
    const syncSession = () => {
      setSession(readSession())
      setIsReady(true)
    }

    syncSession()
    window.addEventListener("storage", syncSession)
    window.addEventListener("doremi-auth-change", syncSession)

    return () => {
      window.removeEventListener("storage", syncSession)
      window.removeEventListener("doremi-auth-change", syncSession)
    }
  }, [])

  useEffect(() => {
    if (!isReady || !session) {
      return
    }

    let isCancelled = false
    const timeout = window.setTimeout(() => {
      const runBackgroundSync = async () => {
        const rawPendingSync = localStorage.getItem(PENDING_RESOURCE_SYNC_KEY)

        if (!rawPendingSync) {
          return
        }

        let pendingSync: PendingResourceSync

        try {
          pendingSync = JSON.parse(rawPendingSync) as PendingResourceSync
        } catch {
          localStorage.removeItem(PENDING_RESOURCE_SYNC_KEY)
          return
        }

        const pack = gradeResourcePacks[pendingSync.grade] || gradeResourcePacks["Khối 1"]

        setResourceSync({
          isRunning: true,
          progress: 10,
          message: `Đang tải giáo trình ${pendingSync.grade} vào bộ nhớ nội tuyến...`,
        })
        await wait(450)

        if (isCancelled) {
          return
        }

        const rawSyncedPacks = localStorage.getItem(RESOURCE_SYNC_KEY)
        const syncedPacks = rawSyncedPacks ? JSON.parse(rawSyncedPacks) : []
        const nextPack = {
          grade: pendingSync.grade,
          title: pack.title,
          files: [pack.pdfFileName, pack.audioFileName],
          syncedAt: new Date().toISOString(),
        }

        localStorage.setItem(RESOURCE_SYNC_KEY, JSON.stringify([nextPack, ...syncedPacks]))
        setResourceSync((current) => ({ ...current, progress: 45 }))
        await wait(450)

        if (isCancelled) {
          return
        }

        await saveCurriculumAsset(
          pendingSync.grade,
          pack.pdfFileName,
          createPdfBlob(pendingSync.grade, pack.title),
        )
        setResourceSync((current) => ({ ...current, progress: 78 }))
        await wait(450)

        if (isCancelled) {
          return
        }

        await saveCurriculumAsset(pendingSync.grade, pack.audioFileName, createSilentWavBlob())
        localStorage.removeItem(PENDING_RESOURCE_SYNC_KEY)
        setResourceSync({
          isRunning: true,
          progress: 100,
          message: `Giáo trình ${pendingSync.grade} đã sẵn sàng offline.`,
        })
        await wait(1200)

        if (!isCancelled) {
          setResourceSync({ isRunning: false, progress: 0, message: "" })
        }
      }

      void runBackgroundSync()
    }, 1200)

    return () => {
      isCancelled = true
      window.clearTimeout(timeout)
    }
  }, [isReady, session])

  async function loadLesson(lesson: Lesson) {
    setActiveLessonTitle(lesson.title)
    setLessonContent(null)
    setIsLoadingLesson(true)

    try {
      const lessonModule = await lesson.loader()
      setLessonContent(() => lessonModule.default)
    } finally {
      setIsLoadingLesson(false)
    }
  }

  if (!isReady) {
    return (
      <main className="grid min-h-screen place-items-center animated-gradient">
        <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.85_0.18_85)]" />
      </main>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  const isAdmin = session.role === "ADMIN"
  const selectedLessons = lessonsByLevel[selectedLevel]

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_center,oklch(0.28_0.1_290/0.55),transparent_42rem),linear-gradient(135deg,oklch(0.09_0.03_280),oklch(0.18_0.08_275),oklch(0.18_0.08_245))] text-white">
      <Sidebar />

      {resourceSync.isRunning ? (
        <div className="fixed right-4 top-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-[oklch(0.72_0.28_320/0.35)] bg-black/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/75">
            <HardDrive className="h-4 w-4 text-[oklch(0.8_0.25_300)]" />
            {resourceSync.message}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[oklch(0.58_0.25_285)] via-[oklch(0.65_0.28_310)] to-[oklch(0.75_0.22_330)] transition-all duration-300"
              style={{ width: `${resourceSync.progress}%` }}
            />
          </div>
        </div>
      ) : null}

      <section className="ml-64 min-h-screen overflow-y-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto flex max-w-7xl flex-col gap-6"
        >
          {isAdmin ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="glass flex flex-col gap-4 rounded-[1.5rem] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity }}
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-[oklch(0.85_0.18_85)]"
                >
                  <ShieldCheck className="h-5 w-5" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Bạn đang đăng nhập bằng tài khoản Admin.
                  </p>
                  <p className="text-xs text-white/45">
                    Chọn Admin Panel để quản trị, hoặc tiếp tục xem User Dashboard.
                  </p>
                </div>
              </div>
              <Link
                href="/admin"
                className="neon-glow inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[oklch(0.5_0.2_280)] to-[oklch(0.45_0.22_300)] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                Admin Panel
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ) : null}

          <WelcomeBanner />

          <section className="glass rounded-[1.75rem] p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[oklch(0.85_0.18_85)]">
                  Roadmap
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Lộ trình của bạn
                </h2>
              </div>
              <p className="text-right text-sm text-white/45">
                Chọn cấp độ để đổi bài học phía dưới.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {roadmapLevels.map((level) => {
                const isSelected = selectedLevel === level.label

                return (
                  <motion.button
                    key={level.label}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(level.label)
                      setActiveLessonTitle("")
                      setLessonContent(null)
                      // Save selected level to localStorage for Chat API
                      localStorage.setItem("doremi_current_level", level.label)
                    }}
                    whileHover={{ y: -8, scale: 1.035 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className={[
                      "group rounded-[1.35rem] border bg-white/[0.07] p-4 text-left backdrop-blur-xl transition-colors",
                      isSelected
                        ? "border-[oklch(0.72_0.28_320)] shadow-[0_0_28px_oklch(0.72_0.28_320/0.42)]"
                        : "border-white/10 hover:border-white/25",
                    ].join(" ")}
                  >
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-white/10 transition-colors">
                      <Image
                        src={level.iconPath}
                        alt={level.label}
                        width={44}
                        height={44}
                        className="h-11 w-11 object-contain"
                      />
                    </div>
                    <p className="text-sm font-black text-white">{level.label}</p>
                    <p className="mt-1 text-xs text-white/35">
                      {isSelected ? "Đang học" : "Chọn cấp độ"}
                    </p>
                  </motion.button>
                )
              })}
            </div>

            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              className="mt-4 flex items-center justify-between rounded-[1.35rem] border border-[oklch(0.85_0.18_85/0.45)] bg-gradient-to-r from-[oklch(0.35_0.13_285/0.52)] to-[oklch(0.22_0.09_245/0.62)] p-5 shadow-[0_0_30px_oklch(0.85_0.18_85/0.22)]"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[oklch(0.85_0.18_85/0.16)] text-[oklch(0.85_0.18_85)]">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-lg font-black text-white">Challenger</p>
                  <p className="text-sm text-white/45">
                    Mở khóa sau khi hoàn thành toàn bộ lộ trình Master.
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[oklch(0.85_0.18_85)]">
                Cúp vàng
              </span>
            </motion.div>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  className="glass rounded-[2rem] p-6"
                >
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[oklch(0.75_0.18_200)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="max-w-40 text-right text-sm font-semibold text-white/45">
                      {stat.label}
                    </p>
                  </div>
                  <p className="text-4xl font-black tracking-tight text-white">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm font-bold text-[oklch(0.75_0.18_200)]">
                    {stat.detail}
                  </p>
                </motion.div>
              )
            })}
          </section>

          <section className="glass rounded-[1.75rem] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Bài học đang tiếp tục
                </h2>
                <p className="mt-1 text-sm font-medium text-white/45">
                  Cấp độ hiện tại: {selectedLevel}. Click vào bài học để tải nội dung.
                </p>
              </div>
              <Brain className="h-8 w-8 animate-pulse text-[oklch(0.72_0.28_320)]" />
            </div>

            <div className="space-y-4">
              {selectedLessons.map((lesson) => (
                <motion.button
                  key={lesson.title}
                  type="button"
                  onClick={() => void loadLesson(lesson)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full rounded-[1.5rem] border border-white/10 bg-white/10 p-5 text-left backdrop-blur-xl transition-colors hover:border-[oklch(0.72_0.28_325/0.6)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-black text-white">
                        {lesson.title}
                      </p>
                      <p className="mt-1 text-sm font-medium text-white/45">
                        {lesson.meta}
                      </p>
                    </div>
                    <span className="text-sm font-black text-[oklch(0.75_0.18_200)]">
                      {lesson.progress}%
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${lesson.progress}%` }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.17_200)] via-[oklch(0.72_0.25_285)] to-[oklch(0.72_0.28_325)]"
                    />
                  </div>
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeLessonTitle ? (
                <motion.div
                  key={activeLessonTitle}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
                >
                  {isLoadingLesson ? (
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải bài học theo tốc độ mạng hiện tại...
                    </div>
                  ) : LessonContent ? (
                    <LessonContent />
                  ) : null}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>

          <footer className="pb-4 text-center">
            <p className="text-xs text-white/60 md:text-sm">
              Phát Triển App & Web bởi{" "}
              <span className="bg-gradient-to-r from-[oklch(0.9_0.2_85)] via-[oklch(0.85_0.18_70)] to-[oklch(0.8_0.15_60)] bg-clip-text font-bold text-transparent drop-shadow-[0_0_12px_oklch(0.85_0.18_85/0.6)]">
                TJN MSTUDIOTB
              </span>
            </p>
          </footer>
        </motion.div>
      </section>
    </main>
  )
}
