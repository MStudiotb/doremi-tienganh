"use client";

import { BookOpen, Database, Users } from "lucide-react";
import { useEffect, useState } from "react";

const stats = [
  {
    label: "Tổng số Tài Liệu & Bài Tập",
    value: "1,250",
    detail: "+12 cập nhật mới",
    icon: Database,
  },
  {
    label: "Số Bài Tập Hoàn Thành của Tháng",
    value: "12,480",
    detail: "38 bài học tuần này",
    icon: BookOpen,
  },
  {
    label: "Tổng Số Thành Viên",
    value: "5,600",
    detail: "214 đang trực tuyến",
    icon: Users,
  },
];

export function StatsSection() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { isAdmin?: boolean };

        if (isMounted) {
          setIsAdmin(Boolean(data.isAdmin));
        }
      } catch {
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="glass-panel border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="grid size-12 place-items-center rounded-2xl bg-white/5 text-neon-cyan">
                <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
              </div>
              <span className="max-w-[9.5rem] text-right text-xs font-medium leading-5 text-white/50 sm:text-sm">
                {stat.label}
              </span>
            </div>

            <p className="text-4xl font-black tracking-tight text-white">
              {stat.value}
            </p>
            <p className="mt-3 text-sm font-medium text-neon-cyan">
              {stat.detail}
            </p>

            {stat.label === "Tổng số Tài Liệu & Bài Tập" ? (
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  disabled={!isAdmin}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-neon-cyan/40 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Nạp dữ liệu
                </button>
                <button
                  type="button"
                  disabled={!isAdmin}
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-neon-cyan/40 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Cập nhật
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
