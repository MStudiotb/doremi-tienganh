"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { LoginScreen } from "@/components/auth/login-screen"
import { Sidebar } from "@/components/Sidebar"
import { WelcomeBanner } from "@/components/WelcomeBanner"
import { HallOfFameCard } from "@/components/HallOfFameCard"
import { IncompleteLessons } from "@/components/IncompleteLessons"
import { saveCurriculumAsset } from "@/lib/idb-curriculum"
import {
  BookOpenCheck,
  Database,
  HardDrive,
  Loader2,
  Users,
} from "lucide-react"

type Session = {
  email: string
  name: string
  role: "ADMIN" | "USER"
  grade?: string
  age?: string
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
  { label: "Cấp 1", iconPath: "/TapSu.png" },
  { label: "Cấp 2", iconPath: "/CoBan.png" },
  { label: "Cấp 3", iconPath: "/TienBo.png" },
  { label: "Trung Cấp", iconPath: "/HieuBiet.png" },
  { label: "Cao Đẳng", iconPath: "/thanhthao.png" },
  { label: "Đại Học", iconPath: "/ChuyenGia.png" },
]

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
  const [selectedLevel, setSelectedLevel] = useState("Cấp 1")
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

      {/* Main content - Responsive margin for sidebar */}
      <section className="ml-0 lg:ml-64 min-h-screen overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto flex max-w-7xl flex-col gap-6"
        >
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

            {/* Responsive grid for roadmap levels */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {roadmapLevels.map((level) => {
                const isSelected = selectedLevel === level.label

                return (
                  <motion.button
                    key={level.label}
                    type="button"
                    onClick={() => {
                      setSelectedLevel(level.label)
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
          </section>

          {/* Responsive stats grid */}
          <section className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

          {/* Hall of Fame Section */}
          <HallOfFameCard />

          {/* Incomplete Lessons Section - Real data from database */}
          <IncompleteLessons userId={session.email} />

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
