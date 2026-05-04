# 🚀 Video Learning - Quick Start Guide

## Thiết lập nhanh trong 5 bước

### Bước 1: Cài đặt Ollama và Qwen

**Windows:**
```bash
# Tải từ: https://ollama.com/download/windows
# Sau khi cài đặt:
ollama pull qwen2.5:latest
ollama serve
```

**macOS/Linux:**
```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Cả hai:
ollama pull qwen2.5:latest
ollama serve
```

> ⚠️ **Quan trọng:** Giữ terminal `ollama serve` chạy trong suốt quá trình sử dụng!

### Bước 2: Cấu hình API Keys

Tạo file `.env.local`:

```bash
cp .env.local.example .env.local
```

Thêm YouTube API Key vào `.env.local`:

```env
YOUTUBE_API_KEY=your-youtube-api-key-here
```

**Lấy YouTube API Key:**
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project → Enable "YouTube Data API v3"
3. Tạo API Key → Copy vào `.env.local`

### Bước 3: Crawl Video từ YouTube

```bash
npm run video:crawl
```

Hoặc:
```bash
node scripts/crawl-youtube-playlist.js
```

**Kết quả:** File `public/youtube-videos-data.json` chứa thông tin video và transcript.

### Bước 4: Import vào MongoDB

**Khởi động dev server (terminal mới):**
```bash
npm run dev
```

**Import videos (terminal khác):**
```bash
npm run video:import
```

Hoặc:
```bash
node scripts/import-videos-to-db.js
```

### Bước 5: Tạo Embeddings

```bash
npm run video:embeddings
```

Hoặc:
```bash
node scripts/generate-video-embeddings.js
```

> ⏱️ **Lưu ý:** Quá trình này có thể mất 5-10 phút tùy số lượng video.

---

## ✅ Hoàn tất!

Truy cập: **http://localhost:3000/video-learning**

---

## 🎯 Lệnh nhanh

### Setup toàn bộ (một lệnh)
```bash
# Chạy tất cả các bước (crawl → import → embeddings)
npm run video:setup
```

> ⚠️ **Yêu cầu:** Dev server phải đang chạy ở terminal khác!

### Các lệnh riêng lẻ
```bash
npm run video:crawl       # Crawl video từ YouTube
npm run video:import      # Import vào MongoDB
npm run video:embeddings  # Tạo embeddings
```

---

## 🔍 Kiểm tra

### Kiểm tra Ollama
```bash
curl http://localhost:11434/api/tags
```

Nếu thành công, bạn sẽ thấy danh sách models.

### Kiểm tra MongoDB
```bash
# Trong MongoDB Compass hoặc mongosh
use doremi_eng
db.videos.countDocuments()
```

### Kiểm tra API
```bash
curl http://localhost:3000/api/videos
```

---

## ❓ Troubleshooting

### Ollama không chạy
```bash
# Khởi động lại
ollama serve
```

### Port 3000 đã được sử dụng
```bash
# Sử dụng port khác
PORT=3001 npm run dev
```

### MongoDB connection error
- Kiểm tra `MONGODB_URI` trong `.env.local`
- Đảm bảo MongoDB đang chạy

### Video không có transcript
- Một số video YouTube không có phụ đề
- Chức năng chat sẽ không khả dụng cho video đó
- Vẫn có thể xem video bình thường

---

## 📚 Tài liệu đầy đủ

Xem file `VIDEO_LEARNING_README.md` để biết thêm chi tiết về:
- Kiến trúc hệ thống
- API endpoints
- Database schema
- Tùy chỉnh nâng cao

---

## 🎨 Tính năng

✅ Hiển thị video dạng lưới đẹp mắt  
✅ Trình phát YouTube tích hợp  
✅ Chat AI thông minh về nội dung video  
✅ Tự động nhảy đến timestamp liên quan  
✅ Responsive design (mobile-friendly)  
✅ Gravity Gradient styling với Quicksand font  
✅ Glassmorphism và neon effects  

---

**Happy Learning! 🎓**
