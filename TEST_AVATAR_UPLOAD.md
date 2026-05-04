# Test Avatar Upload Feature

## Server đang chạy
✅ Development server: http://localhost:3000

## Hướng dẫn test thủ công

### Bước 1: Mở ứng dụng
1. Truy cập: http://localhost:3000
2. Đăng nhập vào hệ thống (nếu cần)

### Bước 2: Kiểm tra giao diện
1. Tìm avatar hình tròn ở sidebar bên trái
2. Di chuột qua avatar
3. **Kiểm tra**: 
   - ✅ Con trỏ chuột chuyển thành pointer (tay)
   - ✅ Border sáng hơn (cyan glow)
   - ✅ Xuất hiện icon máy ảnh (Camera)
   - ✅ Có overlay mờ đen

### Bước 3: Test upload ảnh hợp lệ
1. Click vào avatar
2. Chọn một file ảnh < 10MB (JPG, PNG, GIF, WEBP)
3. **Kiểm tra**:
   - ✅ Preview ảnh hiển thị ngay lập tức
   - ✅ Xuất hiện spinner loading
   - ✅ Thông báo "Cập nhật ảnh đại diện thành công!"
   - ✅ Avatar mới được hiển thị

### Bước 4: Test validation - File quá lớn
1. Click vào avatar
2. Chọn file ảnh > 10MB
3. **Kiểm tra**:
   - ✅ Hiện thông báo: "Dung lượng ảnh không được vượt quá 10MB"
   - ✅ Không upload
   - ✅ Avatar cũ vẫn giữ nguyên

### Bước 5: Test validation - File không hợp lệ
1. Click vào avatar
2. Chọn file không phải ảnh (PDF, TXT, etc.)
3. **Kiểm tra**:
   - ✅ Hiện thông báo: "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)"
   - ✅ Không upload
   - ✅ Avatar cũ vẫn giữ nguyên

### Bước 6: Test persistence
1. Upload ảnh thành công
2. Refresh trang (F5)
3. **Kiểm tra**:
   - ✅ Avatar mới vẫn hiển thị
   - ✅ Không bị reset về logo mặc định

### Bước 7: Kiểm tra file đã lưu
Mở terminal và chạy:
```bash
ls public/avatars/
```
**Kiểm tra**:
- ✅ File ảnh có tên format: `{email}-{timestamp}.{extension}`
- ✅ File có thể mở và xem được

## Test Cases Summary

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Hover avatar | Camera icon + glow effect | ⏳ |
| Click avatar | File picker opens | ⏳ |
| Upload valid image (<10MB) | Success + preview | ⏳ |
| Upload large image (>10MB) | Error message | ⏳ |
| Upload non-image file | Error message | ⏳ |
| Preview display | Instant preview | ⏳ |
| Loading state | Spinner shows | ⏳ |
| Persistence | Avatar saved after refresh | ⏳ |
| File saved | File in public/avatars/ | ⏳ |

## Ảnh test mẫu

Bạn có thể dùng các ảnh sau để test:

### ✅ Ảnh hợp lệ (< 10MB):
- Bất kỳ ảnh JPG/PNG từ máy tính
- Screenshot màn hình
- Ảnh từ internet (download về)

### ❌ Ảnh không hợp lệ (> 10MB):
- Ảnh chụp từ máy ảnh DSLR chất lượng cao
- Ảnh RAW
- File video (để test validation)

## Kết quả test

Sau khi test xong, cập nhật bảng trên với:
- ✅ = Pass
- ❌ = Fail
- ⏳ = Chưa test

## Lưu ý
- Server phải đang chạy: `npm run dev`
- Kiểm tra console browser nếu có lỗi
- Kiểm tra terminal server nếu có lỗi API
