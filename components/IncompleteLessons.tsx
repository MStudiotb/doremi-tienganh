"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";

type IncompleteLesson = {
  _id: string;
  title: string;
  grade: string;
  unit: string;
  description: string;
  progress: number;
};

export function IncompleteLessons({ userId }: { userId: string }) {
  const [lessons, setLessons] = useState<IncompleteLesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchIncompleteLessons() {
      try {
        setIsLoading(true);

        // Fetch all lessons from API
        const response = await fetch(`/api/user/incomplete-lessons?userId=${userId}`);
        const data = await response.json();

        if (data.success && data.lessons) {
          // Filter lessons with progress < 100% from localStorage
          const incompleteLessons: IncompleteLesson[] = [];

          for (const lesson of data.lessons) {
            const progressKey = `doremi_lesson_progress_${lesson._id}`;
            const storedProgress = localStorage.getItem(progressKey);
            const progress = storedProgress ? parseInt(storedProgress, 10) : 0;

            // Only include lessons that have been started (progress > 0) but not completed (progress < 100)
            if (progress > 0 && progress < 100) {
              incompleteLessons.push({
                ...lesson,
                progress,
              });
            }
          }

          // Sort by progress descending (most recent/highest progress first)
          incompleteLessons.sort((a, b) => b.progress - a.progress);

          setLessons(incompleteLessons);
        }
      } catch (error) {
        console.error("Error fetching incomplete lessons:", error);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchIncompleteLessons();
  }, [userId]);

  if (isLoading) {
    return (
      <section className="glass rounded-[1.75rem] p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[oklch(0.75_0.18_200)]" />
        </div>
      </section>
    );
  }

  if (lessons.length === 0) {
    return (
      <section className="glass rounded-[1.75rem] p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">Bài Học Dang Dở</h2>
            <p className="mt-1 text-sm font-medium text-white/45">
              Các bài học bạn đang làm nhưng chưa hoàn thành
            </p>
          </div>
          <BookOpen className="h-8 w-8 text-[oklch(0.72_0.28_320)]" />
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-8 text-center">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-white/30" />
          <p className="text-base font-semibold text-white/60">
            Bạn chưa có bài học nào đang làm dở
          </p>
          <p className="mt-2 text-sm text-white/40">
            Hãy bắt đầu học một bài mới từ mục "Bài học"
          </p>
          <Link
            href="/lessons"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[oklch(0.72_0.25_285)] to-[oklch(0.72_0.28_325)] px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105"
          >
            Khám phá bài học
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="glass rounded-[1.75rem] p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Bài Học Dang Dở</h2>
          <p className="mt-1 text-sm font-medium text-white/45">
            {lessons.length} bài học đang chờ bạn hoàn thành
          </p>
        </div>
        <BookOpen className="h-8 w-8 animate-pulse text-[oklch(0.72_0.28_320)]" />
      </div>

      <div className="space-y-4">
        {lessons.map((lesson, index) => (
          <motion.div
            key={lesson._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link
              href={`/lessons?grade=${encodeURIComponent(lesson.grade)}&unit=${encodeURIComponent(lesson.unit)}&lessonId=${lesson._id}`}
              className="block w-full rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl transition-all hover:border-[oklch(0.72_0.28_325/0.6)] hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[oklch(0.72_0.28_320/0.2)] px-2 py-1 text-xs font-bold text-[oklch(0.85_0.18_85)]">
                      {lesson.grade} - {lesson.unit}
                    </span>
                  </div>
                  <p className="mt-2 text-base font-black text-white">
                    {lesson.title}
                  </p>
                  {lesson.description && (
                    <p className="mt-1 text-sm font-medium text-white/45 line-clamp-1">
                      {lesson.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-2xl font-black text-[oklch(0.75_0.18_200)]">
                    {lesson.progress}%
                  </span>
                  <span className="text-xs font-medium text-white/40">
                    Tiếp tục học
                  </span>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${lesson.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[oklch(0.78_0.17_200)] via-[oklch(0.72_0.25_285)] to-[oklch(0.72_0.28_325)]"
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[oklch(0.75_0.18_200)] transition-colors hover:text-[oklch(0.85_0.18_85)]"
        >
          <BookOpen className="h-4 w-4" />
          Xem tất cả bài học
        </Link>
      </div>
    </section>
  );
}
