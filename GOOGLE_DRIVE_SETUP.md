# 🚀 Hướng Dẫn Cài Đặt Google Drive API

## 📋 Tổng Quan

Tính năng này tự động lưu thông tin người đăng ký lên Google Drive của bạn. Mỗi khi có người dùng mới đăng ký, hệ thống sẽ tạo một file `.txt` chứa thông tin chi tiết và tự động upload lên thư mục "User" trên Google Drive.

## 🎯 Tính Năng

✅ **Tự động lưu trữ**: Thông tin đăng ký được lưu ngay sau khi người dùng hoàn tất đăng ký  
✅ **Không chặn UI**: Upload diễn ra ở background, không làm chậm trải nghiệm người dùng  
✅ **Tự động tạo thư mục**: Hệ thống tự động tạo thư mục "User" nếu chưa tồn tại  
✅ **Định dạng file**: `[Tên_User]_[Ngày_Đăng_Ký].txt`  
✅ **Nội dung đầy đủ**: Họ tên, Email, Tuổi, Giới tính, Khối học, Ảnh đại diện, Ngày đăng ký

---

## 📝 Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn
3. Nhấn vào **"Select a project"** ở góc trên bên trái
4. Chọn **"New Project"**
5. Đặt tên project: `DOREMI-HocTiengAnh` (hoặc tên bạn muốn)
6. Nhấn **"Create"**

---

## 🔑 Bước 2: Kích Hoạt Google Drive API

1. Trong Google Cloud Console, vào menu bên trái
2. Chọn **"APIs & Services"** → **"Library"**
3. Tìm kiếm **"Google Drive API"**
4. Nhấn vào **"Google Drive API"**
5. Nhấn nút **"Enable"** để kích hoạt

---

## 🛡️ Bước 3: Tạo Service Account

1. Vào **"APIs & Services"** → **"Credentials"**
2. Nhấn **"Create Credentials"** → Chọn **"Service Account"**
3. Điền thông tin:
   - **Service account name**: `doremi-drive-service`
   - **Service account ID**: Tự động tạo
   - **Description**: `Service account for DOREMI user data backup`
4. Nhấn **"Create and Continue"**
5. Ở bước **"Grant this service account access to project"**:
   - Chọn role: **"Editor"** hoặc **"Owner"**
   - Nhấn **"Continue"**
6. Bỏ qua bước 3, nhấn **"Done"**

---

## 📥 Bước 4: Tải Credentials JSON

1. Trong trang **"Credentials"**, tìm Service Account vừa tạo
2. Nhấn vào tên Service Account
3. Chuyển sang tab **"Keys"**
4. Nhấn **"Add Key"** → **"Create new key"**
5. Chọn định dạng **JSON**
6. Nhấn **"Create"**
7. File `credentials.json` sẽ được tải về máy tính của bạn

---

## 📂 Bước 5: Cài Đặt Credentials Vào Project

1. **Di chuyển file `credentials.json`** vào thư mục gốc của project:
   ```
   C:\Users\MSTUDIOTB\Desktop\HOCTIENGANH\credentials.json
   ```

2. **Đảm bảo file nằm đúng vị trí**:
   ```
   HOCTIENGANH/
   ├── app/
   ├── components/
   ├── lib/
   ├── public/
   ├── credentials.json  ← File phải ở đây
   ├── package.json
   └── ...
   ```

3. **QUAN TRỌNG**: File `credentials.json` đã được thêm vào `.gitignore` để không bị commit lên Git

---

## 🔐 Bước 6: Chia Sẻ Quyền Truy Cập Google Drive

Để Service Account có thể upload file lên Google Drive của bạn:

1. Mở file `credentials.json` vừa tải về
2. Tìm dòng `"client_email"`, copy địa chỉ email (dạng: `xxx@xxx.iam.gserviceaccount.com`)
3. Mở [Google Drive](https://drive.google.com/)
4. Nhấn chuột phải vào **"My Drive"** hoặc thư mục bạn muốn chia sẻ
5. Chọn **"Share"**
6. Dán địa chỉ email Service Account vào ô **"Add people and groups"**
7. Chọn quyền: **"Editor"**
8. **BỎ CHỌN** "Notify people" (không cần gửi email thông báo)
9. Nhấn **"Share"**

---

## ✅ Bước 7: Kiểm Tra Cài Đặt

### Khởi động server:
```bash
npm run dev
```

### Thử nghiệm đăng ký:
1. Truy cập: `http://localhost:3000/auth`
2. Chuyển sang tab **"Đăng Ký"**
3. Điền đầy đủ thông tin:
   - Họ và Tên
   - Tuổi
   - Khối học
   - Giới tính
   - Email
   - Mật khẩu
4. Nhấn **"Tạo Tài Khoản"**
5. Xác nhận đăng ký

### Kiểm tra Google Drive:
1. Mở [Google Drive](https://drive.google.com/)
2. Tìm thư mục **"User"** (tự động tạo)
3. Kiểm tra file mới: `[Tên_User]_[Ngày].txt`
4. Mở file để xem thông tin đã lưu

---

## 📊 Cấu Trúc File Lưu Trữ

Mỗi file `.txt` sẽ có định dạng:

```
╔════════════════════════════════════════════════════════════╗
║           THÔNG TIN ĐĂNG KÝ HỌC VIÊN - DOREMI            ║
╚════════════════════════════════════════════════════════════╝

📋 THÔNG TIN CÁ NHÂN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Họ và Tên:           Nguyễn Văn A
📧 Email:               nguyenvana@example.com
🎂 Tuổi:                10
👥 Giới tính:           Nam

📚 THÔNG TIN HỌC TẬP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎓 Cấp độ bắt đầu:      Tập Sự
📖 Khối học:            Khối 5
🖼️  Ảnh đại diện:        /avatars/user-123456.jpg

⏰ THÔNG TIN ĐĂNG KÝ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 Ngày đăng ký:        3 tháng 5, 2026 lúc 04:30
🌐 Hệ thống:            DOREMI - Học Tiếng Anh Mỗi Ngày
```

---

## 🔧 Xử Lý Sự Cố

### ❌ Lỗi: "credentials.json not found"
**Giải pháp**: 
- Kiểm tra file `credentials.json` có nằm đúng thư mục gốc project không
- Đảm bảo tên file chính xác là `credentials.json` (không có số hoặc ký tự thêm)

### ❌ Lỗi: "Permission denied" hoặc "Insufficient permissions"
**Giải pháp**:
- Kiểm tra lại bước 6: Đã chia sẻ quyền Editor cho Service Account email chưa
- Đảm bảo Google Drive API đã được Enable (Bước 2)

### ❌ Lỗi: "Could not find or create User folder"
**Giải pháp**:
- Kiểm tra Service Account có quyền tạo folder trong Drive không
- Thử tạo thư mục "User" thủ công và chia sẻ quyền Editor cho Service Account

### ❌ File không xuất hiện trên Google Drive
**Giải pháp**:
- Kiểm tra Console log trong terminal (server logs)
- Xem có thông báo lỗi nào không
- Đảm bảo internet connection ổn định
- Thử đăng ký lại với thông tin khác

---

## 🔒 Bảo Mật

### ⚠️ QUAN TRỌNG:

1. **KHÔNG BAO GIỜ** commit file `credentials.json` lên Git/GitHub
2. File này đã được thêm vào `.gitignore` tự động
3. Không chia sẻ nội dung file `credentials.json` với người khác
4. Nếu file bị lộ, hãy xóa Service Account và tạo mới ngay lập tức

### 🛡️ Kiểm tra .gitignore:

Đảm bảo file `.gitignore` có dòng:
```
credentials.json
```

---

## 📱 Luồng Hoạt Động

```
Người dùng đăng ký
        ↓
Thông tin được lưu vào localStorage
        ↓
API call đến /api/register/save-to-drive (background)
        ↓
Tạo file .txt với thông tin đầy đủ
        ↓
Tìm/Tạo thư mục "User" trên Google Drive
        ↓
Upload file lên Google Drive
        ↓
✅ Hoàn tất (không chặn UI người dùng)
```

---

## 🎨 Tính Năng Bổ Sung Đã Hoàn Thành

### ✅ Roadmap Page - Nobita Icon Fix
- Icon Nobita (và các nhân vật khác) hiển thị đúng vị trí bên phải thẻ
- Hiệu ứng 3D với drop-shadow
- Animation mượt mà khi hover
- Scale lớn hơn cho level hiện tại
- Overflow visible để icon có thể "nhô" ra ngoài thẻ

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra lại từng bước trong hướng dẫn
2. Xem Console logs trong terminal
3. Kiểm tra Browser DevTools Console
4. Liên hệ: **TJN MSTUDIOTB**

---

## 🎉 Hoàn Tất!

Bây giờ hệ thống sẽ tự động lưu thông tin người đăng ký lên Google Drive của bạn. Mỗi lần có người dùng mới, một file `.txt` sẽ được tạo và upload tự động!

**Phát triển bởi: TJN MSTUDIOTB**  
**Website: https://doremi-hoctienganh.com**
