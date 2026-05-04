# 🚀 Hướng Dẫn Deploy Lên Vercel - Checklist Hoàn Chỉnh

## ✅ Bước 1: Khởi động Cloudflared Tunnel

### Cài đặt Cloudflared (nếu chưa có):
```bash
# Windows - Tải về từ:
# https://github.com/cloudflare/cloudflared/releases/latest
# Hoặc dùng winget:
winget install --id Cloudflare.cloudflared
```

### Chạy Tunnel:
Mở một terminal riêng và chạy lệnh:
```bash
cloudflared tunnel --url http://localhost:11434
```

**📋 Tìm và copy URL tunnel có dạng:**
```
https://xxxxx-xxxx-xxxx.trycloudflare.com
```

**⚠️ LƯU Ý:** Giữ terminal này mở trong suốt quá trình deploy!

---

## ✅ Bước 2: Chuẩn Bị Biến Môi Trường

### Truy cập Vercel Dashboard:
1. Đăng nhập vào https://vercel.com
2. Chọn project **doremi-eng-mstudiotb**
3. Vào **Settings** → **Environment Variables**

### Thêm 4 biến sau (nhấn Add cho từng biến):

#### 1️⃣ MONGODB_URI
```
Tên: MONGODB_URI
Giá trị: [Dán connection string MongoDB của bạn]
Ví dụ: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

#### 2️⃣ NINEROUTER_API_KEY
```
Tên: NINEROUTER_API_KEY
Giá trị: [Dán API key từ 9router.com]
```

#### 3️⃣ YOUTUBE_API_KEY
```
Tên: YOUTUBE_API_KEY
Giá trị: [Dán API key từ Google Cloud Console]
```

#### 4️⃣ OLLAMA_BASE_URL
```
Tên: OLLAMA_BASE_URL
Giá trị: [Dán URL tunnel từ Bước 1]
Ví dụ: https://xxxxx-xxxx-xxxx.trycloudflare.com
```

### ⚠️ Quan trọng:
- Chọn **Production**, **Preview**, và **Development** cho tất cả biến
- Nhấn **Save** sau mỗi biến
- **KHÔNG** có dấu cách thừa ở đầu/cuối giá trị

---

## ✅ Bước 3: Xác Nhận Với Tôi

**Sau khi đã Save tất cả 4 biến trên Vercel, hãy gõ:**
```
"Đã save xong"
```

Tôi sẽ chạy lệnh deploy cho bạn!

---

## ✅ Bước 4: Deploy (Tôi sẽ làm)

Sau khi bạn xác nhận, tôi sẽ chạy:
```bash
npx vercel --prod
```

---

## ✅ Bước 5: Kiểm Tra Giao Diện

Sau khi deploy thành công, kiểm tra:

### ✓ Roadmap Page:
- [x] Có 6 cấp độ (Tập Sự → Chuyên Gia)
- [x] Nobita xuất hiện bên phải mỗi cấp độ
- [x] KHÔNG có mục "Challenger" hay "Cup"
- [x] Giao diện responsive và mượt mà

### ✓ Các tính năng khác:
- [ ] Video Learning hoạt động
- [ ] AI Summary hoạt động (cần Ollama tunnel)
- [ ] Đăng ký user lưu vào MongoDB
- [ ] Google Drive backup hoạt động

---

## 📝 Thông Tin Tham Khảo

### File cấu hình quan trọng:
- `vercel.json` - Cấu hình Vercel
- `.vercelignore` - File bỏ qua khi deploy
- `.env.local.example` - Template biến môi trường

### Roadmap đã được kiểm tra:
- File: `app/(dashboard)/roadmap/page.tsx`
- Dòng 12-19: CHARACTER_LEVELS chỉ có 6 cấp độ
- Dòng 421-458: Nobita icon hiển thị bên phải
- ✅ Không có "Challenger" trong code

---

## 🆘 Troubleshooting

### Nếu Ollama không hoạt động:
1. Kiểm tra tunnel còn chạy không
2. Kiểm tra URL trong OLLAMA_BASE_URL đúng chưa
3. Test tunnel: `curl https://your-tunnel-url.trycloudflare.com/api/tags`

### Nếu MongoDB lỗi:
1. Kiểm tra IP whitelist trên MongoDB Atlas
2. Thêm `0.0.0.0/0` để cho phép tất cả IP (production)

### Nếu build lỗi:
1. Kiểm tra logs trên Vercel Dashboard
2. Đảm bảo tất cả dependencies trong package.json

---

## 🎯 Sẵn Sàng Deploy?

**Checklist cuối cùng:**
- [ ] Cloudflared tunnel đang chạy
- [ ] Đã copy URL tunnel
- [ ] Đã thêm 4 biến môi trường trên Vercel
- [ ] Đã nhấn Save tất cả
- [ ] Sẵn sàng gõ "Đã save xong"

**Hãy bắt đầu từ Bước 1! 🚀**
