# 🔧 Sửa Lỗi Import PDF - Hướng Dẫn Chi Tiết

## 📋 Tổng Quan

Đã khắc phục lỗi "Không thể đọc file PDF" khi import từ vựng từ file PDF/DOCX. Hệ thống hiện có khả năng xử lý PDF tốt hơn với logging chi tiết và thông báo lỗi rõ ràng.

## ✅ Các Cải Tiến Đã Thực Hiện

### 1. **Thư Viện PDF**
- ✅ Đã xác nhận `pdfjs-dist@5.7.284` đã được cài đặt
- ✅ Đã cài thêm `pdf-parse` làm thư viện dự phòng
- ✅ Cấu hình PDF.js với các tùy chọn tối ưu cho Node.js

### 2. **Cải Thiện Xử Lý PDF**

#### Trước:
```typescript
const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
```

#### Sau:
```typescript
const loadingTask = pdfjsLib.getDocument({
  data: buffer,
  useSystemFonts: true,
  standardFontDataUrl: undefined,
  cMapUrl: undefined,
  cMapPacked: false,
  disableFontFace: true, // Tắt font loading để tương thích tốt hơn
  verbosity: 0, // Giảm console noise
});
```

### 3. **Xử Lý Lỗi Từng Trang**
- Hệ thống giờ đây tiếp tục xử lý các trang khác nếu một trang bị lỗi
- Theo dõi số trang thành công/thất bại
- Chỉ báo lỗi nếu KHÔNG có trang nào đọc được

```typescript
for (let i = 1; i <= pdf.numPages; i++) {
  try {
    // Xử lý trang
    successfulPages++;
  } catch (pageError) {
    failedPages++;
    console.error(`❌ Error parsing page ${i}:`, pageError);
    // Tiếp tục với trang khác thay vì dừng hoàn toàn
  }
}
```

### 4. **Logging Chi Tiết**

Mỗi request giờ đây có logging đầy đủ:

```
============================================================
🚀 Starting document parsing request
============================================================
📁 File info: {
  name: "vocabulary.pdf",
  size: "245.67 KB",
  type: "application/pdf"
}
📄 Starting PDF parsing...
📊 Buffer size: 251584 bytes
✅ PDF loaded successfully
📄 Total pages: 5
✅ Page 1/5 - Extracted 1234 characters
✅ Page 2/5 - Extracted 1456 characters
...
📊 Parsing complete: 5 successful, 0 failed
📝 Total text extracted: 6789 characters
✅ Text extraction complete
📝 Preview: This is a sample vocabulary list...
🤖 Sending to AI for vocabulary extraction...
✅ Parsing successful!
📊 Results: {
  vocabularyCount: 45,
  duration: "3.45s",
  fileFormat: "PDF"
}
============================================================
```

### 5. **Thông Báo Lỗi Cụ Thể**

Thay vì thông báo chung "Không thể đọc file PDF", giờ đây hệ thống cung cấp thông báo chi tiết:

| Loại Lỗi | Thông Báo |
|-----------|-----------|
| PDF không hợp lệ | "File PDF không hợp lệ hoặc bị hỏng. Vui lòng thử file khác hoặc chuyển sang định dạng .docx" |
| PDF có mật khẩu | "File PDF được bảo vệ bằng mật khẩu. Vui lòng mở khóa file trước khi tải lên." |
| PDF mã hóa | "File PDF bị mã hóa. Vui lòng sử dụng file không mã hóa hoặc chuyển sang .docx" |
| PDF scan/ảnh | "PDF không chứa văn bản có thể đọc được. File có thể là ảnh scan hoặc bị mã hóa." |
| Lỗi chung | "Không thể đọc file PDF. Vui lòng thử: 1) Chuyển sang file .docx, 2) Xuất lại PDF từ Word, 3) Kiểm tra file có bị hỏng không" |

### 6. **Giới Hạn Kích Thước File**
- Thêm validation: File tối đa 10MB
- Thông báo rõ ràng nếu file quá lớn

### 7. **Cải Thiện DOCX Parsing**
- Thêm logging chi tiết cho DOCX
- Hiển thị warnings từ mammoth
- Xử lý lỗi cụ thể hơn

## 🧪 Cách Kiểm Tra

### 1. Khởi động server:
```bash
npm run dev
```

### 2. Truy cập trang quản lý từ vựng:
```
http://localhost:3000/tra-cuu-tu-vung/quan-ly
```

### 3. Thử import các loại file:
- ✅ PDF bình thường
- ✅ PDF nhiều trang
- ✅ DOCX file
- ⚠️ PDF có mật khẩu (sẽ báo lỗi rõ ràng)
- ⚠️ PDF scan (sẽ báo lỗi rõ ràng)

### 4. Kiểm tra terminal logs:
Mở terminal và xem logs chi tiết khi upload file. Bạn sẽ thấy:
- 📊 Thông tin file
- 📄 Tiến trình xử lý từng trang
- ✅ Kết quả thành công
- ❌ Chi tiết lỗi nếu có

## 🔍 Debug Khi Gặp Lỗi

### Bước 1: Kiểm tra Terminal
Khi upload file, terminal sẽ hiển thị logs chi tiết. Tìm các dòng:
```
❌ PDF parsing error details: {
  name: "...",
  message: "...",
  stack: "..."
}
```

### Bước 2: Các Lỗi Thường Gặp

#### Lỗi: "Invalid PDF structure"
**Nguyên nhân:** File PDF bị hỏng hoặc không đúng định dạng
**Giải pháp:**
1. Mở file PDF bằng Adobe Reader để kiểm tra
2. Xuất lại PDF từ Word/Google Docs
3. Thử chuyển sang DOCX

#### Lỗi: "PDF không chứa văn bản"
**Nguyên nhân:** File PDF là ảnh scan
**Giải pháp:**
1. Sử dụng OCR để chuyển ảnh thành text
2. Gõ lại nội dung vào Word và xuất DOCX
3. Sử dụng file gốc (Word) thay vì PDF

#### Lỗi: "Password protected"
**Nguyên nhân:** PDF có mật khẩu bảo vệ
**Giải pháp:**
1. Mở PDF và nhập mật khẩu
2. Lưu lại PDF không có mật khẩu
3. Upload file mới

#### Lỗi: "File quá lớn"
**Nguyên nhân:** File > 10MB
**Giải pháp:**
1. Chia nhỏ file thành nhiều phần
2. Nén PDF (giảm chất lượng ảnh)
3. Chuyển sang DOCX (thường nhẹ hơn)

## 📦 Thư Viện Đã Cài Đặt

```json
{
  "pdfjs-dist": "^5.7.284",  // Thư viện chính để đọc PDF
  "pdf-parse": "^1.1.1",      // Thư viện dự phòng
  "mammoth": "^1.12.0"        // Đọc DOCX
}
```

## 🎯 Fallback Strategy

Nếu `pdfjs-dist` gặp vấn đề, có thể chuyển sang `pdf-parse`:

```typescript
// Thêm vào đầu file
import pdfParse from 'pdf-parse';

// Thêm function fallback
async function parsePDFWithFallback(buffer: ArrayBuffer): Promise<string> {
  try {
    return await parsePDF(buffer); // Thử pdfjs-dist trước
  } catch (error) {
    console.log("⚠️ pdfjs-dist failed, trying pdf-parse...");
    const data = await pdfParse(Buffer.from(buffer));
    return data.text;
  }
}
```

## 📝 Ghi Chú Quan Trọng

1. **PDF Scan/Ảnh:** Hệ thống KHÔNG hỗ trợ OCR. File PDF phải chứa text layer.

2. **Encoding:** Một số PDF có encoding đặc biệt có thể không đọc được. Khuyến nghị xuất lại từ Word.

3. **Font Đặc Biệt:** PDF với font nhúng phức tạp có thể gặp vấn đề. Sử dụng font chuẩn (Arial, Times New Roman).

4. **Performance:** File lớn (>5MB) có thể mất 10-30 giây để xử lý.

5. **AI Parsing:** Sau khi trích xuất text, AI sẽ phân tách từ vựng. Đảm bảo format rõ ràng:
   ```
   word - nghĩa
   apple - quả táo
   book - sách
   ```

## 🚀 Khuyến Nghị

### Cho Người Dùng:
1. **Ưu tiên DOCX** thay vì PDF (dễ đọc hơn, ít lỗi hơn)
2. **Kiểm tra file** trước khi upload (mở được, không có mật khẩu)
3. **Format đơn giản** (tránh table phức tạp, nhiều cột)
4. **File nhỏ** (<5MB để xử lý nhanh)

### Cho Developer:
1. **Luôn kiểm tra terminal logs** khi debug
2. **Test với nhiều loại PDF** (scan, encrypted, multi-page)
3. **Cân nhắc thêm OCR** nếu cần hỗ trợ PDF scan (tesseract.js đã có sẵn)
4. **Monitor performance** với file lớn

## 📞 Hỗ Trợ

Nếu vẫn gặp lỗi sau khi áp dụng các fix trên:

1. Kiểm tra logs trong terminal
2. Thử với file PDF mẫu đơn giản
3. Kiểm tra version của các thư viện
4. Xem lại cấu hình Next.js

## ✨ Tóm Tắt

✅ **Đã sửa:**
- Cấu hình PDF.js tối ưu cho Node.js
- Xử lý lỗi từng trang thay vì fail toàn bộ
- Logging chi tiết cho debug
- Thông báo lỗi cụ thể và hướng dẫn giải quyết
- Validation file size
- Cài thêm thư viện dự phòng

✅ **Kết quả:**
- Đọc được nhiều loại PDF hơn
- Debug dễ dàng hơn với logs chi tiết
- Người dùng hiểu rõ lỗi và cách khắc phục
- Hệ thống ổn định hơn với error handling tốt hơn
