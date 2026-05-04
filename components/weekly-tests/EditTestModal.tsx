"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, Edit, AlertCircle } from "lucide-react";

interface EditTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: any;
  onSave: (updatedTest: any) => Promise<void>;
}

export function EditTestModal({ isOpen, onClose, test, onSave }: EditTestModalProps) {
  const [jsonText, setJsonText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (test && isOpen) {
      // Format test data for editing
      const editableData = {
        title: test.title,
        description: test.description,
        week: test.week,
        year: test.year,
        startDate: test.startDate,
        endDate: test.endDate,
        questions: test.questions,
      };
      setJsonText(JSON.stringify(editableData, null, 2));
      setError("");
      setIsValid(true);
    }
  }, [test, isOpen]);

  const validateJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      
      // Validate required fields
      if (!parsed.title || !parsed.week || !parsed.year || !parsed.questions) {
        setError("Thiếu các trường bắt buộc: title, week, year, questions");
        setIsValid(false);
        return false;
      }

      if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        setError("questions phải là mảng và có ít nhất 1 câu hỏi");
        setIsValid(false);
        return false;
      }

      setError("");
      setIsValid(true);
      return true;
    } catch (e) {
      setError("JSON không hợp lệ. Vui lòng kiểm tra cú pháp!");
      setIsValid(false);
      return false;
    }
  };

  const handleTextChange = (text: string) => {
    setJsonText(text);
    validateJSON(text);
  };

  const handleSave = async () => {
    if (!validateJSON(jsonText)) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = JSON.parse(jsonText);
      await onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Error saving test:", error);
      setError(error instanceof Error ? error.message : "Lỗi khi lưu bài thi");
    } finally {
      setIsSaving(false);
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
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Edit className="size-5 text-[oklch(0.72_0.28_320)]" />
                Chỉnh sửa Bài Thi Tuần
              </h2>
              <p className="mt-1 text-sm text-white/45">
                {test?.title} - Tuần {test?.week}/{test?.year}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="grid size-10 place-items-center rounded-xl text-white/35 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 180px)" }}>
            <div className="space-y-4">
              {/* Instructions */}
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-4">
                <p className="text-sm text-blue-300">
                  💡 <strong>Hướng dẫn:</strong> Chỉnh sửa JSON bên dưới để cập nhật thông tin bài thi.
                  Đảm bảo giữ đúng cấu trúc JSON và các trường bắt buộc.
                </p>
              </div>

              {/* JSON Editor */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-white">
                  Nội dung JSON:
                </label>
                <textarea
                  value={jsonText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className={`w-full h-96 rounded-xl border ${
                    isValid ? "border-white/10" : "border-red-500/50"
                  } bg-white/[0.07] p-4 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[oklch(0.65_0.2_200/0.6)] font-mono`}
                  spellCheck={false}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3"
                >
                  <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}

              {/* Field Guide */}
              <div className="rounded-xl bg-white/5 p-4">
                <h3 className="text-sm font-bold text-white mb-2">Các trường dữ liệu:</h3>
                <ul className="text-xs text-white/60 space-y-1">
                  <li>• <strong>title</strong>: Tiêu đề bài thi (bắt buộc)</li>
                  <li>• <strong>description</strong>: Mô tả bài thi</li>
                  <li>• <strong>week</strong>: Số tuần (bắt buộc)</li>
                  <li>• <strong>year</strong>: Năm (bắt buộc)</li>
                  <li>• <strong>startDate</strong>: Ngày bắt đầu (ISO format)</li>
                  <li>• <strong>endDate</strong>: Ngày kết thúc (ISO format)</li>
                  <li>• <strong>questions</strong>: Mảng câu hỏi (bắt buộc)</li>
                </ul>
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
              disabled={isSaving || !isValid}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: isValid
                  ? "linear-gradient(135deg,oklch(0.52 0.22 200),oklch(0.68 0.22 280))"
                  : "oklch(0.3 0.05 280)",
                boxShadow: isValid ? "0 0 20px oklch(0.65 0.22 200/0.4)" : "none",
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="size-4" /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
