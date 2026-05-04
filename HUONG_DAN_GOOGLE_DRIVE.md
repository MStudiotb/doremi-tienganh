# 📝 HƯỚNG DẪN NHANH - GOOGLE DRIVE API

## 🎯 Mục Đích
Tự động lưu thông tin người đăng ký lên Google Drive của bạn.

## ⚡ Các Bước Cài Đặt Nhanh

### 1️⃣ Tạo Project trên Google Cloud
- Truy cập: https://console.cloud.google.com/
- Tạo project mới: `DOREMI-HocTiengAnh`

### 2️⃣ Bật Google Drive API
- Vào **APIs & Services** → **Library**
- Tìm và Enable **Google Drive API**

### 3️⃣ Tạo Service Account
- Vào **APIs & Services** → **Credentials**
- Tạo **Service Account** với role **Editor**
- Tải file **credentials.json**

### 4️⃣ Cài Đặt Credentials
```bash
# Di chuyển file credentials.json vào thư mục gốc project
C:\Users\MSTUDIOTB\Desktop\HOCTIENGANH\credentials.json
```

### 5️⃣ Chia Sẻ Google Drive
- Mở file `credentials.json`, copy email Service Account
- Vào Google Drive, Share "My Drive" với email đó (quyền Editor)

### 6️⃣ Chạy Thử
```bash
npm run dev
```
- Truy cập: http://localhost:3000/auth
- Đăng ký tài khoản mới
- Kiểm tra Google Drive → Thư mục "User"

## ✅ Kết Quả
Mỗi lần đăng ký, file `.txt` sẽ tự động xuất hiện trong thư mục "User" trên Google Drive với định dạng:
```
[Tên_User]_[Ngày_Đăng_Ký].txt
```

## 🔒 Bảo Mật
- ❌ **KHÔNG** commit file `credentials.json` lên Git
- ✅ File đã được thêm vào `.gitignore`

## 📚 Tài Liệu Chi Tiết
Xem file: `GOOGLE_DRIVE_SETUP.md`

---
**Phát triển bởi: TJN MSTUDIOTB**
