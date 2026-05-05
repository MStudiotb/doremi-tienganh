# ✅ CHECKLIST CUỐI CÙNG - BUILD APK KHÔNG BỊ LỖI 404

## 🔍 ĐÃ KIỂM TRA VÀ XÁC NHẬN

### 1. ✅ Cấu hình Capacitor (`capacitor.config.ts`)
```typescript
server: {
  url: 'https://doremi-eng-v2.vercel.app',
  cleartext: true
}
```
**Trạng thái:** ✅ ĐÚNG

### 2. ✅ File Config trong Android (`android/app/src/main/assets/capacitor.config.json`)
```json
{
  "server": {
    "url": "https://doremi-eng-v2.vercel.app",
    "cleartext": true
  }
}
```
**Trạng thái:** ✅ ĐÃ SYNC

### 3. ✅ AndroidManifest.xml
- ✅ Có permission INTERNET
- ✅ Không có cấu hình ghi đè URL
- ✅ App name đúng: "DOREMI - TIẾNG ANH"

### 4. ✅ Đã Sync Lại
- ✅ Chạy `npx cap sync android` thành công
- ✅ Cấu hình mới nhất đã được copy vào Android

## 🚨 QUAN TRỌNG: KIỂM TRA TRƯỚC KHI BUILD

### Bước 1: Test URL Vercel
**Mở trình duyệt và truy cập:**
```
https://doremi-eng-v2.vercel.app
```

**Kết quả mong đợi:**
- ✅ Trang web load thành công
- ✅ Hiển thị giao diện DOREMI - TIẾNG ANH
- ✅ Có thể đăng nhập/đăng ký

**Nếu gặp lỗi 404 trên trình duyệt:**
- ❌ URL Vercel không hoạt động
- ❌ Cần kiểm tra lại deployment trên Vercel
- ❌ APK sẽ KHÔNG hoạt động cho đến khi URL Vercel được fix

### Bước 2: Kiểm tra Deployment trên Vercel
1. Đăng nhập vào https://vercel.com
2. Vào project "doremi-eng-v2"
3. Kiểm tra tab "Deployments"
4. Đảm bảo deployment mới nhất có status "Ready" (màu xanh)
5. Click vào deployment và test URL

## 📱 CÁC BƯỚC BUILD APK TRONG ANDROID STUDIO

### Bước 1: Sync Gradle (Nếu Cần)
Nếu Android Studio hiển thị "Gradle files have changed":
1. Click "Sync Now"
2. Đợi sync hoàn tất

### Bước 2: Clean Project (BẮT BUỘC)
1. **Build** → **Clean Project**
2. Đợi clean xong (khoảng 10-30 giây)

### Bước 3: Rebuild Project (BẮT BUỘC)
1. **Build** → **Rebuild Project**
2. Đợi rebuild xong (khoảng 1-3 phút)
3. Kiểm tra không có lỗi trong tab "Build"

### Bước 4: Build APK
1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Đợi build xong (khoảng 2-5 phút)
3. Click **locate** để mở thư mục chứa APK

### Bước 5: Tìm File APK
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 🧪 TEST APK TRÊN ĐIỆN THOẠI

### Bước 1: Cài Đặt APK
1. Copy file APK vào điện thoại
2. Bật "Cài đặt từ nguồn không xác định"
3. Cài đặt APK

### Bước 2: Kiểm Tra Kết Nối Internet
- ✅ Đảm bảo điện thoại có kết nối WiFi hoặc 4G
- ✅ Test bằng cách mở trình duyệt và truy cập Google

### Bước 3: Mở App
1. Mở app "DOREMI - TIẾNG ANH"
2. **Lần đầu mở sẽ mất 3-5 giây** để load từ Vercel
3. Quan sát màn hình:

**Nếu thành công:**
- ✅ Hiển thị giao diện DOREMI - TIẾNG ANH
- ✅ Có thể đăng nhập/đăng ký
- ✅ Các tính năng hoạt động bình thường

**Nếu vẫn lỗi 404:**
- ❌ Kiểm tra lại URL Vercel trên trình duyệt điện thoại
- ❌ Thử truy cập https://doremi-eng-v2.vercel.app từ trình duyệt điện thoại
- ❌ Nếu trình duyệt cũng lỗi 404 → Vấn đề ở Vercel deployment, không phải APK

## 🔧 TROUBLESHOOTING

### Vấn đề 1: App hiển thị màn hình trắng
**Nguyên nhân:** Đang load từ Vercel, cần đợi
**Giải pháp:** Đợi 5-10 giây, nếu vẫn trắng → kiểm tra kết nối internet

### Vấn đề 2: App báo lỗi 404
**Nguyên nhân:** URL Vercel không hoạt động
**Giải pháp:** 
1. Test URL trên trình duyệt: https://doremi-eng-v2.vercel.app
2. Nếu trình duyệt cũng lỗi → Fix deployment trên Vercel
3. Nếu trình duyệt OK nhưng app lỗi → Rebuild APK sau khi sync lại

### Vấn đề 3: App không kết nối được
**Nguyên nhân:** Không có internet hoặc firewall chặn
**Giải pháp:**
1. Kiểm tra kết nối internet
2. Thử tắt VPN nếu đang bật
3. Thử chuyển từ WiFi sang 4G hoặc ngược lại

## ✅ XÁC NHẬN CUỐI CÙNG

Em đã kiểm tra và xác nhận:
- ✅ Cấu hình Capacitor đúng URL Vercel
- ✅ File config đã được sync vào Android
- ✅ AndroidManifest.xml không có vấn đề
- ✅ Tên app đã đổi thành "DOREMI - TIẾNG ANH"

**Bước tiếp theo của anh:**
1. Test URL Vercel trên trình duyệt trước
2. Nếu URL OK → Build APK trong Android Studio
3. Cài APK và test trên điện thoại

**Lưu ý:** Nếu URL Vercel không hoạt động trên trình duyệt, APK cũng sẽ không hoạt động. Cần fix deployment trên Vercel trước!
