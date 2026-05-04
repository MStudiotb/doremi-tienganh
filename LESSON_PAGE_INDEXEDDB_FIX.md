# Sửa Lỗi Hiển Thị Bài Học từ IndexedDB

## Tổng Quan
Đã sửa thành công các lỗi khiến trang "Bài Học" không hiển thị đúng dữ liệu từ IndexedDB khi nhấn vào "Khối 2", "Khối 3". Hệ thống giờ đây tải và hiển thị đầy đủ dữ liệu từ 3 nguồn: Smart Start 1, MongoDB API, và IndexedDB RAG.

## Các Vấn Đề Đã Được Sửa

### 1. ✅ Tích Hợp IndexedDB vào Trang Lessons
**Vấn đề:** Trang lessons có hàm `loadRagResources()` nhưng không bao giờ gọi nó.

**Giải pháp:**
- Cập nhật `useEffect` trong `app/(dashboard)/lessons/page.tsx` để tải dữ liệu từ cả 3 nguồn:
  - MongoDB API (`/api/lessons`)
  - IndexedDB RAG (qua `loadRagResources()`)
  - Smart Start 1 (dữ liệu mặc định)

### 2. ✅ Trích Xuất Grade từ Tên File
**Vấn đề:** File như "lop 2 - phan 1.pdf" không được gán grade number, nên không lọc được theo "Khối 2".

**Giải pháp:**
- Thêm logic regex để trích xuất grade từ tên file:
  ```typescript
  const gradeMatch = res.fileName.match(/lop\s*(\d+)/i) || res.fileName.match(/grade\s*(\d+)/i)
  const grade = gradeMatch ? parseInt(gradeMatch[1], 10) : undefined
  ```
- Gán `grade` cho mỗi lesson unit từ IndexedDB

### 3. ✅ Cập Nhật TypeScript Types
**Vấn đề:** Type `LessonUnit` không hỗ trợ `grade` field và source `"mongodb"`.

**Giải pháp:**
- Cập nhật `lib/lesson-seed.ts`:
  ```typescript
  export type LessonUnit = {
    // ... existing fields
    source: "seed" | "idb" | "mongodb"  // Thêm "mongodb"
    grade?: number  // Thêm optional grade field
  }
  ```

### 4. ✅ Đồng Bộ Dữ Liệu Tự Động
**Vấn đề:** Sau khi Admin lưu file vào IndexedDB, trang Lessons không tự động cập nhật.

**Giải pháp:**
- **Trang Lessons:** Lắng nghe events để reload data:
  ```typescript
  window.addEventListener('storage', handleStorageUpdate)
  window.addEventListener('doremi_idb_updated', handleIdbUpdate)
  ```

- **Trang Admin:** Phát event sau khi lưu/xóa:
  ```typescript
  window.dispatchEvent(new Event('doremi_idb_updated'))
  localStorage.setItem('doremi_idb_updated', Date.now().toString())
  ```

### 5. ✅ Hiển Thị Card Đầy Đủ
**Vấn đề:** Card từ IndexedDB thiếu thông tin so với Smart Start 1.

**Giải pháp:**
- Parse RAG text thành units với đầy đủ thông tin:
  - Title: Từ tên file hoặc Unit marker
  - Topic: "Lớp X - [filename]"
  - Vocabulary: Trích xuất từ RAG text
  - Sentences: Trích xuất từ RAG text
  - Badge "RAG" để phân biệt nguồn

### 6. ✅ Filter Logic Chính Xác
**Vấn đề:** Logic filter không khớp với namespace và grade.

**Giải pháp:**
- Filter theo namespace dựa trên cấp độ:
  - Cấp 1 → `primary_data`
  - Cấp 2 → `secondary_data`
  - Cấp 3 → `highschool_data`
- Filter theo grade number từ "Khối X"
- Giữ nguyên filter theo skill tags

## Cấu Trúc Dữ Liệu

### IndexedDB Schema
```typescript
{
  id: string
  fileName: string          // e.g., "lop 2 - phan 1.pdf"
  ragText: string          // Nội dung đã trích xuất
  schoolLevel: string      // "Cấp 1", "Cấp 2", "Cấp 3"
  namespace: RagNamespace  // "primary_data", "secondary_data", "highschool_data"
  createdAt: string
}
```

### LessonUnit Format
```typescript
{
  id: string
  title: string
  topic: string
  namespace: "primary_data" | "secondary_data" | "highschool_data"
  vocabulary: VocabItem[]
  sentences: string[]
  skillTags: string[]
  source: "seed" | "idb" | "mongodb"
  grade?: number  // 1-12
}
```

## Luồng Hoạt Động

### 1. Admin Upload File
1. Admin chọn file PDF/DOCX (e.g., "lop 2 - phan 1.pdf")
2. Hệ thống trích xuất text và auto-tag namespace
3. Lưu vào IndexedDB với namespace `secondary_data`
4. Phát event `doremi_idb_updated`

### 2. Lessons Page Load
1. Tải dữ liệu từ MongoDB API
2. Tải dữ liệu từ IndexedDB
3. Parse RAG text thành lesson units
4. Trích xuất grade từ filename
5. Merge với Smart Start 1 data
6. Hiển thị tất cả trong grid

### 3. User Filter
1. Chọn "Cấp 2" → Filter namespace = `secondary_data`
2. Chọn "Khối 2" → Filter grade = 2
3. Chọn "Từ vựng" → Filter theo skill tags
4. Kết quả: Chỉ hiển thị bài học Lớp 2 về từ vựng

## Quyền Truy Cập

✅ **User bình thường** có thể đọc dữ liệu từ IndexedDB
- IndexedDB là client-side storage, không có giới hạn quyền
- Mọi user truy cập trang lessons đều có thể đọc dữ liệu
- Chỉ Admin mới có quyền thêm/xóa dữ liệu (qua trang `/admin`)

## Files Đã Thay Đổi

1. **app/(dashboard)/lessons/page.tsx**
   - Thêm logic load từ IndexedDB
   - Thêm event listeners cho auto-sync
   - Trích xuất grade từ filename
   - Merge data từ 3 nguồn

2. **lib/lesson-seed.ts**
   - Cập nhật type `LessonUnit` với `grade?` và `source: "mongodb"`
   - Giữ nguyên hàm `parseRagIntoUnits()`

3. **app/(dashboard)/admin/page.tsx**
   - Thêm event dispatch sau khi save
   - Thêm event dispatch sau khi delete
   - Thêm event dispatch sau khi bulk delete

## Kiểm Tra

### Test Case 1: Upload File Lớp 2
1. Vào `/admin`
2. Upload "lop 2 - phan 1.pdf"
3. Nhấn "Lưu vào IndexedDB"
4. Vào `/lessons`
5. Chọn "Cấp 2" → "Khối 2"
6. ✅ Thấy card bài học từ file vừa upload

### Test Case 2: Auto Sync
1. Mở 2 tab: `/admin` và `/lessons`
2. Ở tab admin, upload file mới
3. ✅ Tab lessons tự động reload và hiển thị file mới

### Test Case 3: Filter Chính Xác
1. Upload files: "lop 1.pdf", "lop 2.pdf", "lop 3.pdf"
2. Vào `/lessons`
3. Chọn "Cấp 1" → "Khối 1" → ✅ Chỉ thấy lớp 1
4. Chọn "Cấp 2" → "Khối 2" → ✅ Chỉ thấy lớp 2
5. Chọn "Cấp 3" → "Khối 3" → ✅ Chỉ thấy lớp 3

## Lưu Ý Quan Trọng

1. **Tên File Phải Có Grade:** File cần có format "lop X" hoặc "grade X" để tự động gán grade
2. **Namespace Mapping:** Hệ thống tự động map Cấp → Namespace
3. **Event-Based Sync:** Không cần F5, trang tự động reload khi có thay đổi
4. **3 Nguồn Dữ Liệu:** Smart Start 1 (seed) + MongoDB (import) + IndexedDB (RAG)

## Kết Quả

✅ Trang "Bài Học" giờ hiển thị đầy đủ dữ liệu từ IndexedDB  
✅ Filter "Khối 2", "Khối 3" hoạt động chính xác  
✅ Card hiển thị đầy đủ thông tin như Smart Start 1  
✅ Tự động đồng bộ khi Admin thêm/xóa file  
✅ User bình thường có quyền đọc dữ liệu  

---

**Ngày hoàn thành:** 5/5/2026  
**Phát triển bởi:** TJN MSTUDIOTB
