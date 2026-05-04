"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const badges = ["🔥 0 ngày streak", "✨ 0 XP", "🌱 Cấp 1"];
const mascotFrames = ["/doremi1.png", "/doremi2.png", "/doremi3.png"];

type Session = {
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  grade?: string;
  age?: string;
};

function readSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = localStorage.getItem("doremi_session");

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as Session;
  } catch {
    localStorage.removeItem("doremi_session");
    return null;
  }
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "GOOD MORNING";
  } else if (hour >= 12 && hour < 18) {
    return "HELLO";
  } else if (hour >= 18 && hour < 22) {
    return "GOOD EVENING";
  } else {
    return "HELLO";
  }
}

export function WelcomeBanner() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const isAnimatingRef = useRef(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearFrameTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  }, []);

  const runMascotCycle = useCallback(() => {
    if (isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;
    clearFrameTimeouts();
    setFrameIndex(0);

    timeoutsRef.current = [
      setTimeout(() => setFrameIndex(1), 500),
      setTimeout(() => setFrameIndex(2), 1000),
      setTimeout(() => {
        setFrameIndex(0);
        isAnimatingRef.current = false;
      }, 1500),
    ];
  }, [clearFrameTimeouts]);

  useEffect(() => {
    // Load session data
    const syncSession = () => {
      setSession(readSession());
    };

    syncSession();
    window.addEventListener("storage", syncSession);
    window.addEventListener("doremi-auth-change", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("doremi-auth-change", syncSession);
    };
  }, []);

  useEffect(() => {
    runMascotCycle();

    const interval = window.setInterval(runMascotCycle, 60000);
    window.addEventListener("focus", runMascotCycle);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", runMascotCycle);
      clearFrameTimeouts();
    };
  }, [clearFrameTimeouts, runMascotCycle]);

  const greeting = getTimeBasedGreeting();
  const userName = session?.name?.trim() || "BẠN NHỎ";
  const displayName = userName.toUpperCase();

  // Debug logging
  console.log('WelcomeBanner Debug:', {
    rawSession: typeof window !== 'undefined' ? localStorage.getItem('doremi_session') : null,
    session,
    userName,
    displayName,
    greeting,
    currentHour: new Date().getHours()
  });

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r from-[#00B4D8] via-[#0077B6] to-[#03045E] p-6 sm:p-10 animate-gradient-x">
      {/* Text content - highest z-index */}
      <div className="relative z-30 max-w-2xl pr-0 sm:pr-32 lg:pr-56">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white break-words drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] leading-tight">
          {greeting},<br className="sm:hidden" /> {displayName}
        </h1>

        <p className="mt-2 text-sm sm:text-base italic tracking-wide text-yellow-100/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)] font-quicksand">
          Có Công Mài Sắc - Có Ngày Nên Kim
        </p>

        <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/10 bg-white/20 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-white backdrop-blur-md"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Classroom scene - layered images */}
      <div className="absolute bottom-0 right-0 hidden sm:block pointer-events-none w-full">
        {/* Students in background - z-index 10, shifted LEFT to show all characters */}
        <div className="absolute bottom-0 right-[45%] sm:right-[40%] lg:right-[35%] w-[240px] h-[170px] lg:w-[280px] lg:h-[200px] z-10">
          <Image
            src="/damban.png"
            alt="Students in classroom - Nobita, Suneo, Jaian"
            fill
            sizes="(max-width: 1024px) 240px, 280px"
            priority
            className="object-contain object-bottom opacity-85"
            style={{
              transform: 'scale(0.9)'
            }}
          />
        </div>

        {/* DOREMI mascot in front - z-index 20 with drop shadow, stays on RIGHT */}
        <div className="absolute bottom-0 right-4 lg:right-8 w-[220px] h-[220px] lg:w-[260px] lg:h-[260px] z-20">
          <Image
            src={mascotFrames[frameIndex]}
            alt="Doremi mascot teaching"
            fill
            sizes="(max-width: 1024px) 220px, 260px"
            priority
            className="object-contain object-bottom"
            style={{
              filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))'
            }}
          />
        </div>
      </div>

      {/* Preload images */}
      <div aria-hidden="true" className="hidden">
        <Image
          src="/damban.png"
          alt=""
          width={320}
          height={220}
          priority
        />
        {mascotFrames.map((frame) => (
          <Image
            key={frame}
            src={frame}
            alt=""
            width={260}
            height={260}
            priority
          />
        ))}
      </div>
    </div>
  );
}
