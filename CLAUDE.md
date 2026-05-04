# Tóm tắt dự án DOREMI - ĐI HỌC ĐI

## 1. Thiết lập dự án

- Dự án được xây dựng bằng Next.js, sử dụng App Router.
- Ngôn ngữ chính: TypeScript.
- Giao diện sử dụng Tailwind CSS.
- Thư mục dự án chính: `HOCTIENGANH`.
- Các thư mục quan trọng:
  - `app/`: chứa trang, layout và API route.
  - `components/`: chứa các component giao diện dùng lại.
  - `lib/`: chứa logic dùng chung, bao gồm phần MongoDB/RAG.
  - `assets/` và `public/`: chứa hình ảnh, logo, mascot và tài nguyên tĩnh.

## 2. Thư viện đã dùng

- `lucide-react`: dùng cho icon trong Sidebar, Dashboard, form đăng nhập.
- `framer-motion`: dùng cho hiệu ứng chuyển động ở Dashboard và Roadmap.
- `pdfjs-dist`: dùng để đọc và trích xuất văn bản từ file PDF.
- `mammoth`: dùng để đọc và trích xuất văn bản từ file Word `.docx`.
- `next-auth`, `bcryptjs`, `mongodb`: đã có trong dự án, nhưng luồng đăng nhập hiện tại đang ưu tiên chế độ localStorage để chạy nhanh không cần database.

## 3. Phong cách giao diện

- Giao diện theo phong cách Dark Theme + Glassmorphism.
- Màu nền chính là tím đen rất tối.
- Màu nhấn chính:
  - Xanh teal neon.
  - Tím hồng neon.
  - Vàng/gold cho một số phần thương hiệu DOREMI.
- Đã tạo các lớp kính mờ cho card/panel:
  - Nền trong suốt.
  - Blur mạnh.
  - Viền trắng mờ.
  - Bo góc lớn.
  - Đổ bóng mềm.

## 4. Bố cục ứng dụng

- Dashboard có Sidebar cố định bên trái.
- Khu vực nội dung chính nằm bên phải và có thể cuộn.
- Trang đăng nhập `/auth` là giao diện độc lập, không dùng Sidebar.
- Footer thương hiệu đã được đặt là:
  - `Phát Triển App & Web by TJN MSTUDIOTB style by Anaceus Tue`

## 5. Sidebar

- Sidebar hiển thị thương hiệu `DOREMI - ĐI HỌC ĐI`.
- Logo sử dụng file `/logo.png` thông qua `next/image`.
- Khu vực logo có hiệu ứng glass đồng bộ với app.
- Có thẻ thông tin người dùng hiển thị:
  - Tên người dùng.
  - Streak.
  - XP.
  - Badge ADMIN nếu là tài khoản quản trị.
- Các mục điều hướng chính:
  - Lộ trình
  - Bài học
  - Bài tập
  - Test Center
  - Nghe hiểu
  - Phát âm
  - Viết câu
  - Ôn tập
- Nếu đăng nhập bằng tài khoản Admin, Sidebar hiển thị thêm mục:
  - Quản lý Dữ liệu
- Phía dưới Sidebar có:
  - Backup
  - Import
  - Nút chuyển theme
  - Logout
- Logout sẽ xóa session trong localStorage và chuyển về `/auth`.

## 6. Đăng nhập và đăng ký

- Luồng đăng nhập/đăng ký hiện tại chạy bằng localStorage ở phía trình duyệt.
- Không bắt buộc MongoDB để đăng nhập hoặc đăng ký trong chế độ hiện tại.
- Tài khoản Admin được nhận diện bằng email đặc biệt:
  - `mstudiotb@gmail.com`
- Khi đăng nhập đúng tài khoản Admin, hệ thống lưu role là `ADMIN`.
- Thông tin phiên đăng nhập được lưu vào localStorage bằng các key:
  - `doremi_session`
  - `doremi_user_role`
  - `doremi_display_name`
  - `doremi_selected_grade`
  - `doremi_student_age`

## 7. Form đăng ký

- Form đăng ký hiện có các trường:
  - Họ và tên
  - Tuổi
  - Chọn Khối
  - Email
  - Mật khẩu
  - Xác nhận mật khẩu
- Dropdown Chọn Khối hỗ trợ từ:
  - Khối 1 đến Khối 12
- Tuổi và Khối được lưu vào localStorage để cá nhân hóa Dashboard.

## 8. Giao diện đăng nhập

- Trang đăng nhập nằm tại:
  - `app/auth/page.tsx`
- Giao diện dùng Glassmorphism.
- Logo chính dùng file:
  - `icondangki.png`
- Icon dấu chân dùng file:
  - `dau chan.png`
- Nội dung thương hiệu:
  - `DOREMI - ĐI HỌC ĐI`
  - `Học Tiếng Anh Mỗi Ngày`
- Có tab chuyển giữa:
  - Đăng nhập
  - Đăng ký

## 9. Tự động đồng bộ giáo trình sau đăng ký

- Sau khi người dùng đăng ký và chọn Khối, hệ thống tự chạy luồng đồng bộ tài liệu.
- Giao diện hiển thị thanh tiến trình màu tím neon với nội dung:
  - `Đang đồng bộ giáo trình Khối [X] về máy của bạn...`
- Hệ thống lưu thông tin bộ tài liệu đã đồng bộ vào localStorage:
  - `doremi_synced_resource_packs`
- Trình duyệt sẽ kích hoạt tải xuống file mẫu PDF và audio WAV theo Khối đã chọn.
- Lưu ý: do giới hạn bảo mật của trình duyệt, web app không thể âm thầm ghi file trực tiếp vào máy người dùng như app desktop. Việc tải file vẫn đi qua cơ chế download của browser.

## 10. Dashboard người dùng

- Trang chủ `/` hiển thị User Dashboard khi đã có session localStorage.
- Nếu chưa đăng nhập, trang chủ hiển thị màn hình đăng nhập.
- Dashboard gồm:
  - Sidebar.
  - Banner chào mừng.
  - Lộ trình học.
  - Các thẻ thống kê.
  - Danh sách bài học đang tiếp tục.
- Nếu là Admin, người dùng có thể chọn giữa:
  - Admin Panel.
  - User Dashboard.

## 11. Welcome Banner

- Component:
  - `components/WelcomeBanner.tsx`
- Hiển thị lời chào theo tên người dùng.
- Không còn hardcode `PROUSER`.
- Mascot Doremi dùng các ảnh trong `public/`:
  - `doremi1.png`
  - `doremi2.png`
  - `doremi3.png`
- Mascot có animation theo chu kỳ.
- Animation chạy định kỳ và khi người dùng quay lại tab/trang.
- Ảnh mascot được bọc trong khung cố định để tránh bị nhảy khung hình.

## 12. Stats Section

- Component:
  - `components/StatsSection.tsx`
- Hiển thị 3 thẻ thống kê:
  - Tổng số Tài Liệu & Bài Tập
  - Số Bài Tập Hoàn Thành của Tháng
  - Tổng Số Thành Viên
- Các thẻ dùng hiệu ứng Glassmorphism và icon từ `lucide-react`.

## 13. Lộ trình học

- Dashboard có phần:
  - `Lộ trình của bạn`
- Các cấp độ trong lộ trình:
  - Cơ bản
  - Trung cấp
  - Trung cao cấp
  - Cao cấp
  - Thành thạo
  - Master
  - Challenger
- Các icon đã dùng:
  - Sprout
  - Leaf
  - Waves
  - Rocket
  - Diamond
  - Crown
  - Trophy
- Có hiệu ứng hover bằng Framer Motion.
- Khi chọn một cấp độ, danh sách bài học bên dưới thay đổi theo cấp độ đó.

## 14. Bài học

- Các bài học được tải bằng dynamic import.
- Các file bài học chính:
  - `components/lessons/daily-conversation.tsx`
  - `components/lessons/vocabulary-builder.tsx`
  - `components/lessons/listening-drill.tsx`
- Cách tải này giúp bài học chỉ được load khi cần.

## 15. Trang Quản lý Dữ liệu

- Trang Admin nằm tại:
  - `app/(dashboard)/admin/page.tsx`
- Trang này dùng để nhập dữ liệu cho RAG.
- Admin có thể tải lên:
  - PDF
  - Word `.docx`
  - TXT
  - WAV
  - Hình ảnh
- Có ô nhập văn bản để thêm nội dung RAG thủ công.
- Dữ liệu được lưu cục bộ vào localStorage.

## 16. Xử lý file cho RAG

- PDF:
  - Được đọc bằng `pdfjs-dist`.
  - Hệ thống cố gắng trích xuất text từ từng trang.
- DOCX:
  - Được đọc bằng `mammoth`.
  - Hệ thống trích xuất raw text từ file Word.
- TXT:
  - Được đọc trực tiếp bằng FileReader.
- WAV và hình ảnh:
  - Được lưu như file tài nguyên.
  - Chưa có OCR hoặc speech-to-text trong bản hiện tại.

## 17. AI Auto-Tagging cho RAG

- Khi tải tài liệu lên, hệ thống phân tích nội dung văn bản đã trích xuất.
- Cơ chế hiện tại là rule-based local, chạy ngay trong trình duyệt.
- Nếu phát hiện từ vựng đơn giản như:
  - `hello`
  - `goodbye`
  - `family`
  - `mother`
  - `father`
  - `school`
  - `book`
thì tự gắn nhãn `Cấp 1`.
- Nếu phát hiện ngữ pháp trung cấp như:
  - `because`
  - `although`
  - `comparative`
  - `superlative`
  - `present perfect`
  - `reported speech`
thì tự gắn nhãn `Cấp 2`.
- Nếu phát hiện từ học thuật hoặc ngữ pháp nâng cao như:
  - `academic`
  - `hypothesis`
  - `analysis`
  - `therefore`
  - `nevertheless`
  - `passive voice`
  - `subjunctive`
thì tự gắn nhãn `Cấp 3`.

## 18. Namespace dữ liệu RAG

- Để tránh dữ liệu bị chồng chéo, tài nguyên được lưu theo namespace riêng:
  - `primary_data`
  - `secondary_data`
  - `highschool_data`
- Ý nghĩa:
  - `primary_data`: dữ liệu Cấp 1.
  - `secondary_data`: dữ liệu Cấp 2.
  - `highschool_data`: dữ liệu Cấp 3.
- Các key localStorage tương ứng:
  - `doremi_rag_namespace_primary_data`
  - `doremi_rag_namespace_secondary_data`
  - `doremi_rag_namespace_highschool_data`
- Mỗi tài nguyên được lưu kèm:
  - Tên file.
  - Loại file.
  - Dung lượng file.
  - Nội dung RAG.
  - Cấp học.
  - Namespace.
  - Lý do tự phân loại.
  - Thời gian tạo.

## 19. API Routes

- Các API route hiện có:
  - `/api/auth/login`
  - `/api/auth/logout`
  - `/api/auth/me`
  - `/api/auth/register`
  - `/api/admin/backup-users`
- Auth API đã được điều chỉnh để không bị chặn khi thiếu MongoDB trong chế độ local.
- API backup users dùng để tạo file sao lưu danh sách người dùng vào thư mục dữ liệu cục bộ.

## 20. MongoDB

- Dự án có file helper MongoDB:
  - `lib/mongodb.ts`
- Tuy nhiên, luồng hiện tại không bắt buộc MongoDB.
- Nếu thiếu `MONGODB_URI`, người dùng vẫn có thể đăng nhập/đăng ký bằng chế độ localStorage.

## 21. Kiểm tra hiện trạng

- Dự án đã chạy kiểm tra thành công:
  - `npm run lint`
  - `npm run build`

## 22. Tính năng Tra Cứu Từ Vựng

### 22.1. Tổng quan
- Menu "Test Center" đã được đổi tên thành "Tra Cứu Từ Vựng".
- Hệ thống tra cứu từ vựng hoàn chỉnh với tích hợp AI.
- Tách biệt hoàn toàn với hệ thống Curriculum và Lessons.
- Dữ liệu lưu trong collection riêng `vocabulary` trong MongoDB.

### 22.2. Trang tra cứu từ vựng
- Đường dẫn: `/tra-cuu-tu-vung`
- Giao diện hiện đại với ô tìm kiếm lớn.
- Hiển thị kết quả bao gồm:
  - Nghĩa tiếng Việt
  - Phiên âm IPA
  - Câu ví dụ
  - Hình ảnh minh họa (nếu có)
- Phát âm từ vựng bằng Text-to-Speech.
- Học sinh chỉ có thể tra cứu, không thấy nút quản lý.

### 22.3. Trang quản lý từ vựng (Admin)
- Đường dẫn: `/tra-cuu-tu-vung/quan-ly`
- Chỉ dành cho tài khoản Admin.
- Nút "Quản lý kho từ" hiển thị ở góc trên phải trang tra cứu.
- Tự động redirect nếu không phải Admin.

### 22.4. Chức năng Admin
- **Thêm từ thủ công**:
  - Form nhập từ vựng, nghĩa, phiên âm, ví dụ, hình ảnh.
  - Có thể để trống các trường, AI sẽ tự động điền.
- **Import hàng loạt**:
  - Hỗ trợ file CSV.
  - Hỗ trợ file JSON.
  - Hỗ trợ file Word (.docx) với AI phân tách thông minh.
  - Hỗ trợ file PDF (.pdf) với AI phân tách thông minh.
- **Xóa từ vựng**:
  - Nút xóa với icon thùng rác màu đỏ.
  - Yêu cầu xác nhận trước khi xóa.
- **Xem danh sách đầy đủ**:
  - Hiển thị tất cả từ vựng trong kho.
  - Có thống kê tổng số từ.

### 22.5. Tích hợp AI (9Router)
- Sử dụng 9Router API với model `gpt-4o-mini`.
- Tự động điền thông tin khi:
  - Học sinh tra từ mới chưa có trong database.
  - Admin thêm từ thủ công nhưng bỏ trống một số trường.
  - Admin import file với tùy chọn "Tự động điền bằng AI".
- AI phân tách thông minh cho file Word/PDF:
  - Nhận diện và trích xuất từ vựng từ văn bản.
  - Lọc bỏ tiêu đề, số trang, văn bản thừa.
  - Trích xuất: Từ | Nghĩa | Phiên âm | Ví dụ.

### 22.6. File mẫu
- CSV: `/public/vocabulary-import-template.csv`
- JSON: `/public/vocabulary-import-template.json`

### 22.7. API Endpoints
- `GET /api/vocabulary/search`: Tra cứu từ vựng.
- `GET /api/vocabulary/list`: Lấy danh sách tất cả từ (Admin).
- `POST /api/vocabulary/manage`: Thêm từ mới (Admin).
- `DELETE /api/vocabulary/manage`: Xóa từ (Admin).
- `POST /api/vocabulary/import`: Import CSV/JSON (Admin).
- `POST /api/vocabulary/parse-document`: Phân tách Word/PDF bằng AI (Admin).

### 22.8. Database Schema
- Collection: `vocabulary`
- Fields:
  - `word`: Từ vựng (lowercase, unique)
  - `meaning`: Nghĩa tiếng Việt
  - `phonetic`: Phiên âm IPA
  - `example`: Câu ví dụ
  - `imageUrl`: URL hình ảnh (optional)
  - `createdAt`: Ngày tạo
  - `updatedAt`: Ngày cập nhật

### 22.9. Biến môi trường
- `MONGODB_URI`: Kết nối MongoDB (bắt buộc)
- `MONGODB_DB`: Tên database (mặc định: `doremi_eng`)
- `NINEROUTER_API_KEY`: API key cho 9Router (bắt buộc cho AI)

## 23. Tính năng Luyện Kỹ Năng Viết

### 23.1. Tổng quan
- Trang luyện viết: `/luyen-ky-nang/viet`
- Giao diện hiện đại với 3 chế độ luyện tập.
- Sử dụng Framer Motion cho animation mượt mà.

### 23.2. Các chế độ luyện tập

#### A. Sắp xếp từ thành câu (Arrange Words)
- Component: `components/writing/ArrangeWordsMode.tsx`
- Người dùng kéo thả các từ để tạo thành câu đúng.
- Có hệ thống kiểm tra câu trả lời.
- Hiển thị feedback ngay lập tức.

#### B. Dịch với Nobita (Translate with Nobita)
- Component: `components/writing/TranslateWithNobitaMode.tsx`
- Mascot Nobita hỗ trợ người dùng dịch câu.
- Sử dụng AI để kiểm tra bản dịch.
- Có gợi ý và giải thích.

#### C. Mô tả hình ảnh (Describe Image)
- Component: `components/writing/DescribeImageMode.tsx`
- Hiển thị hình ảnh theo chủ đề.
- Người dùng viết câu mô tả bằng tiếng Anh.
- AI kiểm tra và đánh giá câu trả lời.
- Hỗ trợ 5 chủ đề:
  - Gia đình (Family)
  - Trường học (School)
  - Thiên nhiên (Nature)
  - Thể thao (Sports)
  - Thức ăn (Food)

### 23.3. Hệ thống hình ảnh cho bài tập
- Thư mục: `/public/lessons/`
- Cấu trúc:
  - `/public/lessons/gia-dinh/`
  - `/public/lessons/truong-hoc/`
  - `/public/lessons/thien-nhien/`
  - `/public/lessons/the-thao/`
  - `/public/lessons/thuc-an/`
- Quy tắc đặt tên: `1.png`, `2.png`, `3.png` (theo questionId)
- Hỗ trợ định dạng: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`

### 23.4. Hệ thống tải hình ảnh hybrid
- **Ưu tiên 1**: Tải hình ảnh có sẵn trong thư mục local.
- **Ưu tiên 2**: Nếu không có, tạo hình ảnh bằng AI (DALL-E).
- **Ưu tiên 3**: Sử dụng hình ảnh ngẫu nhiên hoặc placeholder.

### 23.5. API Endpoints cho Lessons
- `GET /api/lessons/images`: Lấy danh sách hình ảnh theo theme.
- `POST /api/lessons/generate-image`: Tạo hình ảnh bằng AI.
- `POST /api/lessons/save-image`: Lưu hình ảnh AI về local.

### 23.6. API kiểm tra câu viết
- `POST /api/writing/check-sentence`: Kiểm tra câu trả lời của học sinh.
- Sử dụng AI để đánh giá độ chính xác.
- Trả về feedback chi tiết.

### 23.7. Giao diện
- Phong cách: Modern dark theme với gradient.
- Màu sắc chủ đạo:
  - Neon Cyan: `#4fd1c5`
  - Violet Pink gradient
  - Dark background: `#03010a`, `#0a0520`
- Bo góc: `rounded-2xl`, `rounded-3xl`
- Hiệu ứng: Blur, shadows, smooth transitions

## 24. Tính năng Chat với AI

### 24.1. Tổng quan
- Trang chat: `/chat`
- Component: `components/ChatWidget.tsx`
- Tích hợp AI chatbot để hỗ trợ học sinh.

### 24.2. API Chat
- `POST /api/chat/route.ts`: Xử lý tin nhắn chat với AI.
- Sử dụng 9Router API hoặc OpenAI.
- Hỗ trợ streaming response.

## 25. Cập nhật Sidebar

### 25.1. Menu mới
- "Test Center" đã đổi thành "Tra Cứu Từ Vựng".
- Thêm mục "Luyện Kỹ Năng" với submenu:
  - Viết câu
  - Nghe hiểu
  - Phát âm

### 25.2. Nút Import (Admin)
- Hiển thị modal import từ vựng.
- Component: `components/VocabularyImportModal.tsx`
- Chỉ hiển thị với tài khoản Admin.

## 26. Thư viện mới đã thêm

### 26.1. Xử lý file
- `mammoth`: Đọc file Word (.docx)
- `pdfjs-dist`: Đọc file PDF (.pdf)

### 26.2. UI/UX
- `framer-motion`: Animation và transitions
- `lucide-react`: Icon library

### 26.3. AI Integration
- 9Router API: Tích hợp GPT-4o-mini
- OpenAI API: DALL-E cho tạo hình ảnh

## 27. Biến môi trường mới

Thêm vào file `.env.local`:
```env
# MongoDB (Bắt buộc cho từ vựng)
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/
MONGODB_DB=doremi_eng

# 9Router AI API (Bắt buộc cho tính năng AI)
NINEROUTER_API_KEY=your-9router-api-key-here

# OpenAI API (Tùy chọn, cho DALL-E)
OPENAI_API_KEY=your-openai-api-key-here
```

## 28. Tài liệu tham khảo

- `VOCABULARY_FEATURE.md`: Hướng dẫn chi tiết tính năng tra cứu từ vựng.
- `VOCABULARY_MANAGEMENT.md`: Hướng dẫn quản lý kho từ vựng cho Admin.
- `public/lessons/README.md`: Hướng dẫn hệ thống hình ảnh cho bài tập.

## 29. Cải tiến gần đây (2026-05-02)

### 29.1. Hệ thống từ vựng
- ✅ Thêm tính năng tra cứu từ vựng hoàn chỉnh.
- ✅ Tích hợp AI tự động điền thông tin.
- ✅ Hỗ trợ import CSV, JSON, Word, PDF.
- ✅ AI phân tách thông minh cho file Word/PDF.
- ✅ Trang quản lý riêng cho Admin.

### 29.2. Hệ thống luyện viết
- ✅ Thêm 3 chế độ luyện viết.
- ✅ Tích hợp hệ thống hình ảnh hybrid.
- ✅ AI kiểm tra câu trả lời.
- ✅ Hỗ trợ 5 chủ đề bài tập.

### 29.3. Sửa lỗi
- ✅ Sửa lỗi tên file hình ảnh có khoảng trắng.
- ✅ Thêm URL encoding cho đường dẫn hình ảnh.
- ✅ Thêm logging chi tiết cho API.
- ✅ Tự động tạo thư mục nếu thiếu.
- ✅ Cải thiện prompt AI cho chủ đề "Gia đình".

## 30. Roadmap tương lai

### 30.1. Tính năng từ vựng
- [ ] Thêm hình ảnh tự động bằng AI.
- [ ] Lưu lịch sử tra cứu của học sinh.
- [ ] Tạo flashcard từ từ vựng đã tra.
- [ ] Export danh sách từ vựng.
- [ ] Phát âm bằng giọng native speaker.
- [ ] Thêm từ đồng nghĩa, trái nghĩa.
- [ ] Quiz từ vựng.
- [ ] Chỉnh sửa từ vựng (Edit).
- [ ] Tìm kiếm và lọc trong danh sách.
- [ ] Phân trang cho danh sách lớn.

### 30.2. Tính năng luyện tập
- [ ] Thêm chế độ luyện nghe.
- [ ] Thêm chế độ luyện phát âm.
- [ ] Hệ thống điểm số và xếp hạng.
- [ ] Lưu tiến độ học tập.
- [ ] Thống kê chi tiết.

