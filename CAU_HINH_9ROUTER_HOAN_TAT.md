# Cấu hình 9Router hoàn tất ✅

## Các thay đổi đã thực hiện:

### 1. ✅ Cập nhật package.json
- Đã thêm `cross-env` vào devDependencies
- Đã cập nhật script "start" để chạy mặc định trên cổng 20128:
  ```json
  "start": "cross-env NODE_ENV=production PORT=20128 next start"
  ```

### 2. ✅ Tạo file chạy nhanh
- Đã tạo file `chay-9router.bat` ở thư mục gốc
- Chỉ cần double-click file này để khởi động server
- File sẽ tự động:
  - Kiểm tra và cài đặt dependencies nếu cần
  - Build project nếu chưa có
  - Khởi động server trên cổng 20128

### 3. ✅ Commit code
- Đã commit tất cả thay đổi với message: "fix: update 9router port to 20128 and fix deployment"

## Các bước tiếp theo cần thực hiện:

### Bước 1: Kết nối GitHub Repository

Anh cần thêm remote repository GitHub. Chạy lệnh sau (thay YOUR_GITHUB_USERNAME và YOUR_REPO_NAME):

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

**Hoặc** nếu đã có repository, chỉ cần:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin master
```

### Bước 2: Kiểm tra biến môi trường trên Vercel

1. Đăng nhập vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project DOREMI
3. Vào Settings → Environment Variables
4. Kiểm tra và cập nhật biến `OPENAI_API_BASE`:
   ```
   OPENAI_API_BASE=https://miracle-wrote-newly-restoration.trycloudflare.com/v1
   ```
5. Nhấn "Save" và Vercel sẽ tự động redeploy

### Bước 3: Chạy server local

Để chạy server 9Router trên máy local:

**Cách 1: Dùng file batch (Đơn giản nhất)**
- Double-click vào file `chay-9router.bat`

**Cách 2: Dùng npm**
```bash
npm run build
npm start
```

Server sẽ chạy tại: http://localhost:20128

## Kiểm tra kết nối

Sau khi server chạy, kiểm tra:
- Local: http://localhost:20128
- Vercel: Sau khi push code, Vercel sẽ tự động deploy

## Lưu ý quan trọng

1. **Cloudflare Tunnel**: Đảm bảo tunnel đang chạy và URL khớp với biến môi trường
2. **MongoDB**: Đảm bảo MongoDB đang chạy nếu cần thiết
3. **Environment Variables**: Kiểm tra file `.env.local` có đầy đủ các biến cần thiết

## Cấu trúc file đã tạo/sửa

```
HOCTIENGANH/
├── package.json (đã sửa - thêm cross-env và cập nhật start script)
├── chay-9router.bat (mới tạo - file chạy nhanh)
└── CAU_HINH_9ROUTER_HOAN_TAT.md (file này)
```

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log khi chạy `chay-9router.bat`
2. Đảm bảo đã cài đặt Node.js và npm
3. Kiểm tra port 20128 không bị chiếm bởi ứng dụng khác
