"use client";

import { useEffect, useState } from "react";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { StatsSection } from "@/components/StatsSection";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ChevronRight,
  Headphones,
  Lock,
  MessageSquare,
  PenLine,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { type UserProgress } from "@/lib/user-progress";

// Character icons for proficiency levels - 6 levels only
const CHARACTER_LEVELS = [
  { name: "Tập Sự", icon: "/tapsu.png", minProgress: 0, href: "/roadmap/tapsu", slug: "tapsu" },
  { name: "Cơ Bản", icon: "/coban.png", minProgress: 17, href: "/roadmap/coban", slug: "coban" },
  { name: "Tiến Bộ", icon: "/tienbo.png", minProgress: 34, href: "/roadmap/tienbo", slug: "tienbo" },
  { name: "Hiểu Biết", icon: "/hieubiet.png", minProgress: 51, href: "/roadmap/hieubiet", slug: "hieubiet" },
  { name: "Thành Thạo", icon: "/thanhthao.png", minProgress: 68, href: "/roadmap/thanhthao", slug: "thanhthao" },
  { name: "Chuyên Gia", icon: "/chuyengia.png", minProgress: 85, href: "/roadmap/chuyengia", slug: "chuyengia" },
] as const;

const quickActions = [
  {
    title: "Bài học",
    description: "Học từ vựng và ngữ pháp",
    icon: BookOpen,
    href: "/lessons",
    gradient: "from-[oklch(0.58_0.25_285)] to-[oklch(0.52_0.22_200)]",
  },
  {
    title: "Luyện kỹ năng",
    description: "Luyện viết và phát âm",
    icon: PenLine,
    href: "/luyen-ky-nang/viet",
    gradient: "from-[oklch(0.65_0.28_310)] to-[oklch(0.58_0.25_285)]",
  },
  {
    title: "Video Learning",
    description: "Học qua video tương tác",
    icon: Headphones,
    href: "/video-learning",
    gradient: "from-[oklch(0.72_0.28_320)] to-[oklch(0.65_0.28_310)]",
  },
  {
    title: "Tra cứu từ vựng",
    description: "Tìm kiếm và quản lý từ vựng",
    icon: Sparkles,
    href: "/tra-cuu-tu-vung",
    gradient: "from-[oklch(0.78_0.2_165)] to-[oklch(0.72_0.28_320)]",
  },
  {
    title: "Luyện tập",
    description: "Bài tập thực hành",
    icon: TrendingUp,
    href: "/practice",
    gradient: "from-[oklch(0.68_0.22_280)] to-[oklch(0.65_0.28_310)]",
  },
  {
    title: "Chat AI",
    description: "Trò chuyện với AI",
    icon: MessageSquare,
    href: "/chat",
    gradient: "from-[oklch(0.75_0.22_330)] to-[oklch(0.68_0.22_280)]",
  },
];

export default function DashboardPage() {
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

  // Calculate progress percentage
  const progressPercentage = userProgress 
    ? Math.round(((userProgress.completedUnits?.length || 0) / 100) * 100)
    : 0;

  // Determine current character level
  const currentLevel = CHARACTER_LEVELS.reduce((prev, curr) => {
    return progressPercentage >= curr.minProgress ? curr : prev;
  }, CHARACTER_LEVELS[0]);

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 pt-16 sm:pt-8"
      >
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Stats Section */}
        <StatsSection />

        {/* Learning Roadmap - 3 Column Grid */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <h2
              className="text-3xl md:text-4xl font-black mb-2"
              style={{
                fontFamily: "'Quicksand', sans-serif",
                background: "linear-gradient(135deg, oklch(0.85 0.2 330), oklch(0.75 0.25 280), oklch(0.65 0.28 200))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Lộ trình học tập
            </h2>
            <p className="text-white/60 text-sm">
              Chọn cấp độ phù hợp để bắt đầu hành trình học tiếng Anh
            </p>
          </div>

          {/* 3-Column Grid of Character Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHARACTER_LEVELS.map((level, index) => {
              const isActive = progressPercentage >= level.minProgress;
              const isCurrent = level.name === currentLevel.name;
              const isLocked = !isActive;
              
              return (
                <motion.div
                  key={level.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={isActive ? { y: -6, scale: 1.02 } : {}}
                  whileTap={isActive ? { scale: 0.98 } : {}}
                >
                  <Link
                    href={isActive ? level.href : "#"}
                    className={`block relative overflow-hidden rounded-3xl backdrop-blur-xl transition-all duration-300 ${
                      isActive ? "hover:shadow-2xl cursor-pointer" : "cursor-not-allowed pointer-events-none"
                    }`}
                    style={{
                      background: isActive
                        ? "linear-gradient(145deg, oklch(0.18 0.06 280 / 0.85), oklch(0.14 0.04 265 / 0.9))"
                        : "linear-gradient(145deg, oklch(0.12 0.03 280 / 0.5), oklch(0.10 0.02 265 / 0.6))",
                      border: isCurrent
                        ? "2px solid oklch(0.75 0.25 285)"
                        : isActive
                        ? "1px solid oklch(0.55 0.18 300 / 0.25)"
                        : "1px solid oklch(0.35 0.08 280 / 0.15)",
                      boxShadow: isCurrent 
                        ? "0 0 30px oklch(0.75 0.25 285 / 0.6), 0 8px 32px rgba(0,0,0,0.3)"
                        : isActive 
                        ? "0 8px 32px rgba(0,0,0,0.3)" 
                        : "none",
                      minHeight: "180px",
                      opacity: isLocked ? 0.5 : 1,
                    }}
                    onClick={(e) => {
                      if (!isActive) e.preventDefault();
                    }}
                  >
                    {/* Neon Glow Effect for Current Level */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                        animate={{
                          boxShadow: [
                            "0 0 20px oklch(0.75 0.25 285 / 0.4), inset 0 0 20px oklch(0.75 0.25 285 / 0.2)",
                            "0 0 40px oklch(0.75 0.25 285 / 0.6), inset 0 0 30px oklch(0.75 0.25 285 / 0.3)",
                            "0 0 20px oklch(0.75 0.25 285 / 0.4), inset 0 0 20px oklch(0.75 0.25 285 / 0.2)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}

                    {/* Flexbox container for text and image */}
                    <div className="flex items-center justify-between h-full">
                      {/* Left side: Text content */}
                      <div className="flex-1 p-6 z-10">
                        <h3
                          className="text-2xl md:text-3xl font-black mb-2"
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
                        </h3>
                        <p
                          className="text-sm font-semibold"
                          style={{
                            color: isActive ? "oklch(0.8 0.1 280)" : "oklch(0.45 0.08 280)",
                          }}
                        >
                          {isCurrent ? "Đang học" : isActive ? "Đã mở khóa" : "Chưa mở khóa"}
                        </p>
                      </div>

                      {/* Right side: Character image with Lock overlay */}
                      <div className="relative w-[45%] h-full flex items-end justify-end">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: isActive ? 1 : 0.3 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="relative w-full h-full"
                          style={{
                            filter: isActive ? "none" : "grayscale(100%)",
                          }}
                        >
                          <Image
                            src={level.icon}
                            alt={level.name}
                            width={200}
                            height={200}
                            className="absolute bottom-0 right-0"
                            style={{
                              objectFit: "contain",
                              objectPosition: "bottom right",
                              maxHeight: "160px",
                              width: "auto",
                              transform: isCurrent ? "scale(1.1)" : "scale(1)",
                              transition: "transform 0.3s ease",
                            }}
                            priority={index < 3}
                          />
                          
                          {/* Lock Icon Overlay for Locked Levels */}
                          {isLocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/60 backdrop-blur-sm rounded-full p-4">
                                <Lock className="size-12 text-white/80" />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    {/* Progress indicator for current level */}
                    {isCurrent && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full"
                          style={{
                            background: "linear-gradient(90deg, oklch(0.68 0.2 165), oklch(0.65 0.22 285), oklch(0.72 0.28 320))",
                          }}
                        />
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Quick Actions */}
        <section>
          <div className="mb-6">
            <h2
              className="text-2xl font-black"
              style={{
                fontFamily: "'Quicksand', sans-serif",
                background:
                  "linear-gradient(135deg, oklch(0.85 0.2 330), oklch(0.75 0.25 280))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Các hoạt động học tập
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Chọn một hoạt động để tiếp tục hành trình học tập
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={action.href}
                    className="group block h-full rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-6 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
                  >
                    <div
                      className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-black text-white">
                      {action.title}
                    </h3>
                    <p className="text-sm text-white/45 group-hover:text-white/60 transition-colors">
                      {action.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Recent Activity Placeholder */}
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
          <h2 className="mb-4 text-xl font-black text-white">
            Hoạt động gần đây
          </h2>
          <p className="text-sm text-white/45">
            Lịch sử học tập của bạn sẽ hiển thị ở đây
          </p>
        </section>

        {/* Footer */}
        <footer className="pb-4 text-center">
          <p className="text-xs text-white/60">
            Phát Triển App & Web bởi{" "}
            <span className="bg-gradient-to-r from-[oklch(0.9_0.2_85)] via-[oklch(0.85_0.18_70)] to-[oklch(0.8_0.15_60)] bg-clip-text font-bold text-transparent drop-shadow-[0_0_12px_oklch(0.85_0.18_85/0.6)]">
              TJN MSTUDIOTB
            </span>
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
