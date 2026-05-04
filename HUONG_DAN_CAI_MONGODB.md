# 🚀 HƯỚNG DẪN CÀI ĐẶT MONGODB - NHANH CHÓNG

## ⚡ CÁCH 1: Dùng Script Tự Động (Khuyến nghị)

### Bước 1: Mở PowerShell với quyền Administrator

1. Nhấn phím **Windows**
2. Gõ: `PowerShell`
3. **Click phải** vào **Windows PowerShell**
4. Chọn **"Run as Administrator"**
5. Click **Yes** khi được hỏi

### Bước 2: Chạy script cài đặt

Trong cửa sổ PowerShell (với quyền Admin), copy và paste lệnh sau:

```powershell
cd C:\Users\MSTUDIOTB\Desktop\HOCTIENGANH
.\install-mongodb.ps1
```

**Script này sẽ:**
- ✅ Kiểm tra MongoDB đã cài chưa
- ✅ Nếu đã cài: Tự động khởi động service
- ✅ Nếu chưa cài: Mở trang tải về và hướng dẫn chi tiết

---

## 📥 CÁCH 2: Cài Đặt Thủ Công

### Bước 1: Tải MongoDB

1. Truy cập: https://www.mongodb.com/try/download/community
2. Chọn:
   - **Version**: 7.0.x (Latest)
   - **Platform**: Windows
   - **Package**: MSI
3. Click **Download**

### Bước 2: Cài Đặt

1. Chạy file `.msi` vừa tải về
2. Chọn **"Complete"** installation
3. **⚠️ QUAN TRỌNG**: Tích chọn **"Install MongoDB as a Service"**
4. Để mặc định các cài đặt khác
5. Click **Install** và chờ hoàn tất

### Bước 3: Kiểm Tra Service

Mở Command Prompt hoặc PowerShell và chạy:

```bash
sc query MongoDB
```

Nếu thấy `STATE: 4 RUNNING` → MongoDB đã chạy ✅

### Bước 4: Khởi Động MongoDB (nếu chưa chạy)

```bash
net start MongoDB
```

---

## ✅ SAU KHI MONGODB ĐÃ CHẠY

### Kiểm tra kết nối:

```bash
netstat -an | findstr "27017"
```

Nếu thấy dòng có `127.0.0.1:27017` → MongoDB đang lắng nghe ✅

### Import dữ liệu từ vựng:

```bash
node scripts/import-vocab-to-db.js
```

Script sẽ tự động:
- ✅ Kết nối MongoDB
- ✅ Import 854 từ vựng từ `data_1000.json`
- ✅ Hiển thị thống kê
- ✅ Số liệu trên UI sẽ cập nhật từ **(0)** → số thực tế

---

## 🔧 XỬ LÝ LỖI

### Lỗi: "Access denied" khi chạy `net start MongoDB`
→ Mở Command Prompt **với quyền Administrator**

### Lỗi: "Service name invalid"
→ MongoDB chưa được cài như Windows Service
→ Cài lại và đảm bảo tích chọn "Install as Service"

### Lỗi: "Port 27017 already in use"
→ Kiểm tra: `netstat -ano | findstr "27017"`
→ Có thể MongoDB đã chạy rồi

---

## 📞 CẦN TRỢ GIÚP?

Sau khi chạy script hoặc cài đặt xong, hãy cho tôi biết kết quả để tôi tiếp tục import dữ liệu!
