"use client";

import { X, Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VocabularyImportModal({ isOpen, onClose }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [autoFill, setAutoFill] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
    updated?: number;
    aiFilledCount?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  }

  async function handleUpload() {
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("autoFill", autoFill.toString());

      // Get session token for admin auth
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

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult({
        success: true,
        message: data.message,
        imported: data.imported,
        updated: data.updated,
        aiFilledCount: data.aiFilledCount,
      });

      // Clear file after successful upload
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Đã xảy ra lỗi khi import",
      });
    } finally {
      setIsUploading(false);
    }
  }

  function handleClose() {
    setFile(null);
    setResult(null);
    setAutoFill(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1c2e] via-[#0d2b33] to-[#3a1c24] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
        {/* Decorative blurs */}
        <div className="pointer-events-none absolute -left-12 -top-12 size-40 rounded-full bg-[#4fd1c5]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 size-40 rounded-full bg-violet-pink/10 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <h2 className="text-xl font-bold text-white">Import Từ Vựng</h2>
            <p className="mt-1 text-sm text-white/60">
              Upload file CSV, PDF hoặc DOCX để thêm từ vựng hàng loạt
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X className="size-5" strokeWidth={1.7} />
          </button>
        </div>

        {/* Content */}
        <div className="relative space-y-6 p-6">
          {/* File Upload Area */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
              Chọn file (CSV, PDF, DOCX)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center transition-colors hover:border-neon-cyan/50 hover:bg-white/10"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="size-8 text-neon-cyan" strokeWidth={1.7} />
                  <div className="text-left">
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-sm text-white/60">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto mb-3 size-12 text-white/30" strokeWidth={1.5} />
                  <p className="text-sm text-white/60">
                    Click để chọn file hoặc kéo thả vào đây
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Định dạng: CSV (word,meaning,phonetic,example,imageUrl)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Auto-fill Option */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={autoFill}
                onChange={(e) => setAutoFill(e.target.checked)}
                className="mt-1 size-4 rounded border-white/20 bg-white/10 text-neon-cyan focus:ring-2 focus:ring-neon-cyan"
              />
              <div className="flex-1">
                <p className="font-medium text-white">Tự động điền bằng AI</p>
                <p className="mt-1 text-sm text-white/60">
                  Sử dụng AI (9Router) để tự động điền nghĩa, phiên âm và ví dụ cho các từ chưa có đầy đủ thông tin
                </p>
              </div>
            </label>
          </div>

          {/* Result Message */}
          {result && (
            <div
              className={`rounded-2xl border p-4 ${
                result.success
                  ? "border-green-500/20 bg-green-500/10"
                  : "border-red-500/20 bg-red-500/10"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="size-5 text-green-400" strokeWidth={1.7} />
                ) : (
                  <AlertCircle className="size-5 text-red-400" strokeWidth={1.7} />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      result.success ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.success && (
                    <div className="mt-2 space-y-1 text-xs text-white/60">
                      {result.imported !== undefined && (
                        <p>• {result.imported} từ mới được thêm</p>
                      )}
                      {result.updated !== undefined && (
                        <p>• {result.updated} từ được cập nhật</p>
                      )}
                      {result.aiFilledCount !== undefined && result.aiFilledCount > 0 && (
                        <p>• {result.aiFilledCount} từ được AI tự động điền</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Đóng
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1 rounded-2xl border border-[#4fd1c5]/20 bg-gradient-to-r from-[#4fd1c5] to-[#38b2ac] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4fd1c5]/20 transition-all hover:shadow-[#4fd1c5]/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Đang import...
                </span>
              ) : (
                "Import"
              )}
            </button>
          </div>

          {/* Format Guide */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-sm font-medium text-white/80">
              Hướng dẫn:
            </p>
            <div className="space-y-2 text-xs text-white/60">
              <div>
                <p className="font-medium text-white/70">CSV:</p>
                <code className="block">
                  word,meaning,phonetic,example,imageUrl
                  <br />
                  hello,xin chào,/həˈloʊ/,Hello everyone!,
                </code>
              </div>
              <div>
                <p className="font-medium text-white/70">PDF/DOCX:</p>
                <p>AI sẽ tự động trích xuất từ vựng từ tài liệu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
