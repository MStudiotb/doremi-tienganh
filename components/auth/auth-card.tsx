"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react"

interface AuthCardProps {
  isLogin: boolean
  setIsLogin: (value: boolean) => void
}

interface PendingRegistration {
  name: string
  grade: string
  age: string
  gender: "male" | "female"
}

const PENDING_RESOURCE_SYNC_KEY = "doremi_pending_resource_sync"

const gradeOptions = Array.from({ length: 12 }, (_, index) => `Khối ${index + 1}`)

export function AuthCard({ isLogin, setIsLogin }: AuthCardProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("Khối 1")
  const [studentAge, setStudentAge] = useState("")
  const [selectedGender, setSelectedGender] = useState<"male" | "female">("male")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginMessage, setLoginMessage] = useState("")
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  async function completeAuth(name: string, grade: string, age: string, gender: "male" | "female") {
    setIsLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const isAdmin =
        normalizedEmail === "mstudiotb@gmail.com" &&
        password === "1b30lethanhtong"
      
      let avatarUrl = "/tapsu.png" // Default avatar (Nobita)

      // Upload avatar if file is selected (only for registration)
      if (!isLogin && avatarFile) {
        try {
          const formData = new FormData()
          formData.append("avatar", avatarFile)
          formData.append("userId", normalizedEmail || `user-${Date.now()}`)

          const uploadResponse = await fetch("/api/upload/avatar", {
            method: "POST",
            body: formData,
          })

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json() as { avatarUrl: string }
            avatarUrl = uploadData.avatarUrl
          }
        } catch (error) {
          console.error("Avatar upload failed:", error)
          // Continue with default avatar if upload fails
        }
      }

      const session = {
        email: normalizedEmail || "local-user@doremi.local",
        name: isAdmin ? "Admin MstudioTB" : name,
        role: isAdmin ? "ADMIN" : "USER",
        grade,
        age,
        avatar: avatarUrl,
        loginMode: "CLIENT_LOCAL_STORAGE",
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem("doremi_session", JSON.stringify(session))
      localStorage.setItem("doremi_user_role", session.role)
      localStorage.setItem("doremi_display_name", session.name)
      localStorage.setItem("doremi_selected_grade", grade)
      localStorage.setItem("doremi_student_age", age)
      localStorage.setItem("doremi_user_gender", gender)
      localStorage.setItem("doremi_user_avatar", avatarUrl)

      if (!isLogin) {
        localStorage.setItem(
          PENDING_RESOURCE_SYNC_KEY,
          JSON.stringify({ grade, requestedAt: new Date().toISOString() }),
        )
        
        // Save registration data to Google Drive (background, non-blocking)
        const registrationDate = new Date().toISOString()
        fetch("/api/register/save-to-drive", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email: normalizedEmail,
            grade,
            age,
            gender,
            avatarUrl,
            registrationDate,
          }),
        }).catch((error) => {
          // Silent fail - don't block user experience
          console.error("Background save to Drive failed:", error)
        })
      }

      window.dispatchEvent(new Event("doremi-auth-change"))
      setLoginMessage(
        isLogin ? "Đăng nhập thành công (Client Mode)" : "Đăng ký thành công (Local Mode)",
      )
      router.push("/")
      router.refresh()
    } catch {
      setLoginMessage("Không thể lưu phiên đăng nhập cục bộ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        setLoginMessage("Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)")
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setLoginMessage("Kích thước file không được vượt quá 5MB")
        return
      }

      setAvatarFile(file)
      setLoginMessage("")

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginMessage("")

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") || "").trim() || "Bạn nhỏ"
    const grade = String(formData.get("grade") || selectedGrade || "Khối 1")
    const age = String(formData.get("age") || studentAge || "").trim()
    const gender = String(formData.get("gender") || selectedGender) as "male" | "female"

    if (!isLogin) {
      setPendingRegistration({ name, grade, age, gender })
      setShowConfirmPopup(true)
      return
    }

    await completeAuth(name, grade, age, gender)
  }

  const handleConfirmRegister = async () => {
    setShowConfirmPopup(false)
    if (pendingRegistration) {
      await completeAuth(
        pendingRegistration.name,
        pendingRegistration.grade,
        pendingRegistration.age,
        pendingRegistration.gender,
      )
    }
  }

  return (
    <div className="w-full">
      {/* Tab switcher */}
      <div className="mb-6 flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={[
            "flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300",
            isLogin
              ? "neon-glow bg-gradient-to-r from-[oklch(0.5_0.2_280)] to-[oklch(0.45_0.22_300)] text-white"
              : "text-white/45 hover:text-white/80",
          ].join(" ")}
        >
          Đăng Nhập
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={[
            "flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-300",
            !isLogin
              ? "neon-glow bg-gradient-to-r from-[oklch(0.5_0.2_280)] to-[oklch(0.45_0.22_300)] text-white"
              : "text-white/45 hover:text-white/80",
          ].join(" ")}
        >
          Đăng Ký
        </button>
      </div>

      <div className="glass neon-border rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin ? (
            <>
              <label className="flex flex-col gap-2 text-sm font-medium text-white/80">
                Họ và Tên
                <span className="relative block">
                  <User className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/45" />
                  <input
                    name="name"
                    type="text"
                    placeholder="Nhập họ và tên của bạn"
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/35 focus:border-[oklch(0.7_0.25_300)]"
                  />
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-white/80">
                Tuổi
                <span className="relative block">
                  <CalendarDays className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/45" />
                  <input
                    name="age"
                    type="number"
                    min={3}
                    max={99}
                    inputMode="numeric"
                    placeholder="Nhập tuổi học viên"
                    value={studentAge}
                    onChange={(event) => setStudentAge(event.target.value)}
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/35 focus:border-[oklch(0.7_0.25_300)]"
                  />
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-white/80">
                Chọn Khối
                <span className="relative block">
                  <GraduationCap className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/45" />
                  <select
                    name="grade"
                    value={selectedGrade}
                    onChange={(event) => setSelectedGrade(event.target.value)}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-4 text-white outline-none transition-all focus:border-[oklch(0.7_0.25_300)] [&>option]:bg-[#151428] [&>option]:text-white"
                  >
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-white/80">
                Giới Tính
                <span className="relative block">
                  <User className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/45" />
                  <select
                    name="gender"
                    value={selectedGender}
                    onChange={(event) => setSelectedGender(event.target.value as "male" | "female")}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-4 text-white outline-none transition-all focus:border-[oklch(0.7_0.25_300)] [&>option]:bg-[#151428] [&>option]:text-white"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </span>
              </label>

              {/* Avatar Upload */}
              <label className="flex flex-col gap-2 text-sm font-medium text-white/80">
                Tải ảnh đại diện của bạn
                <div className="flex items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 via-purple-500/20 to-pink-500/30 blur-md" />
                    <div className="relative size-20 overflow-hidden rounded-full border-2 border-cyan-400/40 bg-gradient-to-br from-[#1a1c2e] to-[#0d2b33] p-1 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                      <Image
                        src={avatarPreview || "/tapsu.png"}
                        alt="Avatar Preview"
                        width={80}
                        height={80}
                        className="size-full rounded-full object-cover"
                      />
                    </div>
                  </div>

                  {/* File Input Button */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/70 transition-all hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
                    >
                      <Upload className="size-4" />
                      {avatarFile ? "Đổi ảnh khác" : "Chọn ảnh"}
                    </label>
                    <p className="mt-1 text-xs text-white/45">
                      JPG, PNG, GIF hoặc WEBP (tối đa 5MB)
                    </p>
                  </div>
                </div>
              </label>
            </>
          ) : null}

          <label className="flex flex-col gap-2 text-sm font-medium text-white/80">
            Email
            <span className="relative block">
              <Mail className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/45" />
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-4 text-white outline-none transition-all placeholder:text-white/35 focus:border-[oklch(0.7_0.25_300)]"
              />
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-white/80">
            Mật Khẩu
            <span className="relative block">
              <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/45" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-11 text-white outline-none transition-all placeholder:text-white/35 focus:border-[oklch(0.7_0.25_300)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition-colors hover:text-white"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </span>
          </label>

          {!isLogin ? (
            <label className="flex flex-col gap-2 text-sm font-medium text-white/80">
              Xác Nhận Mật Khẩu
              <span className="relative block">
                <Lock className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-white/45" />
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/10 pl-11 pr-11 text-white outline-none transition-all placeholder:text-white/35 focus:border-[oklch(0.7_0.25_300)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 transition-colors hover:text-white"
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                >
                  {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </span>
            </label>
          ) : null}

          {isLogin ? (
            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm text-[oklch(0.75_0.15_300)] transition-colors hover:text-[oklch(0.85_0.18_300)]"
              >
                Quên mật khẩu?
              </a>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="neon-glow mt-2 flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[oklch(0.5_0.2_280)] to-[oklch(0.45_0.22_300)] font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                {isLogin ? "Đăng Nhập" : "Tạo Tài Khoản"}
                <ArrowRight className="ml-2 size-5" />
              </>
            )}
          </button>

          {loginMessage ? (
            <p className="text-center text-sm font-medium text-red-300">{loginMessage}</p>
          ) : null}

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[oklch(0.16_0.03_280)] px-3 text-white/45">Hoặc tiếp tục với</span>
            </div>
          </div>

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:border-[oklch(0.7_0.25_300/0.5)] hover:bg-white/10"
          >
            <Sparkles className="mr-2 size-5" />
            Google
          </button>
        </form>
      </div>

      {!isLogin ? (
        <p className="mt-4 px-4 text-center text-xs text-white/45">
          Bằng việc đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
        </p>
      ) : null}

      {/* ── Confirmation Popup ── */}
      {showConfirmPopup && pendingRegistration ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ background: "rgba(8,6,24,0.75)" }}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-3xl p-8"
            style={{
              background:
                "linear-gradient(145deg,oklch(0.18 0.07 280/0.92),oklch(0.14 0.05 260/0.96))",
              border: "1px solid oklch(0.72 0.28 320/0.35)",
              boxShadow:
                "0 0 0 1px oklch(0.58 0.25 285/0.18) inset, 0 30px 80px rgba(0,0,0,0.55)",
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowConfirmPopup(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl text-white/45 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Đóng"
            >
              <X className="size-4" />
            </button>

            {/* Icon ring */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg,oklch(0.52 0.22 285),oklch(0.47 0.24 305))",
                boxShadow: "0 0 28px oklch(0.65 0.28 300/0.45)",
              }}
            >
              <ShieldCheck className="size-8 text-white" />
            </div>

            {/* Heading */}
            <h2 className="mb-2 text-center text-xl font-black text-white">
              Xác nhận Đăng ký
            </h2>
            <p className="mb-6 text-center text-sm leading-relaxed text-white/60">
              Đồng ý đăng ký và trải nghiệm{" "}
              <span className="font-bold text-[oklch(0.82_0.2_85)]">miễn phí</span> tất cả tính
              năng học Tiếng Anh cùng DOREMI.
            </p>

            {/* Info pill */}
            <div
              className="mb-6 rounded-2xl px-4 py-3 text-sm"
              style={{
                background: "oklch(0.22 0.08 285/0.5)",
                border: "1px solid oklch(0.65 0.22 285/0.3)",
              }}
            >
              <div className="flex items-center gap-2 text-white/75">
                <CheckCircle2 className="size-4 shrink-0 text-[oklch(0.78_0.2_165)]" />
                <span>
                  Tài khoản: <strong className="text-white">{pendingRegistration.name}</strong>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-white/75">
                <CheckCircle2 className="size-4 shrink-0 text-[oklch(0.78_0.2_165)]" />
                <span>
                  Giáo trình:{" "}
                  <strong className="text-white">{pendingRegistration.grade}</strong> sẽ được đồng
                  bộ tự động
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmPopup(false)}
                className="flex h-12 flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmRegister()}
                disabled={isLoading}
                className="flex h-12 flex-1 items-center justify-center rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg,oklch(0.52 0.22 285),oklch(0.47 0.24 305))",
                  boxShadow: "0 0 22px oklch(0.65 0.28 300/0.4)",
                }}
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    Xác nhận
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
