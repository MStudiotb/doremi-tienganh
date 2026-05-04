# 🚀 Hướng dẫn cấu hình MongoDB Atlas cho Vercel

## ✅ Đã hoàn thành

- ✅ Dự án HOCTIENGANH đang chạy đúng thư mục
- ✅ MongoDB local đang hoạt động (127.0.0.1:27017)
- ✅ Đã import 183 videos vào database local
- ✅ Server đang chạy tại http://localhost:3000

## 📝 Vấn đề DNS với MongoDB Atlas

Máy local của anh gặp vấn đề DNS resolution khi kết nối MongoDB Atlas:
- Lỗi: `ENOTFOUND hoctienganh-shard-00-00.fyuwokm.mongodb.net`
- Nguyên nhân: Network/Firewall/DNS của máy local không thể resolve MongoDB Atlas domain

## 💡 Giải pháp

**Development (Local):** Dùng MongoDB local
**Production (Vercel):** Dùng MongoDB Atlas (Vercel có network tốt hơn)

## 🔧 Cấu hình Vercel Environment Variables

Khi deploy lên Vercel, anh cần thêm các biến môi trường sau:

### Bước 1: Vào Vercel Dashboard
1. Truy cập: https://vercel.com/dashboard
2. Chọn project **DOREMI-TIENGANH**
3. Vào **Settings** → **Environment Variables**

### Bước 2: Thêm MongoDB Atlas Variables

**Option 1: Standard Connection String (Khuyến nghị)**
```
MONGODB_URI=mongodb://mstudiotb_db_hoctienganh:rEhv4V1c1ClJIr0B@hoctienganh-shard-00-00.fyuwokm.mongodb.net:27017,hoctienganh-shard-00-01.fyuwokm.mongodb.net:27017,hoctienganh-shard-00-02.fyuwokm.mongodb.net:27017/?ssl=true&replicaSet=atlas-xxxxxx-shard-0&authSource=admin&retryWrites=true&w=majority

MONGODB_DB=mstudiotb_db_hoctienganh
```

**Option 2: SRV Connection String (Nếu Option 1 không work)**
```
MONGODB_URI=mongodb+srv://mstudiotb_db_hoctienganh:rEhv4V1c1ClJIr0B@hoctienganh.fyuwokm.mongodb.net/?retryWrites=true&w=majority&appName=hoctienganh

MONGODB_DB=mstudiotb_db_hoctienganh
```

### Bước 3: Thêm các biến khác (nếu cần)

```
YOUTUBE_API_KEY=AIzaSyBZw8QRUe15tblPmZqLMGzs8XOcG4ngAus

OPENAI_API_KEY=sk-af4879ad86c895bc-8xliu9-550acb94
OPENAI_API_BASE=http://localhost:20128/v1
```

**Lưu ý:** `OPENAI_API_BASE` với localhost sẽ không hoạt động trên Vercel. Anh cần:
- Hoặc dùng OpenAI API chính thức
- Hoặc setup Ollama với Cloudflare Tunnel (xem file OLLAMA_TUNNEL_SETUP.md)

### Bước 4: Apply cho tất cả environments

Chọn:
- ✅ Production
- ✅ Preview
- ✅ Development

Click **Save**

## 📤 Deploy lên Vercel

### Cách 1: Deploy từ GitHub (Khuyến nghị)

```bash
# Commit và push code
git add .
git commit -m "Update MongoDB Atlas configuration"
git push origin main
```

Vercel sẽ tự động deploy khi có commit mới.

### Cách 2: Deploy trực tiếp

```bash
# Cài Vercel CLI (nếu chưa có)
npm i -g vercel

# Deploy
vercel --prod
```

## 🔍 Kiểm tra sau khi deploy

1. Vào https://doremi-tienganh.vercel.app
2. Kiểm tra xem app có hiển thị 183 videos không
3. Nếu không thấy, check logs:
   - Vercel Dashboard → Project → Deployments → Click vào deployment mới nhất → View Function Logs

## 📊 Import dữ liệu lên MongoDB Atlas

Nếu anh muốn import dữ liệu từ local lên Atlas:

### Cách 1: Dùng MongoDB Compass
1. Mở MongoDB Compass
2. Connect đến MongoDB local: `mongodb://127.0.0.1:27017`
3. Export collection `videos` ra file JSON
4. Connect đến MongoDB Atlas (dùng connection string)
5. Import file JSON vào collection `videos`

### Cách 2: Dùng mongodump/mongorestore

```bash
# Export từ local
mongodump --uri="mongodb://127.0.0.1:27017/hoctienganh" --out=./backup

# Import lên Atlas
mongorestore --uri="mongodb+srv://mstudiotb_db_hoctienganh:rEhv4V1c1ClJIr0B@hoctienganh.fyuwokm.mongodb.net/" ./backup
```

### Cách 3: Chạy script import trực tiếp trên Vercel

Sau khi deploy, anh có thể:
1. Tạm thời enable MongoDB Atlas trong .env.local
2. Deploy lên Vercel
3. Truy cập: https://doremi-tienganh.vercel.app/api/videos (POST request với data)

## 🎯 Tóm tắt

- ✅ **Local Development:** MongoDB local (127.0.0.1:27017)
- ✅ **Production (Vercel):** MongoDB Atlas (cloud)
- ✅ Đã có 183 videos trong database local
- ⏳ Cần cấu hình Environment Variables trên Vercel
- ⏳ Cần import dữ liệu lên MongoDB Atlas

## 📱 Build APK

Sau khi Vercel hoạt động ổn định, anh có thể build APK:

```bash
# Cập nhật capacitor.config.ts với URL Vercel
# Sau đó build
npm run build
npx cap sync android
npx cap open android
```

Trong Android Studio, build APK như bình thường.

---

**Lưu ý quan trọng:** 
- MongoDB Atlas connection string đã được lưu trong file này
- Khi deploy Vercel, nhớ thêm vào Environment Variables
- Không commit file .env.local lên GitHub (đã có trong .gitignore)
