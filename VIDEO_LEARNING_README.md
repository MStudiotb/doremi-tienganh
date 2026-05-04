# 🎬 Video Learning Feature - RAG Implementation

## Tổng quan

Tính năng **Ôn Luyện Qua Video** cho phép học sinh học tiếng Anh thông qua video YouTube với trợ lý AI thông minh sử dụng công nghệ RAG (Retrieval-Augmented Generation).

### Tính năng chính

- ✅ Crawl video từ YouTube Playlist
- ✅ Tự động lấy transcript từ video
- ✅ Tạo embeddings sử dụng Ollama/Qwen (local LLM)
- ✅ Giao diện hiển thị video dạng lưới đẹp mắt
- ✅ Trình phát video YouTube tích hợp
- ✅ Chat AI về nội dung video với RAG
- ✅ Tự động nhảy đến thời điểm liên quan trong video
- ✅ Tối ưu cho mobile (Android/iOS)

## 🚀 Cài đặt

### 1. Cài đặt Ollama

Ollama là công cụ chạy LLM local trên máy tính.

**Windows:**
```bash
# Tải và cài đặt từ: https://ollama.com/download/windows
# Sau khi cài đặt, mở terminal và chạy:
ollama pull qwen2.5:latest
```

**macOS:**
```bash
brew install ollama
ollama pull qwen2.5:latest
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:latest
```

### 2. Cấu hình API Keys

Tạo file `.env.local` từ `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Thêm các API keys cần thiết:

```env
# MongoDB (đã có sẵn)
MONGODB_URI=your-mongodb-uri
MONGODB_DB=doremi_eng

# YouTube Data API v3 (BẮT BUỘC)
YOUTUBE_API_KEY=your-youtube-api-key-here
```

#### Lấy YouTube API Key:

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **YouTube Data API v3**
4. Tạo credentials → API Key
5. Copy API key vào `.env.local`

### 3. Cài đặt Dependencies

```bash
npm install
```

## 📝 Hướng dẫn sử dụng

### Bước 1: Khởi động Ollama

Mở terminal và chạy:

```bash
ollama serve
```

Giữ terminal này mở trong suốt quá trình sử dụng.

### Bước 2: Crawl Video từ YouTube

Chạy script để tải thông tin video và transcript:

```bash
node scripts/crawl-youtube-playlist.js
```

Script này sẽ:
- Lấy danh sách video từ playlist
- Tải thumbnail, title, description
- Tải transcript (phụ đề) của mỗi video
- Lưu vào file `public/youtube-videos-data.json`

**Lưu ý:** Playlist mặc định là: `PL8IRMG1KdNbwKBpMvDl3oluXw3s9JRhGB`

Để thay đổi playlist, sửa file `scripts/crawl-youtube-playlist.js`:

```javascript
const PLAYLIST_ID = 'YOUR_PLAYLIST_ID_HERE';
```

### Bước 3: Import Video vào MongoDB

Sau khi crawl xong, import dữ liệu vào MongoDB bằng API:

```bash
# Sử dụng curl hoặc Postman
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d @public/youtube-videos-data.json
```

Hoặc tạo script import đơn giản:

```javascript
// scripts/import-videos-to-db.js
const fs = require('fs');

async function importVideos() {
  const videos = JSON.parse(fs.readFileSync('./public/youtube-videos-data.json', 'utf8'));
  
  const response = await fetch('http://localhost:3000/api/videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videos }),
  });
  
  const result = await response.json();
  console.log(result);
}

importVideos();
```

Chạy:
```bash
node scripts/import-videos-to-db.js
```

### Bước 4: Tạo Embeddings

Tạo embeddings cho transcript sử dụng Ollama:

```bash
node scripts/generate-video-embeddings.js
```

Script này sẽ:
- Chia transcript thành các chunks nhỏ
- Tạo embedding vector cho mỗi chunk
- Lưu embeddings vào MongoDB

**Lưu ý:** Quá trình này có thể mất vài phút tùy thuộc vào số lượng video.

### Bước 5: Khởi động ứng dụng

```bash
npm run dev
```

Truy cập: [http://localhost:3000/video-learning](http://localhost:3000/video-learning)

## 🎨 Giao diện

### Trang danh sách video

- Hiển thị video dạng lưới responsive
- Thumbnail với hiệu ứng hover
- Badge "AI Chat" cho video có transcript
- Thông tin video: title, channel, ngày đăng

### Trang xem video

- **Bên trái:** Trình phát YouTube embed
- **Bên phải:** Chat interface với AI
- Tự động scroll chat khi có tin nhắn mới
- Click vào timestamp để nhảy đến đoạn video tương ứng

## 🤖 Cách hoạt động của RAG

### 1. Chunking
Transcript được chia thành các đoạn nhỏ (~500 ký tự) với thông tin thời gian.

### 2. Embedding
Mỗi chunk được chuyển thành vector embedding sử dụng Qwen model.

### 3. Retrieval
Khi người dùng đặt câu hỏi:
- Câu hỏi được chuyển thành embedding
- Tính cosine similarity với tất cả chunks
- Lấy top 3 chunks có độ tương đồng cao nhất

### 4. Generation
Chunks liên quan được đưa vào context của LLM để tạo câu trả lời chính xác.

## 📱 Tối ưu Mobile

### Performance
- Lazy loading cho thumbnail
- Debounce cho input chat
- Pagination cho danh sách video (nếu cần)

### UI/UX
- Responsive grid: 1 cột (mobile) → 4 cột (desktop)
- Touch-friendly buttons
- Optimized font size cho màn hình nhỏ

### Network
- Compress images
- Cache API responses
- Progressive loading

## 🔧 Troubleshooting

### Ollama không chạy

```bash
# Kiểm tra Ollama
curl http://localhost:11434/api/tags

# Nếu lỗi, khởi động lại
ollama serve
```

### Video không có transcript

Một số video YouTube không có phụ đề. Trong trường hợp này:
- Badge "AI Chat" sẽ không hiển thị
- Chức năng chat bị disable
- Chỉ có thể xem video bình thường

### Embeddings generation chậm

Tốc độ phụ thuộc vào:
- Cấu hình máy tính
- Số lượng video
- Độ dài transcript

**Giải pháp:**
- Chạy script vào lúc rảnh
- Xử lý từng batch nhỏ
- Sử dụng GPU nếu có

### MongoDB connection error

Kiểm tra:
- `MONGODB_URI` trong `.env.local`
- MongoDB service đang chạy
- Network connection

## 📊 Database Schema

### Collection: `videos`

```typescript
{
  videoId: string;           // YouTube video ID
  title: string;             // Tiêu đề video
  description: string;       // Mô tả
  thumbnail: string;         // URL thumbnail
  publishedAt: string;       // Ngày đăng
  channelTitle: string;      // Tên kênh
  transcript: Array<{        // Transcript gốc
    text: string;
    offset: number;          // Thời gian bắt đầu (ms)
    duration: number;        // Độ dài (ms)
  }>;
  transcriptText: string;    // Full text
  hasTranscript: boolean;    // Có transcript không
  chunks: Array<{            // Chunks với embeddings
    videoId: string;
    chunkIndex: number;
    text: string;
    startTime: number;
    endTime: number;
    embedding: number[];     // Vector embedding
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎯 API Endpoints

### GET `/api/videos`
Lấy danh sách tất cả video

**Response:**
```json
{
  "success": true,
  "videos": [...],
  "count": 10
}
```

### POST `/api/videos`
Import video vào database

**Request:**
```json
{
  "videos": [...]
}
```

### POST `/api/videos/chat`
Chat với AI về video

**Request:**
```json
{
  "videoId": "abc123",
  "question": "Video này nói về gì?"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Video này giới thiệu về...",
  "chunks": [
    {
      "text": "...",
      "startTime": 1000,
      "endTime": 5000,
      "similarity": 0.85
    }
  ]
}
```

## 🎨 Styling

Sử dụng:
- **Font:** Quicksand (đã có sẵn trong globals.css)
- **Color scheme:** Gravity Gradient (xanh đậm)
- **Effects:** Neon glow, glassmorphism, floating orbs

## 📈 Roadmap

- [ ] Thêm tính năng bookmark video
- [ ] Lưu lịch sử chat
- [ ] Export transcript
- [ ] Tạo quiz từ nội dung video
- [ ] Multi-language support
- [ ] Voice input cho chat

## 🤝 Contributing

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request.

## 📄 License

MIT License

---

**Developed with ❤️ for English learners**
