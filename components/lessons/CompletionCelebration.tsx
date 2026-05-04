"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface CompletionCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  unitTitle: string;
  nextUnitTitle?: string;
  onContinue?: () => void;
}

export function CompletionCelebration({
  isOpen,
  onClose,
  unitTitle,
  nextUnitTitle,
  onContinue,
}: CompletionCelebrationProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      // Show content after a brief delay
      setTimeout(() => setShowContent(true), 300);

      return () => {
        clearInterval(interval);
        setShowContent(false);
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            fontFamily: "'Quicksand', sans-serif",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative max-w-md w-full rounded-3xl p-8 text-center"
            style={{
              background:
                "linear-gradient(145deg, oklch(0.18 0.06 280 / 0.95), oklch(0.14 0.04 265 / 0.98))",
              border: "2px solid oklch(0.65 0.25 300 / 0.4)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px oklch(0.65 0.25 300 / 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Trophy Icon with Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(135deg, oklch(0.85 0.2 60), oklch(0.75 0.25 40))",
                boxShadow: "0 0 40px oklch(0.85 0.2 60 / 0.6)",
              }}
            >
              <Trophy className="size-12 text-white" />
            </motion.div>

            {/* Title */}
            {showContent && (
              <>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-3 text-3xl font-black"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.85 0.2 330), oklch(0.75 0.25 280), oklch(0.65 0.28 200))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Chúc mừng! 🎉
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-2 text-lg font-bold text-white"
                >
                  Bạn đã hoàn thành
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6 text-xl font-black text-white/90"
                >
                  {unitTitle}
                </motion.p>

                {/* Stars */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mb-6 flex justify-center gap-3"
                >
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                    >
                      <Star
                        className="size-10 fill-[oklch(0.85_0.2_60)] text-[oklch(0.85_0.2_60)]"
                        style={{
                          filter: "drop-shadow(0 0 8px oklch(0.85 0.2 60 / 0.6))",
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Next Unit Info */}
                {nextUnitTitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mb-6 rounded-2xl p-4"
                    style={{
                      background: "oklch(0.12 0.04 280 / 0.6)",
                      border: "1px solid oklch(0.5 0.15 285 / 0.3)",
                    }}
                  >
                    <div className="mb-2 flex items-center justify-center gap-2 text-sm text-white/60">
                      <Sparkles className="size-4" />
                      <span>Bài học tiếp theo đã mở khóa</span>
                    </div>
                    <p className="font-bold text-white">{nextUnitTitle}</p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="flex flex-col gap-3"
                >
                  {onContinue && nextUnitTitle && (
                    <button
                      onClick={onContinue}
                      className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all hover:scale-105"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.65 0.25 285), oklch(0.52 0.22 200))",
                        boxShadow: "0 0 20px oklch(0.65 0.25 285 / 0.4)",
                      }}
                    >
                      Tiếp tục học <ChevronRight className="size-5" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="rounded-xl px-6 py-3 font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  >
                    Quay lại lộ trình
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
