# Hệ Thống Import Bài Học Tự Động

## 📋 Tổng Quan

Hệ thống tự động quét thư mục "du lieu nhap", phân loại bài học theo lớp (grade) và phần (part), sau đó import vào MongoDB Atlas và hiển thị trên giao diện web.

## ✅ Kết Quả Import

### Thống Kê
- **Tổng số bài học**: 11 bài
- **Phân bổ theo lớp**:
  - **Lớp 1**: 2 bài học (Phần 1: 1 bài, Phần 2: 1 bài)
  - **Lớp 2**: 2 bài học (Phần 1: 1 bài, Phần 2: 1 bài)
  - **Lớp 3**: 3 bài học (Phần 1: 2 bài, Phần 2: 1 bài)
  - **Lớp 4**: 2 bài học (Phần 1: 1 bài, Phần 2: 1 bài)
  - **Lớp 5**: 2 bài học (Phần 1: 1 bài, Phần 2: 1 bài)

### Database
- **Database**: `doremi`
- **Collection**: `lessons`
- **Connection**: MongoDB Atlas (MONGODB_URI)

## 🔧 Cấu Trúc Hệ Thống

### 1. Script Import (`scripts/import-lessons-from-folder.js`)

**Chức năng**:
- Quét thư mục `C:\Users\MSTUDIOTB\Desktop\HOCTIENGANH\du lieu nhap`
- Phân tích tên file để xác định lớp và phần
- Import vào MongoDB với cấu trúc chuẩn

**Logic Phân Loại**:
```javascript
// Xác định lớp (grade)
- "lop 1" hoặc "smart-start-1" → Lớp 1
- "lop 2" hoặc "smart-start-2" → Lớp 2
- "lop 3" hoặc "smart-start-3" → Lớp 3
- "lop 4" hoặc "level 4" → Lớp 4
- "lop 5" hoặc "level 5" → Lớp 5

// Xác định phần (part)
- "phan 1", "p1", "part 1" → Phần 1
- "phan 2", "p2", "part 2" → Phần 2
- "phan 3", "p3", "part 3" → Phần 3
```

**Cấu Trúc Dữ Liệu**:
```javascript
{
  grade: number,           // Lớp (1-5)
  part: number,            // Phần (1, 2, 3...)
  title: string,           // Tiêu đề bài học
  fileName: string,        // Tên file gốc
  filePath: string,        // Đường dẫn file
  namespace: string,       // primary_data, secondary_data, highschool_data
  vocabulary: [],          // Danh sách từ vựng
  sentences: [],           // Danh sách câu mẫu
  skillTags: [],           // Kỹ năng (Từ vựng, Ngữ pháp, Nghe, Nói)
  source: "import",        // Nguồn dữ liệu
  createdAt: Date,
  updatedAt: Date
}
```

**Cách Chạy**:
```bash
node scripts/import-lessons-from-folder.js
```

### 2. API Endpoint (`app/api/lessons/route.ts`)

**Endpoint**: `GET /api/lessons`

**Query Parameters**:
- `grade` (optional): Lọc theo lớp cụ thể

**Response**:
```json
{
  "success": true,
  "total": 11,
  "lessonsByGrade": {
    "1": [...],
    "2": [...],
    "3": [...],
    "4": [...],
    "5": [...]
  },
  "lessons": [...]
}
```

### 3. Giao Diện Roadmap (`app/(dashboard)/roadmap/page.tsx`)

**Tính Năng**:
- ✅ Hiển thị bài học theo lớp (Lớp 1 → Lớp 5)
- ✅ Mở/đóng từng lớp để xem danh sách bài học
- ✅ Hiển thị số lượng bài học và tiến độ hoàn thành
- ✅ Sắp xếp bài học theo phần (Part 1, Part 2...)
- ✅ Khóa/mở khóa bài học theo tiến độ
- ✅ Thanh tiến độ cho từng bài học
- ✅ Hiển thị cấp độ nhân vật (Character Level)

**Màu Sắc Theo Lớp**:
- Lớp 1: `oklch(0.78_0.2_165)` - Xanh lá nhạt
- Lớp 2: `oklch(0.78_0.17_200)` - Xanh dương nhạt
- Lớp 3: `oklch(0.72_0.28_320)` - Tím
- Lớp 4: `oklch(0.75_0.25_280)` - Tím nhạt
- Lớp 5: `oklch(0.70_0.22_240)` - Xanh tím

## 📝 Hướng Dẫn Sử Dụng

### Thêm Bài Học Mới

1. **Đặt tên file theo quy tắc**:
   ```
   lop-[số]-phan-[số]-[tên-bài].pdf
   
   Ví dụ:
   - lop-1-phan-1-hello-world.pdf
   - lop-2-phan-2-my-family.pdf
   - lop-3-phan-1-animals.pdf
   ```

2. **Copy file vào thư mục**:
   ```
   C:\Users\MSTUDIOTB\Desktop\HOCTIENGANH\du lieu nhap\
   ```

3. **Chạy script import**:
   ```bash
   node scripts/import-lessons-from-folder.js
   ```

4. **Kiểm tra kết quả**:
   - Mở web và vào trang "Lộ Trình"
   - Chọn lớp tương ứng
   - Xem bài học mới được thêm

### Xóa/Cập Nhật Bài Học

Script sẽ tự động xóa dữ liệu cũ (có `source: "import"`) trước khi import mới, đảm bảo dữ liệu luôn đồng bộ với thư mục.

## 🎨 Giao Diện

### Màn Hình Lộ Trình
- Header với gradient đẹp mắt
- Character Level Display (6 cấp độ)
- Stats Overview (Bài hoàn thành, Chuỗi ngày, Tiến độ)
- Danh sách lớp có thể mở/đóng
- Card bài học với:
  - Icon phần (P1, P2...)
  - Tiêu đề và mô tả
  - Thanh tiến độ
  - Trạng thái khóa/mở

### Responsive Design
- Tối ưu cho mobile và desktop
- Animation mượt mà với Framer Motion
- Dark theme với OKLCH color space

## 🔐 Bảo Mật

- Chỉ import file PDF
- Validate tên file trước khi xử lý
- Sử dụng MongoDB connection pool
- Error handling đầy đủ

## 📊 Monitoring

### Kiểm Tra Database
```bash
node scripts/check-db-data.js
```

### Log Import
Script sẽ hiển thị:
- Số lượng file tìm thấy
- Chi tiết từng bài học được import
- Thống kê theo lớp và phần
- Thông báo lỗi (nếu có)

## 🚀 Tính Năng Tương Lai

- [ ] Upload file PDF trực tiếp từ web
- [ ] Trích xuất nội dung PDF tự động
- [ ] Tạo từ vựng và câu mẫu từ PDF
- [ ] Quản lý bài học từ admin panel
- [ ] Export/Import dữ liệu
- [ ] Backup tự động

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra MONGODB_URI trong `.env.local`
2. Đảm bảo tên file đúng quy tắc
3. Xem log khi chạy script
4. Kiểm tra kết nối MongoDB Atlas

---

**Phát triển bởi**: TJN MSTUDIOTB  
**Ngày hoàn thành**: 05/05/2026  
**Version**: 1.0.0
