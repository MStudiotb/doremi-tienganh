# Hướng Dẫn Build APK - DOREMI - TIẾNG ANH

## ✅ Đã Hoàn Thành

1. ✅ Cập nhật tên ứng dụng thành "DOREMI - TIẾNG ANH" trong:
   - `android/app/src/main/res/values/strings.xml`
   - `capacitor.config.ts`

2. ✅ Cấu hình Capacitor để load từ server Vercel:
   - URL: `https://doremi-eng-v2.vercel.app`
   - App sẽ kết nối trực tiếp với server Vercel
   - Giữ nguyên 100% tính năng (AI, Database, Authentication, v.v.)

3. ✅ Đồng bộ cấu hình với Android project
4. ✅ Mở Android Studio

## 📱 Các Bước Build APK Trong Android Studio

### Bước 1: Đợi Android Studio Load Xong
- Đợi Android Studio load và sync Gradle hoàn tất
- Kiểm tra không có lỗi trong tab "Build" ở dưới cùng

### Bước 2: Build APK Debug (Để Test)
1. Trong Android Studio, chọn menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Đợi quá trình build hoàn tất (có thể mất 2-5 phút)
3. Khi build xong, sẽ có thông báo ở góc dưới bên phải
4. Click vào **locate** để mở thư mục chứa APK

### Bước 3: Tìm File APK
File APK sẽ nằm tại:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Bước 4: Build APK Release (Để Phát Hành)
Nếu muốn build bản release (tối ưu hơn, nhỏ hơn):

1. Chọn menu: **Build** → **Generate Signed Bundle / APK**
2. Chọn **APK** → Click **Next**
3. Nếu chưa có key store:
   - Click **Create new...**
   - Điền thông tin:
     - Key store path: Chọn nơi lưu file (ví dụ: `C:\Users\MSTUDIOTB\Desktop\doremi-keystore.jks`)
     - Password: Tạo mật khẩu (nhớ lưu lại!)
     - Alias: `doremi-key`
     - Validity: 25 years
     - Điền thông tin Organization (tùy ý)
   - Click **OK**
4. Click **Next**
5. Chọn **release** → Click **Finish**
6. File APK release sẽ nằm tại: `android/app/build/outputs/apk/release/app-release.apk`

## 🎯 Đặc Điểm APK Này

### ✅ Ưu Điểm:
- **Tên app**: "DOREMI - TIẾNG ANH" (hiển thị trên màn hình điện thoại)
- **Đầy đủ tính năng**: 
  - ✅ Đăng nhập/Đăng ký với MongoDB
  - ✅ AI chấm điểm và gợi ý
  - ✅ Lưu tiến độ học tập
  - ✅ Hiệu ứng pháo hoa khi hoàn thành
  - ✅ Tính năng ấn giữ 3 giây để xóa
  - ✅ Upload và quản lý nội dung
  - ✅ Responsive design cho mobile
- **Kết nối server**: Tất cả dữ liệu được đồng bộ với server Vercel

### ⚠️ Yêu Cầu:
- **Cần kết nối Internet**: App cần internet để hoạt động vì load từ server Vercel
- **Tốc độ**: Phụ thuộc vào tốc độ mạng của người dùng

## 🔧 Nếu Muốn Build Offline App (Không Cần Internet)

Nếu anh muốn app chạy offline hoàn toàn, cần:
1. Chuyển sang static export (mất một số tính năng server-side)
2. Hoặc tích hợp local database (SQLite) thay vì MongoDB
3. Hoặc sử dụng Capacitor Live Update để cache nội dung

Hiện tại phương án load từ Vercel là tốt nhất để giữ đầy đủ tính năng!

## 📦 Copy APK Ra Desktop

Sau khi build xong, anh có thể copy file APK ra Desktop:

**Cho Debug APK:**
```bash
copy android\app\build\outputs\apk\debug\app-debug.apk %USERPROFILE%\Desktop\DOREMI-TIENGANH-debug.apk
```

**Cho Release APK:**
```bash
copy android\app\build\outputs\apk\release\app-release.apk %USERPROFILE%\Desktop\DOREMI-TIENGANH-release.apk
```

## 🎉 Hoàn Tất!

Sau khi có file APK, anh có thể:
1. Cài đặt trực tiếp lên điện thoại Android (cần bật "Cài đặt từ nguồn không xác định")
2. Chia sẻ file APK cho người khác
3. Upload lên Google Play Store (cần bản release đã ký)

---

**Lưu ý**: Lần đầu cài đặt, Android sẽ cảnh báo "App không xác định" - đây là bình thường vì app chưa được Google xác minh. Chọn "Cài đặt" để tiếp tục.
