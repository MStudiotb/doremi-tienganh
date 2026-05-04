"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  Trash2,
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
  grade?: number // Add grade field for filtering
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
  "Cấp 1",
  "Cấp 2",
  "Cấp 3",
  "Trung cấp & Cao đẳng",
  "Đại học",
] as const

// Dynamic grade blocks based on selected level
const GRADE_BLOCKS: Record<Level, readonly string[]> = {
  "Cấp 1": ["Khối 1", "Khối 2", "Khối 3", "Khối 4", "Khối 5"],
  "Cấp 2": ["Khối 6", "Khối 7", "Khối 8", "Khối 9"],
  "Cấp 3": ["Khối 10", "Khối 11", "Khối 12"],
  "Trung cấp & Cao đẳng": ["Đang cập nhật"],
  "Đại học": ["Đang cập nhật"],
} as const

const SKILLS = [
  "Từ vựng",
  "Ngữ pháp",
  "Đọc",
  "Nghe",
  "Nói",
  "Viết",
] as const

type Level = (typeof LEVELS)[number]
type Skill = (typeof SKILLS)[number]
type GradeBlock = string

const levelToNamespace: Record<string, ("primary_data" | "secondary_data" | "highschool_data")[]> = {
  "Cấp 1": ["primary_data"],
  "Cấp 2": ["secondary_data"],
  "Cấp 3": ["highschool_data"],
  "Trung cấp & Cao đẳng": ["highschool_data"],
  "Đại học": ["highschool_data"],
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
  isAdmin,
  onDelete,
}: {
  unit: LessonUnit
  index: number
  isAdmin: boolean
  onDelete: (unitId: string) => void
}) {
  const progress = getProgress(unit.id)
  const meta = namespaceMeta[unit.namespace] ?? namespaceMeta.primary_data
  
  // Long press state
  const [showDeleteButton, setShowDeleteButton] = useState(false)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [pressProgress, setPressProgress] = useState(0)

  const handleMouseDown = () => {
    if (!isAdmin) return
    
    // Start long press timer
    const startTime = Date.now()
    const duration = 3000 // 3 seconds
    
    // Animate progress
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / duration) * 100, 100)
      setPressProgress(progress)
      
      if (progress >= 100) {
        clearInterval(progressInterval)
      }
    }, 50)
    
    longPressTimerRef.current = setTimeout(() => {
      setShowDeleteButton(true)
      setPressProgress(0)
      clearInterval(progressInterval)
    }, duration)
  }

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    setPressProgress(0)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (confirm(`Bạn có chắc chắn muốn xóa bài học "${unit.title}" không?`)) {
      onDelete(unit.id)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.045 }}
      whileHover={{ y: -5, scale: 1.012 }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className="relative flex flex-col overflow-hidden rounded-[1.5rem] p-4 transition-colors h-[280px]"
      style={{
        background:
          "linear-gradient(145deg,oklch(0.18 0.06 280/0.85),oklch(0.14 0.04 265/0.9))",
        border: "1px solid oklch(0.55 0.18 300/0.22)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Long press progress indicator */}
      {isAdmin && pressProgress > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(to right, oklch(0.5 0.2 15/0.3) ${pressProgress}%, transparent ${pressProgress}%)`,
          }}
        />
      )}

      {/* Delete button (shown after long press) */}
      {isAdmin && showDeleteButton && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          type="button"
          onClick={handleDelete}
          className="absolute top-2 right-2 z-20 grid size-8 place-items-center rounded-full text-white transition-all hover:scale-110"
          style={{
            background: "linear-gradient(135deg, oklch(0.5 0.25 15), oklch(0.45 0.22 10))",
            boxShadow: "0 0 16px oklch(0.5 0.25 15/0.6)",
          }}
        >
          <Trash2 className="size-4" />
        </motion.button>
      )}
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

      {/* Title with ellipsis */}
      <h3 className="mb-1 text-base font-black leading-snug text-white line-clamp-2">
        {unit.title}
      </h3>
      <p className="mb-3 text-xs text-white/45 line-clamp-1">{unit.topic}</p>

      {/* Vocabulary preview - Fixed height */}
      <div className="mb-auto flex flex-wrap gap-1.5 h-[52px] overflow-hidden">
        {unit.vocabulary.slice(0, 4).map((v) => (
          <span
            key={v.word}
            className="rounded-lg border border-white/10 bg-white/[0.07] px-2 py-0.5 text-xs font-semibold text-white/80 h-fit"
          >
            {v.word}
          </span>
        ))}
        {unit.vocabulary.length > 4 && (
          <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs text-white/35 h-fit">
            +{unit.vocabulary.length - 4}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium text-white/40">Tiến độ</span>
        <span className="text-[10px] font-bold text-white/55">{progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10 mb-3">
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

      {/* Action row: start lesson link only */}
      <div className="flex items-center justify-end">
        <Link
          href={`/lessons/${unit.id}`}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.68 0.22 280))",
            boxShadow: "0 0 10px oklch(0.65 0.22 200/0.35)",
          }}
        >
          Vào học <ChevronRight className="size-3" />
        </Link>
      </div>
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
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="shrink-0 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/35 hidden sm:block">
        {label}
      </span>
      {/* scrollable container — hides scrollbar on all platforms */}
      <div
        className="flex gap-1.5 sm:gap-2 overflow-x-auto py-1"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {options.map((opt) => {
          const isActive = selected === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className="shrink-0 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all duration-200 touch-manipulation min-h-[32px]"
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
  const [selectedLevel, setSelectedLevel] = useState<Level>("Cấp 1")
  const [selectedGradeBlock, setSelectedGradeBlock] = useState<GradeBlock>("Khối 1")
  const [selectedSkill, setSelectedSkill] = useState<Skill>("Từ vựng")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAdmin, setIsAdmin] = useState(false)
  const ITEMS_PER_PAGE = 10

  // Check if user is admin
  useEffect(() => {
    const session = localStorage.getItem("doremi_session")
    if (session) {
      try {
        const parsed = JSON.parse(session)
        setIsAdmin(parsed.role === "ADMIN")
      } catch {
        setIsAdmin(false)
      }
    }
  }, [])

  // Delete lesson handler
  async function handleDeleteLesson(unitId: string) {
    try {
      // Extract base ID (remove -0, -1 suffix for IDB lessons)
      const baseId = unitId.replace(/-\d+$/, "")
      
      // Try to delete from IndexedDB first
      const req = indexedDB.open(RAG_DB_NAME, RAG_DB_VERSION)
      
      req.onsuccess = () => {
        const db = req.result
        const tx = db.transaction(RAG_STORE, "readwrite")
        const store = tx.objectStore(RAG_STORE)
        
        const deleteReq = store.delete(baseId)
        
        deleteReq.onsuccess = () => {
          // Remove from local state
          setAllUnits(prev => prev.filter(u => !u.id.startsWith(baseId)))
          alert("Đã xóa bài học thành công!")
        }
        
        deleteReq.onerror = () => {
          alert("Không thể xóa bài học từ IndexedDB!")
        }
      }
      
      req.onerror = () => {
        alert("Lỗi khi mở database!")
      }
    } catch (error) {
      console.error("Error deleting lesson:", error)
      alert("Có lỗi xảy ra khi xóa bài học!")
    }
  }

  useEffect(() => {
    // Load lessons from both MongoDB API and IndexedDB
    async function loadLessons() {
      try {
        // Load from MongoDB API
        const response = await fetch('/api/lessons')
        const data = await response.json()
        
        const apiUnits: LessonUnit[] = []
        if (data.success && data.lessons) {
          // Convert API lessons to LessonUnit format
          data.lessons.forEach((lesson: any, index: number) => {
            apiUnits.push({
              id: lesson.id,
              unitNumber: index + 1,
              title: lesson.title,
              topic: `Lớp ${lesson.grade} - Phần ${lesson.part}`,
              namespace: lesson.namespace,
              vocabulary: lesson.vocabulary || [],
              sentences: lesson.sentences || [],
              skillTags: lesson.skillTags || ["Từ vựng"],
              source: "mongodb",
              grade: lesson.grade,
            })
          })
        }

        // Load from IndexedDB
        const idbResources = await loadRagResources()
        const idbUnits: LessonUnit[] = []
        
        idbResources.forEach((res, index) => {
          // Extract grade from filename (e.g., "lop 2 - phan 1.pdf" -> grade 2)
          const gradeMatch = res.fileName.match(/lop\s*(\d+)/i) || res.fileName.match(/grade\s*(\d+)/i)
          const grade = gradeMatch ? parseInt(gradeMatch[1], 10) : undefined
          
          // Parse RAG text into units
          const parsed = parseRagIntoUnits(res.ragText, res.namespace, res.id)
          
          parsed.forEach((unit, unitIndex) => {
            idbUnits.push({
              ...unit,
              id: `${res.id}-${unitIndex}`,
              title: unit.title || `${res.fileName} - Phần ${unitIndex + 1}`,
              topic: grade ? `Lớp ${grade} - ${res.fileName}` : res.fileName,
              source: "idb",
              grade: grade,
            })
          })
        })
        
        // Merge all sources
        const merged = [
          ...apiUnits,
          ...idbUnits,
          ...smartStart1Units.map(u => ({ ...u, grade: 1 })),
        ]
        
        setAllUnits(merged)
      } catch (error) {
        console.error('Error loading lessons:', error)
        // Fallback to Smart Start 1 only
        setAllUnits(smartStart1Units.map(u => ({ ...u, grade: 1 })))
      } finally {
        setIsLoading(false)
      }
    }
    
    loadLessons()

    // Listen for IndexedDB updates from admin page
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'doremi_idb_updated') {
        loadLessons()
      }
    }

    // Listen for custom event from admin page
    const handleIdbUpdate = () => {
      loadLessons()
    }

    window.addEventListener('storage', handleStorageUpdate)
    window.addEventListener('doremi_idb_updated', handleIdbUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageUpdate)
      window.removeEventListener('doremi_idb_updated', handleIdbUpdate)
    }
  }, [])

  const filtered = useMemo(() => {
    let list = allUnits

    // Always filter by level
    const ns = levelToNamespace[selectedLevel] ?? []
    if (ns.length > 0) {
      list = list.filter((u) => ns.includes(u.namespace))
    }

    // Filter by grade block (Khối) - skip "Đang cập nhật"
    if (selectedGradeBlock !== "Đang cập nhật") {
      const gradeMatch = selectedGradeBlock.match(/Khối\s+(\d+)/)
      if (gradeMatch) {
        const targetGrade = parseInt(gradeMatch[1], 10)
        list = list.filter((u) => {
          const unitWithGrade = u as LessonUnit & { grade?: number }
          return unitWithGrade.grade === targetGrade
        })
      }
    }

    // Always filter by skill
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

    // FIXED SORTING: Grade -> Filename -> Page number
    list.sort((a, b) => {
      // 1. Sort by grade first (ascending: 1, 2, 3...)
      const gradeA = (a as LessonUnit & { grade?: number }).grade ?? 999
      const gradeB = (b as LessonUnit & { grade?: number }).grade ?? 999
      if (gradeA !== gradeB) return gradeA - gradeB

      // 2. Sort by filename/title (extract part number if exists)
      const getPartNumber = (title: string) => {
        const match = title.match(/phần\s*(\d+)|part\s*(\d+)/i)
        return match ? parseInt(match[1] || match[2], 10) : 0
      }
      const partA = getPartNumber(a.title + a.topic)
      const partB = getPartNumber(b.title + b.topic)
      if (partA !== partB) return partA - partB

      // 3. Sort by page number (extract from title/topic)
      const getPageNumber = (text: string) => {
        const match = text.match(/trang\s*(\d+)|page\s*(\d+)/i)
        return match ? parseInt(match[1] || match[2], 10) : 0
      }
      const pageA = getPageNumber(a.title + a.topic)
      const pageB = getPageNumber(b.title + b.topic)
      if (pageA !== pageB) return pageA - pageB

      // 4. Fallback to unit number
      return a.unitNumber - b.unitNumber
    })

    return list
  }, [allUnits, selectedLevel, selectedGradeBlock, selectedSkill, searchQuery])

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedUnits = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedLevel, selectedGradeBlock, selectedSkill, searchQuery])

  // Get current grade blocks based on selected level
  const currentGradeBlocks = GRADE_BLOCKS[selectedLevel]

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 text-white bg-[radial-gradient(circle_at_20%_20%,oklch(0.28_0.1_290/0.4),transparent_40rem)]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl flex flex-col gap-6"
      >
        {/* ── Page header - Responsive ── */}
        <div className="flex items-end justify-between gap-3 sm:gap-4 flex-wrap">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[oklch(0.75_0.2_285)]">
              DOREMI - TIẾNG ANH
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Tất cả Bài học
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-white/45">
              {isLoading
                ? "Đang tải..."
                : `${filtered.length} / ${allUnits.length} bài học`}
            </p>
          </div>
        </div>

        {/* ── Search bar - Responsive ── */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            placeholder="Tìm bài học theo tiêu đề, từ vựng, nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 sm:h-12 w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.07] pl-10 sm:pl-11 pr-9 sm:pr-10 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[oklch(0.65_0.25_300/0.6)] backdrop-blur-sm touch-manipulation"
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

        {/* ── Filter strips - Responsive ── */}
        <div
          className="flex flex-col gap-2 sm:gap-3 rounded-xl sm:rounded-2xl p-3 sm:p-4"
          style={{
            background: "oklch(0.15 0.05 280/0.6)",
            border: "1px solid oklch(0.4 0.1 280/0.2)",
          }}
        >
          <FilterStrip
            label="Cấp độ"
            options={LEVELS}
            selected={selectedLevel}
            onSelect={(level) => {
              setSelectedLevel(level)
              // Reset to first grade block of the new level
              const newGradeBlocks = GRADE_BLOCKS[level]
              setSelectedGradeBlock(newGradeBlocks[0])
            }}
          />
          <div
            className="h-px w-full"
            style={{ background: "oklch(0.45 0.1 280/0.2)" }}
          />
          <FilterStrip
            label="Khối lớp"
            options={currentGradeBlocks}
            selected={selectedGradeBlock}
            onSelect={setSelectedGradeBlock}
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
                setSelectedLevel("Cấp 1")
                setSelectedGradeBlock("Khối 1")
                setSelectedSkill("Từ vựng")
                setSearchQuery("")
              }}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-[oklch(0.75_0.22_300)] transition-colors hover:text-white"
            >
              Xoá tất cả bộ lọc →
            </button>
          </motion.div>
        ) : (
          <>
            {/* Responsive Grid: 1 col mobile, 2 cols tablet, 3-4 cols desktop */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedUnits.map((unit, i) => (
                <LessonCard 
                  key={unit.id} 
                  unit={unit} 
                  index={i} 
                  isAdmin={isAdmin}
                  onDelete={handleDeleteLesson}
                />
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-8">
                {/* Page numbers */}
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={
                      currentPage === 1
                        ? {
                            background: "oklch(0.2 0.05 280/0.4)",
                            color: "oklch(0.5 0.1 280)",
                          }
                        : {
                            background: "oklch(0.2 0.05 280/0.6)",
                            border: "1px solid oklch(0.45 0.12 280/0.3)",
                            color: "oklch(0.75 0.1 280)",
                          }
                    }
                  >
                    <ChevronRight className="size-3.5 rotate-180" />
                    <span className="hidden sm:inline">Trước</span>
                  </button>

                  {/* Page number buttons */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)

                    // Show ellipsis
                    const showEllipsisBefore = pageNum === currentPage - 2 && currentPage > 3
                    const showEllipsisAfter = pageNum === currentPage + 2 && currentPage < totalPages - 2

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span
                          key={`ellipsis-${pageNum}`}
                          className="px-2 text-white/30"
                        >
                          ...
                        </span>
                      )
                    }

                    if (!showPage) return null

                    const isActive = currentPage === pageNum
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className="min-w-[2.5rem] rounded-xl px-3 py-2 text-sm font-bold transition-all"
                        style={
                          isActive
                            ? {
                                background: "linear-gradient(135deg,oklch(0.52 0.22 285),oklch(0.47 0.24 305))",
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
                        {pageNum}
                      </button>
                    )
                  })}

                  {/* Next button */}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={
                      currentPage === totalPages
                        ? {
                            background: "oklch(0.2 0.05 280/0.4)",
                            color: "oklch(0.5 0.1 280)",
                          }
                        : {
                            background: "oklch(0.2 0.05 280/0.6)",
                            border: "1px solid oklch(0.45 0.12 280/0.3)",
                            color: "oklch(0.75 0.1 280)",
                          }
                    }
                  >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                </div>

                {/* Info text */}
                <div className="text-center">
                  <span className="text-xs text-white/40">
                    Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} trong tổng số {filtered.length} bài học
                  </span>
                </div>
              </div>
            )}
          </>
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
