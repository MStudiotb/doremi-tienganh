"use client";

import { useEffect, useMemo, useState } from "react";
import { openDB, type DBSchema } from "idb";
import type { PDFPageProxy } from "pdfjs-dist";
import {
  AlertTriangle,
  Database,
  FileAudio,
  FileImage,
  FileText,
  HardDrive,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";

type RagNamespace = "primary_data" | "secondary_data" | "highschool_data";

type LocalResource = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileBlob: Blob | null;
  ragText: string;
  schoolLevel: string;
  namespace: RagNamespace;
  autoTagReason: string;
  createdAt: string;
};

interface DoremiRagDB extends DBSchema {
  rag_resources: {
    key: string;
    value: LocalResource;
    indexes: {
      "by-namespace": RagNamespace;
      "by-created-at": string;
    };
  };
}

const DB_NAME = "doremi_rag_database";
const DB_VERSION = 1;
const STORE_NAME = "rag_resources";

const schoolLevels = ["Cấp 1", "Cấp 2", "Cấp 3"];
const namespaceLabels: Record<RagNamespace, string> = {
  primary_data: "primary_data",
  secondary_data: "secondary_data",
  highschool_data: "highschool_data",
};

function getNamespaceForLevel(level: string): RagNamespace {
  if (level === "Cấp 1") {
    return "primary_data";
  }

  if (level === "Cấp 2") {
    return "secondary_data";
  }

  return "highschool_data";
}

function getRagDb() {
  return openDB<DoremiRagDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });

        store.createIndex("by-namespace", "namespace");
        store.createIndex("by-created-at", "createdAt");
      }
    },
  });
}

async function getAllResources() {
  const db = await getRagDb();
  const resources = await db.getAll(STORE_NAME);

  return resources.sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}

async function saveResourceToIndexedDb(resource: LocalResource) {
  const db = await getRagDb();
  await db.put(STORE_NAME, resource);
}

async function deleteResourceFromIndexedDb(id: string) {
  const db = await getRagDb();
  await db.delete(STORE_NAME, id);
}

async function deleteAllResourcesFromIndexedDb() {
  const db = await getRagDb();
  await db.clear(STORE_NAME);
}

/** Remove all localStorage lesson-progress entries tied to a resource */
function cleanupLessonData(resourceId: string) {
  const prefix = `doremi_lesson_progress_${resourceId}-`;
  const cachePrefix = "doremi_vocab_parse_";
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && (k.startsWith(prefix) || k.startsWith(cachePrefix))) {
      toRemove.push(k);
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

function cleanupAllLessonData() {
  const prefixes = ["doremi_lesson_progress_", "doremi_vocab_parse_"];
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && prefixes.some((p) => k.startsWith(p))) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}

async function ocrPdfPage(page: PDFPageProxy) {
  const { createWorker } = await import("tesseract.js");
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: false });

  if (!context) {
    return "";
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;

  const worker = await createWorker("eng");

  try {
    const result = await worker.recognize(canvas);

    return result.data.text.replace(/\s+/g, " ").trim();
  } finally {
    await worker.terminate();
  }
}

async function extractPdfText(
  file: File,
  onProgress?: (message: string) => void,
) {
  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc ||= new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    onProgress?.(`Đang đọc trang ${pageNumber}/${pdf.numPages}...`);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    let pageText = content.items
      .map((item) => ("str" in item ? String(item.str) : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!pageText) {
      onProgress?.(
        `Trang ${pageNumber} không có text layer, đang OCR bằng Tesseract.js...`,
      );
      pageText = await ocrPdfPage(page);
    }

    if (pageText) {
      pages.push(`--- Trang ${pageNumber} ---\n${pageText}`);
    }
  }

  return pages.join("\n\n");
}

async function extractDocxText(file: File) {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return result.value.replace(/\s+/g, " ").trim();
}

async function extractReadableText(
  file: File,
  onProgress?: (message: string) => void,
) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
    return extractPdfText(file, onProgress);
  }

  if (
    fileName.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDocxText(file);
  }

  if (fileName.endsWith(".txt") || file.type === "text/plain") {
    return readFileAsText(file);
  }

  return "";
}

function autoTagRagContent(text: string) {
  const normalized = text.toLowerCase();
  const words = normalized.split(/\s+/).filter(Boolean);
  const simpleWords = [
    "hello",
    "hi",
    "goodbye",
    "bye",
    "family",
    "mother",
    "father",
    "school",
    "book",
    "cat",
    "dog",
    "color",
    "number",
    "apple",
    "banana",
    "classroom",
    "friend",
    "teacher",
  ];
  const secondaryMarkers = [
    "because",
    "although",
    "comparative",
    "superlative",
    "past tense",
    "future tense",
    "present perfect",
    "conditional",
    "relative clause",
    "reported speech",
  ];
  const advancedMarkers = [
    "academic",
    "hypothesis",
    "analysis",
    "therefore",
    "consequently",
    "nevertheless",
    "furthermore",
    "whereas",
    "sustainable",
    "environmental",
    "economics",
    "literature",
    "passive voice",
    "subjunctive",
  ];

  const simpleScore = simpleWords.filter((word) => normalized.includes(word)).length;
  const secondaryScore = secondaryMarkers.filter((word) => normalized.includes(word)).length;
  const advancedScore = advancedMarkers.filter((word) => normalized.includes(word)).length;
  const averageWordLength =
    words.reduce((total, word) => total + word.length, 0) / Math.max(words.length, 1);

  if (simpleScore >= 1 && advancedScore === 0 && secondaryScore === 0) {
    return {
      schoolLevel: "Cấp 1",
      namespace: "primary_data" as const,
      reason:
        "AI phát hiện từ vựng cơ bản như hello/goodbye/family, tự lưu vào primary_data.",
    };
  }

  if (advancedScore >= 2 || averageWordLength >= 8.5) {
    return {
      schoolLevel: "Cấp 3",
      namespace: "highschool_data" as const,
      reason:
        "AI phát hiện từ vựng học thuật hoặc ngữ pháp nâng cao, tự lưu vào highschool_data.",
    };
  }

  if (secondaryScore >= 1 || advancedScore === 1) {
    return {
      schoolLevel: "Cấp 2",
      namespace: "secondary_data" as const,
      reason:
        "AI phát hiện cấu trúc ngữ pháp trung cấp, tự lưu vào secondary_data.",
    };
  }

  return {
    schoolLevel: "Cấp 1",
    namespace: "primary_data" as const,
    reason:
      "AI chưa thấy tín hiệu nâng cao, mặc định xếp tài liệu vào primary_data.",
  };
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [ragText, setRagText] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("Cấp 1");
  const [namespace, setNamespace] = useState<RagNamespace>("primary_data");
  const [autoTagReason, setAutoTagReason] = useState("Chưa phân tích tài liệu.");
  const [message, setMessage] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resources, setResources] = useState<LocalResource[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; fileName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const namespaceCounts = useMemo(
    () => ({
      primary_data: resources.filter((resource) => resource.namespace === "primary_data").length,
      secondary_data: resources.filter((resource) => resource.namespace === "secondary_data").length,
      highschool_data: resources.filter((resource) => resource.namespace === "highschool_data").length,
    }),
    [resources],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsAdmin(localStorage.getItem("doremi_user_role") === "ADMIN");
      void getAllResources().then(setResources);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  function applyAutoTag(text: string) {
    const tag = autoTagRagContent(text);

    setSchoolLevel(tag.schoolLevel);
    setNamespace(tag.namespace);
    setAutoTagReason(tag.reason);

    return tag;
  }

  async function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    setMessage("");
    setRagText("");

    if (!nextFile) {
      setAutoTagReason("Chưa phân tích tài liệu.");
      return;
    }

    setIsExtracting(true);
    setAutoTagReason("Đang trích xuất và phân tích tài liệu...");

    try {
      const extractedText = await extractReadableText(nextFile, (progressMessage) => {
        setAutoTagReason(progressMessage);
      });

      if (extractedText) {
        const tag = applyAutoTag(extractedText);

        setRagText(extractedText);
        setMessage(
          `Đã trích xuất nội dung và tự gắn nhãn ${tag.schoolLevel}. Namespace hiện tại: ${tag.namespace}.`,
        );
      } else {
        const tag = applyAutoTag("");

        setMessage(
          `File này không có lớp text đọc được. Nếu là PDF scan/hình ảnh, cần OCR ở bước sau. Tạm xếp vào ${tag.namespace}.`,
        );
      }
    } catch {
      setAutoTagReason("Không thể phân tích tài liệu này. Vui lòng thử file khác.");
      setMessage("Không thể trích xuất văn bản từ file này.");
    } finally {
      setIsExtracting(false);
    }
  }

  function handleManualLevelChange(level: string) {
    const nextNamespace = getNamespaceForLevel(level);

    setSchoolLevel(level);
    setNamespace(nextNamespace);
    setAutoTagReason(`Bạn đã chọn thủ công ${level}, dữ liệu sẽ lưu vào ${nextNamespace}.`);
  }

  function handleRagTextChange(text: string) {
    setRagText(text);

    if (text.trim().length >= 8) {
      applyAutoTag(text);
    } else {
      setAutoTagReason("Chưa đủ nội dung để phân tích tài liệu.");
    }
  }

  async function handleSaveLocal() {
    setMessage("");

    if (!file && !ragText.trim()) {
      setMessage("Vui lòng chọn file hoặc nhập nội dung RAG trước khi lưu.");
      return;
    }

    setIsSaving(true);

    try {
      const currentTag = ragText.trim() ? autoTagRagContent(ragText) : null;
      const finalSchoolLevel = currentTag?.schoolLevel || schoolLevel;
      const finalNamespace = currentTag?.namespace || namespace;
      const finalReason = currentTag?.reason || autoTagReason;
      const nextResource: LocalResource = {
        id: crypto.randomUUID(),
        fileName: file?.name || "Không có file",
        fileType: file?.type || "text/plain",
        fileSize: file?.size || 0,
        fileBlob: file || null,
        ragText: ragText.trim(),
        schoolLevel: finalSchoolLevel,
        namespace: finalNamespace,
        autoTagReason: finalReason,
        createdAt: new Date().toISOString(),
      };

      await saveResourceToIndexedDb(nextResource);

      setResources(await getAllResources());
      setFile(null);
      setRagText("");
      setSchoolLevel("Cấp 1");
      setNamespace("primary_data");
      setAutoTagReason("Chưa phân tích tài liệu.");
      setMessage(`Đã lưu vào IndexedDB, namespace ${finalNamespace}.`);
      
      // Notify lessons page to reload data
      window.dispatchEvent(new Event('doremi_idb_updated'));
      localStorage.setItem('doremi_idb_updated', Date.now().toString());
    } catch {
      setMessage("Không thể lưu vào IndexedDB. Vui lòng kiểm tra dung lượng trình duyệt.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await deleteResourceFromIndexedDb(deleteConfirm.id);
      cleanupLessonData(deleteConfirm.id);
      setResources(await getAllResources());
      setMessage(`Đã xóa "${deleteConfirm.fileName}" khỏi IndexedDB.`);
      
      // Notify lessons page to reload data
      window.dispatchEvent(new Event('doremi_idb_updated'));
      localStorage.setItem('doremi_idb_updated', Date.now().toString());
    } catch {
      setMessage("Không thể xóa tài nguyên. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  }

  async function handleBulkDelete() {
    setIsBulkDeleting(true);
    try {
      await deleteAllResourcesFromIndexedDb();
      cleanupAllLessonData();
      setResources([]);
      setMessage("Đã xóa toàn bộ tài nguyên và dữ liệu bài học liên quan.");
      
      // Notify lessons page to reload data
      window.dispatchEvent(new Event('doremi_idb_updated'));
      localStorage.setItem('doremi_idb_updated', Date.now().toString());
    } catch {
      setMessage("Không thể xóa toàn bộ tài nguyên. Vui lòng thử lại.");
    } finally {
      setIsBulkDeleting(false);
      setShowBulkConfirm(false);
    }
  }

  return (
    <main className="min-h-screen p-8 text-foreground">
      <section className="glass mx-auto max-w-6xl rounded-[2rem] p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-neon-cyan">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Admin IndexedDB RAG
            </div>
            <h1 className="text-3xl font-black text-white">
              Quản lý Dữ liệu & Bài tập
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              Tải PDF, DOCX, TXT, WAV hoặc hình ảnh. File lớn như Smart Start 12.9MB
              sẽ được lưu bằng IndexedDB thay vì localStorage.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
            {isAdmin ? "Quyền: ADMIN" : "Chưa phát hiện quyền ADMIN trong localStorage"}
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {Object.entries(namespaceCounts).map(([key, count]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-white/35">{key}</p>
              <p className="mt-2 text-2xl font-black text-white">{count}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
            <label className="block">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <FileAudio className="size-4 text-neon-cyan" aria-hidden="true" />
                File PDF, DOCX, TXT, âm thanh hoặc hình ảnh
              </span>
              <input
                type="file"
                accept="audio/wav,audio/x-wav,image/*,.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.txt,text/plain"
                onChange={(event) => void handleFileChange(event.target.files?.[0] || null)}
                className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/65 file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
              />
            </label>

            {file ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                <div className="flex items-center gap-2 text-white">
                  {file.type.startsWith("image/") ? (
                    <FileImage className="size-4 text-neon-cyan" aria-hidden="true" />
                  ) : file.name.toLowerCase().endsWith(".pdf") ||
                    file.name.toLowerCase().endsWith(".docx") ||
                    file.name.toLowerCase().endsWith(".txt") ? (
                    <FileText className="size-4 text-neon-cyan" aria-hidden="true" />
                  ) : (
                    <FileAudio className="size-4 text-neon-cyan" aria-hidden="true" />
                  )}
                  {file.name}
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {file.type || "Không rõ định dạng"} · {formatFileSize(file.size)}
                </p>
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-neon-cyan">
                <Sparkles className="size-4" aria-hidden="true" />
                AI Auto-Tagging
              </div>
              <p className="mt-2 text-sm leading-6 text-white/60">{autoTagReason}</p>
              <p className="mt-2 text-xs font-semibold text-white/45">
                Namespace hiện tại:{" "}
                <span className="text-neon-cyan">{namespaceLabels[namespace]}</span>
              </p>
            </div>

            <label className="mt-6 block">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Database className="size-4 text-neon-cyan" aria-hidden="true" />
                Phân loại chương trình học
              </span>
              <select
                value={schoolLevel}
                onChange={(event) => handleManualLevelChange(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm font-semibold text-white outline-none focus:border-neon-cyan/50"
              >
                {schoolLevels.map((level) => (
                  <option key={level} value={level} className="bg-[#121225] text-white">
                    {level}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-6 block">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Database className="size-4 text-neon-cyan" aria-hidden="true" />
                Nội dung văn bản cho tài nguyên RAG
              </span>
              <textarea
                value={ragText}
                onChange={(event) => handleRagTextChange(event.target.value)}
                rows={9}
                placeholder="Nhập mô tả bài học, đáp án, transcript, từ vựng hoặc nội dung cần đưa vào RAG..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-neon-cyan/50"
              />
              {isExtracting ? (
                <p className="mt-2 text-xs font-medium text-neon-cyan">
                  Đang trích xuất văn bản từ file. PDF scan sẽ được OCR bằng Tesseract.js...
                </p>
              ) : null}
            </label>

            <button
              type="button"
              onClick={() => void handleSaveLocal()}
              disabled={isSaving}
              className="neon-glow mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[oklch(0.5_0.2_280)] to-[oklch(0.45_0.22_300)] text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" aria-hidden="true" />
              {isSaving ? "Đang lưu..." : "Lưu vào IndexedDB"}
            </button>

            {message ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/65">
                {message}
              </p>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Tài nguyên đã lưu</h2>
                <p className="mt-2 text-sm text-white/45">
                  Danh sách này được đọc từ IndexedDB, có thể chứa file PDF lớn dạng Blob.
                </p>
              </div>
              {resources.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBulkConfirm(true)}
                  className="flex shrink-0 items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {resources.length ? (
                resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{resource.fileName}</p>
                        <p className="mt-1 text-xs text-white/40">
                          {resource.fileType || "unknown"} · {formatFileSize(resource.fileSize)} ·{" "}
                          {resource.schoolLevel} · {resource.namespace} ·{" "}
                          {new Date(resource.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-neon-cyan/10 px-3 py-1 text-xs font-semibold text-neon-cyan">
                          <HardDrive className="size-3" aria-hidden="true" />
                          IndexedDB
                        </span>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ id: resource.id, fileName: resource.fileName })}
                          title="Xóa tài nguyên này"
                          className="flex size-8 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/25 hover:text-red-300"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-medium text-neon-cyan/80">
                      {resource.autoTagReason}
                    </p>
                    {resource.ragText ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/60">
                        {resource.ragText}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
                  Chưa có tài nguyên nào được lưu vào IndexedDB.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Single-delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-[1.5rem] p-7 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle className="size-5 text-red-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-black text-white">Xác nhận xóa</h3>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/65">
              Bạn có chắc chắn muốn xóa tài nguyên{" "}
              <span className="font-semibold text-white">&ldquo;{deleteConfirm.fileName}&rdquo;</span> và toàn
              bộ bài học liên quan không? Thao tác này không thể hoàn tác.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeleting}
                className="flex-1 rounded-2xl bg-red-500/80 py-3 text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xóa tài nguyên"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk-delete confirmation */}
      {showBulkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-[1.5rem] p-7 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-red-500/20">
                <AlertTriangle className="size-5 text-red-400" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-black text-white">Xóa toàn bộ dữ liệu</h3>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/65">
              Thao tác này sẽ xóa{" "}
              <span className="font-semibold text-white">tất cả {resources.length} tài nguyên</span>{" "}
              khỏi IndexedDB, đồng thời xóa toàn bộ tiến trình bài học và cache AI đã lưu. Không
              thể hoàn tác.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowBulkConfirm(false)}
                disabled={isBulkDeleting}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleBulkDelete()}
                disabled={isBulkDeleting}
                className="flex-1 rounded-2xl bg-red-500/80 py-3 text-sm font-bold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {isBulkDeleting ? "Đang xóa..." : `Xóa tất cả ${resources.length} tài nguyên`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
