# 🚀 Hướng Dẫn Deploy DOREMI ENG lên Vercel

## ✅ Bước 1: Kiểm Tra Build (ĐÃ HOÀN THÀNH)

Build đã chạy thành công không có lỗi:
- ✓ CSS đã được sửa (không còn lỗi @import)
- ✓ TypeScript compilation thành công
- ✓ 45 trang static đã được tạo
- ✓ Tất cả API routes đã sẵn sàng

## 📋 Bước 2: Danh Sách Biến Môi Trường Cần Thiết

### **Biến BẮT BUỘC:**

1. **MONGODB_URI** (Bắt buộc)
   - Chuỗi kết nối MongoDB Atlas
   - Ví dụ: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Lấy từ: MongoDB Atlas Dashboard → Connect → Connect your application

2. **MONGODB_DB** (Bắt buộc)
   - Tên database
   - Giá trị: `doremi_eng`

3. **NINEROUTER_API_KEY** (Bắt buộc cho tính năng tra cứu từ vựng)
   - API key từ 9Router
   - Lấy từ: https://9router.com
   - Dùng để tự động điền nghĩa, phiên âm, ví dụ cho từ vựng

4. **YOUTUBE_API_KEY** (Bắt buộc cho tính năng Video Learning)
   - YouTube Data API v3 key
   - Lấy từ: https://console.cloud.google.com/
   - Dùng để lấy thông tin video từ YouTube playlists

### **Biến TÙY CHỌN:**

5. **OPENAI_API_KEY** (Tùy chọn)
   - OpenAI API key cho tạo ảnh AI
   - Nếu không có, hệ thống sẽ dùng ảnh local hoặc placeholder
   - Ví dụ: `sk-proj-xxxxxxxxxxxxx`

### **Biến KHÔNG CẦN trên Vercel:**

- ❌ **GOOGLE_DRIVE_CREDENTIALS**: Không thể dùng trên Vercel (cần file credentials.json)
  - Tính năng backup Google Drive sẽ không hoạt động trên production
  - Chỉ hoạt động ở môi trường local development

## 🔧 Bước 3: Cấu Hình Biến Môi Trường trên Vercel

### Cách 1: Qua Vercel Dashboard (Khuyến nghị)

1. Truy cập: https://vercel.com/dashboard
2. Chọn project **doremi-eng-mstudiotb** (sau khi deploy lần đầu)
3. Vào **Settings** → **Environment Variables**
4. Thêm từng biến:

```
Key: MONGODB_URI
Value: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
Environment: Production, Preview, Development
```

```
Key: MONGODB_DB
Value: doremi_eng
Environment: Production, Preview, Development
```

```
Key: NINEROUTER_API_KEY
Value: [your-9router-api-key]
Environment: Production, Preview, Development
```

```
Key: YOUTUBE_API_KEY
Value: [your-youtube-api-key]
Environment: Production, Preview, Development
```

```
Key: OPENAI_API_KEY (Tùy chọn)
Value: sk-proj-xxxxxxxxxxxxx
Environment: Production, Preview, Development
```

5. Click **Save** sau mỗi biến

### Cách 2: Qua Vercel CLI

```bash
vercel env add MONGODB_URI
vercel env add MONGODB_DB
vercel env add NINEROUTER_API_KEY
vercel env add YOUTUBE_API_KEY
vercel env add OPENAI_API_KEY
```

## 🚀 Bước 4: Deploy lên Vercel

### Phương án A: Deploy qua Vercel CLI (Khuyến nghị)

1. **Login vào Vercel:**
```bash
vercel login
```

2. **Deploy lần đầu (Preview):**
```bash
vercel
```
- Chọn scope (team hoặc personal account)
- Link to existing project? → **No**
- Project name: **doremi-eng-mstudiotb**
- Directory: **./** (Enter)
- Override settings? → **No**

3. **Deploy lên Production:**
```bash
vercel --prod
```

### Phương án B: Deploy qua GitHub (Tự động)

1. Push code lên GitHub repository
2. Truy cập: https://vercel.com/new
3. Import repository từ GitHub
4. Cấu hình:
   - Project Name: **doremi-eng-mstudiotb**
   - Framework Preset: **Next.js**
   - Root Directory: **./**
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Thêm Environment Variables (như Bước 3)
6. Click **Deploy**

## 📁 Bước 5: Xác Nhận File Tĩnh

✅ **Đã kiểm tra - Tất cả icon nhân vật có trong thư mục public:**

- ✓ tapsu.png
- ✓ coban.png
- ✓ tienbo.png
- ✓ hieubiet.png
- ✓ thanhthao.png
- ✓ chuyengia.png
- ✓ nobita.png
- ✓ xuka.png
- ✓ chuong.png
- ✓ logo.png
- ✓ Và nhiều file khác...

Tất cả file trong `public/` sẽ tự động được deploy lên Vercel.

## 🌐 Bước 6: Đường Dẫn Sau Khi Deploy

Sau khi deploy thành công, bạn sẽ nhận được:

### URL Production:
```
https://doremi-eng-mstudiotb.vercel.app
```

### URL Preview (mỗi lần deploy):
```
https://doremi-eng-mstudiotb-[random-hash].vercel.app
```

## 🧪 Bước 7: Test Trên Điện Thoại

1. Mở trình duyệt trên điện thoại
2. Truy cập: `https://doremi-eng-mstudiotb.vercel.app`
3. Kiểm tra:
   - ✓ Trang chủ hiển thị đúng
   - ✓ Icon nhân vật hiển thị (không bị ảnh trắng)
   - ✓ Đăng ký/Đăng nhập hoạt động
   - ✓ Roadmap hiển thị đầy đủ
   - ✓ Video Learning hoạt động
   - ✓ Tra cứu từ vựng hoạt động

## ⚠️ Lưu Ý Quan Trọng

### 1. Google Drive Backup
- ❌ **Không hoạt động trên Vercel** (cần file credentials.json)
- Giải pháp: Chỉ dùng tính năng này ở local development
- Hoặc: Chuyển sang dùng Vercel Blob Storage hoặc AWS S3

### 2. MongoDB Connection
- ✅ Đảm bảo MongoDB Atlas cho phép kết nối từ mọi IP (0.0.0.0/0)
- Vào MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere

### 3. API Keys
- 🔒 Không commit file `.env.local` vào Git
- ✅ File `.gitignore` đã được cấu hình đúng

### 4. Build Time
- ⏱️ Build có thể mất 2-3 phút
- Vercel có giới hạn 45 giây cho Serverless Functions
- Nếu có API route chạy lâu, cần tối ưu

## 🔄 Deploy Lại Sau Khi Thay Đổi Code

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```

Hoặc nếu dùng GitHub integration, chỉ cần:
```bash
git add .
git commit -m "Update features"
git push origin main
```

Vercel sẽ tự động deploy.

## 📊 Monitoring & Logs

Xem logs và analytics tại:
- Dashboard: https://vercel.com/dashboard
- Logs: https://vercel.com/[your-username]/doremi-eng-mstudiotb/logs
- Analytics: https://vercel.com/[your-username]/doremi-eng-mstudiotb/analytics

## 🆘 Troubleshooting

### Lỗi: "Module not found"
```bash
# Xóa cache và rebuild
rm -rf .next node_modules
npm install
npm run build
vercel --prod
```

### Lỗi: "MongoDB connection failed"
- Kiểm tra MONGODB_URI đúng format
- Kiểm tra Network Access trên MongoDB Atlas
- Kiểm tra username/password không có ký tự đặc biệt (cần encode)

### Lỗi: "API route timeout"
- Tối ưu code trong API route
- Giảm thời gian xử lý xuống dưới 10 giây
- Cân nhắc dùng Vercel Edge Functions

## ✅ Checklist Hoàn Thành

- [x] Build thành công không lỗi
- [x] Xác định biến môi trường cần thiết
- [x] Cài đặt Vercel CLI
- [x] Tạo file vercel.json
- [x] Xác nhận file tĩnh đầy đủ
- [ ] Thêm biến môi trường vào Vercel Dashboard
- [ ] Deploy lên Vercel
- [ ] Test trên điện thoại

---

**Sẵn sàng deploy! 🎉**

Chạy lệnh sau để bắt đầu:
```bash
vercel login
vercel
```
