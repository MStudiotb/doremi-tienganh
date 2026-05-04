# Tạo GitHub Repository "doremi-tieng-anh" - Hướng dẫn nhanh

## Bước 1: Tạo Repository trên GitHub (2 phút)

### Cách 1: Tạo qua trình duyệt (Đơn giản nhất)

1. **Mở link này trong trình duyệt**: https://github.com/new

2. **Điền thông tin:**
   - Repository name: `doremi-tieng-anh`
   - Description: `Ứng dụng học tiếng Anh DOREMI - Next.js App`
   - Visibility: Chọn **Public** ✅
   
3. **QUAN TRỌNG - Bỏ qua các tùy chọn sau:**
   - ❌ KHÔNG chọn "Add a README file"
   - ❌ KHÔNG chọn "Add .gitignore"
   - ❌ KHÔNG chọn "Choose a license"
   
4. **Click nút "Create repository"** (màu xanh lá)

5. **Copy URL repository** - Anh sẽ thấy URL dạng:
   ```
   https://github.com/YOUR_USERNAME/doremi-tieng-anh.git
   ```
   Copy URL này lại!

## Bước 2: Kết nối và Push Code (1 phút)

Sau khi tạo xong repo, **quay lại VS Code** và làm theo:

### Mở Terminal trong VS Code:
- Nhấn `Ctrl + ~` (hoặc View → Terminal)

### Chạy các lệnh sau (thay YOUR_USERNAME bằng username GitHub của anh):

```bash
# Bước 1: Thêm remote repository
git remote add origin https://github.com/YOUR_USERNAME/doremi-tieng-anh.git

# Bước 2: Kiểm tra xem đã thêm chưa
git remote -v

# Bước 3: Push code lên GitHub
git push -u origin master
```

### Nếu được yêu cầu đăng nhập:
- **Username**: Nhập GitHub username của anh
- **Password**: Nhập Personal Access Token (KHÔNG phải password GitHub)

## Bước 3: Tạo Personal Access Token (Nếu chưa có)

Nếu GitHub yêu cầu token:

1. Mở link: https://github.com/settings/tokens/new
2. Điền:
   - **Note**: `DOREMI Project`
   - **Expiration**: `90 days`
   - **Select scopes**: Chọn ✅ `repo` (toàn bộ)
3. Click **"Generate token"** (nút xanh lá ở cuối trang)
4. **COPY TOKEN NGAY** (chỉ hiển thị 1 lần!)
5. Dùng token này làm password khi push

## Kiểm tra thành công

Sau khi push xong, mở trình duyệt và truy cập:
```
https://github.com/YOUR_USERNAME/doremi-tieng-anh
```

Anh sẽ thấy toàn bộ code đã lên GitHub! 🎉

## Lệnh đầy đủ để copy-paste

Thay `YOUR_USERNAME` bằng username GitHub của anh:

```bash
git remote add origin https://github.com/YOUR_USERNAME/doremi-tieng-anh.git
git push -u origin master
```

## Nếu gặp lỗi "remote origin already exists"

```bash
# Xóa remote cũ
git remote remove origin

# Thêm lại
git remote add origin https://github.com/YOUR_USERNAME/doremi-tieng-anh.git

# Push
git push -u origin master
```

## Sau khi push thành công

Anh có thể kết nối với Vercel:
1. Vào https://vercel.com/new
2. Import repository `doremi-tieng-anh`
3. Thêm Environment Variables:
   ```
   OPENAI_API_BASE=https://miracle-wrote-newly-restoration.trycloudflare.com/v1
   ```
4. Deploy!

---

**Tóm tắt 3 bước:**
1. ✅ Tạo repo trên GitHub: https://github.com/new
2. ✅ Chạy: `git remote add origin URL`
3. ✅ Chạy: `git push -u origin master`

**Xong! Đơn giản vậy thôi! 🚀**
