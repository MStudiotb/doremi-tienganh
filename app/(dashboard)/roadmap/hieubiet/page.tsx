"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Lock, ChevronRight, ArrowLeft } from "lucide-react";
import { smartStart1Units, type LessonUnit } from "@/lib/lesson-seed";
import { type UserProgress } from "@/lib/user-progress";

export default function HieuBietRoadmapPage() {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => setUserProgress(data))
      .catch((err) => {
        console.error("Failed to fetch progress:", err);
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

  const filteredUnits = smartStart1Units.filter((unit) => unit.namespace === "secondary_data");
  const allUnitIds = filteredUnits.map((u) => u.id);

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl space-y-8"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="size-5" />
          <span className="font-semibold">Quay lại trang chủ</span>
        </Link>

        <div className="flex items-center gap-6">
          <Image src="/hieubiet.png" alt="Hiểu Biết" width={120} height={120} className="drop-shadow-2xl" />
          <div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-black mb-2"
              style={{
                background: "linear-gradient(135deg, oklch(0.9 0.2 85), oklch(0.85 0.18 70), oklch(0.8 0.15 60))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Hiểu Biết
            </motion.h1>
            <p className="text-white/60 text-base">Cấp độ A2 - Mở rộng vốn từ vựng</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="text-white/50">Đang tải...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUnits.map((unit, index) => {
              const isUnlocked = index === 0 || userProgress?.completedUnits.includes(allUnitIds[index - 1]) || false;
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
      </motion.div>
    </div>
  );
}

function UnitCard({ unit, index, isUnlocked, isCompleted, progress }: {
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
    >
      <Link
        href={isUnlocked ? `/lessons/${unit.id}` : "#"}
        className={`block rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 ${
          isUnlocked ? "hover:scale-[1.02] cursor-pointer" : "cursor-not-allowed pointer-events-none"
        }`}
        style={{
          background: isUnlocked
            ? "linear-gradient(145deg, oklch(0.18 0.06 280 / 0.85), oklch(0.14 0.04 265 / 0.9))"
            : "linear-gradient(145deg, oklch(0.12 0.03 280 / 0.5), oklch(0.10 0.02 265 / 0.6))",
          border: isUnlocked ? "1px solid oklch(0.55 0.18 300 / 0.22)" : "1px solid oklch(0.35 0.08 280 / 0.15)",
          boxShadow: isUnlocked ? "0 8px 32px rgba(0,0,0,0.3)" : "none",
        }}
        onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
      >
        <div className="flex items-start gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-full font-black text-lg relative"
            style={{
              background: isUnlocked ? "linear-gradient(135deg, oklch(0.65 0.25 285), oklch(0.52 0.22 200))" : "oklch(0.2 0.05 280 / 0.5)",
              color: isUnlocked ? "white" : "oklch(0.4 0.1 280)",
            }}
          >
            {!isUnlocked && <Lock className="size-6 absolute" />}
            {isUnlocked && (isCompleted ? "✓" : index + 1)}
          </div>

          <div className="flex-1">
            <h3 className="mb-2 text-xl font-black leading-tight" style={{ color: isUnlocked ? "white" : "oklch(0.5 0.1 280)" }}>
              {unit.title}
            </h3>
            <p className="mb-4 text-sm" style={{ color: isUnlocked ? "oklch(0.8 0.1 280)" : "oklch(0.45 0.08 280)" }}>
              {unit.topic}
            </p>

            {isUnlocked && (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {unit.vocabulary.slice(0, 3).map((v) => (
                    <span key={v.word} className="rounded-lg border border-white/10 bg-white/[0.07] px-3 py-1 text-xs font-semibold text-white/80">
                      {v.word}
                    </span>
                  ))}
                  {unit.vocabulary.length > 3 && (
                    <span className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/35">
                      +{unit.vocabulary.length - 3}
                    </span>
                  )}
                </div>

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
                      background: "linear-gradient(90deg, oklch(0.68 0.2 165), oklch(0.65 0.22 285), oklch(0.72 0.28 320))",
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="shrink-0">
            {isUnlocked ? <ChevronRight className="size-6 text-white/60" /> : <Lock className="size-6 text-white/25" />}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function getUnitProgress(unitId: string): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(`doremi_lesson_progress_${unitId}`);
  return stored ? Math.min(100, Math.max(0, parseInt(stored, 10))) : 0;
}
