# 🚀 HƯỚNG DẪN DEPLOY DOREMI ENG - BƯỚC CUỐI CÙNG

## ✅ ĐÃ HOÀN THÀNH

1. ✅ Build thành công (không có lỗi)
2. ✅ Vercel CLI đã được cài đặt
3. ✅ Đã đăng nhập Vercel thành công
4. ✅ File `vercel.json` đã được tạo
5. ✅ Tất cả file tĩnh (icon nhân vật) đã sẵn sàng

## 🎯 BƯỚC TIẾP THEO - BẠN CẦN LÀM

### Bước 1: Trả lời câu hỏi trong Terminal

Terminal đang hỏi: "Would you like to install Vercel Plugin for Claude Code?"

**Trả lời:** Gõ `n` (No) và nhấn Enter

### Bước 2: Deploy lên Vercel

Sau khi trả lời câu hỏi trên, chạy lệnh:

```bash
npx vercel
```

Vercel CLI sẽ hỏi một số câu hỏi:

#### Câu hỏi 1: Set up and deploy?
```
? Set up and deploy "c:\Users\MSTUDIOTB\Desktop\HOCTIENGANH"?
```
**Trả lời:** `Y` (Yes)

#### Câu hỏi 2: Which scope?
```
? Which scope do you want to deploy to?
```
**Trả lời:** Chọn personal account của bạn (thường là tên username)

#### Câu hỏi 3: Link to existing project?
```
? Link to existing project?
```
**Trả lời:** `N` (No)

#### Câu hỏi 4: Project name?
```
? What's your project's name?
```
**Trả lời:** `doremi-eng-mstudiotb`

#### Câu hỏi 5: Directory?
```
? In which directory is your code located?
```
**Trả lời:** `./` (nhấn Enter)

#### Câu hỏi 6: Override settings?
```
? Want to override the settings?
```
**Trả lời:** `N` (No)

### Bước 3: Chờ Deploy Hoàn Thành

Vercel sẽ:
1. Upload code lên cloud
2. Chạy `npm install`
3. Chạy `npm run build`
4. Deploy lên server

**Thời gian:** Khoảng 2-3 phút

### Bước 4: Lấy URL Preview

Sau khi deploy xong, bạn sẽ thấy:

```
✅ Preview: https://doremi-eng-mstudiotb-xxxxx.vercel.app
```

**Lưu URL này lại!** Đây là URL preview để test.

### Bước 5: Thêm Biến Môi Trường

**QUAN TRỌNG:** Ứng dụng sẽ KHÔNG hoạt động đầy đủ nếu thiếu biến môi trường!

#### Cách 1: Qua Vercel Dashboard (Dễ nhất)

1. Truy cập: https://vercel.com/dashboard
2. Click vào project **doremi-eng-mstudiotb**
3. Vào tab **Settings**
4. Click **Environment Variables** ở sidebar bên trái
5. Thêm các biến sau:

**Biến BẮT BUỘC:**

| Key | Value | Environment |
|-----|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster...` | Production, Preview, Development |
| `MONGODB_DB` | `doremi_eng` | Production, Preview, Development |
| `NINEROUTER_API_KEY` | `your-9router-api-key` | Production, Preview, Development |
| `YOUTUBE_API_KEY` | `your-youtube-api-key` | Production, Preview, Development |

**Biến TÙY CHỌN:**

| Key | Value | Environment |
|-----|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-xxxxx` | Production, Preview, Development |

6. Click **Save** sau mỗi biến

#### Cách 2: Qua CLI (Nhanh hơn)

```bash
npx vercel env add MONGODB_URI production
# Paste giá trị khi được hỏi

npx vercel env add MONGODB_DB production
# Gõ: doremi_eng

npx vercel env add NINEROUTER_API_KEY production
# Paste API key

npx vercel env add YOUTUBE_API_KEY production
# Paste API key

npx vercel env add OPENAI_API_KEY production
# Paste API key (hoặc bỏ qua nếu không có)
```

### Bước 6: Deploy lên Production

Sau khi thêm biến môi trường, chạy:

```bash
npx vercel --prod
```

Lệnh này sẽ deploy lên production với URL chính thức:

```
✅ Production: https://doremi-eng-mstudiotb.vercel.app
```

### Bước 7: Cấu Hình MongoDB Atlas

**QUAN TRỌNG:** Cho phép Vercel kết nối đến MongoDB

1. Truy cập: https://cloud.mongodb.com/
2. Chọn cluster của bạn
3. Click **Network Access** (ở sidebar trái)
4. Click **Add IP Address**
5. Chọn **Allow Access from Anywhere** (0.0.0.0/0)
6. Click **Confirm**

**Lý do:** Vercel deploy trên nhiều server với IP động, nên cần cho phép tất cả IP.

### Bước 8: Test Trên Điện Thoại

1. Mở trình duyệt trên điện thoại
2. Truy cập: `https://doremi-eng-mstudiotb.vercel.app`
3. Kiểm tra:
   - ✓ Trang chủ hiển thị
   - ✓ Icon nhân vật hiển thị (tapsu, coban, tienbo...)
   - ✓ Đăng ký/Đăng nhập
   - ✓ Roadmap
   - ✓ Video Learning
   - ✓ Tra cứu từ vựng

## 🎉 HOÀN THÀNH!

Sau khi làm xong các bước trên, ứng dụng DOREMI ENG của bạn đã LIVE trên internet!

## 📱 CHIA SẺ

Bạn có thể chia sẻ link này cho bất kỳ ai:

```
https://doremi-eng-mstudiotb.vercel.app
```

## 🔄 DEPLOY LẠI SAU KHI SỬA CODE

Mỗi khi bạn sửa code và muốn deploy lại:

```bash
# Deploy preview để test
npx vercel

# Deploy production khi đã test OK
npx vercel --prod
```

## ⚠️ LƯU Ý

### Tính năng KHÔNG hoạt động trên Vercel:

- ❌ **Google Drive Backup**: Không thể dùng file `credentials.json` trên Vercel
  - Giải pháp: Chỉ dùng ở local, hoặc chuyển sang Vercel Blob Storage

### Tính năng HOẠT ĐỘNG bình thường:

- ✅ Đăng ký/Đăng nhập (lưu vào MongoDB)
- ✅ Roadmap và tất cả các level
- ✅ Video Learning với AI Summary
- ✅ Tra cứu từ vựng
- ✅ Luyện kỹ năng viết
- ✅ Chat AI
- ✅ Upload avatar

## 🆘 NẾU GẶP LỖI

### Lỗi: "Internal Server Error"
- Kiểm tra biến môi trường đã thêm đúng chưa
- Kiểm tra MongoDB Atlas Network Access
- Xem logs: https://vercel.com/dashboard → Project → Logs

### Lỗi: "MongoDB connection failed"
- Kiểm tra MONGODB_URI đúng format
- Kiểm tra username/password không có ký tự đặc biệt
- Kiểm tra Network Access trên MongoDB Atlas

### Lỗi: "Build failed"
- Chạy lại `npm run build` ở local để kiểm tra
- Xem chi tiết lỗi trong Vercel deployment logs

## 📞 HỖ TRỢ

Nếu cần hỗ trợ, check:
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://cloud.mongodb.com/

---

**Chúc bạn deploy thành công! 🚀**
