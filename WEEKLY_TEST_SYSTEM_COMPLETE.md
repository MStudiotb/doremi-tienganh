# 🎓 Hệ Thống Bài Thi Tuần - Hoàn Chỉnh

## 📋 Tổng Quan

Hệ thống "Bài Thi Tuần" đã được triển khai đầy đủ với tất cả các tính năng được yêu cầu:

### ✅ Các Tính Năng Đã Hoàn Thành

1. **Chức năng Admin (Quản lý đề thi)**
   - ✅ Giao diện upload file Word (.docx) hoặc PDF
   - ✅ AI tự động trích xuất 10 câu hỏi trắc nghiệm từ file
   - ✅ Lưu trữ vào Database MongoDB

2. **Giao diện User làm bài (Dạng giấy A4)**
   - ✅ Thiết kế mô phỏng trang giấy A4 (210mm x 297mm)
   - ✅ Nền trắng, đặt giữa màn hình
   - ✅ 10 câu hỏi trắc nghiệm với 4 đáp án mỗi câu

3. **Logic chọn đáp án với icon**
   - ✅ Thay chữ A, B, C, D bằng hình tròn trống
   - ✅ Khi click chọn, hiện icon "/chuong.png" để xác nhận

4. **Tính năng Nộp bài & Chấm điểm**
   - ✅ Nút "Nộp bài" ở góc trên bên phải
   - ✅ Screenshot toàn bộ trang làm bài (html2canvas)
   - ✅ AI "Cô Doremi" chấm điểm trên thang 10
   - ✅ Viết lời phê khích lệ
   - ✅ Lưu kết quả vinh danh lên Bảng Vàng (nếu đạt ≥8 điểm)

5. **Kỹ thuật**
   - ✅ Sử dụng html2canvas để chụp màn hình
   - ✅ Font chữ Nunito in đậm (weight: 900) cho tiêu đề

---

## 📁 Cấu Trúc File

### 1. API Routes

#### `/app/api/weekly-tests/upload/route.ts`
- **Chức năng**: Upload file Word/PDF và trích xuất câu hỏi bằng AI
- **Method**: POST
- **Input**: FormData với file, title, description, week, year, startDate, endDate
- **Output**: 10 câu hỏi trắc nghiệm được AI tạo ra
- **AI Engine**: Anthropic Claude API

#### `/app/api/weekly-tests/route.ts`
- **Chức năng**: CRUD operations cho bài thi
- **Methods**: GET, POST, PUT, DELETE
- **Features**: 
  - Lọc theo role (Admin/User)
  - Tạo thông báo cho tất cả users khi có bài thi mới

#### `/app/api/weekly-tests/submit/route.ts`
- **Chức năng**: Nộp bài và chấm điểm bằng AI
- **Method**: POST, GET
- **Features**:
  - Nhận screenshot từ client
  - AI "Cô Doremi" chấm điểm và viết lời phê
  - Tự động cập nhật Hall of Fame nếu đạt điểm cao
  - Gửi thông báo kết quả

### 2. Pages

#### `/app/(dashboard)/weekly-tests/page.tsx`
- **Chức năng**: Trang danh sách bài thi
- **Features**:
  - Hiển thị tất cả bài thi
  - Trạng thái: Sắp diễn ra, Đang diễn ra, Đã hoàn thành, Đã kết thúc
  - Nút "Tạo Bài Thi" cho Admin
  - Hiển thị điểm nếu đã làm bài

#### `/app/(dashboard)/weekly-tests/admin/page.tsx`
- **Chức năng**: Trang admin tạo bài thi
- **Features**:
  - Upload file Word (.docx) hoặc PDF
  - Form nhập thông tin bài thi
  - AI tự động trích xuất 10 câu hỏi
  - Chỉ Admin mới truy cập được

#### `/app/(dashboard)/weekly-tests/[testId]/page.tsx`
- **Chức năng**: Trang làm bài thi
- **Features**:
  - Thiết kế A4 (210mm x 297mm)
  - Nền trắng, shadow 2xl
  - 10 câu hỏi với circular checkbox
  - Icon /chuong.png khi chọn đáp án
  - Nút "Nộp bài" fixed position
  - Screenshot bằng html2canvas

#### `/app/(dashboard)/weekly-tests/[testId]/result/page.tsx`
- **Chức năng**: Trang kết quả bài thi
- **Features**:
  - Hiển thị điểm số lớn
  - Lời phê từ Cô Doremi
  - Chi tiết từng câu (đúng/sai)
  - Confetti effect nếu điểm ≥8
  - Nút xem Bảng Vàng nếu đạt điểm cao

### 3. TypeScript Interfaces

#### `/lib/mongodb-collections.ts`
```typescript
export interface TestSubmission {
  _id?: ObjectId
  testId: string
  userId: string
  userName: string
  userAvatar?: string
  answers: SubmissionAnswer[]
  totalScore: number
  rawScore?: number
  status: SubmissionStatus
  aiTeacherFeedback?: string
  screenshot?: string // Screenshot base64 data URL
  submittedAt: Date
  gradedAt?: Date
  gradedBy?: string
}
```

---

## 🎨 Thiết Kế UI/UX

### Màu Sắc
- **Primary**: `oklch(0.72_0.28_320)` - Tím hồng
- **Secondary**: `oklch(0.58_0.22_280)` - Tím đậm
- **Background**: Gradient tối với radial overlay
- **A4 Paper**: Trắng (#ffffff)

### Typography
- **Font**: Nunito
- **Title Weight**: 900 (Black)
- **Body**: 400-700

### Components
- **Circular Checkbox**: Border 2px, rounded-full
- **Selected State**: Icon /chuong.png (20x20px)
- **Submit Button**: Fixed position, gradient background
- **Score Display**: 7xl font size, color-coded

---

## 🔧 Cài Đặt & Sử Dụng

### 1. Cài Đặt Dependencies

```bash
npm install html2canvas
```

### 2. Cấu Hình Environment Variables

Thêm vào `.env.local`:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
MONGODB_URI=your_mongodb_connection_string
```

### 3. Chạy Development Server

```bash
npm run dev
```

### 4. Truy Cập

- **User**: `http://localhost:3000/weekly-tests`
- **Admin**: `http://localhost:3000/weekly-tests/admin`

---

## 📖 Hướng Dẫn Sử Dụng

### Dành Cho Admin

1. **Tạo Bài Thi Mới**
   - Truy cập `/weekly-tests`
   - Click nút "Tạo Bài Thi" (chỉ Admin mới thấy)
   - Upload file Word (.docx) hoặc PDF
   - Điền thông tin: Tiêu đề, Mô tả, Tuần, Năm, Ngày bắt đầu/kết thúc
   - Click "Tạo Bài Thi"
   - AI sẽ tự động trích xuất 10 câu hỏi

2. **Quản Lý Bài Thi**
   - Xem danh sách tất cả bài thi
   - Theo dõi số lượng học viên đã làm bài
   - Xem thống kê điểm số

### Dành Cho User (Học Viên)

1. **Làm Bài Thi**
   - Truy cập `/weekly-tests`
   - Chọn bài thi muốn làm
   - Click "Làm bài thi"
   - Đọc câu hỏi và click vào hình tròn để chọn đáp án
   - Icon chuông sẽ xuất hiện khi đã chọn
   - Click "Nộp bài" khi hoàn thành

2. **Xem Kết Quả**
   - Sau khi nộp bài, tự động chuyển đến trang kết quả
   - Xem điểm số và lời phê từ Cô Doremi
   - Xem chi tiết từng câu (đúng/sai)
   - Nếu đạt ≥8 điểm, sẽ được lên Bảng Vàng

---

## 🤖 AI Integration

### Anthropic Claude API

#### 1. Trích Xuất Câu Hỏi
- **Model**: claude-3-5-sonnet-20241022
- **Input**: Nội dung file Word/PDF
- **Output**: 10 câu hỏi trắc nghiệm (JSON format)
- **Prompt**: Yêu cầu AI tạo câu hỏi liên quan đến nội dung

#### 2. Chấm Điểm & Phản Hồi
- **Model**: claude-3-5-sonnet-20241022
- **Input**: Câu hỏi + Câu trả lời của học viên
- **Output**: Lời phê khích lệ từ "Cô Doremi"
- **Tone**: Thân thiện, động viên, sử dụng emoji

### Fallback Mechanism
- Nếu API key không có hoặc lỗi, hệ thống sẽ dùng logic fallback
- Vẫn chấm điểm được nhưng lời phê sẽ generic hơn

---

## 📊 Database Schema

### Collection: `weeklyTests`
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  week: Number,
  year: Number,
  questions: [
    {
      question: String,
      options: [String], // 4 options
      correctAnswer: Number, // 0-3
      points: Number // 1
    }
  ],
  status: "active" | "draft" | "closed",
  startDate: Date,
  endDate: Date,
  totalPoints: Number,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: `testSubmissions`
```javascript
{
  _id: ObjectId,
  testId: String,
  userId: String,
  userName: String,
  userAvatar: String,
  answers: [
    {
      questionIndex: Number,
      userAnswer: Number,
      correctAnswer: Number,
      isCorrect: Boolean,
      pointsEarned: Number
    }
  ],
  totalScore: Number, // 0-10
  rawScore: Number,
  status: "graded",
  aiTeacherFeedback: String,
  screenshot: String, // base64 data URL
  submittedAt: Date,
  gradedAt: Date,
  gradedBy: String
}
```

### Collection: `hallOfFame`
```javascript
{
  _id: ObjectId,
  testId: String,
  testTitle: String,
  week: Number,
  year: Number,
  submissionId: String,
  userId: String,
  userName: String,
  userAvatar: String,
  score: Number,
  imageUrl: String,
  aiTeacherComment: String,
  likes: [String],
  comments: [],
  featuredAt: Date,
  createdAt: Date
}
```

---

## 🎯 Tính Năng Nổi Bật

### 1. AI-Powered Question Extraction
- Tự động phân tích nội dung file
- Tạo 10 câu hỏi chất lượng cao
- Đa dạng độ khó (cơ bản → nâng cao)

### 2. A4 Paper Design
- Mô phỏng giấy thi thật
- Responsive design
- Professional look & feel

### 3. Circular Answer Selection
- UX/UI độc đáo
- Icon /chuong.png làm checkmark
- Smooth transitions

### 4. AI Teacher Feedback
- Lời phê cá nhân hóa
- Giọng điệu của "Cô Doremi"
- Khích lệ và xây dựng

### 5. Screenshot & Archive
- Lưu trữ bài làm dưới dạng ảnh
- Có thể xem lại sau này
- Chứng minh kết quả

### 6. Hall of Fame Integration
- Tự động cập nhật nếu đạt điểm cao
- Vinh danh học viên xuất sắc
- Tạo động lực học tập

---

## 🔒 Bảo Mật

- ✅ Role-based access control (Admin/User)
- ✅ Kiểm tra quyền trước khi upload/tạo bài thi
- ✅ Validate input data
- ✅ Prevent duplicate submissions
- ✅ Secure API endpoints

---

## 🚀 Performance

- ✅ Lazy loading images
- ✅ Optimized screenshot capture (scale: 2)
- ✅ Efficient database queries
- ✅ Client-side caching (localStorage)
- ✅ Smooth animations (Framer Motion)

---

## 📱 Responsive Design

- ✅ Desktop: Full A4 paper view
- ✅ Tablet: Scaled down A4
- ✅ Mobile: Stacked layout (future enhancement)

---

## 🎉 Kết Luận

Hệ thống "Bài Thi Tuần" đã được triển khai hoàn chỉnh với tất cả các tính năng được yêu cầu:

1. ✅ Admin upload file Word/PDF
2. ✅ AI tự động trích xuất 10 câu hỏi
3. ✅ Giao diện A4 paper design
4. ✅ Circular answer selection với icon /chuong.png
5. ✅ Screenshot bài làm
6. ✅ AI "Cô Doremi" chấm điểm và viết lời phê
7. ✅ Tích hợp Hall of Fame
8. ✅ Font Nunito weight 900 cho tiêu đề

Hệ thống sẵn sàng để sử dụng trong môi trường production!

---

## 📞 Hỗ Trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team phát triển.

**Phiên bản**: 1.0.0  
**Ngày hoàn thành**: 05/05/2026  
**Developed with 💜 by Doremi Team**
