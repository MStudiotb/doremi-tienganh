"use client"

import { useState } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { Music, PawPrint, Sparkles } from "lucide-react"

export function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4 animated-gradient">
      <div className="floating-orb absolute left-10 top-20 h-72 w-72 rounded-full bg-[oklch(0.5_0.2_280/0.3)] blur-[100px]" />
      <div className="floating-orb-delayed absolute bottom-20 right-10 h-96 w-96 rounded-full bg-[oklch(0.5_0.25_300/0.25)] blur-[120px]" />
      <div className="floating-orb-delayed absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-[oklch(0.5_0.2_260/0.2)] blur-[80px]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="glass group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl border-2 border-[oklch(0.75_0.18_85)] shadow-[0_0_30px_oklch(0.75_0.18_85/0.5),0_0_60px_oklch(0.75_0.18_85/0.3)] transition-transform hover:scale-105">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[oklch(0.8_0.18_85/0.3)] to-[oklch(0.65_0.15_60/0.1)]" />
            <Music className="relative z-10 h-12 w-12 text-[oklch(0.85_0.18_85)] drop-shadow-[0_0_15px_oklch(0.85_0.18_85/0.8)]" />
            <Sparkles className="absolute -right-2 -top-2 h-5 w-5 animate-pulse text-[oklch(0.9_0.18_85)] drop-shadow-[0_0_10px_oklch(0.9_0.18_85)]" />
          </div>

          <div className="text-center drop-shadow-[0_0_30px_oklch(0.7_0.15_270/0.4)]">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              <span className="bg-gradient-to-r from-[oklch(0.9_0.2_85)] via-[oklch(0.85_0.18_70)] to-[oklch(0.8_0.15_60)] bg-clip-text text-transparent drop-shadow-[0_0_20px_oklch(0.85_0.18_85/0.6)]">
                DOREMI
              </span>
              <span className="text-white/80"> - </span>
              <span className="bg-gradient-to-r from-[oklch(0.75_0.25_250)] via-[oklch(0.7_0.28_290)] to-[oklch(0.75_0.28_330)] bg-clip-text text-transparent drop-shadow-[0_0_20px_oklch(0.7_0.25_290/0.8)]">
                ĐI HỌC ĐI
              </span>
            </h1>

            <div className="mt-3 flex items-center justify-center gap-2">
              <PawPrint className="h-5 w-5 text-[oklch(0.8_0.2_300)]" />
              <p className="text-sm font-medium tracking-wide text-muted-foreground md:text-base">
                Học Tiếng Anh Mỗi Ngày
              </p>
              <PawPrint className="h-5 w-5 text-[oklch(0.8_0.2_260)]" />
            </div>
          </div>
        </div>

        <AuthCard isLogin={isLogin} setIsLogin={setIsLogin} />

        <footer className="mt-4 text-center">
          <p className="text-xs text-white/60 md:text-sm">
            Phát Triển App & Web bởi{" "}
            <span className="bg-gradient-to-r from-[oklch(0.9_0.2_85)] via-[oklch(0.85_0.18_70)] to-[oklch(0.8_0.15_60)] bg-clip-text font-bold text-transparent drop-shadow-[0_0_12px_oklch(0.85_0.18_85/0.6)]">
              TJN MSTUDIOTB
            </span>
          </p>
        </footer>
      </div>
    </div>
  )
}
