# Tính Năng Tải Avatar - DOREMI

## Tổng Quan
Tính năng cho phép các bé tự tải ảnh đại diện (Avatar) từ máy tính lên web khi đăng ký tài khoản.

## Các Thành Phần Đã Triển Khai

### 1. API Route Upload Avatar
**File:** `app/api/upload/avatar/route.ts`

**Chức năng:**
- Nhận file ảnh từ form upload
- Validate loại file (JPG, PNG, GIF, WEBP)
- Validate kích thước file (tối đa 5MB)
- Tự động tạo thư mục `public/avatars/` nếu chưa có
- Lưu file với tên unique: `{userId}-{timestamp}.{extension}`
- Trả về đường dẫn public URL: `/avatars/{filename}`

**Endpoint:** `POST /api/upload/avatar`

**Request:**
- FormData với 2 fields:
  - `avatar`: File ảnh
  - `userId`: ID người dùng (email hoặc unique ID)

**Response:**
```json
{
  "message": "Tải ảnh đại diện thành công",
  "avatarUrl": "/avatars/user-1234567890.jpg"
}
```

### 2. Form Đăng Ký với Upload Avatar
**File:** `components/auth/auth-card.tsx`

**Tính năng mới:**
- ✅ Input file ẩn với accept image types
- ✅ Preview ảnh real-time khi chọn file
- ✅ Validate file type và size ở client-side
- ✅ Hiển thị ảnh preview trong khung tròn với Glassmorphism effect
- ✅ Button "Chọn ảnh" / "Đổi ảnh khác" với icon Upload
- ✅ Hiển thị hướng dẫn: "JPG, PNG, GIF hoặc WEBP (tối đa 5MB)"
- ✅ Upload ảnh lên server khi đăng ký thành công
- ✅ Lưu avatar URL vào localStorage
- ✅ Fallback về ảnh mặc định `/tapsu.png` (Nobita) nếu không upload

**State Management:**
- `avatarFile`: File object được chọn
- `avatarPreview`: Data URL để preview ảnh

**Flow:**
1. User chọn ảnh → Validate → Tạo preview
2. User nhấn "Tạo Tài Khoản" → Hiện popup xác nhận
3. User xác nhận → Upload ảnh → Lưu session với avatar URL
4. Redirect về trang chủ

### 3. Hiển Thị Avatar trong Sidebar
**File:** `components/UserAvatarCard.tsx`

**Cập nhật:**
- ✅ Đọc avatar URL từ localStorage (`doremi_user_avatar`)
- ✅ Đọc avatar từ session object (`doremi_session.avatar`)
- ✅ Hiển thị ảnh user thay vì luôn hiện Nobita
- ✅ Fallback về `/tapsu.png` nếu không có avatar
- ✅ Sử dụng `object-cover` để ảnh không bị méo
- ✅ Giữ nguyên Glassmorphism và Gravity Gradient effects

**State:**
- `avatarUrl`: URL của ảnh đại diện (default: `/tapsu.png`)

### 4. Cấu Trúc Thư Mục
```
public/
  avatars/
    .gitkeep          # Đảm bảo thư mục được track bởi git
    {user-uploaded-files}  # Các file ảnh user upload (ignored by git)
```

### 5. Git Configuration
**File:** `.gitignore`

```gitignore
# User uploaded files
public/avatars/*
!public/avatars/.gitkeep
```

Cấu hình này:
- Ignore tất cả file trong `public/avatars/`
- Nhưng vẫn track file `.gitkeep` để giữ thư mục

## Giao Diện

### Form Đăng Ký
```
┌─────────────────────────────────────┐
│ Tải ảnh đại diện của bạn            │
│                                     │
│  ╭─────╮  ┌──────────────────────┐ │
│  │ 👤  │  │  📤 Chọn ảnh         │ │
│  │     │  └──────────────────────┘ │
│  ╰─────╯  JPG, PNG, GIF hoặc WEBP │
│  Preview   (tối đa 5MB)            │
└─────────────────────────────────────┘
```

### Sidebar Avatar Card
```
┌──────────────────────────────────┐
│  ╭─────╮                         │
│  │ 👤  │  Xin chào,              │
│  │     │  Tên User               │
│  ╰─────╯  🔥 5  ✨ 120 XP        │
└──────────────────────────────────┘
```

## Phong Cách Thiết Kế

### Màu Sắc & Hiệu Ứng
- **Glassmorphism:** Border với `border-cyan-400/40`
- **Neon Glow:** Shadow `0_0_20px_rgba(34,211,238,0.3)`
- **Gradient:** `from-cyan-400/30 via-purple-500/20 to-pink-500/30`
- **Font:** Quicksand Bold cho tên user

### Bo Góc
- Avatar: `rounded-full` (tròn hoàn toàn)
- Buttons: `rounded-xl`
- Cards: `rounded-2xl`

## Validation

### Client-side
- ✅ File type: JPG, JPEG, PNG, GIF, WEBP
- ✅ File size: Tối đa 5MB
- ✅ Hiển thị error message nếu không hợp lệ

### Server-side
- ✅ Validate file type
- ✅ Validate file size
- ✅ Sanitize filename (remove special characters)
- ✅ Generate unique filename với timestamp

## Security

### File Upload Security
- ✅ Whitelist file types (chỉ cho phép image types)
- ✅ Limit file size (5MB max)
- ✅ Sanitize user input trong filename
- ✅ Store files outside of executable paths
- ✅ Generate unique filenames để tránh conflict

### Storage
- ✅ Files stored in `public/avatars/` (publicly accessible)
- ✅ Filenames không chứa thông tin nhạy cảm
- ✅ Ignored by git để không commit user data

## Testing Checklist

### Đăng Ký với Avatar
- [ ] Chọn ảnh JPG → Preview hiển thị đúng
- [ ] Chọn ảnh PNG → Preview hiển thị đúng
- [ ] Chọn file không phải ảnh → Hiện error
- [ ] Chọn file > 5MB → Hiện error
- [ ] Đăng ký thành công → Avatar được upload
- [ ] Đăng ký không chọn ảnh → Dùng Nobita mặc định

### Hiển Thị Avatar
- [ ] Avatar hiển thị trong Sidebar sau khi đăng ký
- [ ] Avatar không bị méo (object-cover hoạt động)
- [ ] Glassmorphism effects hiển thị đẹp
- [ ] Refresh page → Avatar vẫn hiển thị
- [ ] Đăng xuất → Về Nobita mặc định

### Edge Cases
- [ ] Upload ảnh rất nhỏ (< 100KB)
- [ ] Upload ảnh vuông
- [ ] Upload ảnh dọc (portrait)
- [ ] Upload ảnh ngang (landscape)
- [ ] Network error khi upload → Fallback về default
- [ ] Đăng nhập user cũ (chưa có avatar) → Hiện Nobita

## Cải Tiến Tương Lai

### Phase 2 (Optional)
- [ ] Crop/resize ảnh trước khi upload
- [ ] Compress ảnh để giảm dung lượng
- [ ] Upload lên cloud storage (Cloudinary, S3)
- [ ] Cho phép đổi avatar sau khi đã đăng ký
- [ ] Avatar gallery với các ảnh có sẵn
- [ ] Tích hợp với MongoDB để lưu avatar URL

### Phase 3 (Advanced)
- [ ] Image optimization với Next.js Image API
- [ ] WebP conversion tự động
- [ ] CDN integration
- [ ] Avatar moderation (AI check inappropriate content)

## Troubleshooting

### Lỗi Upload Failed
**Nguyên nhân:**
- File quá lớn
- Loại file không được hỗ trợ
- Không có quyền ghi vào thư mục `public/avatars/`

**Giải pháp:**
1. Check file size và type
2. Verify thư mục `public/avatars/` tồn tại
3. Check permissions của thư mục
4. Check console logs để xem error chi tiết

### Avatar Không Hiển Thị
**Nguyên nhân:**
- File không tồn tại
- Path không đúng
- Next.js Image optimization issue

**Giải pháp:**
1. Check file tồn tại trong `public/avatars/`
2. Verify avatar URL trong localStorage
3. Check browser console cho errors
4. Clear cache và refresh

## Kết Luận

Tính năng upload avatar đã được triển khai hoàn chỉnh với:
- ✅ Upload và lưu trữ file
- ✅ Preview real-time
- ✅ Validation đầy đủ
- ✅ Hiển thị trong UI
- ✅ Glassmorphism design
- ✅ Fallback về default avatar
- ✅ Security best practices

Tính năng sẵn sàng để test và sử dụng! 🎉
