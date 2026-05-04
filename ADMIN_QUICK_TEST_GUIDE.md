# Hướng Dẫn Test Nhanh - Admin Content Management

## Checklist Kiểm Tra

### ✅ Chuẩn Bị
- [ ] Đã có ANTHROPIC_API_KEY trong `.env.local`
- [ ] MongoDB đã kết nối thành công
- [ ] Đã đăng nhập với tài khoản admin: `mstudiotb@gmail.com`

### ✅ Test UI Components

#### 1. Test Nút Admin Xuất Hiện
```
Bước test:
1. Vào trang /roadmap
2. Rê chuột vào "Lớp 1" (hoặc bất kỳ lớp nào)
3. Kiểm tra: Nút "Cập nhật" có xuất hiện ở góc phải không?
4. Kiểm tra: Nút có gradient màu cam-đỏ không?
5. Kiểm tra: Hover vào nút có scale up không?

Kết quả mong đợi:
✓ Nút chỉ hiện khi hover
✓ Có icon Upload
✓ Text "Cập nhật"
✓ Hiệu ứng hover mượt mà
```

#### 2. Test Modal Upload
```
Bước test:
1. Nhấn nút "Cập nhật" trên Lớp 1
2. Modal có mở ra không?
3. Kiểm tra 4 phương thức có hiển thị:
   - PDF (màu cam)
   - Word (màu xanh dương)
   - Text (màu xanh lá)
   - JSON (màu tím)

Kết quả mong đợi:
✓ Modal mở mượt mà
✓ Header hiển thị "Cập nhật nội dung Lớp 1"
✓ 4 nút phương thức hiển thị đẹp
✓ Có thể đóng modal bằng nút X hoặc click ngoài
```

### ✅ Test Upload JSON

#### Test 1: Dán JSON Trực Tiếp
```
Bước test:
1. Chọn phương thức "JSON"
2. Copy nội dung từ file: public/admin-lesson-template.json
3. Dán vào textarea
4. Nhấn "Tải lên và xử lý"

Kết quả mong đợi:
✓ Loading spinner hiển thị
✓ Sau vài giây, thông báo thành công
✓ Hiển thị "Đã tải lên thành công X bài học"
✓ Modal tự động đóng sau 2 giây
✓ Số lượng bài học trên Lớp 1 tăng lên
```

#### Test 2: Upload File JSON
```
Bước test:
1. Chọn phương thức "JSON"
2. Nhấn "Chọn file JSON"
3. Chọn file: public/admin-lesson-template.json
4. Nhấn "Tải lên và xử lý"

Kết quả mong đợi:
✓ Tên file hiển thị
✓ Upload thành công
✓ Bài học được tạo
```

### ✅ Test Upload Text File

#### Test 3: Upload File TXT
```
Bước test:
1. Tạo file test.txt với nội dung:

Unit 1 - Hello World

Vocabulary:
- hello: xin chào
- world: thế giới
- good: tốt
- morning: buổi sáng

Sentences:
- Hello, world!
- Good morning!
- Have a good day!

2. Chọn phương thức "Text"
3. Upload file test.txt
4. Nhấn "Tải lên và xử lý"

Kết quả mong đợi:
✓ AI phân tích nội dung
✓ Tạo bài học với từ vựng và câu
✓ Thông báo thành công
```

### ✅ Test Upload Word File

#### Test 4: Upload File DOCX
```
Bước test:
1. Tạo file Word với nội dung tương tự test.txt
2. Chọn phương thức "Word"
3. Upload file .docx
4. Nhấn "Tải lên và xử lý"

Kết quả mong đợi:
✓ Trích xuất text từ Word
✓ AI phân tích
✓ Tạo bài học thành công
```

### ✅ Test Upload PDF File

#### Test 5: Upload File PDF
```
Bước test:
1. Tạo hoặc có sẵn file PDF với nội dung bài học
2. Chọn phương thức "PDF"
3. Upload file .pdf
4. Nhấn "Tải lên và xử lý"

Kết quả mong đợi:
✓ Trích xuất text từ PDF
✓ AI phân tích
✓ Tạo bài học thành công
```

### ✅ Test Error Handling

#### Test 6: JSON Không Hợp Lệ
```
Bước test:
1. Chọn JSON
2. Dán text: { invalid json }
3. Nhấn upload

Kết quả mong đợi:
✓ Hiển thị lỗi "JSON không hợp lệ"
✓ Không crash
```

#### Test 7: File Rỗng
```
Bước test:
1. Tạo file .txt rỗng
2. Upload file
3. Nhấn upload

Kết quả mong đợi:
✓ Hiển thị lỗi "Không thể trích xuất nội dung"
✓ Không crash
```

#### Test 8: Không Phải Admin
```
Bước test:
1. Đăng xuất
2. Đăng nhập với tài khoản khác (không phải admin)
3. Vào /roadmap
4. Hover vào các lớp

Kết quả mong đợi:
✓ Nút "Cập nhật" KHÔNG hiển thị
✓ Chỉ admin mới thấy nút
```

### ✅ Test Real-time Updates

#### Test 9: Cập Nhật Số Lượng Bài Học
```
Bước test:
1. Ghi nhớ số bài học hiện tại của Lớp 1 (ví dụ: 5 bài học)
2. Upload 3 bài học mới
3. Kiểm tra số lượng sau khi upload

Kết quả mong đợi:
✓ Số bài học tăng từ 5 lên 8
✓ Cập nhật ngay lập tức (không cần refresh)
✓ Hiển thị "8 bài học • X hoàn thành"
```

#### Test 10: Bài Học Mới Xuất Hiện
```
Bước test:
1. Upload bài học mới
2. Expand lớp đó ra
3. Kiểm tra danh sách bài học

Kết quả mong đợi:
✓ Bài học mới xuất hiện trong danh sách
✓ Có đầy đủ thông tin: title, part, skillTags
✓ Có thể click vào để học
```

### ✅ Test Database

#### Test 11: Kiểm Tra MongoDB
```
Bước test:
1. Sau khi upload thành công
2. Vào MongoDB Compass hoặc Atlas
3. Kiểm tra collection "lessons"

Kết quả mong đợi:
✓ Document mới được tạo
✓ Có đầy đủ fields: grade, part, title, vocabulary, sentences
✓ uploadedBy = "mstudiotb@gmail.com"
✓ uploadedAt có timestamp
✓ source = "import"
```

### ✅ Test AI Processing

#### Test 12: AI Phân Tích Đúng
```
Bước test:
1. Upload file text với nội dung phức tạp
2. Kiểm tra kết quả AI trả về

Kết quả mong đợi:
✓ AI chia đúng thành các Unit
✓ Từ vựng được trích xuất chính xác
✓ Mẫu câu được nhận diện
✓ Có phiên âm (nếu AI tìm được)
```

## Lỗi Thường Gặp & Cách Fix

### Lỗi 1: "Unauthorized - Admin only"
```
Nguyên nhân: Chưa đăng nhập hoặc không phải admin
Fix: Đăng nhập với mstudiotb@gmail.com
```

### Lỗi 2: "AI API error"
```
Nguyên nhân: ANTHROPIC_API_KEY không đúng hoặc hết quota
Fix: Kiểm tra API key trong .env.local
```

### Lỗi 3: "Database not configured"
```
Nguyên nhân: MongoDB chưa kết nối
Fix: Kiểm tra MONGODB_URI trong .env.local
```

### Lỗi 4: Modal không mở
```
Nguyên nhân: Component chưa import đúng
Fix: Kiểm tra import AdminContentUploadModal trong roadmap/page.tsx
```

### Lỗi 5: Nút không hiện
```
Nguyên nhân: isAdmin = false
Fix: Kiểm tra API /api/auth/me trả về đúng email admin
```

## Performance Check

### Checklist Performance:
- [ ] Modal mở/đóng mượt mà (< 300ms)
- [ ] Upload file < 5MB xử lý trong < 10 giây
- [ ] AI response time < 5 giây
- [ ] UI không bị lag khi hover
- [ ] Refresh data sau upload < 2 giây

## Security Check

### Checklist Security:
- [ ] Chỉ admin thấy nút upload
- [ ] API endpoint kiểm tra authentication
- [ ] Không thể bypass qua client-side
- [ ] File upload có giới hạn kích thước
- [ ] Validate JSON structure trước khi lưu

## Final Checklist

- [ ] Tất cả 12 test cases đều pass
- [ ] Không có lỗi trong console
- [ ] UI responsive trên mobile
- [ ] Documentation đầy đủ
- [ ] Sample files có sẵn

---

## Kết Luận

Nếu tất cả test cases đều pass, tính năng đã sẵn sàng để sử dụng! 🎉

**Lưu ý**: Luôn test trên môi trường development trước khi deploy lên production.
