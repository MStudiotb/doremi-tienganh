"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Trash2, Save, Loader2, Upload, FileText, Code, MessageSquare, Eye } from "lucide-react"
import type { VocabItem } from "@/lib/lesson-seed"

type InputMethod = "manual" | "file" | "json" | "text"

type ParsedQuestion = {
  question: string
  options: string[]
  answer: string
}

type DirectInputModalProps = {
  isOpen: boolean
  onClose: () => void
  unitId: string
  unitTitle: string
  onSave: (data: { vocabulary: VocabItem[]; sentences: string[] }) => Promise<void>
}

export function DirectInputModal({
  isOpen,
  onClose,
  unitId,
  unitTitle,
  onSave,
}: DirectInputModalProps) {
  const [vocabulary, setVocabulary] = useState<VocabItem[]>([
    { word: "", phonetic: "", meaning: "" },
  ])
  const [sentences, setSentences] = useState<string[]>([""])
  const [isSaving, setIsSaving] = useState(false)

  const addVocabRow = () => {
    setVocabulary([...vocabulary, { word: "", phonetic: "", meaning: "" }])
  }

  const removeVocabRow = (index: number) => {
    setVocabulary(vocabulary.filter((_, i) => i !== index))
  }

  const updateVocab = (index: number, field: keyof VocabItem, value: string) => {
    const updated = [...vocabulary]
    updated[index] = { ...updated[index], [field]: value }
    setVocabulary(updated)
  }

  const addSentenceRow = () => {
    setSentences([...sentences, ""])
  }

  const removeSentenceRow = (index: number) => {
    setSentences(sentences.filter((_, i) => i !== index))
  }

  const updateSentence = (index: number, value: string) => {
    const updated = [...sentences]
    updated[index] = value
    setSentences(updated)
  }

  const handleSave = async () => {
    // Filter out empty entries
    const validVocab = vocabulary.filter((v) => v.word.trim() !== "")
    const validSentences = sentences.filter((s) => s.trim() !== "")

    if (validVocab.length === 0) {
      alert("Vui lòng nhập ít nhất 1 từ vựng!")
      return
    }

    setIsSaving(true)
    try {
      await onSave({ vocabulary: validVocab, sentences: validSentences })
      onClose()
    } catch (error) {
      console.error("Error saving lesson:", error)
      alert("Lỗi khi lưu bài học. Vui lòng thử lại!")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(4,3,18,0.85)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(145deg,oklch(0.17 0.07 280/0.97),oklch(0.13 0.05 265/0.98))",
            border: "1px solid oklch(0.5 0.15 300/0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <h2 className="text-xl font-black text-white">Nhập Bài Học Trực Tiếp</h2>
              <p className="mt-1 text-sm text-white/45">{unitTitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 place-items-center rounded-xl text-white/35 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 140px)" }}>
            {/* Vocabulary Section */}
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Từ Vựng</h3>
                <button
                  type="button"
                  onClick={addVocabRow}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Plus className="size-4" /> Thêm từ
                </button>
              </div>

              <div className="space-y-3">
                {vocabulary.map((vocab, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Từ tiếng Anh (bắt buộc)"
                        value={vocab.word}
                        onChange={(e) => updateVocab(index, "word", e.target.value)}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.07] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[oklch(0.65_0.2_200/0.6)]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Phiên âm (tùy chọn)"
                          value={vocab.phonetic}
                          onChange={(e) => updateVocab(index, "phonetic", e.target.value)}
                          className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.07] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[oklch(0.65_0.2_200/0.6)]"
                        />
                        <input
                          type="text"
                          placeholder="Nghĩa tiếng Việt"
                          value={vocab.meaning}
                          onChange={(e) => updateVocab(index, "meaning", e.target.value)}
                          className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.07] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[oklch(0.65_0.2_200/0.6)]"
                        />
                      </div>
                    </div>
                    {vocabulary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVocabRow(index)}
                        className="grid size-10 shrink-0 place-items-center rounded-lg text-white/35 transition-colors hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sentences Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Mẫu Câu</h3>
                <button
                  type="button"
                  onClick={addSentenceRow}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Plus className="size-4" /> Thêm câu
                </button>
              </div>

              <div className="space-y-3">
                {sentences.map((sentence, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <input
                      type="text"
                      placeholder="Nhập mẫu câu tiếng Anh..."
                      value={sentence}
                      onChange={(e) => updateSentence(index, e.target.value)}
                      className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.07] px-3 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[oklch(0.65_0.2_285/0.6)]"
                    />
                    {sentences.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSentenceRow(index)}
                        className="grid size-10 shrink-0 place-items-center rounded-lg text-white/35 transition-colors hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.68 0.22 280))",
                boxShadow: "0 0 20px oklch(0.65 0.22 200/0.4)",
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="size-4" /> Lưu bài học
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
