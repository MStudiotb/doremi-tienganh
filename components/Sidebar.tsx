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
  Monitor,
  Moon,
  PenLine,
  PlayCircle,
  ShieldAlert,
  Sparkles,
  Sun,
  Upload,
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-[#03010a] px-4 py-5 text-foreground shadow-2xl shadow-black/40">
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
  );
}

