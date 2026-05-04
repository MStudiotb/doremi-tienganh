# Hướng Dẫn Triển Khai DOREMI Lên Online - Hoàn Chỉnh

## 🚀 Tổng Quan

Hướng dẫn này sẽ giúp anh triển khai toàn bộ dự án DOREMI lên online để học sinh tại Thái Bình có thể truy cập qua Web và Điện thoại.

---

## 📋 Phần 1: Chuẩn Bị

### Yêu Cầu:
- ✅ Tài khoản GitHub
- ✅ Tài khoản Vercel (miễn phí)
- ✅ Tài khoản MongoDB Atlas (miễn phí)
- ✅ API Keys (Anthropic Claude, YouTube, v.v.)

---

## 🔧 Phần 2: Thiết Lập MongoDB Atlas

### Bước 1: Tạo Cluster MongoDB Atlas

1. **Truy cập**: https://www.mongodb.com/cloud/atlas
2. **Đăng ký/Đăng nhập** tài khoản
3. **Tạo Cluster mới**:
   - Chọn "Build a Database"
   - Chọn "M0 Sandbox" (FREE)
   - Chọn Region gần Việt Nam (Singapore hoặc Mumbai)
   - Đặt tên cluster: `doremi-cluster`

### Bước 2: Cấu Hình Security

1. **Database Access**:
   - Tạo user mới
   - Username: `doremi_admin`
   - Password: Tạo password mạnh (lưu lại)
   - Database User Privileges: `Read and write to any database`

2. **Network Access**:
   - Add IP Address
   - Chọn "Allow Access from Anywhere" (0.0.0.0/0)
   - Hoặc thêm IP của Vercel

### Bước 3: Lấy Connection String

1. Nhấn "Connect" trên cluster
2. Chọn "Connect your application"
3. Copy connection string:
```
mongodb+srv://doremi_admin:<password>@doremi-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
4. Thay `<password>` bằng password thực tế
5. Lưu lại để dùng cho Vercel

### Bước 4: Tạo Database và Collections

1. Vào "Browse Collections"
2. Tạo database mới: `doremi`
3. Tạo các collections:
   - `users` - Thông tin học sinh
   - `lessons` - Bài học
   - `weeklyTests` - Bài thi tuần
   - `testSubmissions` - Kết quả thi
   - `userProgress` - Tiến độ học
   - `notifications` - Thông báo
   - `vocabulary` - Từ vựng

---

## 📦 Phần 3: Đẩy Code Lên GitHub

### Bước 1: Tạo Repository GitHub

```bash
# Mở terminal tại thư mục dự án
cd C:\Users\MSTUDIOTB\Desktop\HOCTIENGANH

# Khởi tạo git (nếu chưa có)
git init

# Thêm remote repository
git remote add origin https://github.com/YOUR_USERNAME/doremi-eng-v2.git

# Hoặc nếu đã có remote, đổi tên
git remote set-url origin https://github.com/YOUR_USERNAME/doremi-eng-v2.git
```

### Bước 2: Tạo .gitignore

Đảm bảo file `.gitignore` có nội dung:
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env
credentials.json

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# capacitor
android/app/release/
android/app/debug/
ios/App/Pods/
```

### Bước 3: Commit và Push

```bash
# Add tất cả files
git add .

# Commit
git commit -m "Initial commit - DOREMI English Learning Platform"

# Push lên GitHub
git push -u origin main

# Nếu branch là master, đổi thành main
git branch -M main
git push -u origin main
```

---

## 🌐 Phần 4: Deploy Lên Vercel

### Bước 1: Kết Nối Vercel với GitHub

1. **Truy cập**: https://vercel.com
2. **Đăng nhập** bằng GitHub
3. **Import Project**:
   - Nhấn "Add New..." → "Project"
   - Chọn repository `doremi-eng-v2`
   - Nhấn "Import"

### Bước 2: Cấu Hình Project

1. **Framework Preset**: Next.js (tự động detect)
2. **Root Directory**: `./` (mặc định)
3. **Build Command**: `npm run build` (mặc định)
4. **Output Directory**: `.next` (mặc định)

### Bước 3: Cấu Hình Environment Variables

Trong phần "Environment Variables", thêm các biến sau:

#### MongoDB (BẮT BUỘC):
```
MONGODB_URI=mongodb+srv://doremi_admin:YOUR_PASSWORD@doremi-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=doremi
```

#### NextAuth (BẮT BUỘC):
```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-random-secret-key-here-generate-with-openssl
```

Tạo NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### Anthropic Claude AI (BẮT BUỘC cho AI chấm bài):
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

#### YouTube API (Tùy chọn - cho Video Learning):
```
YOUTUBE_API_KEY=your-youtube-api-key
```

#### 9Router API (Tùy chọn - cho Vocabulary Lookup):
```
NINEROUTER_API_KEY=your-9router-api-key
```

#### OpenAI (Tùy chọn - cho AI Image Generation):
```
OPENAI_API_KEY=sk-your-openai-key
```

#### Ollama (Tùy chọn - nếu dùng Cloudflare Tunnel):
```
OLLAMA_BASE_URL=https://your-tunnel-url.trycloudflare.com
```

### Bước 4: Deploy

1. Nhấn **"Deploy"**
2. Chờ 2-5 phút để Vercel build và deploy
3. Sau khi xong, bạn sẽ có URL: `https://doremi-eng-v2.vercel.app`

### Bước 5: Cấu Hình Domain (Tùy chọn)

Nếu muốn domain riêng:
1. Vào "Settings" → "Domains"
2. Thêm domain của bạn (ví dụ: doremi.edu.vn)
3. Cấu hình DNS theo hướng dẫn của Vercel

---

## 📱 Phần 5: Tối Ưu Responsive & PWA

### Bước 1: Kiểm Tra Responsive

Đã được tối ưu cho:
- ✅ Desktop (1920x1080)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667, 414x896)

Test trên:
- Chrome DevTools (F12 → Toggle Device Toolbar)
- Điện thoại thật

### Bước 2: Cấu Hình PWA

File `public/manifest.json` đã có sẵn:
```json
{
  "name": "DOREMI English Learning",
  "short_name": "DOREMI",
  "description": "Học tiếng Anh cùng Doremi và đám bạn",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0514",
  "theme_color": "#b855f5",
  "icons": [
    {
      "src": "/icon-light-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/logo.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Bước 3: Thêm vào Màn Hình Chính

**Trên Android:**
1. Mở web trên Chrome
2. Nhấn menu (3 chấm)
3. Chọn "Add to Home screen"
4. Đặt tên và nhấn "Add"

**Trên iOS:**
1. Mở web trên Safari
2. Nhấn nút Share
3. Chọn "Add to Home Screen"
4. Đặt tên và nhấn "Add"

---

## 📦 Phần 6: Build APK với Capacitor

### Bước 1: Cài Đặt Android Studio

1. Download: https://developer.android.com/studio
2. Cài đặt Android Studio
3. Cài đặt Android SDK (API 33 trở lên)
4. Cài đặt Java JDK 17

### Bước 2: Cấu Hình Capacitor

File `capacitor.config.ts` đã có sẵn:
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.doremi.english',
  appName: 'DOREMI English',
  webDir: 'out',
  server: {
    url: 'https://doremi-eng-v2.vercel.app',
    cleartext: true
  }
};

export default config;
```

### Bước 3: Build Next.js

```bash
# Build Next.js với static export
npm run build

# Tạo thư mục out
npx next export
```

### Bước 4: Sync với Capacitor

```bash
# Sync web assets với Android
npx cap sync android

# Mở Android Studio
npx cap open android
```

### Bước 5: Build APK trong Android Studio

1. **Trong Android Studio**:
   - File → Project Structure
   - Modules → app → Default Config
   - Version Code: 1
   - Version Name: 1.0.0

2. **Build APK**:
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Chờ build xong (2-5 phút)
   - APK sẽ ở: `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Build Release APK** (cho production):
   - Build → Generate Signed Bundle / APK
   - Chọn APK
   - Tạo keystore mới hoặc dùng có sẵn
   - Build
   - APK sẽ ở: `android/app/release/app-release.apk`

### Bước 6: Test APK

1. Copy APK vào điện thoại
2. Cài đặt (cho phép "Unknown sources")
3. Mở app và test các tính năng

---

## ✅ Phần 7: Kiểm Tra Tính Năng Admin

### Test trên Production:

1. **Đăng nhập Admin**:
   - Email: `mstudiotb@gmail.com`
   - Password: (password của anh)

2. **Test Roadmap Admin**:
   - Vào `/roadmap`
   - Hover vào lớp → Nút "Cập nhật" hiện
   - Upload file PDF/Word/JSON
   - Kiểm tra AI parsing
   - Verify bài học mới xuất hiện

3. **Test Weekly Tests Admin**:
   - Vào `/weekly-tests`
   - Nhấn nút Edit → Sửa JSON
   - Long press 3s → Nút X hiện
   - Xóa bài thi → Verify cascade deletion

4. **Test trên Mobile**:
   - Mở web/app trên điện thoại
   - Test tất cả tính năng admin
   - Verify responsive design
   - Test IndexedDB cho PDF

---

## 🔍 Phần 8: Monitoring & Maintenance

### Vercel Dashboard:

1. **Analytics**: Xem số lượng visitors
2. **Logs**: Kiểm tra lỗi runtime
3. **Deployments**: Lịch sử deploy
4. **Environment Variables**: Quản lý biến môi trường

### MongoDB Atlas Dashboard:

1. **Metrics**: CPU, Memory, Connections
2. **Collections**: Xem dữ liệu
3. **Backup**: Tự động backup hàng ngày
4. **Alerts**: Cảnh báo khi có vấn đề

---

## 🚨 Xử Lý Lỗi Thường Gặp

### 1. Build Failed trên Vercel

**Lỗi**: `Module not found`
```bash
# Fix: Cài đặt lại dependencies
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### 2. MongoDB Connection Failed

**Lỗi**: `MongoServerError: Authentication failed`
- Kiểm tra username/password
- Kiểm tra IP whitelist
- Verify connection string

### 3. Environment Variables không hoạt động

- Redeploy sau khi thêm env vars
- Kiểm tra tên biến (case-sensitive)
- Verify giá trị không có khoảng trắng thừa

### 4. APK không cài được

- Enable "Unknown sources" trong Settings
- Kiểm tra Android version (tối thiểu Android 7.0)
- Build lại với signing key

### 5. IndexedDB không hoạt động trên mobile

- Kiểm tra HTTPS (bắt buộc cho IndexedDB)
- Clear browser cache
- Test trên Chrome mobile

---

## 📊 Phần 9: Performance Optimization

### Đã Tối Ưu:

1. **Next.js Image Optimization**: Tự động optimize images
2. **Code Splitting**: Lazy load components
3. **Static Generation**: Pre-render pages
4. **CDN**: Vercel Edge Network
5. **Caching**: Browser và server-side caching

### Metrics Mục Tiêu:

- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3s
- ✅ Lighthouse Score: > 90

---

## 🎯 Phần 10: Checklist Hoàn Thành

### Pre-Deployment:
- [ ] MongoDB Atlas đã setup
- [ ] Environment variables đã chuẩn bị
- [ ] Code đã push lên GitHub
- [ ] .gitignore đã cấu hình đúng

### Deployment:
- [ ] Vercel đã kết nối với GitHub
- [ ] Environment variables đã thêm vào Vercel
- [ ] Deploy thành công
- [ ] URL production đã hoạt động

### Testing:
- [ ] Test responsive trên mobile/tablet/desktop
- [ ] Test PWA "Add to Home Screen"
- [ ] Test admin features trên production
- [ ] Test IndexedDB trên mobile browser
- [ ] Test all API endpoints

### APK:
- [ ] Capacitor đã sync
- [ ] APK đã build thành công
- [ ] APK đã test trên điện thoại thật
- [ ] APK đã upload lên Google Drive/Dropbox

### Documentation:
- [ ] README.md đã cập nhật
- [ ] Deployment guide đã hoàn chỉnh
- [ ] Admin guide đã cung cấp
- [ ] User guide đã tạo

---

## 📞 Hỗ Trợ

### Links Quan Trọng:

- **Web Production**: https://doremi-eng-v2.vercel.app
- **GitHub Repo**: https://github.com/YOUR_USERNAME/doremi-eng-v2
- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com

### Liên Hệ:

- **Developer**: TJN MSTUDIOTB
- **Email**: mstudiotb@gmail.com

---

## 🎉 Kết Luận

Sau khi hoàn thành tất cả các bước trên, anh sẽ có:

1. ✅ **Website**: https://doremi-eng-v2.vercel.app
2. ✅ **APK File**: `app-release.apk` để cài đặt trên Android
3. ✅ **PWA**: Có thể "Add to Home Screen" trên iOS/Android
4. ✅ **Auto-Deploy**: Mỗi lần push code, Vercel tự động deploy
5. ✅ **Admin Panel**: Đầy đủ tính năng quản lý
6. ✅ **Mobile Optimized**: Hoạt động mượt mà trên mọi thiết bị

**Chúc anh triển khai thành công! 🚀**
