"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  DatabaseBackup,
  FileQuestion,
  GraduationCap,
  Home,
  LogOut,
  Map,
  Menu,
  Monitor,
  Moon,
  PenLine,
  PlayCircle,
  ShieldAlert,
  Sparkles,
  Sun,
  Upload,
  X,
} from "lucide-react";
import { VocabularyImportModal } from "./VocabularyImportModal";
import { UserAvatarCard } from "./UserAvatarCard";

const mainMenuItems = [
  {
    label: "Trang Chủ",
    href: "/",
    icon: Home,
  },
  {
    label: "Lộ Trình",
    href: "/roadmap",
    icon: Map,
  },
  {
    label: "Bài học",
    href: "/lessons",
    icon: BookOpen,
  },
  {
    label: "Bài tập",
    href: "/practice",
    icon: ClipboardCheck,
  },
  {
    label: "Bài Thi Tuần",
    href: "/weekly-tests",
    icon: Sparkles,
    special: true, // Mark as special for custom styling
  },
  {
    label: "Tra Cứu Từ Vựng",
    href: "/tra-cuu-tu-vung",
    icon: FileQuestion,
  },
];

const skillMenuItems = [
  {
    label: "Ôn Luyện Qua VIDEO",
    href: "/video-learning",
    icon: PlayCircle,
  },
  {
    label: "Viết câu",
    href: "/luyen-ky-nang/viet",
    icon: PenLine,
  },
  {
    label: "Ôn tập",
    href: "/luyen-ky-nang/on-tap",
    icon: GraduationCap,
  },
];

const themeItems = [
  {
    label: "Sáng",
    icon: Sun,
  },
  {
    label: "Tối",
    icon: Moon,
  },
  {
    label: "Hệ thống",
    icon: Monitor,
  },
];

const adminMenuItem = {
  label: "Quản lý Dữ liệu",
  href: "/admin",
  icon: ShieldAlert,
};

function isActivePath(pathname: string, href: string) {
  // Exact match for home page
  if (href === "/") {
    return pathname === "/";
  }
  // For roadmap, check exact match to avoid conflicts with root
  if (href === "/roadmap") {
    return pathname === "/roadmap";
  }
  // For other paths, use startsWith
  return pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const AdminIcon = adminMenuItem.icon;
  const [displayName, setDisplayName] = useState("Bạn nhỏ");
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const rawSession = localStorage.getItem("doremi_session");
        const data = rawSession
          ? (JSON.parse(rawSession) as { name?: string; role?: string })
          : null;

        setDisplayName(data?.name?.trim() || "Bạn nhỏ");
        setUserIsAdmin(data?.role === "ADMIN");
      } catch {
        setDisplayName("Bạn nhỏ");
        setUserIsAdmin(false);
      }
    }

    void loadCurrentUser();
    window.addEventListener("storage", loadCurrentUser);
    window.addEventListener("doremi-auth-change", loadCurrentUser);

    return () => {
      window.removeEventListener("storage", loadCurrentUser);
      window.removeEventListener("doremi-auth-change", loadCurrentUser);
    };
  }, []);


  async function handleLogout() {
    localStorage.removeItem("doremi_session");
    localStorage.removeItem("doremi_user_role");
    localStorage.removeItem("doremi_display_name");
    window.dispatchEvent(new Event("doremi-auth-change"));
    setDisplayName("Bạn nhỏ");
    setUserIsAdmin(false);
    router.push("/auth");
  }
  async function handleBackupUsers() {
    setIsBackingUp(true);
    setBackupMessage("");

    try {
      const response = await fetch("/api/admin/backup-users", {
        method: "POST",
      });
      const data = (await response.json()) as { message?: string };

      setBackupMessage(
        response.ok
          ? data.message || "Sao lưu thành công."
          : data.message || "Sao lưu thất bại.",
      );
    } catch {
      setBackupMessage("Không thể kết nối API backup.");
    } finally {
      setIsBackingUp(false);
    }
  }

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed left-4 top-4 z-50 grid size-12 place-items-center rounded-xl border border-white/10 bg-[#03010a]/95 text-white backdrop-blur-md lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop: always visible, Mobile: slide in */}
      <aside
        className={[
          "fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[#03010a] px-4 py-5 text-foreground shadow-2xl shadow-black/40 transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
      <Link href="/" className="mb-5 flex items-center gap-4 px-1">
        <div className="grid place-items-center rounded-2xl border-2 border-cyan-400/30 bg-white/5 p-2.5 shadow-[0_0_20px_rgba(34,211,238,0.25)] transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
          <Image
            src="/dau chan.png"
            alt="Doremi Logo"
            width={64}
            height={64}
            className="rounded-xl object-contain"
            priority
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold uppercase tracking-[0.18em] bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
            DOREMI - TIẾNG ANH
          </p>
          <p className="text-xs font-light text-[#E0E0E0] leading-relaxed">
            Cùng Tiến Bộ Mỗi Ngày
          </p>
        </div>
      </Link>

      <UserAvatarCard />

      <nav
        aria-label="Main navigation"
        className="sidebar-scrollbar -mr-2 flex flex-1 flex-col gap-2 overflow-y-auto pr-2"
      >
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);
          const isSpecial = item.special;

          // Special styling for "Bài Thi Tuần" with Doraemon style + Fireworks
          if (isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "group relative flex items-center gap-3 rounded-xl px-3 py-4 text-sm transition-all duration-200 overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 shadow-lg shadow-yellow-500/30 border-2 border-yellow-400/50"
                    : "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-2 border-yellow-400/20 hover:border-yellow-400/40 hover:shadow-md hover:shadow-yellow-500/20",
                ].join(" ")}
                style={{
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {/* Fireworks animation background */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="firework-particle"
                      style={{
                        left: `${15 + i * 15}%`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    />
                  ))}
                </div>

                {/* Bell icon and text container */}
                <div className="relative flex items-center gap-2 flex-1 z-10">
                  <span
                    className={[
                      "relative transition-all duration-200",
                      isActive
                        ? ""
                        : "group-hover:scale-105",
                    ].join(" ")}
                    style={{
                      fontWeight: 900,
                      fontSize: "1.1rem",
                      color: "#FFD700",
                      textShadow: "0px 3px 6px rgba(0,0,0,0.6)",
                      filter: "drop-shadow(0 0 8px rgba(255,215,0,0.8))",
                    }}
                  >
                    {item.label}
                  </span>
                  {/* Bell icon positioned at top-right of text */}
                  <Image
                    src="/chuong.png"
                    alt=""
                    width={18}
                    height={18}
                    className="absolute -top-1 -right-1 animate-[wiggle-continuous_4s_ease-in-out_infinite] group-hover:animate-[wiggle_0.5s_ease-in-out]"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          }

          // Regular menu items
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-lg shadow-cyan-500/20 border border-cyan-500/30"
                  : "text-white/45 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <Icon
                strokeWidth={1.7}
                className={[
                  "size-5 transition-colors duration-200",
                  isActive
                    ? "text-neon-cyan"
                    : "text-white/35 group-hover:text-neon-cyan",
                ].join(" ")}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {userIsAdmin ? (
          <Link
            href={adminMenuItem.href}
            aria-current={
              isActivePath(pathname, adminMenuItem.href) ? "page" : undefined
            }
            className={[
              "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
              isActivePath(pathname, adminMenuItem.href)
                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-lg shadow-cyan-500/20 border border-cyan-500/30"
                : "text-white/45 hover:bg-white/5 hover:text-white",
            ].join(" ")}
          >
            <AdminIcon
              strokeWidth={1.7}
              className={[
                "size-5 transition-colors duration-200",
                isActivePath(pathname, adminMenuItem.href)
                  ? "text-neon-cyan"
                  : "text-white/35 group-hover:text-neon-cyan",
              ].join(" ")}
              aria-hidden="true"
            />
            <span>{adminMenuItem.label}</span>
          </Link>
        ) : null}

        <p className="px-3 pb-1 pt-5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/30">
          LUYỆN KỸ NĂNG
        </p>

        {skillMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-lg shadow-cyan-500/20 border border-cyan-500/30"
                  : "text-white/45 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <Icon
                strokeWidth={1.7}
                className={[
                  "size-5 transition-colors duration-200",
                  isActive
                    ? "text-neon-cyan"
                    : "text-white/35 group-hover:text-neon-cyan",
                ].join(" ")}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
        {userIsAdmin && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void handleBackupUsers()}
                disabled={isBackingUp}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-light text-white/60 transition-colors hover:text-white"
              >
                <DatabaseBackup className="size-4" strokeWidth={1.7} aria-hidden="true" />
                {isBackingUp ? "..." : "Backup"}
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-light text-white/60 transition-colors hover:text-white"
              >
                <Upload className="size-4" strokeWidth={1.7} aria-hidden="true" />
                Import
              </button>
            </div>

            {backupMessage ? (
              <p className="text-center text-[0.68rem] leading-4 text-white/35">
                {backupMessage}
              </p>
            ) : null}
          </>
        )}

        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            {themeItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === 1;

              return (
                <button
                  key={item.label}
                  type="button"
                  aria-label={item.label}
                  className={[
                    "grid size-8 place-items-center rounded-full transition-colors",
                    isActive
                      ? "bg-white/12 text-white"
                      : "text-white/40 hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="size-4" strokeWidth={1.7} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-opacity transition-colors hover:text-white hover:opacity-80"
            aria-label="Thoát"
          >
            <LogOut className="size-4" strokeWidth={1.7} aria-hidden="true" />
          </button>
        </div>
      </div>

        <VocabularyImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />
      </aside>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#03010a]/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-around px-2 py-3">
          {mainMenuItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(pathname, item.href);
            const isSpecial = item.special;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={[
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors",
                  isActive
                    ? "text-cyan-400"
                    : "text-white/50 hover:text-white",
                ].join(" ")}
              >
                {isSpecial ? (
                  <Image
                    src="/chuong.png"
                    alt=""
                    width={20}
                    height={20}
                    className="animate-[wiggle-continuous_4s_ease-in-out_infinite]"
                  />
                ) : (
                  <Icon className="size-5" strokeWidth={1.7} />
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

