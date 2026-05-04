"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Lock, ChevronRight, Trophy, Sparkles, ChevronDown, ChevronUp, Upload } from "lucide-react";
import { type UserProgress } from "@/lib/user-progress";
import { AdminContentUploadModal } from "@/components/roadmap/AdminContentUploadModal";

// Grade configuration
const GRADES = [
  { id: 1, name: "Lớp 1", color: "oklch(0.78_0.2_165)" },
  { id: 2, name: "Lớp 2", color: "oklch(0.78_0.17_200)" },
  { id: 3, name: "Lớp 3", color: "oklch(0.72_0.28_320)" },
  { id: 4, name: "Lớp 4", color: "oklch(0.75_0.25_280)" },
  { id: 5, name: "Lớp 5", color: "oklch(0.70_0.22_240)" },
] as const;

type Lesson = {
  id: string;
  grade: number;
  part: number;
  title: string;
  fileName: string;
  namespace: string;
  vocabulary: any[];
  sentences: any[];
  skillTags: string[];
};

export default function RoadmapPage() {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsByGrade, setLessonsByGrade] = useState<Record<number, Lesson[]>>({});
  const [expandedGrades, setExpandedGrades] = useState<Set<number>>(new Set([1]));
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedGradeForUpload, setSelectedGradeForUpload] = useState<{ id: number; name: string } | null>(null);

  // Check if user is admin
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.email === "mstudiotb@gmail.com") {
          setIsAdmin(true);
        }
      })
      .catch(() => setIsAdmin(false));
  }, []);

  // Fetch user progress
  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        setUserProgress(data);
      })
      .catch((err) => {
        console.error("Failed to fetch progress:", err);
        // Fallback to localStorage
        const stored = localStorage.getItem("doremi_progress_guest");
        if (stored) {
          setUserProgress(JSON.parse(stored));
        } else {
          setUserProgress({
            email: "guest",
            completedUnits: [],
            currentStreak: 0,
            totalLessonsCompleted: 0,
            lastActivityDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });
  }, []);

  // Fetch lessons from API
  const fetchLessons = () => {
    fetch("/api/lessons")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLessons(data.lessons || []);
          setLessonsByGrade(data.lessonsByGrade || {});
        }
      })
      .catch((err) => {
        console.error("Failed to fetch lessons:", err);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Filter lessons by selected grade
  const filteredLessons = lessonsByGrade[selectedGrade] || [];
  const allLessonIds = lessons.map((l) => l.id);

  // Toggle grade expansion
  const toggleGrade = (gradeId: number) => {
    const newExpanded = new Set(expandedGrades);
    if (newExpanded.has(gradeId)) {
      newExpanded.delete(gradeId);
    } else {
      newExpanded.add(gradeId);
    }
    setExpandedGrades(newExpanded);
  };

  // Handle admin upload
  const handleOpenUpload = (gradeId: number, gradeName: string) => {
    setSelectedGradeForUpload({ id: gradeId, name: gradeName });
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    fetchLessons(); // Refresh lessons after upload
  };

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{
        fontFamily: "'Quicksand', sans-serif",
        background: "radial-gradient(circle at 30% 20%, oklch(0.22 0.08 280 / 0.5), transparent 50rem)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl space-y-8"
      >
        {/* Header with Gravity Gradient */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black mb-3"
            style={{
              background: "linear-gradient(135deg, oklch(0.85 0.2 330), oklch(0.75 0.25 280), oklch(0.65 0.28 200))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Lộ trình học
          </motion.h1>
          <p className="text-white/60 text-sm md:text-base">
            Chọn lớp học và hoàn thành từng bài để tiến bộ
          </p>
        </div>

        {/* Stats Overview */}
        {userProgress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4"
          >
            <div
              className="rounded-2xl p-4 text-center backdrop-blur-xl"
              style={{
                background: "linear-gradient(145deg, oklch(0.18 0.06 280 / 0.7), oklch(0.14 0.04 265 / 0.8))",
                border: "1px solid oklch(0.55 0.18 300 / 0.25)",
              }}
            >
              <Trophy className="mx-auto mb-2 size-6 text-[oklch(0.85_0.2_60)]" />
              <div className="text-2xl font-black text-white">{userProgress.totalLessonsCompleted}</div>
              <div className="text-xs text-white/50">Bài hoàn thành</div>
            </div>
            <div
              className="rounded-2xl p-4 text-center backdrop-blur-xl"
              style={{
                background: "linear-gradient(145deg, oklch(0.18 0.06 280 / 0.7), oklch(0.14 0.04 265 / 0.8))",
                border: "1px solid oklch(0.55 0.18 300 / 0.25)",
              }}
            >
              <Sparkles className="mx-auto mb-2 size-6 text-[oklch(0.78_0.2_165)]" />
              <div className="text-2xl font-black text-white">{userProgress.currentStreak}</div>
              <div className="text-xs text-white/50">Chuỗi ngày</div>
            </div>
            <div
              className="rounded-2xl p-4 text-center backdrop-blur-xl"
              style={{
                background: "linear-gradient(145deg, oklch(0.18 0.06 280 / 0.7), oklch(0.14 0.04 265 / 0.8))",
                border: "1px solid oklch(0.55 0.18 300 / 0.25)",
              }}
            >
              <BookOpen className="mx-auto mb-2 size-6 text-[oklch(0.72_0.28_320)]" />
              <div className="text-2xl font-black text-white">
                {Math.round(((userProgress?.completedUnits?.length || 0) / (allLessonIds?.length || 1)) * 100)}%
              </div>
              <div className="text-xs text-white/50">Tiến độ</div>
            </div>
          </motion.div>
        )}

        {/* Grade Sections */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-white/50">Đang tải...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {GRADES.map((grade) => {
              const gradeLessons = lessonsByGrade[grade.id] || [];
              const isExpanded = expandedGrades.has(grade.id);
              const completedCount = gradeLessons.filter((lesson) =>
                userProgress?.completedUnits.includes(lesson.id)
              ).length;

              return (
                <motion.div
                  key={grade.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: grade.id * 0.1 }}
                  className="space-y-3"
                >
                  {/* Grade Header */}
                  <div className="relative group">
                    <button
                      onClick={() => toggleGrade(grade.id)}
                      className="w-full rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: "linear-gradient(145deg, oklch(0.18 0.06 280 / 0.85), oklch(0.14 0.04 265 / 0.9))",
                        border: "1px solid oklch(0.55 0.18 300 / 0.22)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                        <div
                          className="flex size-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${grade.color}, oklch(0.5 0.2 280))`,
                          }}
                        >
                          {grade.id === 1 ? (
                            <Image
                              src="/tapsu.png"
                              alt="Cấp 1"
                              width={56}
                              height={56}
                              className="object-cover w-full h-full"
                              style={{ borderRadius: "0.75rem" }}
                            />
                          ) : (
                            <span className="font-black text-lg text-white">{grade.id}</span>
                          )}
                        </div>
                          <div className="text-left">
                            <h2 className="text-2xl font-black text-white">{grade.name}</h2>
                            <p className="text-sm text-white/60">
                              {gradeLessons.length} bài học • {completedCount} hoàn thành
                            </p>
                          </div>
                        </div>
                        <div className="text-white/60">
                          {isExpanded ? <ChevronUp className="size-6" /> : <ChevronDown className="size-6" />}
                        </div>
                      </div>
                    </button>

                    {/* Admin Upload Button */}
                    {isAdmin && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUpload(grade.id, grade.name);
                        }}
                        className="absolute top-4 right-16 rounded-xl px-3 py-2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                        style={{
                          background: "linear-gradient(135deg, oklch(0.65 0.25 15), oklch(0.55 0.22 340))",
                          boxShadow: "0 4px 12px rgba(255,100,50,0.3)",
                        }}
                      >
                        <Upload className="size-4 inline mr-1" />
                        Cập nhật
                      </motion.button>
                    )}
                  </div>

                  {/* Lessons List */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 pl-4"
                    >
                      {gradeLessons.map((lesson, index) => {
                        const isUnlocked = index === 0 || userProgress?.completedUnits.includes(gradeLessons[index - 1]?.id) || false;
                        const isCompleted = userProgress?.completedUnits.includes(lesson.id) || false;
                        const progress = getUnitProgress(lesson.id);

                        return (
                          <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            index={index}
                            isUnlocked={isUnlocked}
                            isCompleted={isCompleted}
                            progress={progress}
                          />
                        );
                      })}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="pb-4 text-center">
          <p className="text-xs text-white/60">
            Phát Triển App & Web bởi{" "}
            <span className="bg-gradient-to-r from-[oklch(0.9_0.2_85)] via-[oklch(0.85_0.18_70)] to-[oklch(0.8_0.15_60)] bg-clip-text font-bold text-transparent">
              TJN MSTUDIOTB
            </span>
          </p>
        </footer>
      </motion.div>

      {/* Admin Upload Modal */}
      {selectedGradeForUpload && (
        <AdminContentUploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedGradeForUpload(null);
          }}
          gradeId={selectedGradeForUpload.id}
          gradeName={selectedGradeForUpload.name}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}

// Lesson Card Component
function LessonCard({
  lesson,
  index,
  isUnlocked,
  isCompleted,
  progress,
}: {
  lesson: Lesson;
  index: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  progress: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isUnlocked ? 1 : 0.4, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative"
    >
      <Link
        href={isUnlocked ? `/lessons/${lesson.id}` : "#"}
        className={`block rounded-2xl p-5 backdrop-blur-xl transition-all duration-300 ${
          isUnlocked ? "hover:scale-[1.01] cursor-pointer" : "cursor-not-allowed"
        }`}
        style={{
          background: isUnlocked
            ? "linear-gradient(145deg, oklch(0.16 0.05 280 / 0.75), oklch(0.12 0.03 265 / 0.85))"
            : "linear-gradient(145deg, oklch(0.12 0.03 280 / 0.5), oklch(0.10 0.02 265 / 0.6))",
          border: isUnlocked
            ? "1px solid oklch(0.55 0.18 300 / 0.18)"
            : "1px solid oklch(0.35 0.08 280 / 0.15)",
          boxShadow: isUnlocked ? "0 4px 16px rgba(0,0,0,0.2)" : "none",
        }}
        onClick={(e) => {
          if (!isUnlocked) e.preventDefault();
        }}
      >
        <div className="flex items-start gap-4">
          {/* Part Number Circle */}
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-full font-black text-base"
            style={{
              background: isUnlocked
                ? "linear-gradient(135deg, oklch(0.65 0.25 285), oklch(0.52 0.22 200))"
                : "oklch(0.2 0.05 280 / 0.5)",
              color: isUnlocked ? "white" : "oklch(0.4 0.1 280)",
            }}
          >
            {isCompleted ? "✓" : `P${lesson.part}`}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3
              className="mb-1 text-lg font-black leading-tight"
              style={{ color: isUnlocked ? "white" : "oklch(0.5 0.1 280)" }}
            >
              {lesson.title}
            </h3>
            <p
              className="mb-3 text-xs"
              style={{ color: isUnlocked ? "oklch(0.8 0.1 280)" : "oklch(0.45 0.08 280)" }}
            >
              Phần {lesson.part} • {lesson.skillTags.join(", ")}
            </p>

            {/* Progress Bar */}
            {isUnlocked && (
              <>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/40">Tiến độ</span>
                  <span className="text-xs font-bold text-white/55">{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, oklch(0.68 0.2 165), oklch(0.65 0.22 285), oklch(0.72 0.28 320))",
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Lock Icon or Arrow */}
          <div className="shrink-0">
            {isUnlocked ? (
              <ChevronRight className="size-5 text-white/60" />
            ) : (
              <Lock className="size-5 text-white/25" />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Helper function to get unit progress from localStorage
function getUnitProgress(unitId: string): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(`doremi_lesson_progress_${unitId}`);
  return stored ? Math.min(100, Math.max(0, parseInt(stored, 10))) : 0;
}
