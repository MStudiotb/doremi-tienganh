# Hướng dẫn tạo GitHub Repository và Push Code

## Bước 1: Tạo Repository trên GitHub

1. Truy cập: https://github.com/new
2. Điền thông tin:
   - **Repository name**: `DOREMI` (hoặc tên khác anh muốn)
   - **Description**: "Ứng dụng học tiếng Anh DOREMI"
   - **Visibility**: Chọn Public hoặc Private
   - ⚠️ **QUAN TRỌNG**: KHÔNG chọn "Add a README file", "Add .gitignore", hoặc "Choose a license"
3. Click **"Create repository"**

## Bước 2: Kết nối và Push Code

Sau khi tạo xong, GitHub sẽ hiển thị trang hướng dẫn. Anh sẽ thấy URL repository có dạng:
```
https://github.com/YOUR_USERNAME/DOREMI.git
```

### Cách 1: Dùng HTTPS (Đơn giản, khuyến nghị)

Mở Terminal/Command Prompt trong VS Code và chạy các lệnh sau:

```bash
# Thêm remote repository
git remote add origin https://github.com/YOUR_USERNAME/DOREMI.git

# Push code lên GitHub
git push -u origin master
```

**Lưu ý**: Thay `YOUR_USERNAME` bằng username GitHub của anh.

Nếu được yêu cầu đăng nhập:
- Username: Nhập GitHub username
- Password: Nhập Personal Access Token (không phải password thông thường)

### Cách 2: Dùng SSH (Nếu đã cấu hình SSH key)

```bash
# Thêm remote repository
git remote add origin git@github.com:YOUR_USERNAME/DOREMI.git

# Push code lên GitHub
git push -u origin master
```

## Bước 3: Tạo Personal Access Token (Nếu cần)

Nếu GitHub yêu cầu token khi push:

1. Truy cập: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Điền thông tin:
   - **Note**: "DOREMI Project"
   - **Expiration**: Chọn thời hạn (khuyến nghị 90 days)
   - **Scopes**: Chọn `repo` (full control of private repositories)
4. Click **"Generate token"**
5. **QUAN TRỌNG**: Copy token ngay (chỉ hiển thị 1 lần)
6. Dùng token này làm password khi push code

## Bước 4: Kiểm tra kết quả

Sau khi push thành công:

```bash
# Kiểm tra remote đã được thêm
git remote -v

# Kiểm tra branch hiện tại
git branch -a
```

Anh sẽ thấy output:
```
origin  https://github.com/YOUR_USERNAME/DOREMI.git (fetch)
origin  https://github.com/YOUR_USERNAME/DOREMI.git (push)
```

## Bước 5: Kết nối với Vercel

Sau khi code đã lên GitHub:

1. Đăng nhập vào https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Chọn **"Import Git Repository"**
4. Tìm và chọn repository `DOREMI`
5. Click **"Import"**
6. Cấu hình:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
7. Thêm **Environment Variables**:
   ```
   OPENAI_API_BASE=https://miracle-wrote-newly-restoration.trycloudflare.com/v1
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
8. Click **"Deploy"**

## Các lệnh Git hữu ích

```bash
# Kiểm tra trạng thái
git status

# Xem lịch sử commit
git log --oneline

# Push các thay đổi mới
git add .
git commit -m "your message"
git push

# Pull code mới từ GitHub
git pull origin master
```

## Xử lý lỗi thường gặp

### Lỗi: "failed to push some refs"
```bash
# Pull code về trước
git pull origin master --allow-unrelated-histories
git push -u origin master
```

### Lỗi: "Authentication failed"
- Đảm bảo dùng Personal Access Token thay vì password
- Hoặc cấu hình SSH key

### Lỗi: "remote origin already exists"
```bash
# Xóa remote cũ
git remote remove origin

# Thêm lại remote mới
git remote add origin https://github.com/YOUR_USERNAME/DOREMI.git
```

## Tóm tắt các bước

1. ✅ Tạo repository trên GitHub (không thêm file nào)
2. ✅ Copy URL repository
3. ✅ Chạy: `git remote add origin URL`
4. ✅ Chạy: `git push -u origin master`
5. ✅ Kết nối Vercel với GitHub repository
6. ✅ Cấu hình Environment Variables trên Vercel
7. ✅ Deploy!

---

**Sau khi hoàn thành các bước trên, mỗi lần anh commit và push code, Vercel sẽ tự động deploy bản mới!**
