# Tính Năng Tra Cứu Từ Vựng

## Tổng Quan

Hệ thống đã được cập nhật với tính năng tra cứu từ vựng hoàn chỉnh, bao gồm:

1. **Đổi tên menu**: "Test Center" → "Tra Cứu Từ Vựng"
2. **Trang tra cứu từ vựng**: Giao diện hiện đại với khả năng tìm kiếm
3. **Tích hợp AI**: Tự động điền thông tin từ vựng qua 9Router API
4. **Import hàng loạt**: Admin có thể upload file CSV để thêm nhiều từ vựng cùng lúc

## Các Tính Năng Chính

### 1. Tra Cứu Từ Vựng (Dành cho Học Sinh)

**Đường dẫn**: `/tra-cuu-tu-vung`

**Chức năng**:
- Tìm kiếm từ vựng tiếng Anh
- Hiển thị kết quả bao gồm:
  - Nghĩa tiếng Việt
  - Phiên âm (IPA)
  - Câu ví dụ
  - Hình ảnh minh họa (nếu có)
- Phát âm từ vựng bằng Text-to-Speech

**Cách sử dụng**:
1. Nhập từ vựng cần tra vào ô tìm kiếm
2. Nhấn nút "Tra cứu" hoặc Enter
3. Xem kết quả hiển thị
4. Nhấn biểu tượng loa để nghe phát âm

### 2. Import Từ Vựng (Dành cho Admin)

**Vị trí**: Nút "Import" trên Sidebar (chỉ hiển thị với tài khoản Admin)

**Chức năng**:
- Upload file CSV chứa danh sách từ vựng
- Tự động điền thông tin thiếu bằng AI (9Router)
- Cập nhật từ vựng đã có hoặc thêm mới

**Định dạng file CSV**:
```csv
word,meaning,phonetic,example,imageUrl
hello,xin chào,/həˈloʊ/,Hello everyone! How are you today?,
cat,con mèo,/kæt/,I have a cute cat at home.,
```

**Cách sử dụng**:
1. Đăng nhập với tài khoản Admin
2. Nhấn nút "Import" trên Sidebar
3. Chọn file CSV (hoặc kéo thả)
4. Bật/tắt tùy chọn "Tự động điền bằng AI"
5. Nhấn "Import"

**File mẫu**: `/public/vocabulary-import-template.csv`

## Cấu Hình

### Biến Môi Trường

Thêm vào file `.env.local`:

```env
# MongoDB (Bắt buộc)
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/
MONGODB_DB=doremi_eng

# 9Router AI API (Bắt buộc cho tính năng AI)
NINEROUTER_API_KEY=your-9router-api-key-here
```

### Lấy API Key từ 9Router

1. Truy cập https://9router.com
2. Đăng ký/Đăng nhập tài khoản
3. Lấy API key từ dashboard
4. Thêm vào file `.env.local`

## Kiến Trúc Hệ Thống

### Database Schema

**Collection**: `vocabulary`

```typescript
{
  word: string,           // Từ vựng (lowercase)
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

**Query Parameters**:
- `word`: Từ vựng cần tra (required)

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
2. Nếu có → Trả về kết quả
3. Nếu không → Gọi AI để lấy thông tin
4. Lưu vào database
5. Trả về kết quả

#### 2. POST `/api/vocabulary/import`

**Headers**:
- `Authorization`: Bearer token (Admin only)

**Body**: FormData
- `file`: File CSV
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

## Tích Hợp AI (9Router)

### Cách Hoạt Động

1. **Tra cứu từ mới**: Khi học sinh tra từ chưa có trong database, hệ thống tự động:
   - Gọi 9Router API với model `gpt-4o-mini`
   - Nhận về nghĩa, phiên âm, ví dụ
   - Lưu vào database cho lần tra sau

2. **Import với AI**: Khi Admin import file CSV:
   - Kiểm tra từng từ vựng
   - Nếu thiếu thông tin (meaning, phonetic, example)
   - Tự động gọi AI để điền đầy đủ
   - Tiết kiệm thời gian cho Admin

### Prompt Template

```
You are a helpful English-Vietnamese dictionary assistant.
Provide accurate translations, phonetics, and example sentences.
Return ONLY valid JSON without any markdown formatting or code blocks.

Provide information for the English word "hello" in the following JSON format:
{
  "word": "hello",
  "meaning": "Vietnamese translation",
  "phonetic": "IPA phonetic notation",
  "example": "An example sentence in English using this word"
}
```

## Giao Diện

### Thiết Kế

- **Phong cách**: Modern, dark theme với gradient
- **Bo góc**: Rounded corners (rounded-2xl, rounded-3xl)
- **Màu sắc chủ đạo**:
  - Neon Cyan: `#4fd1c5`
  - Violet Pink: Gradient accent
  - Dark background: `#03010a`, `#0a0520`
- **Hiệu ứng**: Blur effects, shadows, transitions

### Responsive

- Desktop: Full layout với sidebar
- Mobile: Tối ưu cho màn hình nhỏ
- Tablet: Adaptive layout

## Testing

### Test Cases

1. **Tra cứu từ có sẵn**:
   - Input: "hello"
   - Expected: Hiển thị kết quả từ database

2. **Tra cứu từ mới**:
   - Input: "beautiful"
   - Expected: Gọi AI, lưu DB, hiển thị kết quả

3. **Import CSV**:
   - Upload file mẫu
   - Expected: Import thành công, hiển thị thống kê

4. **Import với AI**:
   - Upload file chỉ có cột "word"
   - Bật "Tự động điền bằng AI"
   - Expected: AI điền đầy đủ thông tin

## Troubleshooting

### Lỗi thường gặp

1. **"Database not configured"**
   - Kiểm tra `MONGODB_URI` trong `.env.local`
   - Đảm bảo MongoDB đang chạy

2. **"AI không khả dụng"**
   - Kiểm tra `NINEROUTER_API_KEY`
   - Kiểm tra kết nối internet
   - Kiểm tra quota API key

3. **Import thất bại**
   - Kiểm tra định dạng CSV
   - Đảm bảo file có header
   - Kiểm tra quyền Admin

## Tối Ưu Hóa

### Performance

- **Caching**: Từ vựng được lưu trong database sau lần tra đầu tiên
- **Batch Processing**: Import xử lý từng từ một để tránh timeout
- **Lazy Loading**: Hình ảnh được load khi cần

### Security

- **Admin Only**: Import chỉ dành cho Admin
- **Input Validation**: Kiểm tra và sanitize input
- **Rate Limiting**: Có thể thêm để tránh abuse

## Roadmap

### Tính năng tương lai

- [ ] Thêm hình ảnh tự động bằng AI
- [ ] Lưu lịch sử tra cứu của học sinh
- [ ] Tạo flashcard từ từ vựng đã tra
- [ ] Export danh sách từ vựng
- [ ] Phát âm bằng giọng native speaker
- [ ] Thêm từ đồng nghĩa, trái nghĩa
- [ ] Quiz từ vựng

## Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console log
2. Xem file `.next/dev/logs/next-development.log`
3. Liên hệ team phát triển

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 2026-05-02  
**Tác giả**: DOREMI - ĐI HỌC ĐI Development Team
