"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  BookOpenCheck,
  ChevronRight,
  Headphones,
  Loader2,
  Mic,
  PenLine,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import {
  type LessonUnit,
  parseRagIntoUnits,
  smartStart1Units,
} from "@/lib/lesson-seed"

// ── IDB config (same store as admin page) ──────────────────────────────────
const RAG_DB_NAME = "doremi_rag_database"
const RAG_DB_VERSION = 1
const RAG_STORE = "rag_resources"

type RagResource = {
  id: string
  fileName: string
  ragText: string
  schoolLevel: string
  namespace: "primary_data" | "secondary_data" | "highschool_data"
  createdAt: string
}

async function loadRagResources(): Promise<RagResource[]> {
  return new Promise((resolve) => {
    const req = indexedDB.open(RAG_DB_NAME, RAG_DB_VERSION)
    req.onerror = () => resolve([])
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(RAG_STORE)) {
        const store = db.createObjectStore(RAG_STORE, { keyPath: "id" })
        store.createIndex("by-namespace", "namespace")
        store.createIndex("by-created-at", "createdAt")
      }
    }
    req.onsuccess = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(RAG_STORE)) { resolve([]); return }
      const tx = db.transaction(RAG_STORE, "readonly")
      const getAllReq = tx.objectStore(RAG_STORE).getAll()
      getAllReq.onsuccess = () => resolve(getAllReq.result as RagResource[])
      getAllReq.onerror = () => resolve([])
    }
  })
}

// ── Filter constants ───────────────────────────────────────────────────────
const LEVELS = [
  "Tất cả",
  "Cơ bản",
  "Trung cấp",
  "Trung cao cấp",
  "Cao cấp",
  "Thành thạo",
  "Master",
] as const

const SKILLS = [
  "Tất cả",
  "Từ vựng",
  "Ngữ pháp",
  "Đọc",
  "Nghe",
  "Nói",
  "Viết",
] as const

type Level = (typeof LEVELS)[number]
type Skill = (typeof SKILLS)[number]

const levelToNamespace: Record<string, ("primary_data" | "secondary_data" | "highschool_data")[]> = {
  "Cơ bản": ["primary_data"],
  "Trung cấp": ["secondary_data"],
  "Trung cao cấp": ["secondary_data"],
  "Cao cấp": ["highschool_data"],
  "Thành thạo": ["highschool_data"],
  Master: ["highschool_data"],
}

const skillKeywords: Record<string, string[]> = {
  "Từ vựng": ["vocabulary", "word", "từ vựng", "glossary", "term", "meaning"],
  "Ngữ pháp": ["grammar", "ngữ pháp", "tense", "present", "past", "structure"],
  "Đọc": ["reading", "passage", "text", "read", "comprehension", "paragraph"],
  "Nghe": ["listening", "audio", "pronunciation", "nghe", "sound", "listen"],
  "Nói": ["speaking", "conversation", "dialogue", "speak", "talk", "nói"],
  "Viết": ["writing", "write", "essay", "composition", "viết"],
}

// ── Badge helpers ──────────────────────────────────────────────────────────
const namespaceMeta: Record<
  string,
  { label: string; glow: string; bg: string }
> = {
  primary_data: {
    label: "Cấp 1",
    glow: "oklch(0.78_0.2_165)",
    bg: "oklch(0.28_0.1_165/0.25)",
  },
  secondary_data: {
    label: "Cấp 2",
    glow: "oklch(0.78_0.17_200)",
    bg: "oklch(0.28_0.1_200/0.25)",
  },
  highschool_data: {
    label: "Cấp 3",
    glow: "oklch(0.72_0.28_320)",
    bg: "oklch(0.28_0.1_320/0.25)",
  },
}

const skillIcon: Record<string, React.ReactNode> = {
  "Từ vựng": <Sparkles className="size-3" />,
  "Ngữ pháp": <BookOpen className="size-3" />,
  "Đọc": <BookOpenCheck className="size-3" />,
  "Nghe": <Headphones className="size-3" />,
  "Nói": <Mic className="size-3" />,
  "Viết": <PenLine className="size-3" />,
}

// ── Progress localStorage ──────────────────────────────────────────────────
function getProgress(id: string): number {
  if (typeof window === "undefined") return 0
  const stored = localStorage.getItem(`doremi_lesson_progress_${id}`)
  return stored ? Math.min(100, Math.max(0, parseInt(stored, 10))) : 0
}

// ── Card component ─────────────────────────────────────────────────────────
function LessonCard({
  unit,
  index,
}: {
  unit: LessonUnit
  index: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const progress = getProgress(unit.id)
  const meta = namespaceMeta[unit.namespace] ?? namespaceMeta.primary_data

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.045 }}
      whileHover={{ y: -5, scale: 1.012 }}
      onClick={() => setIsExpanded((v) => !v)}
      className="relative flex cursor-pointer flex-col overflow-hidden rounded-[1.5rem] p-5 transition-colors"
      style={{
        background:
          "linear-gradient(145deg,oklch(0.18 0.06 280/0.85),oklch(0.14 0.04 265/0.9))",
        border: "1px solid oklch(0.55 0.18 300/0.22)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Top badges row */}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{
            background: meta.bg,
            border: `1px solid ${meta.glow}`,
            color: meta.glow,
          }}
        >
          {meta.label}
        </span>
        {unit.skillTags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/8 px-2 py-0.5 text-[10px] font-medium text-white/55"
          >
            {skillIcon[tag]}
            {tag}
          </span>
        ))}
        {unit.source === "idb" && (
          <span className="ml-auto inline-flex items-center rounded-full border border-[oklch(0.72_0.28_60/0.4)] bg-[oklch(0.25_0.1_60/0.3)] px-2 py-0.5 text-[10px] font-bold text-[oklch(0.82_0.2_85)]">
            RAG
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-1 text-base font-black leading-snug text-white">
        {unit.title}
      </h3>
      <p className="mb-4 text-xs text-white/45">{unit.topic}</p>

      {/* Vocabulary preview */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {unit.vocabulary.slice(0, 4).map((v) => (
          <span
            key={v.word}
            className="rounded-lg border border-white/10 bg-white/[0.07] px-2 py-0.5 text-xs font-semibold text-white/80"
          >
            {v.word}
          </span>
        ))}
        {unit.vocabulary.length > 4 && (
          <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs text-white/35">
            +{unit.vocabulary.length - 4}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium text-white/40">Tiến độ</span>
        <span className="text-[10px] font-bold text-white/55">{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.0, ease: "easeOut", delay: index * 0.04 }}
          className="h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg,oklch(0.68 0.2 165),oklch(0.65 0.22 285),oklch(0.72 0.28 320))",
          }}
        />
      </div>

      {/* Action row: expand toggle + start lesson link */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsExpanded((v) => !v) }}
          className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/55 transition-colors"
        >
          <span>{isExpanded ? "Ẩn chi tiết" : "Xem mẫu câu"}</span>
          <ChevronRight
            className={`size-3 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          />
        </button>
        <Link
          href={`/lessons/${unit.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.68 0.22 280))",
            boxShadow: "0 0 10px oklch(0.65 0.22 200/0.35)",
          }}
        >
          Vào học <ChevronRight className="size-3" />
        </Link>
      </div>

      {/* Expandable sentences panel */}
      <AnimatePresence>
        {isExpanded && unit.sentences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 rounded-xl p-3"
              style={{
                background: "oklch(0.12 0.04 280/0.6)",
                border: "1px solid oklch(0.5 0.15 285/0.25)",
              }}
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/35">
                Mẫu câu
              </p>
              <ul className="space-y-1.5">
                {unit.sentences.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/65">
                    <span className="mt-0.5 text-[oklch(0.72_0.28_320)] text-[8px]">▶</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Full vocabulary in expanded view */}
            {unit.vocabulary.length > 0 && (
              <div
                className="mt-2 rounded-xl p-3"
                style={{
                  background: "oklch(0.12 0.04 165/0.4)",
                  border: "1px solid oklch(0.5 0.15 165/0.25)",
                }}
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/35">
                  Từ vựng đầy đủ
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {unit.vocabulary.map((v) => (
                    <div key={v.word} className="flex flex-col">
                      <span className="text-xs font-bold text-white/85">{v.word}</span>
                      {v.phonetic && (
                        <span className="text-[9px] text-[oklch(0.72_0.2_200)]">{v.phonetic}</span>
                      )}
                      {v.meaning && (
                        <span className="text-[10px] text-white/45">{v.meaning}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

// ── Filter tab strip (horizontal scroll, mobile-friendly) ──────────────────
function FilterStrip<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: readonly T[]
  selected: T
  onSelect: (v: T) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-white/35 hidden sm:block">
        {label}
      </span>
      {/* scrollable container — hides scrollbar on all platforms */}
      <div
        className="flex gap-2 overflow-x-auto py-1"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {options.map((opt) => {
          const isActive = selected === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200"
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg,oklch(0.52 0.22 285),oklch(0.47 0.24 305))",
                      color: "white",
                      boxShadow: "0 0 14px oklch(0.65 0.28 300/0.45)",
                    }
                  : {
                      background: "oklch(0.2 0.05 280/0.6)",
                      border: "1px solid oklch(0.45 0.12 280/0.3)",
                      color: "oklch(0.75 0.1 280)",
                    }
              }
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function LessonsPage() {
  const [allUnits, setAllUnits] = useState<LessonUnit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState<Level>("Tất cả")
  const [selectedSkill, setSelectedSkill] = useState<Skill>("Tất cả")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadRagResources()
      .then((ragResources) => {
        // Try to parse IDB resources into units
        const idbUnits: LessonUnit[] = []
        for (const resource of ragResources) {
          const parsed = parseRagIntoUnits(resource.ragText, resource.namespace, resource.id)
          if (parsed.length > 0) {
            idbUnits.push(...parsed)
          } else if (resource.ragText?.trim()) {
            // Single-document fallback: treat each IDB resource as one lesson
            idbUnits.push({
              id: resource.id,
              unitNumber: idbUnits.length + 1,
              title: resource.fileName.replace(/\.[^.]+$/, ""),
              topic: resource.schoolLevel,
              namespace: resource.namespace,
              vocabulary: [],
              sentences: resource.ragText
                .split("\n")
                .filter((l) => /[.!?]$/.test(l.trim()) && l.trim().length > 8)
                .slice(0, 4)
                .map((l) => l.trim()),
              skillTags: ["Từ vựng"],
              source: "idb",
            })
          }
        }

        // Merge: IDB units take priority; seed fills the gap
        const idbIds = new Set(idbUnits.map((u) => u.id))
        const merged = [
          ...idbUnits,
          ...smartStart1Units.filter((u) => !idbIds.has(u.id)),
        ]

        setAllUnits(merged)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = allUnits

    if (selectedLevel !== "Tất cả") {
      const ns = levelToNamespace[selectedLevel] ?? []
      list = list.filter((u) => ns.includes(u.namespace))
    }

    if (selectedSkill !== "Tất cả") {
      const keywords = skillKeywords[selectedSkill] ?? []
      list = list.filter(
        (u) =>
          u.skillTags.includes(selectedSkill) ||
          u.vocabulary.some((v) =>
            keywords.some((kw) => v.word.toLowerCase().includes(kw)),
          ) ||
          u.sentences.some((s) =>
            keywords.some((kw) => s.toLowerCase().includes(kw)),
          ),
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (u) =>
          u.title.toLowerCase().includes(q) ||
          u.topic.toLowerCase().includes(q) ||
          u.vocabulary.some((v) => v.word.includes(q) || v.meaning.includes(q)) ||
          u.sentences.some((s) => s.toLowerCase().includes(q)),
      )
    }

    return list
  }, [allUnits, selectedLevel, selectedSkill, searchQuery])

  return (
    <div className="min-h-screen p-6 md:p-8 text-white bg-[radial-gradient(circle_at_20%_20%,oklch(0.28_0.1_290/0.4),transparent_40rem)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl flex flex-col gap-6"
      >
        {/* ── Page header ── */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[oklch(0.75_0.2_285)]">
              DOREMI - ĐI HỌC ĐI
            </p>
            <h1 className="mt-1 text-3xl font-black text-white md:text-4xl">
              Tất cả Bài học
            </h1>
            <p className="mt-1 text-sm text-white/45">
              {isLoading
                ? "Đang tải..."
                : `${filtered.length} / ${allUnits.length} bài học`}
            </p>
          </div>

          {/* Source indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/45 backdrop-blur-sm">
            <span
              className="size-2 rounded-full"
              style={{ background: "oklch(0.78_0.2_165)" }}
            />
            Smart Start 1 &nbsp;|&nbsp;
            <span
              className="size-2 rounded-full"
              style={{ background: "oklch(0.72_0.28_60)" }}
            />
            Từ RAG
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            placeholder="Tìm bài học theo tiêu đề, từ vựng, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.07] pl-11 pr-10 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[oklch(0.65_0.25_300/0.6)] backdrop-blur-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/35 transition-colors hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* ── Filter strips ── */}
        <div
          className="flex flex-col gap-3 rounded-2xl p-4"
          style={{
            background: "oklch(0.15 0.05 280/0.6)",
            border: "1px solid oklch(0.4 0.1 280/0.2)",
          }}
        >
          <FilterStrip
            label="Cấp độ"
            options={LEVELS}
            selected={selectedLevel}
            onSelect={setSelectedLevel}
          />
          <div
            className="h-px w-full"
            style={{ background: "oklch(0.45 0.1 280/0.2)" }}
          />
          <FilterStrip
            label="Kỹ năng"
            options={SKILLS}
            selected={selectedSkill}
            onSelect={setSelectedSkill}
          />
        </div>

        {/* ── Loading state ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="size-8 animate-spin text-[oklch(0.72_0.28_300)]" />
            <p className="text-sm text-white/45">Đang tải dữ liệu bài học...</p>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-20 text-center"
          >
            <div
              className="grid size-16 place-items-center rounded-2xl"
              style={{ background: "oklch(0.2 0.06 280/0.5)" }}
            >
              <BookOpen className="size-8 text-white/30" />
            </div>
            <p className="text-lg font-bold text-white/50">Không tìm thấy bài học</p>
            <p className="text-sm text-white/30">
              Thử xoá bộ lọc hoặc thay đổi từ khoá tìm kiếm.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedLevel("Tất cả")
                setSelectedSkill("Tất cả")
                setSearchQuery("")
              }}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-[oklch(0.75_0.22_300)] transition-colors hover:text-white"
            >
              Xoá tất cả bộ lọc →
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((unit, i) => (
              <LessonCard key={unit.id} unit={unit} index={i} />
            ))}
          </div>
        )}

        {/* footer */}
        <footer className="pb-2 text-center">
          <p className="text-xs text-white/60">
            Phát Triển App & Web bởi{" "}
            <span className="bg-gradient-to-r from-[oklch(0.9_0.2_85)] via-[oklch(0.85_0.18_70)] to-[oklch(0.8_0.15_60)] bg-clip-text font-bold text-transparent drop-shadow-[0_0_12px_oklch(0.85_0.18_85/0.6)]">
              TJN MSTUDIOTB
            </span>
          </p>
        </footer>
      </motion.div>
    </div>
  )
}
