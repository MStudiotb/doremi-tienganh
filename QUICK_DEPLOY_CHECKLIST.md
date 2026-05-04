# ✅ Checklist Triển Khai Nhanh DOREMI

## 🎯 Mục Tiêu
Deploy DOREMI lên online để học sinh Thái Bình truy cập qua Web và Mobile

---

## 📝 Bước 1: Chuẩn Bị (15 phút)

### MongoDB Atlas
- [ ] Tạo tài khoản tại https://www.mongodb.com/cloud/atlas
- [ ] Tạo cluster M0 (FREE) - Region: Singapore
- [ ] Tạo database user: `doremi_admin` với password mạnh
- [ ] Whitelist IP: 0.0.0.0/0 (Allow all)
- [ ] Copy connection string và lưu lại

**Connection String:**
```
mongodb+srv://doremi_admin:YOUR_PASSWORD@doremi-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### GitHub
- [ ] Tạo repository mới: `doremi-eng-v2`
- [ ] Copy URL: `https://github.com/YOUR_USERNAME/doremi-eng-v2.git`

### Vercel
- [ ] Tạo tài khoản tại https://vercel.com (dùng GitHub)
- [ ] Sẵn sàng import project

---

## 🚀 Bước 2: Deploy Code (10 phút)

### Push lên GitHub

**Option 1: Dùng Script (Khuyến nghị)**
```bash
# 1. Chạy script
deploy-to-github.bat

# 2. Nếu lần đầu, setup remote:
git remote add origin https://github.com/YOUR_USERNAME/doremi-eng-v2.git

# 3. Chạy lại script
deploy-to-github.bat
```

**Option 2: Manual**
```bash
git init
git add .
git commit -m "Initial commit - DOREMI Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/doremi-eng-v2.git
git push -u origin main
```

### Deploy trên Vercel

1. **Import Project**
   - [ ] Vào https://vercel.com/new
   - [ ] Chọn repository `doremi-eng-v2`
   - [ ] Nhấn "Import"

2. **Cấu Hình Environment Variables**
   
   Thêm các biến sau (Settings → Environment Variables):

   **BẮT BUỘC:**
   ```
   MONGODB_URI=mongodb+srv://doremi_admin:PASSWORD@doremi-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=doremi
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=[generate bằng: openssl rand -base64 32]
   ANTHROPIC_API_KEY=sk-ant-api03-your-key
   ```

   **TÙY CHỌN:**
   ```
   YOUTUBE_API_KEY=your-youtube-key
   NINEROUTER_API_KEY=your-9router-key
   OPENAI_API_KEY=sk-your-openai-key
   ```

3. **Deploy**
   - [ ] Nhấn "Deploy"
   - [ ] Chờ 3-5 phút
   - [ ] Lấy URL: `https://doremi-eng-v2.vercel.app`

---

## 📱 Bước 3: Build APK (30 phút)

### Cài Đặt Tools

- [ ] Android Studio: https://developer.android.com/studio
- [ ] Java JDK 17: https://www.oracle.com/java/technologies/downloads/

### Build APK

**Option 1: Dùng Script (Khuyến nghị)**
```bash
# Chạy script
build-apk.bat

# Sau đó mở Android Studio
npx cap open android

# Build APK trong Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

**Option 2: Manual**
```bash
# 1. Build Next.js
npm run build

# 2. Export static
npx next export

# 3. Sync Capacitor
npx cap sync android

# 4. Open Android Studio
npx cap open android

# 5. Build APK
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### Lấy APK
- [ ] APK location: `android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] Copy APK ra Desktop
- [ ] Upload lên Google Drive/Dropbox
- [ ] Chia sẻ link download

---

## ✅ Bước 4: Testing (15 phút)

### Test Web Production

**Desktop:**
- [ ] Mở `https://doremi-eng-v2.vercel.app`
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập
- [ ] Test Dashboard
- [ ] Test Roadmap
- [ ] Test Weekly Tests
- [ ] Test confetti effect (hoàn thành bài thi)

**Mobile Browser:**
- [ ] Mở web trên Chrome mobile
- [ ] Test responsive design
- [ ] Test "Add to Home Screen"
- [ ] Test IndexedDB (download PDF)
- [ ] Test all features

### Test Admin Features

**Đăng nhập Admin:**
- [ ] Email: `mstudiotb@gmail.com`
- [ ] Password: [your password]

**Test Roadmap Admin:**
- [ ] Vào `/roadmap`
- [ ] Hover vào lớp → Nút "Cập nhật" hiện
- [ ] Upload file JSON/Word/PDF
- [ ] Verify AI parsing
- [ ] Check bài học mới

**Test Weekly Tests Admin:**
- [ ] Vào `/weekly-tests`
- [ ] Nhấn nút Edit → Sửa JSON
- [ ] Long press 3s → Nút X hiện
- [ ] Xóa bài thi test
- [ ] Verify cascade deletion

### Test APK

- [ ] Cài APK trên điện thoại Android
- [ ] Mở app
- [ ] Test đăng nhập
- [ ] Test tất cả tính năng
- [ ] Verify performance

---

## 📊 Bước 5: Monitoring (Ongoing)

### Vercel Dashboard
- [ ] Check Analytics: Số visitors
- [ ] Check Logs: Lỗi runtime
- [ ] Check Performance: Load time

### MongoDB Atlas
- [ ] Check Metrics: CPU, Memory
- [ ] Check Collections: Data integrity
- [ ] Setup Alerts: Email notifications

---

## 🎉 Hoàn Thành!

### Deliverables:

✅ **Web URL**: https://doremi-eng-v2.vercel.app
✅ **APK File**: `app-debug.apk` hoặc `app-release.apk`
✅ **PWA**: Có thể "Add to Home Screen"
✅ **Auto-Deploy**: Push code → Auto deploy
✅ **Admin Panel**: Đầy đủ tính năng

### Chia Sẻ với Học Sinh:

**Web:**
```
🌐 Website: https://doremi-eng-v2.vercel.app
📱 Có thể thêm vào màn hình chính như app!
```

**APK:**
```
📦 Download APK: [Google Drive Link]
📱 Cài đặt trên Android (cho phép "Unknown sources")
```

---

## 🆘 Troubleshooting

### Build Failed
```bash
# Clear cache và rebuild
rm -rf .next node_modules
npm install
npm run build
```

### MongoDB Connection Error
- Kiểm tra username/password
- Kiểm tra IP whitelist (0.0.0.0/0)
- Verify connection string

### APK Không Cài Được
- Enable "Unknown sources" trong Settings
- Kiểm tra Android version (min: 7.0)
- Build lại với signing key

### Environment Variables Không Hoạt Động
- Redeploy sau khi thêm env vars
- Kiểm tra tên biến (case-sensitive)
- Verify không có khoảng trắng thừa

---

## 📞 Support

**Developer**: TJN MSTUDIOTB  
**Email**: mstudiotb@gmail.com  
**Docs**: Xem `DEPLOYMENT_GUIDE_COMPLETE.md` để biết chi tiết

---

## ⏱️ Tổng Thời Gian Ước Tính

- ⏰ Chuẩn bị: 15 phút
- ⏰ Deploy Web: 10 phút
- ⏰ Build APK: 30 phút
- ⏰ Testing: 15 phút
- **📊 TỔNG: ~70 phút (1 giờ 10 phút)**

---

**Chúc anh deploy thành công! 🚀**
