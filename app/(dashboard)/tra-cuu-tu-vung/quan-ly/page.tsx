"use client";

import { ArrowLeft, Plus, Upload, Trash2, Edit2, Save, X, Loader2, CheckCircle2, AlertCircle, FileText, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface VocabularyItem {
  _id?: string;
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
  imageUrl?: string;
}

interface ParsedVocabulary {
  word: string;
  meaning: string;
  phonetic: string;
  example: string;
}

export default function VocabularyManagementPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newWord, setNewWord] = useState<VocabularyItem>({
    word: "",
    meaning: "",
    phonetic: "",
    example: "",
    imageUrl: "",
  });
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [autoFillAI, setAutoFillAI] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  // For Word/PDF parsing
  const [isParsing, setIsParsing] = useState(false);
  const [parsedVocabulary, setParsedVocabulary] = useState<ParsedVocabulary[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Check if user is admin
    const session = localStorage.getItem("doremi_session");
    if (session) {
      const data = JSON.parse(session);
      if (data.role === "ADMIN") {
        setIsAdmin(true);
        loadVocabulary();
      } else {
        router.push("/tra-cuu-tu-vung");
      }
    } else {
      router.push("/tra-cuu-tu-vung");
    }
  }, [router]);

  async function loadVocabulary() {
    try {
      const response = await fetch("/api/vocabulary/list");
      if (response.ok) {
        const data = await response.json();
        setVocabularyList(data.vocabulary || []);
      }
    } catch (error) {
      console.error("Failed to load vocabulary:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddWord() {
    if (!newWord.word.trim()) {
      alert("Vui lòng nhập từ vựng");
      return;
    }

    try {
      const session = localStorage.getItem("doremi_session");
      const sessionData = session ? JSON.parse(session) : null;
      const token = sessionData?.token || "admin-token";

      const response = await fetch("/api/vocabulary/manage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newWord,
          autoFill: autoFillAI && (!newWord.meaning || !newWord.phonetic || !newWord.example),
        }),
      });

      if (response.ok) {
        await loadVocabulary();
        setNewWord({ word: "", meaning: "", phonetic: "", example: "", imageUrl: "" });
        setIsAddingNew(false);
      } else {
        const data = await response.json();
        alert(data.error || "Không thể thêm từ vựng");
      }
    } catch (error) {
      console.error("Failed to add word:", error);
      alert("Đã xảy ra lỗi khi thêm từ vựng");
    }
  }

  async function handleDeleteWord(id: string) {
    if (!confirm("Bạn có chắc muốn xóa từ này?")) return;

    try {
      const session = localStorage.getItem("doremi_session");
      const sessionData = session ? JSON.parse(session) : null;
      const token = sessionData?.token || "admin-token";

      const response = await fetch("/api/vocabulary/manage", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await loadVocabulary();
      }
    } catch (error) {
      console.error("Failed to delete word:", error);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("autoFill", autoFillAI.toString());

      const session = localStorage.getItem("doremi_session");
      const sessionData = session ? JSON.parse(session) : null;
      const token = sessionData?.token || "admin-token";

      const response = await fetch("/api/vocabulary/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult({ success: true, message: data.message });
        await loadVocabulary();
      } else {
        setUploadResult({ success: false, message: data.error || "Import thất bại" });
      }
    } catch (error) {
      setUploadResult({ success: false, message: "Đã xảy ra lỗi khi import" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setUploadResult(null);
    setParsedVocabulary([]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const session = localStorage.getItem("doremi_session");
      const sessionData = session ? JSON.parse(session) : null;
      const token = sessionData?.token || "admin-token";

      const response = await fetch("/api/vocabulary/parse-document", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setParsedVocabulary(data.vocabulary);
        setSelectedItems(new Set(data.vocabulary.map((_: any, i: number) => i)));
        setShowPreview(true);
        setUploadResult({ success: true, message: data.message });
      } else {
        setUploadResult({ success: false, message: data.error || "Không thể phân tách file" });
      }
    } catch (error) {
      setUploadResult({ success: false, message: "Đã xảy ra lỗi khi xử lý file" });
    } finally {
      setIsParsing(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = "";
      }
    }
  }

  function toggleSelectItem(index: number) {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  }

  function toggleSelectAll() {
    if (selectedItems.size === parsedVocabulary.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(parsedVocabulary.map((_, i) => i)));
    }
  }

  async function handleSaveParsedVocabulary() {
    const selectedVocab = parsedVocabulary.filter((_, i) => selectedItems.has(i));
    
    if (selectedVocab.length === 0) {
      alert("Vui lòng chọn ít nhất một từ vựng");
      return;
    }

    setIsUploading(true);

    try {
      const session = localStorage.getItem("doremi_session");
      const sessionData = session ? JSON.parse(session) : null;
      const token = sessionData?.token || "admin-token";

      let imported = 0;
      let updated = 0;

      for (const vocab of selectedVocab) {
        const response = await fetch("/api/vocabulary/manage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...vocab,
            autoFill: false, // Already processed by AI
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.inserted) imported++;
          if (data.updated) updated++;
        }
      }

      setUploadResult({
        success: true,
        message: `Đã lưu thành công: ${imported} từ mới, ${updated} từ cập nhật`,
      });
      
      await loadVocabulary();
      setShowPreview(false);
      setParsedVocabulary([]);
      setSelectedItems(new Set());
    } catch (error) {
      setUploadResult({ success: false, message: "Đã xảy ra lỗi khi lưu từ vựng" });
    } finally {
      setIsUploading(false);
    }
  }

  if (!isAdmin || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#03010a] via-[#0a0520] to-[#03010a]">
        <Loader2 className="size-8 animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03010a] via-[#0a0520] to-[#03010a] p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/tra-cuu-tu-vung"
              className="mb-3 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" strokeWidth={1.7} />
              Quay lại Tra cứu
            </Link>
            <h1 className="text-3xl font-bold text-white">Quản lý Kho Từ Vựng</h1>
            <p className="mt-2 text-sm text-white/60">
              Thêm, sửa, xóa từ vựng trong kho từ điển (chỉ dành cho Admin)
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#1a1c2e] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <h2 className="mb-4 text-lg font-semibold text-white">Import Hàng Loạt</h2>
          
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-4 transition-colors hover:border-neon-cyan/50 hover:bg-white/10">
              <Upload className="size-6 text-neon-cyan" strokeWidth={1.7} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">CSV / JSON</p>
                <p className="text-xs text-white/60">Import trực tiếp</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-violet-pink/20 bg-violet-pink/5 p-4 transition-colors hover:border-violet-pink/50 hover:bg-violet-pink/10">
              <FileText className="size-6 text-violet-pink" strokeWidth={1.7} />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Word / PDF</p>
                <p className="text-xs text-white/60">AI phân tách thông minh</p>
              </div>
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleDocumentUpload}
                className="hidden"
                disabled={isParsing}
              />
            </label>
          </div>

          <label className="mb-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <input
              type="checkbox"
              checked={autoFillAI}
              onChange={(e) => setAutoFillAI(e.target.checked)}
              className="size-4 rounded border-white/20 bg-white/10 text-neon-cyan"
            />
            <div>
              <p className="text-sm font-medium text-white">Tự động điền bằng AI</p>
              <p className="text-xs text-white/60">
                Nếu chỉ nhập từ tiếng Anh, AI sẽ tự động gợi ý nghĩa và phiên âm
              </p>
            </div>
          </label>

          {uploadResult && (
            <div
              className={`rounded-2xl border p-4 ${
                uploadResult.success
                  ? "border-green-500/20 bg-green-500/10"
                  : "border-red-500/20 bg-red-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                {uploadResult.success ? (
                  <CheckCircle2 className="size-5 text-green-400" strokeWidth={1.7} />
                ) : (
                  <AlertCircle className="size-5 text-red-400" strokeWidth={1.7} />
                )}
                <p
                  className={`text-sm ${
                    uploadResult.success ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {uploadResult.message}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Add New Word Section */}
        <div className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#3a1c24] p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Thêm Từ Mới</h2>
            <button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              {isAddingNew ? <X className="size-5" /> : <Plus className="size-5" />}
            </button>
          </div>

          {isAddingNew && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Từ vựng (bắt buộc)
                  </label>
                  <input
                    type="text"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    placeholder="Nhập từ tiếng Anh..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-neon-cyan/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Nghĩa tiếng Việt
                  </label>
                  <input
                    type="text"
                    value={newWord.meaning}
                    onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                    placeholder="AI sẽ tự động điền nếu bỏ trống..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-neon-cyan/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Phiên âm (IPA)
                  </label>
                  <input
                    type="text"
                    value={newWord.phonetic}
                    onChange={(e) => setNewWord({ ...newWord, phonetic: e.target.value })}
                    placeholder="AI sẽ tự động điền nếu bỏ trống..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-neon-cyan/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/80">
                    URL hình ảnh (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newWord.imageUrl}
                    onChange={(e) => setNewWord({ ...newWord, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-neon-cyan/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Câu ví dụ
                </label>
                <textarea
                  value={newWord.example}
                  onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                  placeholder="AI sẽ tự động điền nếu bỏ trống..."
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-neon-cyan/50 focus:outline-none"
                />
              </div>

              <button
                onClick={handleAddWord}
                className="w-full rounded-2xl border border-[#4fd1c5]/20 bg-gradient-to-r from-[#4fd1c5] to-[#38b2ac] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4fd1c5]/20 transition-all hover:shadow-[#4fd1c5]/40"
              >
                <Plus className="mr-2 inline size-5" strokeWidth={1.7} />
                Thêm từ vào kho
              </button>
            </div>
          )}
        </div>

        {/* Vocabulary List */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#1a1c2e] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">
              Danh Sách Từ Vựng ({vocabularyList.length})
            </h2>
          </div>

          <div className="max-h-[600px] overflow-y-auto p-6">
            {vocabularyList.length === 0 ? (
              <p className="py-12 text-center text-white/60">
                Chưa có từ vựng nào trong kho. Hãy thêm từ mới hoặc import file.
              </p>
            ) : (
              <div className="space-y-3">
                {vocabularyList.map((vocab) => (
                  <div
                    key={vocab._id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-lg font-bold text-white">{vocab.word}</h3>
                          <span className="text-sm text-neon-cyan">{vocab.phonetic}</span>
                        </div>
                        <p className="mb-1 text-sm text-white/80">{vocab.meaning}</p>
                        {vocab.example && (
                          <p className="text-xs italic text-white/60">"{vocab.example}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteWord(vocab._id!)}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20"
                          aria-label="Xóa"
                        >
                          <Trash2 className="size-4" strokeWidth={1.7} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal for Parsed Vocabulary */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#1a1c2e] shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 p-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Xác Nhận Từ Vựng ({selectedItems.size}/{parsedVocabulary.length})
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    Kiểm tra và chọn các từ vựng muốn lưu vào kho
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="size-5" strokeWidth={1.7} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-4">
                <button
                  onClick={toggleSelectAll}
                  className="text-sm font-medium text-neon-cyan transition-colors hover:text-neon-cyan/80"
                >
                  {selectedItems.size === parsedVocabulary.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
                <button
                  onClick={handleSaveParsedVocabulary}
                  disabled={isUploading || selectedItems.size === 0}
                  className="flex items-center gap-2 rounded-xl border border-[#4fd1c5]/20 bg-gradient-to-r from-[#4fd1c5] to-[#38b2ac] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#4fd1c5]/20 transition-all hover:shadow-[#4fd1c5]/40 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" strokeWidth={1.7} />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" strokeWidth={1.7} />
                      Lưu vào kho từ vựng
                    </>
                  )}
                </button>
              </div>

              {/* Vocabulary List */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                <div className="space-y-3">
                  {parsedVocabulary.map((vocab, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl border p-4 transition-all ${
                        selectedItems.has(index)
                          ? "border-neon-cyan/30 bg-neon-cyan/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(index)}
                          onChange={() => toggleSelectItem(index)}
                          className="mt-1 size-5 rounded border-white/20 bg-white/10 text-neon-cyan"
                        />
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-bold text-white">{vocab.word}</h3>
                            {vocab.phonetic && (
                              <span className="text-sm text-neon-cyan">{vocab.phonetic}</span>
                            )}
                          </div>
                          {vocab.meaning && (
                            <p className="mb-1 text-sm text-white/80">
                              <span className="font-medium text-white/60">Nghĩa:</span> {vocab.meaning}
                            </p>
                          )}
                          {vocab.example && (
                            <p className="text-xs italic text-white/60">
                              <span className="font-medium not-italic text-white/60">Ví dụ:</span> "{vocab.example}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
