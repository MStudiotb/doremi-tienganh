# 🚀 HƯỚNG DẪN CÀI ĐẶT MONGODB - TỪNG BƯỚC CHI TIẾT

## ⚠️ QUAN TRỌNG
Bạn PHẢI cài đặt MongoDB trước khi hệ thống có thể lưu trữ 854 từ vựng!

---

## 📥 BƯỚC 1: TẢI MONGODB

### 1.1. Mở trình duyệt
- Truy cập: **https://www.mongodb.com/try/download/community**

### 1.2. Chọn phiên bản
Trên trang tải về, chọn:
- **Version**: `7.0.14` (hoặc phiên bản 7.0.x mới nhất)
- **Platform**: `Windows`
- **Package**: `msi`

### 1.3. Tải về
- Click nút **Download** màu xanh lá
- File sẽ có tên dạng: `mongodb-windows-x86_64-7.0.14-signed.msi`
- Kích thước khoảng 300-400 MB
- Chờ tải về hoàn tất (thường 2-5 phút tùy tốc độ mạng)

---

## 💿 BƯỚC 2: CÀI ĐẶT MONGODB

### 2.1. Chạy file cài đặt
- Tìm file `.msi` vừa tải về (thường trong thư mục Downloads)
- **Double-click** vào file để chạy
- Nếu Windows hỏi "Do you want to allow this app to make changes?", click **Yes**

### 2.2. Màn hình Welcome
- Click **Next**

### 2.3. License Agreement
- Tích chọn **"I accept the terms in the License Agreement"**
- Click **Next**

### 2.4. Choose Setup Type
- Chọn **"Complete"** (khuyến nghị)
- Click **Next**

### 2.5. Service Configuration (QUAN TRỌNG!)
Đây là bước QUAN TRỌNG NHẤT:

✅ **Phải tích chọn**: "Install MongoDB as a Service"
✅ **Service Name**: Để mặc định `MongoDB`
✅ **Data Directory**: Để mặc định `C:\Program Files\MongoDB\Server\7.0\data\`
✅ **Log Directory**: Để mặc định `C:\Program Files\MongoDB\Server\7.0\log\`

- Click **Next**

### 2.6. Install MongoDB Compass (Tùy chọn)
- Bạn có thể tích hoặc bỏ tích "Install MongoDB Compass"
- MongoDB Compass là công cụ GUI để xem database (khuyến nghị cài)
- Click **Next**

### 2.7. Bắt đầu cài đặt
- Click **Install**
- Chờ 3-5 phút để cài đặt hoàn tất
- Khi thấy "Completed the MongoDB Setup Wizard", click **Finish**

---

## ✅ BƯỚC 3: KIỂM TRA MONGODB ĐÃ CHẠY

### 3.1. Mở PowerShell
- Nhấn phím **Windows**
- Gõ: `PowerShell`
- Click vào **Windows PowerShell** (không cần quyền Admin)

### 3.2. Kiểm tra service
Trong PowerShell, chạy lệnh:
```powershell
Get-Service -Name MongoDB
```

**Kết quả mong đợi:**
```
Status   Name               DisplayName
------   ----               -----------
Running  MongoDB            MongoDB
```

Nếu thấy `Status: Running` → MongoDB đã chạy thành công! ✅

### 3.3. Nếu MongoDB chưa chạy
Nếu thấy `Status: Stopped`, chạy lệnh sau (cần quyền Admin):

1. Đóng PowerShell hiện tại
2. Nhấn phím **Windows**
3. Gõ: `PowerShell`
4. **Click phải** vào **Windows PowerShell**
5. Chọn **"Run as Administrator"**
6. Click **Yes**
7. Chạy lệnh:
```powershell
Start-Service MongoDB
```

---

## 📊 BƯỚC 4: IMPORT DỮ LIỆU 854 TỪ VỰNG

### 4.1. Mở terminal trong VS Code
- Trong VS Code, nhấn `` Ctrl + ` `` (phím backtick)
- Hoặc menu: Terminal → New Terminal

### 4.2. Chạy lệnh import
```bash
node scripts/import-vocab-to-db.js
```

**Kết quả mong đợi:**
```
🔄 Đang kết nối đến MongoDB...
✅ Đã kết nối đến MongoDB

📖 Đang đọc file data_1000.json...
✅ Đã đọc 854 từ vựng từ file

🔄 Đang chuẩn bị dữ liệu...
🔍 Đang kiểm tra từ vựng đã tồn tại...

🔄 Đang import dữ liệu vào database...
Đã import 100/854 từ...
Đã import 200/854 từ...
...
Đã import 854/854 từ...

✅ Import hoàn tất!
📊 Tổng số từ vựng đã import: 854
```

---

## 🎯 BƯỚC 5: XÁC NHẬN TRÊN GIAO DIỆN WEB

### 5.1. Mở trình duyệt
- Truy cập: `http://localhost:3000/tra-cuu-tu-vung/quan-ly`
- Đăng nhập với tài khoản Admin

### 5.2. Kiểm tra số liệu
- Tìm dòng **"Danh Sách Từ Vựng (854)"**
- Số `(854)` sẽ xuất hiện thay vì `(0)`

### 5.3. Refresh nếu cần
- Nếu vẫn thấy `(0)`, nhấn **F5** để refresh trang
- Hoặc **Ctrl + Shift + R** để hard refresh

---

## 🔧 XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi 1: "MongoDB service not found"
**Nguyên nhân**: Chưa cài MongoDB hoặc chưa cài như Service
**Giải pháp**: Quay lại Bước 2 và đảm bảo tích chọn "Install as Service"

### Lỗi 2: "ECONNREFUSED 127.0.0.1:27017"
**Nguyên nhân**: MongoDB service chưa chạy
**Giải pháp**: Chạy `Start-Service MongoDB` với quyền Admin

### Lỗi 3: "Access denied"
**Nguyên nhân**: Thiếu quyền Administrator
**Giải pháp**: Mở PowerShell với "Run as Administrator"

### Lỗi 4: Giao diện vẫn hiển thị (0)
**Nguyên nhân**: Chưa refresh trang hoặc server chưa restart
**Giải pháp**: 
1. Nhấn F5 để refresh trang
2. Hoặc restart Next.js server (Ctrl+C rồi `npm run dev`)

---

## 📞 HỖ TRỢ

Sau khi hoàn thành các bước trên:
1. Chạy lệnh kiểm tra: `node scripts/check-db-data.js`
2. Báo cho tôi biết kết quả
3. Tôi sẽ giúp bạn xác nhận số liệu đã hiển thị đúng

---

## 🎉 HOÀN TẤT

Khi bạn thấy:
- ✅ MongoDB service đang chạy
- ✅ Script import báo "Import hoàn tất! 854 từ"
- ✅ Giao diện web hiển thị "(854)" thay vì "(0)"

→ Hệ thống đã hoạt động hoàn hảo! 🚀
