# Welcome Banner Update - Cập nhật Banner Chào Mừng

## Tổng quan thay đổi

Banner chào mừng đã được cập nhật để cá nhân hóa theo người dùng đang đăng nhập với các tính năng sau:

### ✅ Các tính năng đã triển khai

1. **Hiển thị tên người dùng**
   - Lấy tên từ session data (localStorage: `doremi_session`)
   - Tự động chuyển tên thành CHỮ IN HOA
   - Ví dụ: Nếu user name là "trà mi" → hiển thị "TRÀ MI"
   - Fallback: Nếu không có tên → hiển thị "BẠN NHỎ"

2. **Lời chào theo thời gian**
   - **5:00 - 11:59**: "GOOD MORNING, {TÊN}"
   - **12:00 - 17:59**: "HELLO, {TÊN}"
   - **18:00 - 21:59**: "GOOD EVENING, {TÊN}"
   - **22:00 - 4:59**: "HELLO, {TÊN}"

3. **Xử lý tên dài**
   - Sử dụng `break-words` để tự động xuống dòng
   - Responsive font size: `text-3xl sm:text-4xl lg:text-5xl`
   - Đảm bảo không bị tràn khung

4. **Đồng bộ real-time**
   - Tự động cập nhật khi session thay đổi
   - Lắng nghe sự kiện `storage` và `doremi-auth-change`

## Files đã thay đổi

### 1. `components/WelcomeBanner.tsx`
**Thay đổi chính:**
- Thêm type `Session` để định nghĩa cấu trúc dữ liệu user
- Thêm function `readSession()` để đọc session từ localStorage
- Thêm function `getTimeBasedGreeting()` để tạo lời chào theo giờ
- Thêm state `session` để lưu thông tin user
- Thêm useEffect để đồng bộ session data
- Cập nhật heading với greeting động và tên user in hoa
- Cải thiện responsive với `break-words` và font size linh hoạt

### 2. `app/(dashboard)/page.tsx` (MỚI)
**Tạo trang Dashboard chính:**
- Import và sử dụng `WelcomeBanner` component
- Thêm `StatsSection` component
- Tạo Quick Actions grid với 6 hoạt động chính
- Thêm Recent Activity section
- Responsive layout với Framer Motion animations

## Cấu trúc Session Data

```typescript
type Session = {
  email: string;
  name: string;           // ← Tên người dùng
  role: "ADMIN" | "USER";
  grade?: string;
  age?: string;
};
```

Session được lưu trong localStorage với key: `doremi_session`

## Ví dụ hiển thị

### Trường hợp 1: User có tên "Trà Mi" vào lúc 8:00 sáng
```
GOOD MORNING, TRÀ MI
```

### Trường hợp 2: User có tên "Nguyễn Văn A" vào lúc 14:00 chiều
```
HELLO, NGUYỄN VĂN A
```

### Trường hợp 3: User có tên "John" vào lúc 19:00 tối
```
GOOD EVENING, JOHN
```

### Trường hợp 4: User chưa có tên
```
HELLO, BẠN NHỎ
```

## Kiểm tra và Test

### Để test component:

1. **Đăng nhập với user có tên:**
   ```javascript
   localStorage.setItem('doremi_session', JSON.stringify({
     email: 'test@example.com',
     name: 'Trà Mi',
     role: 'USER'
   }));
   ```

2. **Truy cập Dashboard:**
   - Vào URL: `/` (sau khi đăng nhập)
   - Banner sẽ hiển thị: "HELLO, TRÀ MI" (hoặc greeting khác tùy giờ)

3. **Test tên dài:**
   ```javascript
   localStorage.setItem('doremi_session', JSON.stringify({
     email: 'test@example.com',
     name: 'Nguyễn Thị Minh Châu Phương',
     role: 'USER'
   }));
   ```
   - Tên sẽ tự động xuống dòng nếu quá dài

4. **Test thay đổi session:**
   - Thay đổi tên trong localStorage
   - Banner sẽ tự động cập nhật mà không cần reload

## Responsive Design

- **Mobile (< 640px)**: `text-3xl` - Chữ nhỏ hơn, tránh tràn
- **Tablet (640px - 1024px)**: `text-4xl` - Chữ vừa phải
- **Desktop (> 1024px)**: `text-5xl` - Chữ lớn, nổi bật

## Tương thích

- ✅ Next.js 15+ (App Router)
- ✅ React 18+
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Framer Motion
- ✅ Client-side rendering ("use client")

## Lưu ý kỹ thuật

1. Component sử dụng "use client" directive vì cần access localStorage
2. Session sync hoạt động cross-tab (multiple browser tabs)
3. Mascot animation vẫn hoạt động bình thường
4. Component tự động handle edge cases (null, undefined, empty string)

## Hướng dẫn sử dụng trong các trang khác

Để sử dụng WelcomeBanner trong trang khác:

```tsx
import { WelcomeBanner } from "@/components/WelcomeBanner";

export default function YourPage() {
  return (
    <div>
      <WelcomeBanner />
      {/* Nội dung khác */}
    </div>
  );
}
```

---

**Cập nhật:** 03/05/2026, 1:37 AM
**Developer:** TJN MSTUDIOTB
