# 📱 Hướng Dẫn Build APK - DOREMI ENG

## ✅ Đã Hoàn Thành

- [x] Cài đặt Capacitor
- [x] Tạo HTML wrapper (mở web Vercel trong app)
- [x] Thêm Android platform
- [x] Cấu hình cơ bản

---

## 🎯 Bước Tiếp Theo: Build APK

### **Bước 1: Cập nhật URL Vercel**

Sau khi deploy lên Vercel, bạn cần cập nhật URL trong file wrapper:

**File:** `out/index.html`  
**Dòng 186:** Thay `https://doremi-eng-mstudiotb.vercel.app` bằng URL Vercel thực tế của bạn

```javascript
const APP_URL = 'https://your-actual-vercel-url.vercel.app';
```

---

### **Bước 2: Sync lại files**

Sau khi cập nhật URL, chạy lệnh:

```bash
npx cap sync android
```

---

### **Bước 3: Mở Android Studio**

```bash
npx cap open android
```

Hoặc mở thủ công:
- Mở Android Studio
- Chọn **Open an Existing Project**
- Chọn thư mục: `C:\Users\MSTUDIOTB\Desktop\HOCTIENGANH\android`

---

### **Bước 4: Cấu hình Android Studio**

#### 4.1. Đợi Gradle Sync hoàn tất
- Android Studio sẽ tự động sync Gradle
- Đợi cho đến khi thấy "Gradle sync finished" ở thanh dưới

#### 4.2. Cấu hình App Icon (Tùy chọn)
- Vào `android/app/src/main/res/`
- Thay thế icon mặc định bằng logo của bạn
- Hoặc dùng **Image Asset Studio**: Right-click `res` → New → Image Asset

#### 4.3. Cấu hình App Name & Version
**File:** `android/app/build.gradle`

Tìm và sửa:
```gradle
android {
    defaultConfig {
        applicationId "com.mstudiotb.doremi"
        versionCode 1
        versionName "1.0.0"
    }
}
```

---

### **Bước 5: Build APK**

#### Option 1: Debug APK (Nhanh - Để test)
1. Trong Android Studio: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Đợi build hoàn tất (2-5 phút)
3. Nhấn **locate** để mở thư mục chứa APK
4. File APK ở: `android/app/build/outputs/apk/debug/app-debug.apk`

#### Option 2: Release APK (Chính thức - Để phát hành)
1. Tạo keystore (chỉ làm 1 lần):
```bash
keytool -genkey -v -keystore doremi-release-key.keystore -alias doremi -keyalg RSA -keysize 2048 -validity 10000
```

2. Tạo file `android/key.properties`:
```properties
storePassword=your-password
keyPassword=your-password
keyAlias=doremi
storeFile=../doremi-release-key.keystore
```

3. Cập nhật `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

4. Build Release APK:
   - **Build** → **Generate Signed Bundle / APK**
   - Chọn **APK**
   - Chọn keystore và nhập password
   - Chọn **release** build variant
   - File APK ở: `android/app/build/outputs/apk/release/app-release.apk`

---

### **Bước 6: Test APK**

#### Cài trên điện thoại:
1. Bật **Developer Options** và **USB Debugging** trên điện thoại
2. Kết nối điện thoại với máy tính
3. Trong Android Studio: **Run** → **Run 'app'**

Hoặc:
1. Copy file APK vào điện thoại
2. Mở file APK và cài đặt
3. Cho phép "Install from Unknown Sources" nếu cần

---

## 📋 Checklist Hoàn Chỉnh

### Trước khi build:
- [ ] Đã deploy web app lên Vercel
- [ ] Đã cập nhật URL Vercel trong `out/index.html`
- [ ] Đã chạy `npx cap sync android`
- [ ] Đã cài Android Studio

### Build APK:
- [ ] Mở project trong Android Studio
- [ ] Đợi Gradle sync xong
- [ ] Build APK (Debug hoặc Release)
- [ ] Test APK trên điện thoại thật

### Kiểm tra app:
- [ ] App mở được và hiển thị splash screen
- [ ] App load được web từ Vercel
- [ ] Tất cả tính năng hoạt động bình thường
- [ ] Không có lỗi kết nối

---

## 🔧 Troubleshooting

### Lỗi: "SDK location not found"
**Giải pháp:** Tạo file `android/local.properties`:
```properties
sdk.dir=C\:\\Users\\MSTUDIOTB\\AppData\\Local\\Android\\Sdk
```

### Lỗi: Gradle build failed
**Giải pháp:**
1. Mở terminal trong Android Studio
2. Chạy: `./gradlew clean`
3. Chạy: `./gradlew build`

### Lỗi: App không load được web
**Giải pháp:**
1. Kiểm tra URL trong `out/index.html` đúng chưa
2. Kiểm tra điện thoại có internet không
3. Kiểm tra web Vercel có hoạt động không

### Lỗi: "Cleartext HTTP traffic not permitted"
**Giải pháp:** Đảm bảo dùng HTTPS (Vercel mặc định là HTTPS)

---

## 📱 Thông Tin App

- **App Name:** DOREMI ENG
- **Package ID:** com.mstudiotb.doremi
- **Type:** Hybrid App (WebView wrapper)
- **Requires:** Internet connection
- **Platform:** Android 5.0+ (API 21+)

---

## 🎨 Tùy Chỉnh Thêm

### Thay đổi màu splash screen:
**File:** `android/app/src/main/res/values/styles.xml`

### Thay đổi icon:
**Thư mục:** `android/app/src/main/res/mipmap-*/`

### Thêm permissions:
**File:** `android/app/src/main/AndroidManifest.xml`

---

## 📦 Kích Thước APK Dự Kiến

- **Debug APK:** ~5-7 MB
- **Release APK:** ~3-5 MB (sau khi minify)

---

## 🚀 Sẵn Sàng Build?

1. **Deploy web lên Vercel trước** (xem `VERCEL_DEPLOY_CHECKLIST.md`)
2. **Cập nhật URL** trong `out/index.html`
3. **Sync:** `npx cap sync android`
4. **Mở Android Studio:** `npx cap open android`
5. **Build APK!**

---

## 💡 Lưu Ý Quan Trọng

⚠️ **App này cần internet để hoạt động** vì nó load web từ Vercel

✅ **Ưu điểm:**
- Dễ cập nhật (chỉ cần deploy Vercel, không cần build APK mới)
- Nhẹ (APK chỉ ~5MB)
- Đồng bộ với web app

❌ **Nhược điểm:**
- Cần internet
- Không thể dùng offline
- Phụ thuộc vào Vercel uptime

---

**Phát triển bởi:** TJN MSTUDIOTB  
**Ngày tạo:** 03/05/2026
