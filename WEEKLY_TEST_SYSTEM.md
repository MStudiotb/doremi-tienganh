# 🎓 Hệ Thống Bài Thi Tuần - DOREMI

## Tổng Quan

Hệ thống "Bài Thi Tuần" hoàn chỉnh với AI Teacher (Cô Doremi), Bảng Vàng Tuyên Dương, và tính năng tương tác xã hội đã được triển khai thành công cho dự án DOREMI.

## ✨ Tính Năng Chính

### 1. **Quản Lý Bài Thi (Admin)**
- ✅ Tạo bài thi mới với nhiều loại câu hỏi (trắc nghiệm, tự luận, điền khuyết)
- ✅ Đặt thời gian bắt đầu và kết thúc
- ✅ Upload file PDF đề thi (tùy chọn)
- ✅ Quản lý trạng thái bài thi (draft, active, closed)
- ✅ Thông báo tự động cho tất cả học sinh khi có bài thi mới

### 2. **Làm Bài Thi (User)**
- ✅ Xem danh sách bài thi đang diễn ra
- ✅ Giao diện làm bài thân thiện
- ✅ Nộp bài và nhận kết quả ngay lập tức
- ✅ Không thể làm lại bài thi đã nộp

### 3. **AI Teacher - Cô Doremi** 🤖
- ✅ Chấm điểm tự động bằng Gemini AI
- ✅ Đánh giá chi tiết từng câu trả lời
- ✅ Lời phê khích lệ và xây dựng
- ✅ Nhận xét cụ thể cho từng câu sai
- ✅ Quy đổi điểm sang thang 10
- ✅ Fallback grading khi AI không khả dụng

### 4. **Bảng Vàng Tuyên Dương** 🏆
- ✅ Tự động cập nhật học sinh đạt điểm cao nhất
- ✅ Hiển thị nổi bật trên trang chủ Dashboard
- ✅ Ảnh tuyên dương với thông tin học sinh
- ✅ Lời nhận xét của Cô Doremi
- ✅ Chỉ hiển thị bài đạt từ 8 điểm trở lên

### 5. **Tương Tác Xã Hội** 💬
- ✅ Thả tim (Like) cho bài viết trên Bảng Vàng
- ✅ Bình luận chúc mừng
- ✅ Thông báo cho chủ bài viết khi có tương tác
- ✅ Xóa bình luận (chủ sở hữu hoặc admin)

### 6. **Hệ Thống Thông Báo** 🔔
- ✅ Thông báo bài thi mới (icon: chuong.png)
- ✅ Thông báo kết quả chấm bài
- ✅ Thông báo lên Bảng Vàng (icon: dau chan.png)
- ✅ Thông báo có người thích bài viết
- ✅ Thông báo có bình luận mới

## 📁 Cấu Trúc File

### Database Schema (`lib/mongodb-collections.ts`)
```typescript
- WeeklyTest: Thông tin bài thi
- TestSubmission: Bài làm của học sinh
- HallOfFameEntry: Bảng vàng
- Notification: Thông báo
```

### API Routes
```
/api/weekly-tests/
├── route.ts (GET, POST, PUT, DELETE - Quản lý bài thi)
├── submit/route.ts (POST, GET - Nộp bài và xem kết quả)

/api/hall-of-fame/
└── route.ts (GET, POST, DELETE - Bảng vàng và tương tác)
```

### UI Components
```
components/
└── HallOfFameCard.tsx (Hiển thị Bảng Vàng trên Dashboard)

app/(dashboard)/weekly-tests/
└── page.tsx (Danh sách bài thi)
```

## 🔧 Cấu Hình

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

### MongoDB Collections
Hệ thống tự động tạo các collections sau:
- `weeklyTests` - Lưu trữ bài thi
- `testSubmissions` - Lưu trữ bài làm
- `hallOfFame` - Lưu trữ bảng vàng
- `notifications` - Lưu trữ thông báo

## 🎯 Workflow Hoàn Chỉnh

### 1. Admin Tạo Bài Thi
```
Admin → Tạo bài thi → Đặt thời gian → Thêm câu hỏi → Publish
                                                        ↓
                                            Thông báo gửi đến tất cả users
```

### 2. User Làm Bài
```
User → Xem danh sách bài thi → Chọn bài thi → Làm bài → Nộp bài
                                                            ↓
                                                    AI chấm điểm ngay
                                                            ↓
                                                    Lưu kết quả vào DB
                                                            ↓
                                                    Kiểm tra điểm cao nhất
                                                            ↓
                                            (Nếu đạt ≥8 điểm và cao nhất)
                                                            ↓
                                                    Cập nhật Bảng Vàng
                                                            ↓
                                                Thông báo cho user
```

### 3. Hiển Thị Bảng Vàng
```
Dashboard → HallOfFameCard → Fetch API → Hiển thị thông tin
                                              ↓
                                    Avatar + Tên + Điểm
                                              ↓
                                    Lời nhận xét Cô Doremi
                                              ↓
                                    Likes + Comments
```

### 4. Tương Tác
```
User → Thả tim / Bình luận → API cập nhật → Thông báo cho chủ bài
```

## 🤖 AI Grading Logic

### Gemini API Integration
```javascript
1. Chuẩn bị prompt với vai trò "Cô Doremi"
2. Gửi đề bài + câu trả lời đến Gemini
3. Yêu cầu AI trả về JSON format:
   {
     "rawScore": <điểm thô>,
     "score": <điểm/10>,
     "feedback": "<lời phê tổng quan>",
     "detailedFeedback": [...]
   }
4. Parse kết quả và lưu vào database
```

### Fallback Grading
- Tự động chấm trắc nghiệm (so sánh đáp án)
- Cho điểm một phần cho câu tự luận (dựa vào độ dài)
- Tạo feedback cơ bản

## 🎨 UI/UX Features

### Dashboard Integration
- Bảng Vàng hiển thị ngay sau phần thống kê
- Animation mượt mà với Framer Motion
- Responsive design cho mobile và desktop
- Glass morphism effect

### Icons & Assets
- `/chuong.png` - Icon thông báo bài thi mới
- `/dau chan.png` - Icon tuyên dương, thành tích
- `/doremi1.png` - Avatar Cô Doremi

## 📊 Database Indexes (Khuyến nghị)

```javascript
// Tối ưu hiệu suất
db.weeklyTests.createIndex({ status: 1, startDate: 1, endDate: 1 })
db.testSubmissions.createIndex({ testId: 1, userId: 1 })
db.testSubmissions.createIndex({ testId: 1, totalScore: -1 })
db.hallOfFame.createIndex({ week: 1, year: 1 })
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 })
```

## 🔐 Security Features

- ✅ Role-based access control (Admin vs User)
- ✅ Kiểm tra quyền trước khi thực hiện hành động
- ✅ Validate input data
- ✅ Prevent duplicate submissions
- ✅ Sanitize user-generated content

## 🚀 Cách Sử Dụng

### Cho Admin:
1. Đăng nhập với tài khoản Admin
2. Vào mục "Quản Lý Bài Thi" (cần tạo UI admin)
3. Tạo bài thi mới với các thông tin:
   - Tiêu đề
   - Mô tả
   - Tuần/Năm
   - Thời gian bắt đầu/kết thúc
   - Danh sách câu hỏi
4. Publish bài thi

### Cho User:
1. Đăng nhập vào hệ thống
2. Xem thông báo về bài thi mới
3. Vào mục "Bài Thi Tuần" từ sidebar
4. Chọn bài thi và làm bài
5. Nộp bài và xem kết quả ngay
6. Kiểm tra Bảng Vàng trên Dashboard
7. Tương tác (like, comment) với bài viết trên Bảng Vàng

## 📝 TODO - Các Tính Năng Bổ Sung

### Admin Interface (Chưa hoàn thành)
- [ ] Trang quản lý bài thi cho Admin
- [ ] Form tạo/sửa bài thi
- [ ] Xem thống kê kết quả thi
- [ ] Export dữ liệu

### Advanced Features (Tương lai)
- [ ] Tạo ảnh tuyên dương tự động bằng Canvas API
- [ ] Lịch sử bài thi của từng học sinh
- [ ] Biểu đồ tiến bộ theo thời gian
- [ ] Xếp hạng tổng thể
- [ ] Chế độ thi thử (practice mode)
- [ ] Timer đếm ngược khi làm bài
- [ ] Lưu nháp bài làm

## 🧪 Testing

### Test Workflow Hoàn Chỉnh:
```bash
# 1. Tạo bài thi mẫu (qua API hoặc MongoDB Compass)
POST /api/weekly-tests
{
  "title": "Bài Thi Tuần 1 - 2026",
  "description": "Kiểm tra từ vựng và ngữ pháp cơ bản",
  "week": 1,
  "year": 2026,
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "What is the capital of Vietnam?",
      "options": ["Hanoi", "Ho Chi Minh", "Da Nang", "Hue"],
      "correctAnswer": "Hanoi",
      "points": 10
    }
  ],
  "startDate": "2026-05-01",
  "endDate": "2026-05-07",
  "createdBy": "admin@doremi.com",
  "role": "ADMIN"
}

# 2. User làm bài và nộp
POST /api/weekly-tests/submit
{
  "testId": "<test_id>",
  "userId": "user@example.com",
  "userName": "Nguyễn Văn A",
  "answers": [
    { "questionId": "q1", "answer": "Hanoi" }
  ]
}

# 3. Kiểm tra Bảng Vàng
GET /api/hall-of-fame?limit=1

# 4. Kiểm tra Dashboard
# Mở trang chủ và xem HallOfFameCard
```

## 🎉 Kết Quả

Hệ thống Bài Thi Tuần đã được triển khai đầy đủ với:
- ✅ Backend APIs hoàn chỉnh
- ✅ AI grading với Gemini
- ✅ Hall of Fame tự động
- ✅ Social interactions
- ✅ Notification system
- ✅ Beautiful UI components
- ✅ Responsive design

## 📞 Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. MongoDB connection
2. GEMINI_API_KEY trong .env.local
3. Console logs trong browser
4. Network tab để xem API responses

---

**Phát triển bởi:** TJN MSTUDIOTB  
**Ngày hoàn thành:** 05/05/2026  
**Version:** 1.0.0
