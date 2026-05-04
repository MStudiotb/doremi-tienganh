
## Tổng Quan

Hệ thống quản lý từ vựng được thiết kế **tách biệt hoàn toàn** với hệ thống Curriculum và Lessons. Từ vựng được lưu trữ trong collection riêng `vocabulary` trong MongoDB và chỉ phục vụ cho tính năng "Tra Cứu Từ Vựng".

## Đặc Điểm Chính

### 1. Tách Biệt Hoàn Toàn
- ✅ Database riêng: Collection `vocabulary` độc lập
- ✅ Không liên quan đến bảng `curriculum` hay `lessons`
- ✅ Không hiển thị trong danh sách bài tập của học sinh
- ✅ Chỉ dùng cho tính năng tra cứu từ điển

### 2. Quyền Truy Cập
- **Admin (MstudioTB)**: Toàn quyền quản lý kho từ
  - Thêm từ mới (thủ công hoặc hàng loạt)
  - Xóa từ vựng
  - Import CSV/JSON
  - Xem toàn bộ danh sách
  
- **Học sinh**: Chỉ tra cứu
  - Tìm kiếm từ vựng
  - Xem nghĩa, phiên âm, ví dụ
  - Nghe phát âm

### 3. Tự Động Hóa với AI
- Nếu Admin chỉ nhập từ tiếng Anh, AI sẽ tự động:
  - Gợi ý nghĩa tiếng Việt
  - Tạo phiên âm IPA
  - Đưa ra câu ví dụ
- Sử dụng 9Router API với model `gpt-4o-mini`

## Cách Sử Dụng

### Dành Cho Admin

#### 1. Truy Cập Trang Quản Lý

1. Đăng nhập với tài khoản Admin (mstudiotb@gmail.com)
2. Vào trang "Tra Cứu Từ Vựng"
3. Nhấn nút **"Quản lý kho từ"** ở góc trên bên phải
4. Hoặc truy cập trực tiếp: `/tra-cuu-tu-vung/quan-ly`

#### 2. Thêm Từ Thủ Công

**Bước 1**: Nhấn nút "+" trong phần "Thêm Từ Mới"

**Bước 2**: Điền thông tin:
- **Từ vựng** (bắt buộc): Từ tiếng Anh cần thêm
- **Nghĩa tiếng Việt** (tùy chọn): Để trống nếu muốn AI tự động điền
- **Phiên âm IPA** (tùy chọn): Để trống nếu muốn AI tự động điền
- **Câu ví dụ** (tùy chọn): Để trống nếu muốn AI tự động điền
- **URL hình ảnh** (tùy chọn): Link hình minh họa

**Bước 3**: Nhấn "Thêm từ vào kho"

**Ví dụ**:
```
Từ vựng: beautiful
Nghĩa: (để trống)
Phiên âm: (để trống)
Ví dụ: (để trống)
```
→ AI sẽ tự động điền đầy đủ thông tin

#### 3. Import Hàng Loạt

##### A. Import File CSV

**Định dạng file CSV**:
```csv
word,meaning,phonetic,example,imageUrl
hello,xin chào,/həˈloʊ/,Hello everyone! How are you today?,
cat,con mèo,/kæt/,I have a cute cat at home.,
beautiful,,,
```

**Các bước**:
1. Chuẩn bị file CSV theo định dạng trên
2. Trong trang Quản lý, phần "Import Hàng Loạt"
3. Nhấn vào khu vực "Upload CSV hoặc JSON"
4. Chọn file CSV
5. Bật/tắt "Tự động điền bằng AI" (khuyến nghị: BẬT)
6. File sẽ tự động upload và import

**File mẫu**: `/public/vocabulary-import-template.csv`

##### B. Import File JSON

**Định dạng file JSON**:
```json
[
  {
    "word": "hello",
    "meaning": "xin chào",
    "phonetic": "/həˈloʊ/",
    "example": "Hello everyone! How are you today?",
    "imageUrl": ""
  },
  {
    "word": "beautiful",
    "meaning": "",
    "phonetic": "",
    "example": "",
    "imageUrl": ""
  }
]
```

**Các bước**: Tương tự như CSV

**File mẫu**: `/public/vocabulary-import-template.json`

##### C. Import File Word (.docx) hoặc PDF (.pdf) - MỚI! 🎉

**Tính năng đặc biệt**: AI phân tách thông minh

**Cách hoạt động**:
1. Upload file Word hoặc PDF chứa danh sách từ vựng
2. Hệ thống trích xuất văn bản từ file
3. AI (GPT-4o-mini) tự động:
   - Nhận diện và phân tách từ vựng
   - Lọc bỏ tiêu đề, số trang, văn bản thừa
   - Trích xuất: Từ | Nghĩa | Phiên âm | Ví dụ
4. Hiển thị bảng xác nhận để Admin kiểm tra
5. Admin chọn từ muốn lưu và nhấn "Lưu vào kho từ vựng"

**Các bước**:
1. Trong trang Quản lý, phần "Import Hàng Loạt"
2. Nhấn vào khu vực "Word / PDF - AI phân tách thông minh"
3. Chọn file .docx hoặc .pdf
4. Đợi AI phân tách (có thể mất 10-30 giây)
5. Xem bảng xác nhận với danh sách từ đã phân tách
6. Bỏ chọn các từ không mong muốn (nếu có)
7. Nhấn "Lưu vào kho từ vựng"

**Ví dụ nội dung file Word/PDF**:
```
Danh sách từ vựng Unit 1

1. Hello - Xin chào
   Phát âm: /həˈloʊ/
   Ví dụ: Hello, how are you?

2. Goodbye - Tạm biệt
   Phát âm: /ɡʊdˈbaɪ/
   Ví dụ: Goodbye, see you tomorrow!

3. Beautiful - Đẹp
   Example: She is beautiful.
```

→ AI sẽ tự động nhận diện và phân tách thành 3 từ vựng với đầy đủ thông tin

**Lưu ý**:
- File có thể chứa nhiều định dạng khác nhau, AI sẽ tự nhận diện
- Nếu thiếu phiên âm hoặc ví dụ, AI sẽ cố gắng bổ sung
- Luôn kiểm tra kỹ trước khi lưu vì AI có thể nhầm lẫn
- Giới hạn: ~15,000 ký tự (khoảng 200-300 từ vựng)

#### 4. Xóa Từ Vựng

1. Trong danh sách từ vựng, tìm từ cần xóa
2. Nhấn nút "Xóa" (biểu tượng thùng rác màu đỏ)
3. Xác nhận xóa

### Dành Cho Học Sinh

#### Tra Cứu Từ Vựng

1. Vào trang "Tra Cứu Từ Vựng"
2. Nhập từ cần tra vào ô tìm kiếm
3. Nhấn "Tra cứu" hoặc Enter
4. Xem kết quả:
   - Từ vựng và phiên âm
   - Nghĩa tiếng Việt
   - Câu ví dụ
   - Hình ảnh (nếu có)
5. Nhấn biểu tượng loa để nghe phát âm

**Lưu ý**: Học sinh KHÔNG thấy nút "Quản lý kho từ"

## Kiến Trúc Hệ Thống

### Database Schema

**Collection**: `vocabulary` (MongoDB)

```typescript
{
  _id: ObjectId,
  word: string,           // Từ vựng (lowercase, unique)
  meaning: string,        // Nghĩa tiếng Việt
  phonetic: string,       // Phiên âm IPA
  example: string,        // Câu ví dụ
  imageUrl?: string,      // URL hình ảnh (optional)
  createdAt: Date,        // Ngày tạo
  updatedAt: Date         // Ngày cập nhật
}
```

### API Endpoints

#### 1. GET `/api/vocabulary/search`
**Mục đích**: Tra cứu từ vựng (dành cho học sinh)

**Query Parameters**:
- `word`: Từ cần tra (required)

**Response**:
```json
{
  "word": "hello",
  "meaning": "xin chào",
  "phonetic": "/həˈloʊ/",
  "example": "Hello everyone!",
  "imageUrl": "https://..."
}
```

**Luồng xử lý**:
1. Tìm từ trong database
2. Nếu có → Trả về
3. Nếu không → Gọi AI → Lưu DB → Trả về

#### 2. GET `/api/vocabulary/list`
**Mục đích**: Lấy danh sách tất cả từ vựng (dành cho admin)

**Response**:
```json
{
  "vocabulary": [
    {
      "_id": "...",
      "word": "hello",
      "meaning": "xin chào",
      "phonetic": "/həˈloʊ/",
      "example": "Hello everyone!",
      "imageUrl": ""
    }
  ],
  "total": 100
}
```

#### 3. POST `/api/vocabulary/manage`
**Mục đích**: Thêm từ vựng mới (dành cho admin)

**Headers**:
- `Authorization`: Bearer token (Admin only)

**Body**:
```json
{
  "word": "beautiful",
  "meaning": "",
  "phonetic": "",
  "example": "",
  "imageUrl": "",
  "autoFill": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Từ vựng đã được thêm vào kho",
  "inserted": true
}
```

#### 4. DELETE `/api/vocabulary/manage`
**Mục đích**: Xóa từ vựng (dành cho admin)

**Headers**:
- `Authorization`: Bearer token (Admin only)

**Body**:
```json
{
  "id": "507f1f77bcf86cd799439011"
}
```

#### 5. POST `/api/vocabulary/import`
**Mục đích**: Import hàng loạt từ CSV/JSON (dành cho admin)

**Headers**:
- `Authorization`: Bearer token (Admin only)

**Body**: FormData
- `file`: File CSV hoặc JSON
- `autoFill`: "true" | "false"

**Response**:
```json
{
  "success": true,
  "message": "Import thành công: 10 từ mới, 5 từ cập nhật, 3 từ được AI tự động điền",
  "imported": 10,
  "updated": 5,
  "aiFilledCount": 3
}
```

#### 6. POST `/api/vocabulary/parse-document` - MỚI! 🎉
**Mục đích**: Phân tách từ vựng từ file Word/PDF bằng AI (dành cho admin)

**Headers**:
- `Authorization`: Bearer token (Admin only)

**Body**: FormData
- `file`: File .docx hoặc .pdf

**Response**:
```json
{
  "success": true,
  "vocabulary": [
    {
      "word": "hello",
      "meaning": "xin chào",
      "phonetic": "/həˈloʊ/",
      "example": "Hello everyone! How are you today?"
    },
    {
      "word": "goodbye",
      "meaning": "tạm biệt",
      "phonetic": "/ɡʊdˈbaɪ/",
      "example": "Goodbye, see you tomorrow!"
    }
  ],
  "total": 2,
  "message": "Đã phân tách được 2 từ vựng từ file"
}
```

**Luồng xử lý**:
1. Nhận file Word (.docx) hoặc PDF (.pdf)
2. Trích xuất văn bản thô:
   - Word: Sử dụng thư viện `mammoth`
   - PDF: Sử dụng thư viện `pdfjs-dist`
3. Gửi văn bản đến AI (GPT-4o-mini) để phân tách
4. AI nhận diện và trích xuất từ vựng, lọc bỏ nội dung thừa
5. Trả về danh sách từ vựng đã phân tách
6. Frontend hiển thị modal xác nhận
7. Admin chọn từ muốn lưu và gọi API `/api/vocabulary/manage`

**Thư viện sử dụng**:
- `mammoth`: Parse file Word (.docx)
- `pdfjs-dist`: Parse file PDF (.pdf)
- 9Router API (GPT-4o-mini): Phân tách thông minh

## Bảo Mật

### 1. Kiểm Tra Quyền Admin

**Frontend**:
```typescript
const session = localStorage.getItem("doremi_session");
const data = JSON.parse(session);
if (data.role === "ADMIN") {
  // Hiển thị nút "Quản lý kho từ"
}
```

**Backend**:
```typescript
const authHeader = request.headers.get("authorization");
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return NextResponse.json(
    { error: "Unauthorized - Admin access required" },
    { status: 401 }
  );
}
```

### 2. Tài Khoản Admin

**Email**: mstudiotb@gmail.com  
**Được định nghĩa trong**: `lib/auth.ts`

```typescript
export const ADMIN_EMAIL = "mstudiotb@gmail.com";
```

### 3. Phân Quyền Rõ Ràng

| Tính năng | Admin | Học sinh |
|-----------|-------|----------|
| Tra cứu từ vựng | ✅ | ✅ |
| Xem nút "Quản lý kho từ" | ✅ | ❌ |
| Thêm từ thủ công | ✅ | ❌ |
| Import CSV/JSON | ✅ | ❌ |
| Xóa từ vựng | ✅ | ❌ |
| Xem danh sách đầy đủ | ✅ | ❌ |

## Tích Hợp AI

### Cấu Hình

**File**: `.env.local`
```env
NINEROUTER_API_KEY=your-9router-api-key-here
```

### Cách Hoạt Động

1. **Khi tra cứu từ mới**:
   - Học sinh tra từ chưa có trong DB
   - Hệ thống gọi AI để lấy thông tin
   - Lưu vào DB cho lần sau
   - Trả về kết quả cho học sinh

2. **Khi thêm từ thủ công**:
   - Admin nhập từ, bỏ trống các trường khác
   - Hệ thống gọi AI để điền đầy đủ
   - Lưu vào DB

3. **Khi import hàng loạt**:
   - Admin upload file với một số từ thiếu thông tin
   - Nếu bật "Tự động điền bằng AI"
   - Hệ thống gọi AI cho từng từ thiếu thông tin
   - Lưu tất cả vào DB

### Prompt Template

```
You are a helpful English-Vietnamese dictionary assistant.
Provide accurate translations, phonetics, and example sentences.
Return ONLY valid JSON without any markdown formatting or code blocks.

Provide information for the English word "beautiful" in the following JSON format:
{
  "word": "beautiful",
  "meaning": "Vietnamese translation",
  "phonetic": "IPA phonetic notation",
  "example": "An example sentence in English using this word"
}
```

## Giao Diện

### Trang Tra Cứu (`/tra-cuu-tu-vung`)

**Dành cho tất cả người dùng**:
- Ô tìm kiếm lớn, dễ sử dụng
- Hiển thị kết quả đẹp mắt
- Nút phát âm
- Giao diện sạch sẽ, không có nút quản lý (với học sinh)

**Dành cho Admin**:
- Thêm nút "Quản lý kho từ" ở góc trên phải
- Màu neon cyan nổi bật
- Icon Settings

### Trang Quản Lý (`/tra-cuu-tu-vung/quan-ly`)

**Chỉ dành cho Admin**:
- Phần Import hàng loạt (CSV/JSON)
- Phần thêm từ thủ công
- Danh sách từ vựng với nút xóa
- Tự động redirect nếu không phải admin

## Testing

### Test Cases

#### 1. Kiểm Tra Quyền Truy Cập
```
✅ Admin đăng nhập → Thấy nút "Quản lý kho từ"
✅ Học sinh đăng nhập → KHÔNG thấy nút
✅ Truy cập /tra-cuu-tu-vung/quan-ly với học sinh → Redirect
✅ Truy cập /tra-cuu-tu-vung/quan-ly với admin → Hiển thị trang
```

#### 2. Thêm Từ Thủ Công
```
✅ Nhập đầy đủ thông tin → Lưu thành công
✅ Chỉ nhập từ, bật AI → AI điền đầy đủ
✅ Nhập từ trùng → Cập nhật từ cũ
✅ Không nhập từ → Báo lỗi
```

#### 3. Import CSV
```
✅ File CSV hợp lệ → Import thành công
✅ File CSV với từ thiếu thông tin + AI → Điền đầy đủ
✅ File rỗng → Báo lỗi
✅ File sai định dạng → Báo lỗi
```

#### 4. Import JSON
```
✅ File JSON array → Import thành công
✅ File JSON object đơn → Import thành công
✅ File JSON không hợp lệ → Báo lỗi
```

#### 5. Tra Cứu
```
✅ Tra từ có sẵn → Lấy từ DB
✅ Tra từ mới → Gọi AI → Lưu DB → Trả về
✅ Tra từ rỗng → Báo lỗi
```

#### 6. Xóa Từ
```
✅ Xóa từ tồn tại → Xóa thành công
✅ Xóa từ không tồn tại → Báo lỗi
✅ Xóa yêu cầu xác nhận → Hiển thị confirm dialog
```

## Troubleshooting

### Lỗi Thường Gặp

#### 1. "Unauthorized - Admin access required"
**Nguyên nhân**: Không phải admin hoặc token không hợp lệ  
**Giải pháp**: 
- Đăng nhập lại với tài khoản admin
- Kiểm tra localStorage có `doremi_session` với `role: "ADMIN"`

#### 2. "Database not configured"
**Nguyên nhân**: MongoDB chưa được cấu hình  
**Giải pháp**:
- Kiểm tra `MONGODB_URI` trong `.env.local`
- Đảm bảo MongoDB đang chạy

#### 3. "AI không khả dụng"
**Nguyên nhân**: API key không hợp lệ hoặc hết quota  
**Giải pháp**:
- Kiểm tra `NINEROUTER_API_KEY` trong `.env.local`
- Kiểm tra quota tại https://9router.com

#### 4. "File JSON không hợp lệ"
**Nguyên nhân**: Cú pháp JSON sai  
**Giải pháp**:
- Kiểm tra file JSON bằng JSONLint
- Đảm bảo đúng định dạng array hoặc object

#### 5. Import thành công nhưng không thấy từ
**Nguyên nhân**: Từ bị lọc do thiếu trường `word`  
**Giải pháp**:
- Đảm bảo mỗi dòng CSV/JSON có trường `word`
- Kiểm tra console log để xem chi tiết

## Best Practices

### 1. Khi Thêm Từ Mới
- ✅ Luôn bật "Tự động điền bằng AI" nếu thiếu thông tin
- ✅ Kiểm tra từ đã tồn tại chưa trước khi thêm
- ✅ Sử dụng phiên âm IPA chuẩn
- ✅ Viết câu ví dụ đơn giản, dễ hiểu

### 2. Khi Import Hàng Loạt
- ✅ Chuẩn bị file CSV/JSON theo đúng định dạng
- ✅ Test với file nhỏ trước (5-10 từ)
- ✅ Bật AI cho file chỉ có danh sách từ
- ✅ Kiểm tra kết quả sau khi import

### 3. Bảo Trì
- ✅ Định kỳ backup collection `vocabulary`
- ✅ Xóa từ trùng lặp nếu có
- ✅ Cập nhật từ cũ với thông tin mới hơn
- ✅ Kiểm tra và sửa lỗi chính tả

## Roadmap

### Tính Năng Tương Lai

- [ ] Thêm hình ảnh tự động bằng AI
- [ ] Lưu lịch sử tra cứu của học sinh
- [ ] Tạo flashcard từ từ vựng đã tra
- [ ] Export danh sách từ vựng
- [ ] Phát âm bằng giọng native speaker
- [ ] Thêm từ đồng nghĩa, trái nghĩa
- [ ] Quiz từ vựng
- [ ] Chỉnh sửa từ vựng (Edit)
- [ ] Tìm kiếm và lọc trong danh sách
- [ ] Phân trang cho danh sách lớn
- [ ] Thống kê từ vựng (số lượng, từ phổ biến)

## Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra console log trong trình duyệt
2. Kiểm tra terminal log của Next.js
3. Xem file `.next/dev/logs/next-development.log`
4. Liên hệ team phát triển

---

**Phiên bản**: 2.0.0  
**Ngày cập nhật**: 2026-05-02  
**Tác giả**: DOREMI - ĐI HỌC ĐI Development Team
