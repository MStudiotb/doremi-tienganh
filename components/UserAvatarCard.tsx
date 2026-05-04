"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Flame, Sparkles, Camera } from "lucide-react";

export function UserAvatarCard() {
  const [displayName, setDisplayName] = useState("Admin MstudioTB");
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState("/logo.png");
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const rawSession = localStorage.getItem("doremi_session");
        const data = rawSession
          ? (JSON.parse(rawSession) as { name?: string; avatar?: string })
          : null;

        setDisplayName(data?.name?.trim() || "Admin MstudioTB");
        // Load custom avatar if exists, otherwise use logo
        setAvatarUrl(data?.avatar || "/logo.png");

        // Load user progress data
        const progressResponse = await fetch("/api/progress");
        if (progressResponse.ok) {
          const progressData = (await progressResponse.json()) as {
            streak?: number;
            totalXP?: number;
          };
          setStreak(progressData.streak || 0);
          setXp(progressData.totalXP || 0);
        }
      } catch {
        setDisplayName("Admin MstudioTB");
        setStreak(0);
        setXp(0);
        setAvatarUrl("/logo.png");
      }
    }

    void loadUserData();
    window.addEventListener("storage", loadUserData);
    window.addEventListener("doremi-auth-change", loadUserData);

    return () => {
      window.removeEventListener("storage", loadUserData);
      window.removeEventListener("doremi-auth-change", loadUserData);
    };
  }, []);

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Dung lượng ảnh không được vượt quá 10MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      setAvatarUrl(previewUrl);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      
      // Get user email from session
      const rawSession = localStorage.getItem("doremi_session");
      const sessionData = rawSession ? JSON.parse(rawSession) : null;
      const userEmail = sessionData?.email || "user";
      formData.append("userId", userEmail);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Update session with new avatar URL
        const updatedSession = {
          ...sessionData,
          avatar: data.avatarUrl,
        };
        localStorage.setItem("doremi_session", JSON.stringify(updatedSession));
        setAvatarUrl(data.avatarUrl);
        
        // Trigger auth change event to update other components
        window.dispatchEvent(new Event("doremi-auth-change"));
        
        alert("Cập nhật ảnh đại diện thành công!");
      } else {
        alert(data.error || "Không thể tải ảnh lên. Vui lòng thử lại.");
        // Revert to previous avatar on error
        setAvatarUrl(sessionData?.avatar || "/logo.png");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.");
      // Revert to previous avatar on error
      const rawSession = localStorage.getItem("doremi_session");
      const sessionData = rawSession ? JSON.parse(rawSession) : null;
      setAvatarUrl(sessionData?.avatar || "/logo.png");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1c2e]/80 via-[#0d2b33]/80 to-[#3a1c24]/80 p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] backdrop-blur-xl">
      {/* Glassmorphism glow effects */}
      <div className="pointer-events-none absolute -left-6 -top-6 size-20 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -right-6 size-24 rounded-full bg-purple-500/15 blur-2xl" />

      <div className="relative z-10 flex items-center gap-3">
        {/* Avatar with neon border - Clickable */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 via-purple-500/20 to-pink-500/30 blur-md" />
          <div 
            className="relative size-16 overflow-hidden rounded-full border-2 border-cyan-400/40 bg-gradient-to-br from-[#1a1c2e] to-[#0d2b33] p-1 shadow-[0_0_20px_rgba(34,211,238,0.3)] cursor-pointer transition-all duration-300 hover:border-cyan-300/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
            onClick={handleAvatarClick}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            title="Nhấn để thay đổi ảnh đại diện"
          >
            <Image
              src={avatarUrl}
              alt="User Avatar"
              width={64}
              height={64}
              className="size-full rounded-full object-cover"
              priority
            />
            
            {/* Camera overlay on hover */}
            {isHovering && !isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-all duration-300">
                <Camera className="size-6 text-white" />
              </div>
            )}
            
            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70 backdrop-blur-sm">
                <div className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-normal text-white/60" style={{ fontFamily: 'Quicksand, sans-serif' }}>
            Xin chào,
          </p>
          <h3 
            className="text-sm font-bold text-white truncate" 
            style={{ fontFamily: 'Quicksand, sans-serif' }}
            title={displayName}
          >
            {displayName}
          </h3>

          {/* Stats row */}
          <div className="mt-2 flex items-center gap-2">
            {/* Streak */}
            <div className="flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5">
              <Flame 
                className="size-3 text-orange-400" 
                fill="currentColor"
                aria-hidden="true"
              />
              <span className="text-[0.65rem] font-medium text-orange-300" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {streak}
              </span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-0.5">
              <Sparkles 
                className="size-3 text-cyan-400" 
                fill="currentColor"
                aria-hidden="true"
              />
              <span className="text-[0.65rem] font-medium text-cyan-300" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                {xp} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
