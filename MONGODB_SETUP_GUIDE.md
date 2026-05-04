# 🔧 Hướng dẫn cài đặt và khởi động MongoDB trên Windows

## Vấn đề hiện tại
- Hệ thống không thể kết nối đến MongoDB vì service chưa chạy
- Cần cài đặt MongoDB Community Edition và khởi động service

## Giải pháp: 3 Phương án

---

## ✅ PHƯƠNG ÁN 1: Cài đặt MongoDB Community Edition (Khuyến nghị)

### Bước 1: Tải MongoDB
1. Truy cập: https://www.mongodb.com/try/download/community
2. Chọn:
   - Version: 7.0.x (Latest)
   - Platform: Windows
   - Package: MSI
3. Click **Download** và chờ tải về

### Bước 2: Cài đặt MongoDB
1. Chạy file `.msi` vừa tải về
2. Chọn **Complete** installation
3. **QUAN TRỌNG**: Tích chọn "Install MongoDB as a Service"
4. Để mặc định các cài đặt khác
5. Click **Install** và chờ hoàn tất

### Bước 3: Kiểm tra MongoDB đã chạy
Mở Command Prompt (CMD) hoặc PowerShell và chạy:
```bash
sc query MongoDB
```

Nếu thấy `STATE: 4 RUNNING` → MongoDB đã chạy ✅

### Bước 4: Nếu MongoDB chưa chạy, khởi động bằng lệnh:
```bash
net start MongoDB
```

---

## ✅ PHƯƠNG ÁN 2: Sử dụng MongoDB Compass (Có GUI)

### Bước 1: Tải MongoDB Compass
1. Truy cập: https://www.mongodb.com/try/download/compass
2. Tải phiên bản Windows
3. Cài đặt như phần mềm thông thường

### Bước 2: Khởi động MongoDB từ Compass
1. Mở MongoDB Compass
2. Kết nối đến: `mongodb://127.0.0.1:27017`
3. Nếu kết nối thành công → MongoDB đã chạy ✅

**Lưu ý**: MongoDB Compass chỉ là công cụ quản lý, bạn vẫn cần cài MongoDB Community Edition ở Phương án 1.

---

## ✅ PHƯƠNG ÁN 3: Chạy MongoDB bằng Docker (Nếu đã có Docker)

### Nếu bạn đã cài Docker Desktop:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Kiểm tra:
```bash
docker ps
```

---

## 🧪 Sau khi MongoDB đã chạy, kiểm tra kết nối:

### Cách 1: Dùng lệnh trong project
```bash
node scripts/import-vocab-to-db.js
```

### Cách 2: Kiểm tra port
```bash
netstat -an | findstr "27017"
```

Nếu thấy dòng có `127.0.0.1:27017` → MongoDB đang lắng nghe ✅

---

## 📊 Sau khi MongoDB chạy thành công

Quay lại terminal của project và chạy:

```bash
node scripts/import-vocab-to-db.js
```

Script này sẽ:
- ✅ Kết nối đến MongoDB
- ✅ Đọc 854 từ vựng từ `public/data_1000.json`
- ✅ Import vào database `hoctienganh`
- ✅ Hiển thị thống kê

Sau đó, số liệu trên giao diện sẽ tự động cập nhật từ (0) lên số thực tế!

---

## ❓ Nếu gặp lỗi

### Lỗi: "Access denied" khi chạy `net start MongoDB`
→ Mở Command Prompt **với quyền Administrator** (Right-click → Run as Administrator)

### Lỗi: "Service name invalid"
→ MongoDB chưa được cài đặt như một Windows Service
→ Quay lại Phương án 1 và đảm bảo tích chọn "Install as Service"

### Lỗi: "Port 27017 already in use"
→ Có thể MongoDB đã chạy rồi, hoặc có ứng dụng khác dùng port này
→ Kiểm tra: `netstat -ano | findstr "27017"`

---

## 🎯 Tóm tắt các bước

1. ✅ Cài MongoDB Community Edition (hoặc dùng Docker)
2. ✅ Khởi động MongoDB service
3. ✅ Kiểm tra port 27017 đang lắng nghe
4. ✅ Chạy `node scripts/import-vocab-to-db.js`
5. ✅ Xác nhận số liệu trên UI đã cập nhật

---

**Sau khi hoàn thành, hãy cho tôi biết bạn đã chọn phương án nào và kết quả như thế nào!**
