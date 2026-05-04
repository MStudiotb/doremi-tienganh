"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Lock, ChevronRight, Trophy, Sparkles } from "lucide-react";
import { smartStart1Units, type LessonUnit } from "@/lib/lesson-seed";
import { type UserProgress } from "@/lib/user-progress";

// Character icons for proficiency levels - 6 levels only (no Challenger/Cup)
const CHARACTER_LEVELS = [
  { name: "Tập Sự", icon: "/tapsu.png", minProgress: 0 },
  { name: "Cơ Bản", icon: "/coban.png", minProgress: 17 },
  { name: "Tiến Bộ", icon: "/tienbo.png", minProgress: 34 },
  { name: "Hiểu Biết", icon: "/hieubiet.png", minProgress: 51 },
  { name: "Thành Thạo", icon: "/thanhthao.png", minProgress: 68 },
  { name: "Chuyên Gia", icon: "/chuyengia.png", minProgress: 85 },
] as const;

// Level configuration
const LEVELS = [
  { id: "a1", name: "Starter - A1", namespace: "primary_data", color: "oklch(0.78_0.2_165)" },
  { id: "a2", name: "Elementary - A2", namespace: "secondary_data", color: "oklch(0.78_0.17_200)" },
  { id: "b1", name: "Intermediate - B1", namespace: "highschool_data", color: "oklch(0.72_0.28_320)" },
] as const;

export default function RoadmapPage() {
  const [selectedLevel, setSelectedLevel] = useState<typeof LEVELS[number]["id"]>(LEVELS[0].id);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Filter units by selected level
  const currentLevel = LEVELS.find((l) => l.id === selectedLevel);
  const filteredUnits = smartStart1Units.filter(
    (unit) => unit.namespace === currentLevel?.namespace
  );

  // Get all unit IDs for unlock logic
  const allUnitIds = filteredUnits.map((u) => u.id);

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
            Hoàn thành từng bài học để mở khóa bài tiếp theo
          </p>
        </div>

        {/* Character Level Display */}
        {userProgress && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <CharacterLevelDisplay
              progress={Math.round(((userProgress?.completedUnits?.length || 0) / (allUnitIds?.length || 1)) * 100)}
            />
          </motion.div>
        )}

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
                {Math.round(((userProgress?.completedUnits?.length || 0) / (allUnitIds?.length || 1)) * 100)}%
              </div>
              <div className="text-xs text-white/50">Tiến độ</div>
            </div>
          </motion.div>
        )}

        {/* Level Selector */}
        <div className="flex justify-center gap-3 flex-wrap">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className="rounded-full px-6 py-3 font-bold text-sm transition-all duration-300"
              style={
                selectedLevel === level.id
                  ? {
                      background: `linear-gradient(135deg, ${level.color}, oklch(0.5 0.2 280))`,
                      color: "white",
                      boxShadow: `0 0 20px ${level.color}80`,
                      transform: "scale(1.05)",
                    }
                  : {
                      background: "oklch(0.2 0.05 280 / 0.6)",
                      border: "1px solid oklch(0.45 0.12 280 / 0.3)",
                      color: "oklch(0.75 0.1 280)",
                    }
              }
            >
              {level.name}
            </button>
          ))}
        </div>

        {/* Unit Cards */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-white/50">Đang tải...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUnits.map((unit, index) => {
              const isUnlocked =
                index === 0 || userProgress?.completedUnits.includes(allUnitIds[index - 1]) || false;
              const isCompleted = userProgress?.completedUnits.includes(unit.id) || false;
              const progress = getUnitProgress(unit.id);

              return (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  index={index}
                  isUnlocked={isUnlocked}
                  isCompleted={isCompleted}
                  progress={progress}
                />
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
    </div>
  );
}

// Unit Card Component
function UnitCard({
  unit,
  index,
  isUnlocked,
  isCompleted,
  progress,
}: {
  unit: LessonUnit;
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
        href={isUnlocked ? `/lessons/${unit.id}` : "#"}
        className={`block rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 ${
          isUnlocked ? "hover:scale-[1.02] cursor-pointer" : "cursor-not-allowed"
        }`}
        style={{
          background: isUnlocked
            ? "linear-gradient(145deg, oklch(0.18 0.06 280 / 0.85), oklch(0.14 0.04 265 / 0.9))"
            : "linear-gradient(145deg, oklch(0.12 0.03 280 / 0.5), oklch(0.10 0.02 265 / 0.6))",
          border: isUnlocked
            ? "1px solid oklch(0.55 0.18 300 / 0.22)"
            : "1px solid oklch(0.35 0.08 280 / 0.15)",
          boxShadow: isUnlocked ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
        }}
        onClick={(e) => {
          if (!isUnlocked) e.preventDefault();
        }}
      >
        <div className="flex items-start gap-4">
          {/* Unit Number Circle */}
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full font-black text-lg"
            style={{
              background: isUnlocked
                ? "linear-gradient(135deg, oklch(0.65 0.25 285), oklch(0.52 0.22 200))"
                : "oklch(0.2 0.05 280 / 0.5)",
              color: isUnlocked ? "white" : "oklch(0.4 0.1 280)",
            }}
          >
            {isCompleted ? "✓" : index + 1}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3
              className="mb-2 text-xl font-black leading-tight"
              style={{ color: isUnlocked ? "white" : "oklch(0.5 0.1 280)" }}
            >
              {unit.title}
            </h3>
            <p
              className="mb-4 text-sm"
              style={{ color: isUnlocked ? "oklch(0.8 0.1 280)" : "oklch(0.45 0.08 280)" }}
            >
              {unit.topic}
            </p>

            {/* Vocabulary Preview */}
            {isUnlocked && (
              <div className="mb-4 flex flex-wrap gap-2">
                {unit.vocabulary.slice(0, 3).map((v) => (
                  <span
                    key={v.word}
                    className="rounded-lg border border-white/10 bg-white/[0.07] px-3 py-1 text-xs font-semibold text-white/80"
                  >
                    {v.word}
                  </span>
                ))}
                {unit.vocabulary.length > 3 && (
                  <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/35">
                    +{unit.vocabulary.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {isUnlocked && (
              <>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-white/40">Tiến độ</span>
                  <span className="text-xs font-bold text-white/55">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
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
              <ChevronRight className="size-6 text-white/60" />
            ) : (
              <Lock className="size-6 text-white/25" />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Character Level Display Component
function CharacterLevelDisplay({ progress }: { progress: number }) {
  // Determine current character level based on progress
  const currentLevel = CHARACTER_LEVELS.reduce((prev, curr) => {
    return progress >= curr.minProgress ? curr : prev;
  }, CHARACTER_LEVELS[0]);

  return (
    <div className="space-y-4">
      {CHARACTER_LEVELS.map((level, index) => {
        const isActive = progress >= level.minProgress;
        const isCurrent = level.name === currentLevel.name;
        
        return (
          <motion.div
            key={level.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative overflow-hidden rounded-3xl backdrop-blur-xl"
            style={{
              background: isActive
                ? "linear-gradient(145deg, oklch(0.18 0.06 280 / 0.85), oklch(0.14 0.04 265 / 0.9))"
                : "linear-gradient(145deg, oklch(0.12 0.03 280 / 0.5), oklch(0.10 0.02 265 / 0.6))",
              border: isActive
                ? "1px solid oklch(0.55 0.18 300 / 0.25)"
                : "1px solid oklch(0.35 0.08 280 / 0.15)",
              boxShadow: isActive ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
              minHeight: "140px",
            }}
          >
            {/* Flexbox container for text and image */}
            <div className="flex items-center justify-between h-full">
              {/* Left side: Text content */}
              <div className="flex-1 p-6 z-10">
                <h2
                  className="text-3xl font-black mb-2"
                  style={{
                    fontFamily: "'Quicksand', sans-serif",
                    fontWeight: 700,
                    ...(isActive
                      ? {
                          background: "linear-gradient(135deg, oklch(0.9 0.2 85), oklch(0.85 0.18 70), oklch(0.8 0.15 60))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }
                      : {
                          color: "oklch(0.5 0.1 280)",
                        }),
                  }}
                >
                  {level.name}
                </h2>
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: isActive ? "oklch(0.8 0.1 280)" : "oklch(0.45 0.08 280)",
                  }}
                >
                  {isCurrent ? "Đang học" : isActive ? "Đã hoàn thành" : "Chọn cấp độ"}
                </p>
              </div>

              {/* Right side: Character image (Nobita icon positioned on the right) */}
              <div className="relative w-[45%] h-full flex items-end justify-end overflow-visible">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, x: 20 }}
                  animate={{ 
                    scale: isCurrent ? 1.15 : 1, 
                    opacity: isActive ? 1 : 0.3,
                    x: 0
                  }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="relative w-full h-full"
                  style={{
                    filter: isActive ? "drop-shadow(0 8px 16px rgba(0,0,0,0.4))" : "grayscale(100%)",
                  }}
                >
                  <Image
                    src={level.icon}
                    alt={level.name}
                    width={220}
                    height={220}
                    className="absolute bottom-0 right-0"
                    style={{
                      objectFit: "contain",
                      objectPosition: "bottom right",
                      maxHeight: "180px",
                      width: "auto",
                      transform: "translateX(10px)",
                      transition: "all 0.3s ease",
                    }}
                    priority={index < 3}
                  />
                </motion.div>
              </div>
            </div>

            {/* Progress indicator for current level */}
            {isCurrent && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full"
                  style={{
                    background: "linear-gradient(90deg, oklch(0.68 0.2 165), oklch(0.65 0.22 285), oklch(0.72 0.28 320))",
                  }}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// Helper function to get unit progress from localStorage
function getUnitProgress(unitId: string): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(`doremi_lesson_progress_${unitId}`);
  return stored ? Math.min(100, Math.max(0, parseInt(stored, 10))) : 0;
}
