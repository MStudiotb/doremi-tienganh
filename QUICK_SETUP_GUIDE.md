# ⚡ Hướng Dẫn Nhanh - Hoàn Tất Deploy

## 🎯 Trạng Thái Hiện Tại

✅ **Đã hoàn thành:**
- Build thành công
- Vercel CLI đã login
- Code đã được cập nhật
- Đang deploy lên Vercel...

⏳ **Đang chờ:**
- Vercel build và deploy (khoảng 2-3 phút)

## 📝 Các Bước Tiếp Theo (Sau Khi Deploy Xong)

### Bước 1: Lấy URL Preview

Sau khi terminal hiển thị:
```
✅ Preview: https://doremi-eng-mstudiotb-xxxxx.vercel.app
```

**→ Copy URL này!**

### Bước 2: Thêm Biến Môi Trường

1. Truy cập: https://vercel.com/dashboard
2. Click vào project: **doremi-eng-mstudiotb**
3. Vào tab **Settings**
4. Click **Environment Variables** (sidebar trái)
5. Thêm các biến sau:

#### Biến BẮT BUỘC (Không có sẽ lỗi):

**MONGODB_URI**
```
Key: MONGODB_URI
Value: [Paste MongoDB connection string của bạn]
Environment: ✓ Production ✓ Preview ✓ Development
```

**MONGODB_DB**
```
Key: MONGODB_DB
Value: doremi_eng
Environment: ✓ Production ✓ Preview ✓ Development
```

**NINEROUTER_API_KEY**
```
Key: NINEROUTER_API_KEY
Value: [Paste 9Router API key của bạn]
Environment: ✓ Production ✓ Preview ✓ Development
```

**YOUTUBE_API_KEY**
```
Key: YOUTUBE_API_KEY
Value: [Paste YouTube API key của bạn]
Environment: ✓ Production ✓ Preview ✓ Development
```

#### Biến TÙY CHỌN:

**OPENAI_API_KEY** (Nếu có)
```
Key: OPENAI_API_KEY
Value: sk-proj-xxxxx
Environment: ✓ Production ✓ Preview ✓ Development
```

**OLLAMA_BASE_URL** (Nếu muốn dùng AI Video Summary)
```
Key: OLLAMA_BASE_URL
Value: [Sẽ setup sau - xem bước 4]
Environment: ✓ Production ✓ Preview ✓ Development
```

6. Click **Save** sau mỗi biến

### Bước 3: Deploy Production

Sau khi thêm biến môi trường xong, chạy lệnh:

```bash
npx vercel --prod
```

Lệnh này sẽ deploy lên production với URL chính thức:
```
✅ Production: https://doremi-eng-mstudiotb.vercel.app
```

### Bước 4: Setup Ollama Tunnel (Tùy Chọn)

**Chỉ cần nếu muốn dùng AI Video Summary/Chat**

#### 4.1. Cài Cloudflared

```bash
winget install --id Cloudflare.cloudflared
```

Hoặc tải về: https://github.com/cloudflare/cloudflared/releases/latest

#### 4.2. Khởi động Ollama

```bash
ollama serve
```

#### 4.3. Tạo Tunnel (Terminal mới)

```bash
cloudflared tunnel --url http://localhost:11434
```

Sẽ hiển thị:
```
Your quick Tunnel has been created! Visit it at:
https://abc-def-ghi.trycloudflare.com
```

**→ Copy URL này!**

#### 4.4. Thêm vào Vercel

1. Quay lại Vercel Dashboard → Settings → Environment Variables
2. Thêm biến:
```
Key: OLLAMA_BASE_URL
Value: https://abc-def-ghi.trycloudflare.com
Environment: ✓ Production ✓ Preview ✓ Development
```
3. Save

#### 4.5. Redeploy

```bash
npx vercel --prod
```

### Bước 5: Cấu Hình MongoDB Atlas

**QUAN TRỌNG:** Cho phép Vercel kết nối

1. Truy cập: https://cloud.mongodb.com/
2. Chọn cluster của bạn
3. Click **Network Access** (sidebar trái)
4. Click **Add IP Address**
5. Chọn: **Allow Access from Anywhere**
   - IP Address: `0.0.0.0/0`
6. Click **Confirm**

### Bước 6: Test Trên Điện Thoại

1. Mở trình duyệt trên điện thoại
2. Truy cập: `https://doremi-eng-mstudiotb.vercel.app`
3. Kiểm tra:
   - ✓ Trang chủ hiển thị
   - ✓ Icon nhân vật (tapsu, coban, tienbo...)
   - ✓ Đăng ký/Đăng nhập
   - ✓ Roadmap
   - ✓ Video Learning
   - ✓ Tra cứu từ vựng

## 🎉 Hoàn Thành!

Sau khi làm xong các bước trên, ứng dụng DOREMI ENG đã LIVE!

## 🔍 Kiểm Tra Lỗi

### Nếu gặp lỗi 500 (Internal Server Error):

1. Vào Vercel Dashboard → Project → **Logs**
2. Xem lỗi cụ thể
3. Thường là do:
   - Thiếu biến môi trường
   - MongoDB không kết nối được
   - API key sai

### Nếu MongoDB không kết nối:

1. Kiểm tra MONGODB_URI đúng format
2. Kiểm tra Network Access đã cho phép 0.0.0.0/0
3. Kiểm tra username/password không có ký tự đặc biệt

### Nếu Video AI không hoạt động:

- Đây là tính năng tùy chọn
- Cần setup Ollama Tunnel (Bước 4)
- Video vẫn xem được bình thường, chỉ không có AI summary

## 📞 Lấy API Keys

### MongoDB URI:
1. https://cloud.mongodb.com/
2. Cluster → Connect → Connect your application
3. Copy connection string

### 9Router API Key:
1. https://9router.com/
2. Đăng ký/Đăng nhập
3. Dashboard → API Keys

### YouTube API Key:
1. https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Create Credentials → API Key
4. Enable YouTube Data API v3

### OpenAI API Key (Tùy chọn):
1. https://platform.openai.com/
2. API Keys → Create new secret key

---

**Chúc bạn deploy thành công! 🚀**

URL cuối cùng: **https://doremi-eng-mstudiotb.vercel.app**
