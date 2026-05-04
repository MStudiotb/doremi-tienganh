"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, File, Code, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

type UploadMethod = "pdf" | "docx" | "txt" | "json";

type AdminContentUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gradeId: number;
  gradeName: string;
  onUploadSuccess: () => void;
};

export function AdminContentUploadModal({
  isOpen,
  onClose,
  gradeId,
  gradeName,
  onUploadSuccess,
}: AdminContentUploadModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<UploadMethod | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMethods = [
    {
      id: "pdf" as UploadMethod,
      name: "PDF",
      icon: FileText,
      accept: ".pdf",
      description: "Tải lên file PDF",
      color: "oklch(0.65 0.25 15)",
    },
    {
      id: "docx" as UploadMethod,
      name: "Word",
      icon: File,
      accept: ".docx,.doc",
      description: "Tải lên file Word",
      color: "oklch(0.55 0.25 240)",
    },
    {
      id: "txt" as UploadMethod,
      name: "Text",
      icon: FileText,
      accept: ".txt",
      description: "Tải lên file văn bản",
      color: "oklch(0.60 0.20 160)",
    },
    {
      id: "json" as UploadMethod,
      name: "JSON",
      icon: Code,
      accept: ".json",
      description: "Dán hoặc tải JSON",
      color: "oklch(0.70 0.25 280)",
    },
  ];

  const handleMethodSelect = (method: UploadMethod) => {
    setSelectedMethod(method);
    setFile(null);
    setJsonText("");
    setUploadStatus("idle");
    setStatusMessage("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!selectedMethod) return;

    // Validate input
    if (selectedMethod === "json") {
      if (!jsonText.trim() && !file) {
        setUploadStatus("error");
        setStatusMessage("Vui lòng dán JSON hoặc chọn file JSON!");
        return;
      }
    } else {
      if (!file) {
        setUploadStatus("error");
        setStatusMessage("Vui lòng chọn file để tải lên!");
        return;
      }
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setStatusMessage("");

    try {
      const formData = new FormData();
      formData.append("gradeId", gradeId.toString());
      formData.append("method", selectedMethod);

      if (selectedMethod === "json" && jsonText.trim()) {
        // Validate JSON
        try {
          JSON.parse(jsonText);
          formData.append("jsonContent", jsonText);
        } catch (e) {
          throw new Error("JSON không hợp lệ. Vui lòng kiểm tra lại!");
        }
      } else if (file) {
        formData.append("file", file);
      }

      const response = await fetch("/api/admin/upload-grade-content", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Lỗi khi tải lên nội dung");
      }

      setUploadStatus("success");
      setStatusMessage(
        `Đã tải lên thành công ${data.lessonsCreated || 0} bài học cho ${gradeName}!`
      );

      // Wait a bit then close and refresh
      setTimeout(() => {
        onUploadSuccess();
        onClose();
        resetModal();
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setFile(null);
    setJsonText("");
    setUploadStatus("idle");
    setStatusMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(4,3,18,0.9)" }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(145deg,oklch(0.17 0.07 280/0.97),oklch(0.13 0.05 265/0.98))",
            border: "1px solid oklch(0.5 0.15 300/0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="size-5 text-[oklch(0.85_0.2_60)]" />
                Cập nhật nội dung {gradeName}
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Tải lên file hoặc dán JSON để tự động tạo bài học
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="grid size-10 place-items-center rounded-xl text-white/35 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 180px)" }}>
            {/* Method Selection */}
            {!selectedMethod && (
              <div className="grid grid-cols-2 gap-4">
                {uploadMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-105"
                      style={{
                        background: "linear-gradient(145deg, oklch(0.16 0.05 280 / 0.75), oklch(0.12 0.03 265 / 0.85))",
                        border: "1px solid oklch(0.55 0.18 300 / 0.18)",
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10"
                        style={{ background: method.color }}
                      />
                      <Icon className="size-10 mb-3" style={{ color: method.color }} />
                      <h3 className="text-lg font-bold text-white mb-1">{method.name}</h3>
                      <p className="text-sm text-white/50">{method.description}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* File Upload Interface */}
            {selectedMethod && selectedMethod !== "json" && (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  ← Quay lại chọn phương thức
                </button>

                <div
                  className="rounded-2xl border-2 border-dashed border-white/20 p-8 text-center transition-colors hover:border-white/40"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="size-12 mx-auto mb-4 text-white/40" />
                  <p className="text-white font-semibold mb-2">
                    {file ? file.name : "Nhấn để chọn file"}
                  </p>
                  <p className="text-sm text-white/40">
                    {uploadMethods.find((m) => m.id === selectedMethod)?.accept}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={uploadMethods.find((m) => m.id === selectedMethod)?.accept}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* JSON Input Interface */}
            {selectedMethod === "json" && (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  ← Quay lại chọn phương thức
                </button>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-white">
                    Dán JSON hoặc chọn file:
                  </label>
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='{"lessons": [{"title": "Unit 1", "vocabulary": [...], "sentences": [...]}]}'
                    className="w-full h-48 rounded-xl border border-white/10 bg-white/[0.07] p-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[oklch(0.65_0.2_200/0.6)] font-mono"
                  />
                  <div className="text-center text-white/40 text-sm">hoặc</div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-white/70 transition-colors hover:bg-white/10"
                  >
                    {file ? file.name : "Chọn file JSON"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 rounded-xl p-4 flex items-start gap-3 ${
                  uploadStatus === "success"
                    ? "bg-green-500/10 border border-green-500/30"
                    : "bg-red-500/10 border border-red-500/30"
                }`}
              >
                {uploadStatus === "success" ? (
                  <CheckCircle className="size-5 text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    uploadStatus === "success" ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {statusMessage}
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {selectedMethod && (
            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading || (!file && !jsonText.trim())}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  background: "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.68 0.22 280))",
                  boxShadow: "0 0 20px oklch(0.65 0.22 200/0.4)",
                }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <Upload className="size-4" /> Tải lên và xử lý
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
