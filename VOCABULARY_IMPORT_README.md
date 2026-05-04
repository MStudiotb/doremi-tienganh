# Hướng dẫn Import 1000 Từ Vựng Tiếng Anh

## ✅ Đã hoàn thành

### 1. File JSON đã được tạo
- **Đường dẫn**: `public/data_1000.json`
- **Số lượng từ**: 854/1000 từ vựng (85.4%)
- **Nguồn**: Trích xuất từ file PDF `public/tu-vung/1000 tu tieng anh.pdf`
- **Định dạng**:
```json
[
  {
    "stt": 1,
    "word": "accountant (n)",
    "phonetic": "/əˈkaʊn.t̬ənt/",
    "meaning": "kế toán",
    "category": "GENERAL"
  },
  ...
]
```

### 2. Scripts đã tạo

#### `scripts/extract-vocab.js`
Script trích xuất từ vựng từ file PDF.

**Cách chạy**:
```bash
node scripts/extract-vocab.js
```

**Chức năng**:
- Đọc file PDF sử dụng pdfjs-dist
- Phân tích và trích xuất từ vựng theo pattern
- Tự động nhận diện chủ đề (categories)
- Lưu kết quả vào `public/data_1000.json`
- Hiển thị thống kê chi tiết

#### `scripts/import-vocab-to-db.js`
Script import từ vựng vào MongoDB database.

**Cách chạy**:
```bash
node scripts/import-vocab-to-db.js
```

**Chức năng**:
- Đọc dữ liệu từ `public/data_1000.json`
- Kết nối MongoDB theo cấu hình trong `.env.local`
- Xóa dữ liệu cũ từ nguồn "1000_tu_vung_co_ban" (nếu có)
- Import 854 từ vào collection `vocabulary`
- Thêm các trường: `level`, `source`, `examples`, `createdAt`, `updatedAt`
- Hiển thị thống kê theo chủ đề

## 📋 Yêu cầu để Import vào Database

### 1. Khởi động MongoDB
Trước khi chạy script import, bạn cần khởi động MongoDB local:

**Windows**:
```bash
# Nếu cài đặt MongoDB như service
net start MongoDB

# Hoặc chạy trực tiếp
mongod --dbpath "C:\data\db"
```

**macOS/Linux**:
```bash
# Nếu cài đặt qua brew
brew services start mongodb-community

# Hoặc chạy trực tiếp
mongod --dbpath /data/db
```

### 2. Cấu hình kết nối
File `.env.local` đã được cấu hình với MongoDB local:
```
MONGODB_URI=mongodb://127.0.0.1:27017/hoctienganh
MONGODB_DB=hoctienganh
```

### 3. Chạy Import
```bash
node scripts/import-vocab-to-db.js
```

## 📊 Kết quả Import

Sau khi import thành công, bạn sẽ thấy:

```
✅ Đã kết nối đến MongoDB
✅ Đã đọc 854 từ vựng từ file
✅ Đã xóa X từ vựng cũ (nếu có)
Đã import 854/854 từ...
✅ Import hoàn tất!
📊 Tổng số từ vựng đã import: 854

📊 Thống kê theo chủ đề:
  GENERAL: 759 từ
  THAO: 95 từ

📝 Một số từ vựng đã import:
1. accountant (n) /əˈkaʊn.t̬ənt/ - kế toán [GENERAL]
2. actor/ actress (n) /ˈæk.tɚ/ - /ˈæk.trəs/ diễn viên [GENERAL]
...
```

## 🔍 Kiểm tra dữ liệu trong MongoDB

### Sử dụng MongoDB Shell
```bash
mongosh

use hoctienganh

# Đếm số lượng từ vựng
db.vocabulary.countDocuments({ source: "1000_tu_vung_co_ban" })

# Xem một số từ mẫu
db.vocabulary.find({ source: "1000_tu_vung_co_ban" }).limit(5)

# Thống kê theo category
db.vocabulary.aggregate([
  { $match: { source: "1000_tu_vung_co_ban" } },
  { $group: { _id: "$category", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

## 📝 Lưu ý

### Từ vựng bị thiếu
Do format PDF không đồng nhất ở một số trang, có 146 từ không được trích xuất tự động. Các STT bị thiếu bao gồm:
- 44, 58, 88, 120
- 135-150 (một đoạn liên tiếp)
- Và một số từ khác rải rác

Bạn có thể:
1. Thêm thủ công các từ này qua giao diện quản lý từ vựng
2. Hoặc chỉnh sửa file `public/data_1000.json` và chạy lại import

### Cấu trúc dữ liệu trong Database
Mỗi từ vựng được lưu với cấu trúc:
```javascript
{
  word: "accountant (n)",           // Từ vựng + loại từ
  phonetic: "/əˈkaʊn.t̬ənt/",       // Phiên âm
  meaning: "kế toán",               // Nghĩa tiếng Việt
  category: "GENERAL",              // Chủ đề
  examples: [],                     // Ví dụ (mảng rỗng ban đầu)
  level: "basic",                   // Cấp độ
  source: "1000_tu_vung_co_ban",   // Nguồn dữ liệu
  stt: 1,                          // Số thứ tự
  createdAt: ISODate(...),         // Thời gian tạo
  updatedAt: ISODate(...)          // Thời gian cập nhật
}
```

## 🚀 Sử dụng trong ứng dụng

Sau khi import, từ vựng sẽ có sẵn trong:
- Trang tra cứu từ vựng: `/tra-cuu-tu-vung`
- Trang quản lý từ vựng: `/tra-cuu-tu-vung/quan-ly`
- API endpoints:
  - `GET /api/vocabulary/list` - Lấy danh sách từ vựng
  - `GET /api/vocabulary/search?q=...` - Tìm kiếm từ vựng
  - `POST /api/vocabulary/manage` - Thêm/sửa/xóa từ vựng

## 🛠️ Troubleshooting

### Lỗi: Cannot connect to MongoDB
- Kiểm tra MongoDB đã được khởi động chưa
- Kiểm tra port 27017 có bị chiếm dụng không
- Thử kết nối bằng MongoDB Compass để test

### Lỗi: File not found
- Đảm bảo file `public/data_1000.json` tồn tại
- Chạy lại `node scripts/extract-vocab.js` nếu cần

### Import bị trùng lặp
- Script tự động xóa dữ liệu cũ từ cùng nguồn trước khi import
- Nếu muốn giữ lại dữ liệu cũ, sửa logic trong script

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. MongoDB đã chạy chưa: `mongosh` hoặc MongoDB Compass
2. File `.env.local` có đúng cấu hình không
3. File `public/data_1000.json` có tồn tại không
4. Xem log chi tiết khi chạy script
