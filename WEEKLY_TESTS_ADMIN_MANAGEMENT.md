# Hệ Thống Quản Lý Bài Thi Tuần - Admin

## Tổng Quan

Tính năng quản lý chuyên sâu cho phép Admin chỉnh sửa và xóa các bài thi tuần trực tiếp từ trang danh sách, với giao diện trực quan và an toàn.

## Tính Năng Chính

### 1. **Chỉnh Sửa Bài Thi (Edit)**

#### Nút Chỉnh Sửa
- **Vị trí**: Góc trên bên phải của mỗi card bài thi
- **Biểu tượng**: Icon bút chì (Edit) trong nút tròn màu tím gradient
- **Hiển thị**: Chỉ Admin mới thấy
- **Hiệu ứng**: Scale up khi hover, animation mượt mà

#### Modal Chỉnh Sửa
Khi nhấn nút Edit, modal sẽ mở ra với:

**Giao diện:**
- Header hiển thị tên bài thi và tuần/năm
- Textarea lớn để chỉnh sửa JSON
- Real-time validation
- Hướng dẫn các trường dữ liệu
- Nút Lưu/Hủy

**Tính năng:**
- ✅ Chỉnh sửa JSON trực tiếp
- ✅ Validation real-time
- ✅ Hiển thị lỗi rõ ràng
- ✅ Tự động format JSON
- ✅ Cập nhật ngay lập tức sau khi lưu

**Các trường có thể chỉnh sửa:**
```json
{
  "title": "Tiêu đề bài thi",
  "description": "Mô tả",
  "week": 1,
  "year": 2026,
  "startDate": "2026-05-01T00:00:00.000Z",
  "endDate": "2026-05-07T23:59:59.999Z",
  "questions": [
    {
      "question": "Câu hỏi",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "points": 1
    }
  ]
}
```

### 2. **Xóa Bài Thi (Delete)**

#### Long Press Mechanism (3 giây)
- **Cách kích hoạt**: Nhấn và giữ vào card bài thi trong 3 giây
- **Visual feedback**: 
  - Thanh tiến trình màu đỏ chạy từ trái sang phải ở đầu card
  - Animation linear trong 3 giây
- **Kết quả**: Nút X màu đỏ xuất hiện ở góc trên bên phải

#### Nút Xóa
- **Biểu tượng**: Icon X trong nút tròn màu đỏ
- **Vị trí**: Góc trên bên phải (sau khi long press)
- **Animation**: Scale in với opacity fade
- **Hover**: Màu đỏ đậm hơn

#### Modal Xác Nhận
Khi nhấn nút X, modal xác nhận sẽ hiện:

**Nội dung:**
- Icon cảnh báo màu đỏ
- Tiêu đề: "Xác nhận xóa bài thi"
- Thông báo: "Anh có chắc muốn xóa bài thi tuần này không? Hành động này không thể hoàn tác và sẽ xóa cả kết quả thi của học sinh."
- 2 nút: Hủy / Xóa bài thi

**Xử lý:**
- Nếu xác nhận → Xóa bài thi + cascade delete submissions
- Nếu hủy → Đóng modal, giữ nguyên bài thi

### 3. **Phân Quyền & Bảo Mật**

#### Kiểm Tra Admin
```typescript
// Check admin from session
const isAdmin = session?.role === "ADMIN"
```

#### Hiển Thị Có Điều Kiện
- Nút Edit: Chỉ hiện với Admin
- Long press: Chỉ hoạt động với Admin
- Nút Delete: Chỉ hiện với Admin sau long press
- API endpoints: Kiểm tra role trước khi thực thi

#### API Security
```typescript
// All admin operations check role
if (role !== "ADMIN") {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 403 }
  )
}
```

### 4. **Cascade Deletion**

Khi xóa bài thi, hệ thống tự động:

1. **Xóa bài thi** từ collection `weeklyTests`
2. **Xóa tất cả submissions** liên quan từ collection `testSubmissions`
3. **Log kết quả** số lượng submissions đã xóa
4. **Refresh UI** để cập nhật danh sách

```typescript
// Cascade delete implementation
const submissionsResult = await submissionsCollection.deleteMany({
  testId: testId,
})

console.log(`Deleted test ${testId} and ${submissionsResult.deletedCount} related submissions`)
```

### 5. **Tương Tác Với Confetti Effects**

#### Z-Index Management
- Confetti: `z-index: 9999` (cao nhất)
- Delete confirm modal: `z-index: 50`
- Edit modal: `z-index: 50`
- Delete button: `z-index: 20`
- Edit button: `z-index: 20`
- Long press indicator: `z-index: 10`

#### Không Xung Đột
- Confetti chỉ hiện khi hoàn thành bài thi (2 giây)
- Admin controls luôn accessible
- Modal có backdrop để tách biệt
- Buttons có position absolute với z-index cao

## Cấu Trúc File

### 1. Component Modal
```
components/weekly-tests/EditTestModal.tsx
```
- Modal chỉnh sửa với JSON editor
- Real-time validation
- Error handling
- Save/Cancel actions

### 2. Page Component
```
app/(dashboard)/weekly-tests/page.tsx
```
- Tích hợp Edit/Delete buttons
- Long press logic
- Delete confirmation modal
- State management

### 3. API Routes
```
app/api/weekly-tests/route.ts
```
- PUT: Update test
- DELETE: Delete test + cascade submissions
- Admin authentication

## Cách Sử Dụng

### Chỉnh Sửa Bài Thi

**Bước 1:** Đăng nhập với tài khoản Admin

**Bước 2:** Vào trang `/weekly-tests`

**Bước 3:** Nhấn nút Edit (icon bút chì) ở góc card bài thi

**Bước 4:** Chỉnh sửa JSON trong modal
- Sửa title, description, questions, v.v.
- Kiểm tra validation real-time
- Đảm bảo JSON hợp lệ

**Bước 5:** Nhấn "Lưu thay đổi"
- Hệ thống sẽ validate
- Gửi request đến API
- Cập nhật database
- Refresh danh sách

**Bước 6:** Xác nhận thay đổi
- Modal tự động đóng
- Bài thi hiển thị nội dung mới

### Xóa Bài Thi

**Bước 1:** Đăng nhập với tài khoản Admin

**Bước 2:** Vào trang `/weekly-tests`

**Bước 3:** Nhấn và giữ vào card bài thi trong 3 giây
- Desktop: Click chuột và giữ
- Mobile: Touch và giữ
- Thanh đỏ sẽ chạy từ trái sang phải

**Bước 4:** Nút X màu đỏ xuất hiện
- Ở góc trên bên phải card
- Animation scale in

**Bước 5:** Nhấn nút X
- Modal xác nhận sẽ hiện
- Đọc cảnh báo về cascade deletion

**Bước 6:** Xác nhận xóa
- Nhấn "Xóa bài thi" để xác nhận
- Hoặc "Hủy" để giữ lại

**Bước 7:** Hoàn tất
- Bài thi bị xóa khỏi database
- Submissions liên quan bị xóa
- UI refresh tự động

## Validation Rules

### Edit Modal Validation

**Trường bắt buộc:**
- `title`: String, không rỗng
- `week`: Number, > 0
- `year`: Number, hợp lệ
- `questions`: Array, length > 0

**Trường tùy chọn:**
- `description`: String
- `startDate`: ISO date string
- `endDate`: ISO date string

**Questions validation:**
- Mỗi question phải có: question, options, correctAnswer, points
- options phải là array
- points phải là number

### Error Messages

```typescript
// JSON không hợp lệ
"JSON không hợp lệ. Vui lòng kiểm tra cú pháp!"

// Thiếu trường bắt buộc
"Thiếu các trường bắt buộc: title, week, year, questions"

// Questions không hợp lệ
"questions phải là mảng và có ít nhất 1 câu hỏi"
```

## API Endpoints

### PUT /api/weekly-tests
**Mục đích:** Cập nhật bài thi

**Request:**
```json
{
  "testId": "507f1f77bcf86cd799439011",
  "role": "ADMIN",
  "title": "Updated Title",
  "description": "Updated Description",
  "questions": [...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test updated successfully"
}
```

### DELETE /api/weekly-tests
**Mục đích:** Xóa bài thi và submissions

**Request:**
```
DELETE /api/weekly-tests?testId=507f1f77bcf86cd799439011&role=ADMIN
```

**Response:**
```json
{
  "success": true,
  "message": "Test deleted successfully",
  "deletedSubmissions": 15
}
```

## Xử Lý Lỗi

### Lỗi Thường Gặp

**1. "Unauthorized"**
- Nguyên nhân: Không phải Admin
- Giải pháp: Đăng nhập với tài khoản Admin

**2. "Test not found"**
- Nguyên nhân: Test ID không tồn tại
- Giải pháp: Refresh trang và thử lại

**3. "JSON không hợp lệ"**
- Nguyên nhân: Cú pháp JSON sai
- Giải pháp: Kiểm tra dấu ngoặc, dấu phẩy

**4. "Failed to update test"**
- Nguyên nhân: Lỗi database hoặc network
- Giải pháp: Kiểm tra kết nối, thử lại

**5. "Failed to delete test"**
- Nguyên nhân: Lỗi database
- Giải pháp: Kiểm tra MongoDB connection

## Best Practices

### Khi Chỉnh Sửa:
1. ✅ Backup JSON trước khi sửa (copy ra notepad)
2. ✅ Sửa từng trường một, test validation
3. ✅ Kiểm tra kỹ trước khi lưu
4. ✅ Verify kết quả sau khi lưu

### Khi Xóa:
1. ✅ Đảm bảo đúng bài thi cần xóa
2. ✅ Hiểu rằng submissions sẽ bị xóa
3. ✅ Không thể undo sau khi xóa
4. ✅ Backup data quan trọng trước

### Security:
1. ✅ Chỉ Admin mới có quyền
2. ✅ Luôn confirm trước khi xóa
3. ✅ Log mọi thao tác admin
4. ✅ Kiểm tra role ở cả client và server

## Testing Checklist

### Test Edit Function:
- [ ] Nút Edit hiện với Admin
- [ ] Nút Edit không hiện với User
- [ ] Modal mở khi nhấn Edit
- [ ] JSON hiển thị đúng
- [ ] Validation hoạt động
- [ ] Lưu thành công
- [ ] UI refresh sau khi lưu
- [ ] Error handling đúng

### Test Delete Function:
- [ ] Long press hoạt động (3s)
- [ ] Progress bar hiển thị
- [ ] Nút X xuất hiện sau 3s
- [ ] Modal confirm hiển thị
- [ ] Cascade delete submissions
- [ ] UI refresh sau khi xóa
- [ ] Không thể undo
- [ ] Error handling đúng

### Test Permissions:
- [ ] Admin thấy tất cả controls
- [ ] User không thấy controls
- [ ] API reject non-admin requests
- [ ] Session validation đúng

### Test UI/UX:
- [ ] Buttons không che nội dung
- [ ] Confetti không che buttons
- [ ] Z-index đúng thứ tự
- [ ] Animation mượt mà
- [ ] Responsive trên mobile

## Troubleshooting

### Nút không hiện?
```typescript
// Check session
console.log("Session:", session)
console.log("Is Admin:", isAdmin)

// Should be:
// session.role === "ADMIN"
// isAdmin === true
```

### Long press không hoạt động?
```typescript
// Check event handlers
onMouseDown={() => isAdmin && handleLongPressStart(test._id)}
onTouchStart={() => isAdmin && handleLongPressStart(test._id)}

// Ensure isAdmin is true
```

### Modal không mở?
```typescript
// Check state
console.log("Edit Modal Open:", editModalOpen)
console.log("Selected Test:", selectedTest)

// Both should be truthy
```

## Performance

### Optimizations:
- ✅ Lazy load modal components
- ✅ Debounce validation
- ✅ Optimize re-renders
- ✅ Cache session data
- ✅ Batch API calls

### Metrics:
- Modal open time: < 100ms
- Validation response: < 50ms
- Save operation: < 2s
- Delete operation: < 2s
- UI refresh: < 1s

## Future Enhancements

### Có thể thêm:
1. **Bulk operations**: Xóa nhiều bài thi cùng lúc
2. **Version history**: Lưu lịch sử chỉnh sửa
3. **Undo/Redo**: Hoàn tác thao tác
4. **Preview mode**: Xem trước trước khi lưu
5. **Duplicate test**: Copy bài thi
6. **Export/Import**: Xuất/nhập JSON
7. **Rich text editor**: Editor WYSIWYG thay vì JSON

---

**Phát triển bởi:** TJN MSTUDIOTB  
**Email:** mstudiotb@gmail.com  
**Version:** 1.0.0  
**Last Updated:** 2026-05-05
