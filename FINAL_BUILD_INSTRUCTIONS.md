# ✅ HƯỚNG DẪN BUILD APK CUỐI CÙNG - "DOREMI - TIẾNG ANH"

## 🎯 ĐÃ CẬP NHẬT URL VERCEL CHÍNH XÁC

**URL Production đúng:** `https://doremi-tienganh.vercel.app`

## ✅ CÁC THAY ĐỔI ĐÃ HOÀN THÀNH

### 1. ✅ Cập Nhật Capacitor Config
**File:** `capacitor.config.ts`
```typescript
server: {
  url: 'https://doremi-tienganh.vercel.app',  // ✅ URL chính xác
  cleartext: true
}
```

### 2. ✅ Cập Nhật API Config
**File:** `lib/api-config.ts`
```typescript
export const API_BASE_URL = 'https://doremi-tienganh.vercel.app';  // ✅ URL chính xác
```

### 3. ✅ Đồng Bộ Với Android
```bash
npx cap copy android  # ✅ Đã chạy thành công
```

### 4. ✅ Mobile UI Fixes (Đã Hoàn Thành Trước Đó)
- ✅ Sidebar ẩn mặc định trên mobile
- ✅ Hamburger menu hoạt động
- ✅ Banner text không bị xoay dọc
- ✅ Bottom navigation cho mobile
- ✅ Responsive padding và layout

### 5. ✅ Tên App
**Hiển thị trên điện thoại:** "DOREMI - TIẾNG ANH"

## 🧪 KIỂM TRA TRƯỚC KHI BUILD

### Bước 1: Test URL Vercel
Mở trình duyệt và truy cập:
```
https://doremi-tienganh.vercel.app
```

**Kết quả mong đợi:**
- ✅ Trang web load thành công
- ✅ Hiển thị giao diện DOREMI - TIẾNG ANH
- ✅ Có thể đăng nhập/đăng ký

**Nếu URL hoạt động → APK sẽ hoạt động tốt!**

## 📱 CÁC BƯỚC BUILD APK TRONG ANDROID STUDIO

### Bước 1: Sync Gradle (Nếu Cần)
Nếu Android Studio hiển thị "Gradle files have changed":
1. Click **"Sync Now"**
2. Đợi sync hoàn tất (30 giây - 1 phút)

### Bước 2: Clean Project (BẮT BUỘC!)
1. Trong Android Studio, chọn menu: **Build** → **Clean Project**
2. Đợi clean xong (khoảng 10-30 giây)
3. Kiểm tra không có lỗi trong tab "Build"

### Bước 3: Rebuild Project (BẮT BUỘC!)
1. Chọn menu: **Build** → **Rebuild Project**
2. Đợi rebuild xong (khoảng 1-3 phút)
3. Kiểm tra không có lỗi trong tab "Build"

### Bước 4: Build APK
1. Chọn menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Đợi quá trình build hoàn tất (2-5 phút)
3. Khi build xong, sẽ có thông báo "APK(s) generated successfully"
4. Click **"locate"** để mở thư mục chứa APK

### Bước 5: Tìm File APK
File APK sẽ nằm tại:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Bước 6: Copy APK Ra Desktop (Tùy Chọn)
Để dễ tìm, anh có thể copy APK ra Desktop:
```bash
copy android\app\build\outputs\apk\debug\app-debug.apk %USERPROFILE%\Desktop\DOREMI-TIENGANH.apk
```

## 🎯 ĐẶC ĐIỂM CỦA APK NÀY

### ✅ Ưu Điểm:
1. **Tên app:** "DOREMI - TIẾNG ANH" (hiển thị đúng trên màn hình điện thoại)
2. **URL chính xác:** Load từ `https://doremi-tienganh.vercel.app`
3. **Đầy đủ tính năng:**
   - ✅ Đăng nhập/Đăng ký
   - ✅ AI chấm điểm
   - ✅ Lưu tiến độ học tập
   - ✅ Hiệu ứng pháo hoa
   - ✅ Tính năng ấn giữ 3 giây
   - ✅ Upload nội dung
   - ✅ Responsive design hoàn chỉnh

4. **Mobile UI tối ưu:**
   - ✅ Sidebar ẩn mặc định, có hamburger menu
   - ✅ Banner text hiển thị đúng (không xoay dọc)
   - ✅ Bottom navigation tiện lợi
   - ✅ Layout responsive hoàn hảo

### ⚠️ Yêu Cầu:
- **Cần kết nối Internet:** App load từ server Vercel
- **URL phải hoạt động:** Đảm bảo `https://doremi-tienganh.vercel.app` đang online

## 🧪 TEST APK TRÊN ĐIỆN THOẠI

### Bước 1: Cài Đặt APK
1. Copy file `app-debug.apk` vào điện thoại (qua USB, Bluetooth, hoặc email)
2. Trên điện thoại, bật **"Cài đặt từ nguồn không xác định"**:
   - Settings → Security → Unknown Sources → Enable
3. Mở file APK và cài đặt

### Bước 2: Kiểm Tra Kết Nối Internet
- ✅ Đảm bảo điện thoại có kết nối WiFi hoặc 4G
- ✅ Test bằng cách mở trình duyệt và truy cập Google

### Bước 3: Mở App
1. Tìm app **"DOREMI - TIẾNG ANH"** trên màn hình điện thoại
2. Mở app
3. **Lần đầu mở sẽ mất 3-5 giây** để load từ Vercel
4. Quan sát màn hình

### Bước 4: Kiểm Tra Các Tính Năng

**Test cơ bản:**
- ✅ App hiển thị giao diện chính
- ✅ Sidebar ẩn mặc định (chỉ hiện khi bấm hamburger menu)
- ✅ Banner text hiển thị đúng (không bị xoay)
- ✅ Bottom navigation hoạt động

**Test đăng nhập:**
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập
- ✅ Xem thông tin user

**Test học tập:**
- ✅ Vào roadmap
- ✅ Chọn bài học
- ✅ Làm bài tập
- ✅ Kiểm tra hiệu ứng pháo hoa khi hoàn thành

## 🔧 TROUBLESHOOTING

### Vấn đề 1: App hiển thị màn hình trắng
**Nguyên nhân:** Đang load từ Vercel, cần đợi
**Giải pháp:** 
- Đợi 5-10 giây
- Nếu vẫn trắng → Kiểm tra kết nối internet
- Thử tắt app và mở lại

### Vấn đề 2: App báo lỗi 404
**Nguyên nhân:** URL Vercel không hoạt động
**Giải pháp:** 
1. Test URL trên trình duyệt điện thoại: `https://doremi-tienganh.vercel.app`
2. Nếu trình duyệt cũng lỗi → Vấn đề ở Vercel deployment
3. Kiểm tra deployment trên Vercel dashboard

### Vấn đề 3: App không kết nối được
**Nguyên nhân:** Không có internet hoặc firewall chặn
**Giải pháp:**
1. Kiểm tra kết nối internet
2. Thử tắt VPN nếu đang bật
3. Thử chuyển từ WiFi sang 4G hoặc ngược lại
4. Kiểm tra firewall/antivirus

### Vấn đề 4: Sidebar vẫn hiển thị trên mobile
**Nguyên nhân:** Cache cũ hoặc build không đúng
**Giải pháp:**
1. Uninstall app cũ hoàn toàn
2. Cài lại APK mới
3. Clear cache của app (Settings → Apps → DOREMI → Clear Cache)

## 📊 THÔNG TIN KỸ THUẬT

### Cấu Hình:
- **App ID:** `com.mstudiotb.doremi`
- **App Name:** `DOREMI - TIẾNG ANH`
- **Server URL:** `https://doremi-tienganh.vercel.app`
- **Web Directory:** `out`
- **Platform:** Android

### Files Đã Cập Nhật:
1. ✅ `capacitor.config.ts` - Server URL
2. ✅ `lib/api-config.ts` - API Base URL
3. ✅ `android/app/src/main/res/values/strings.xml` - App Name
4. ✅ `android/app/src/main/assets/capacitor.config.json` - Synced Config

### Mobile UI Fixes (Đã Hoàn Thành):
1. ✅ `components/Sidebar.tsx` - Hamburger menu + responsive
2. ✅ `components/WelcomeBanner.tsx` - Responsive text
3. ✅ `app/(dashboard)/layout.tsx` - Responsive margin
4. ✅ `app/(dashboard)/page.tsx` - Responsive padding
5. ✅ `app/layout.tsx` - Viewport meta tag

## ✅ CHECKLIST CUỐI CÙNG

Trước khi build APK, đảm bảo:
- [x] URL Vercel chính xác: `https://doremi-tienganh.vercel.app`
- [x] Đã cập nhật `capacitor.config.ts`
- [x] Đã cập nhật `lib/api-config.ts`
- [x] Đã chạy `npx cap copy android`
- [x] Mobile UI fixes đã hoàn thành
- [x] Tên app: "DOREMI - TIẾNG ANH"

**Bây giờ anh có thể:**
1. ✅ Mở Android Studio (nếu chưa mở)
2. ✅ Clean Project
3. ✅ Rebuild Project
4. ✅ Build APK
5. ✅ Test trên điện thoại

## 🎉 KẾT LUẬN

Tất cả cấu hình đã hoàn tất và chính xác:
- ✅ URL Vercel đúng: `https://doremi-tienganh.vercel.app`
- ✅ Tên app đúng: "DOREMI - TIẾNG ANH"
- ✅ Mobile UI hoàn chỉnh
- ✅ Đã đồng bộ vào Android

**APK sẵn sàng để build! Chúc anh thành công! 🚀📱**

---

**Developer:** TJN MSTUDIOTB  
**Date:** 2026-05-05  
**Version:** Final - Correct URL
