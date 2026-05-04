# Hệ Thống Quản Lý Nội Dung Admin - Roadmap

## Tổng Quan

Tính năng "Quản lý nội dung trực tiếp" cho phép Admin cập nhật và thêm bài học mới ngay tại trang Lộ trình học (Roadmap) thông qua việc tải lên các file đa định dạng hoặc dán JSON trực tiếp.

## Tính Năng Chính

### 1. **Nút Cập Nhật Dữ Liệu cho Admin**
- Hiển thị khi Admin rê chuột vào mỗi mục Lớp (Lớp 1, Lớp 2, v.v.)
- Chỉ hiển thị với tài khoản Admin (mstudiotb@gmail.com)
- Thiết kế gradient đẹp mắt với hiệu ứng hover

### 2. **Hỗ Trợ Đa Định Dạng File**
Hệ thống hỗ trợ 4 loại định dạng:

#### a) **PDF (.pdf)**
- Tự động trích xuất văn bản từ file PDF
- Sử dụng thư viện `pdf-parse`
- Phù hợp cho tài liệu giáo trình đã scan hoặc xuất từ Word

#### b) **Word (.docx, .doc)**
- Trích xuất văn bản từ file Word
- Sử dụng thư viện `mammoth`
- Giữ nguyên cấu trúc văn bản

#### c) **Text (.txt)**
- Đọc trực tiếp file văn bản thuần
- Phù hợp cho nội dung đơn giản

#### d) **JSON (.json hoặc dán trực tiếp)**
- Cho phép dán JSON trực tiếp vào textarea
- Hoặc tải lên file JSON
- Phù hợp khi đã có dữ liệu có cấu trúc

### 3. **Xử Lý Dữ Liệu Thông Minh với AI**

Hệ thống sử dụng **Claude AI (Anthropic)** để tự động phân tích và cấu trúc hóa nội dung:

#### Quy Trình AI Processing:
1. **Trích xuất văn bản** từ file (PDF/Word/Text)
2. **Gửi đến Claude AI** với prompt chuyên biệt
3. **AI phân tích** và chia nhỏ thành các Unit
4. **Trích xuất tự động**:
   - Từ vựng (word, phonetic, meaning)
   - Mẫu câu (sentences)
   - Skill tags (Từ vựng, Ngữ pháp, Nghe, Nói)
5. **Trả về JSON** có cấu trúc chuẩn

#### Ví Dụ Output từ AI:
```json
{
  "lessons": [
    {
      "title": "Unit 1 - Hello",
      "part": 1,
      "vocabulary": [
        {
          "word": "hello",
          "phonetic": "/həˈloʊ/",
          "meaning": "xin chào"
        },
        {
          "word": "goodbye",
          "phonetic": "/ɡʊdˈbaɪ/",
          "meaning": "tạm biệt"
        }
      ],
      "sentences": [
        "Hello, how are you?",
        "Goodbye, see you later!"
      ],
      "skillTags": ["Từ vựng", "Ngữ pháp", "Nói"]
    }
  ]
}
```

### 4. **Đồng Bộ Hóa Tức Thì**

Sau khi Admin upload và xác nhận:
- Dữ liệu được lưu vào MongoDB
- Tự động tính toán số Part tiếp theo cho lớp đó
- Cập nhật số lượng bài học ngay lập tức
- Refresh danh sách bài học trên UI
- Hiển thị thông báo thành công

## Cấu Trúc File

### 1. **Component Modal**
```
components/roadmap/AdminContentUploadModal.tsx
```
- Giao diện upload file
- Chọn phương thức (PDF/Word/Text/JSON)
- Xử lý validation
- Hiển thị trạng thái upload

### 2. **API Endpoint**
```
app/api/admin/upload-grade-content/route.ts
```
- Xác thực Admin
- Parse file theo định dạng
- Gọi AI để phân tích
- Lưu vào MongoDB
- Trả về kết quả

### 3. **Roadmap Page**
```
app/(dashboard)/roadmap/page.tsx
```
- Hiển thị nút Admin
- Tích hợp modal
- Refresh data sau upload

## Cách Sử Dụng

### Bước 1: Đăng Nhập Admin
- Đăng nhập với tài khoản: `mstudiotb@gmail.com`

### Bước 2: Truy Cập Roadmap
- Vào trang `/roadmap`
- Rê chuột vào bất kỳ lớp nào (Lớp 1-5)

### Bước 3: Nhấn Nút "Cập nhật"
- Nút sẽ xuất hiện ở góc phải trên của mỗi lớp
- Nhấn để mở modal upload

### Bước 4: Chọn Phương Thức
Chọn một trong 4 phương thức:
- **PDF**: Tải file PDF giáo trình
- **Word**: Tải file Word (.docx)
- **Text**: Tải file văn bản (.txt)
- **JSON**: Dán JSON hoặc tải file JSON

### Bước 5: Upload File
- Chọn file từ máy tính
- Hoặc dán JSON trực tiếp (với phương thức JSON)
- Nhấn "Tải lên và xử lý"

### Bước 6: Chờ Xử Lý
- Hệ thống sẽ:
  - Trích xuất văn bản
  - Gửi đến AI phân tích
  - Tạo các bài học
  - Lưu vào database

### Bước 7: Xác Nhận
- Thông báo thành công hiển thị
- Số lượng bài học cập nhật tự động
- Modal tự động đóng sau 2 giây

## Cấu Trúc JSON Chuẩn

Nếu muốn dán JSON trực tiếp, sử dụng cấu trúc sau:

```json
{
  "lessons": [
    {
      "title": "Tên bài học",
      "part": 1,
      "vocabulary": [
        {
          "word": "từ tiếng Anh",
          "phonetic": "phiên âm (tùy chọn)",
          "meaning": "nghĩa tiếng Việt"
        }
      ],
      "sentences": [
        "Mẫu câu 1",
        "Mẫu câu 2"
      ],
      "skillTags": ["Từ vựng", "Ngữ pháp", "Nghe", "Nói"]
    }
  ]
}
```

## Yêu Cầu Kỹ Thuật

### Environment Variables
Cần có trong `.env.local`:
```env
ANTHROPIC_API_KEY=your_claude_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

### Dependencies
Đã được cài đặt sẵn:
- `mammoth`: ^1.12.0 (Parse Word files)
- `pdf-parse`: ^2.4.5 (Parse PDF files)
- `@anthropic-ai/sdk`: ^0.92.0 (Claude AI)

## Xử Lý Lỗi

### Lỗi Thường Gặp:

1. **"Unauthorized - Admin only"**
   - Chưa đăng nhập hoặc không phải Admin
   - Giải pháp: Đăng nhập với tài khoản Admin

2. **"Không thể trích xuất nội dung từ file"**
   - File bị lỗi hoặc không đọc được
   - Giải pháp: Kiểm tra file, thử định dạng khác

3. **"AI không trả về JSON hợp lệ"**
   - Nội dung quá phức tạp hoặc không rõ ràng
   - Giải pháp: Chuẩn bị nội dung rõ ràng hơn

4. **"Invalid data structure"**
   - JSON không đúng cấu trúc
   - Giải pháp: Kiểm tra lại format JSON

## Bảo Mật

- ✅ Chỉ Admin mới thấy nút upload
- ✅ API endpoint kiểm tra quyền Admin
- ✅ Session authentication với NextAuth
- ✅ Validation dữ liệu đầu vào
- ✅ Error handling toàn diện

## Tối Ưu Hóa

### Performance:
- Dynamic import cho pdf-parse (giảm bundle size)
- Lazy loading modal component
- Optimistic UI updates

### UX:
- Loading states rõ ràng
- Success/Error messages
- Auto-close modal sau thành công
- Hover effects mượt mà

## Mở Rộng Tương Lai

### Có thể thêm:
1. **Image extraction** từ PDF/Word
2. **Audio file support** cho bài nghe
3. **Batch upload** nhiều file cùng lúc
4. **Preview** trước khi lưu
5. **Edit mode** cho bài học đã tồn tại
6. **Version control** cho nội dung
7. **Export** bài học ra file

## Liên Hệ & Hỗ Trợ

Phát triển bởi: **TJN MSTUDIOTB**
Email: mstudiotb@gmail.com

---

**Lưu ý**: Tính năng này yêu cầu API key của Anthropic Claude. Đảm bảo đã cấu hình đúng trong file `.env.local`.
