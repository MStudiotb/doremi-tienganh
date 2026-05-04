# 🌐 Hướng Dẫn Setup Cloudflare Tunnel cho Ollama

## 📋 Tổng Quan

Để ứng dụng DOREMI ENG trên Vercel có thể sử dụng Ollama đang chạy trên máy local của bạn, bạn cần tạo một tunnel công khai qua Cloudflare.

## 🎯 Mục Đích

- Ollama chạy trên máy local: `http://localhost:11434`
- Cloudflare Tunnel tạo URL công khai: `https://xxxxx.trycloudflare.com`
- Vercel sẽ gọi đến URL công khai này

## 📦 Bước 1: Cài Đặt Cloudflared

### Windows:

**Cách 1: Tải trực tiếp**
1. Tải về: https://github.com/cloudflare/cloudflared/releases/latest
2. Tìm file: `cloudflared-windows-amd64.exe`
3. Đổi tên thành: `cloudflared.exe`
4. Di chuyển vào thư mục: `C:\Windows\System32\`

**Cách 2: Dùng winget**
```bash
winget install --id Cloudflare.cloudflared
```

**Cách 3: Dùng Chocolatey**
```bash
choco install cloudflared
```

### Kiểm tra cài đặt:
```bash
cloudflared --version
```

## 🚀 Bước 2: Khởi Động Ollama

Đảm bảo Ollama đang chạy trên máy:

```bash
# Kiểm tra Ollama
curl http://localhost:11434/api/tags
```

Nếu Ollama chưa chạy:
```bash
ollama serve
```

## 🌉 Bước 3: Tạo Cloudflare Tunnel

Mở terminal mới và chạy:

```bash
cloudflared tunnel --url http://localhost:11434
```

### Output mẫu:
```
2026-05-03T04:58:25Z INF Thank you for trying Cloudflare Tunnel. Doing so, without a Cloudflare account, is a quick way to experiment and try it out. However, be aware that these account-less Tunnels have no uptime guarantee. If you intend to use Tunnels in production you should use a pre-created named tunnel by following: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps
2026-05-03T04:58:25Z INF Requesting new quick Tunnel on trycloudflare.com...
2026-05-03T04:58:26Z INF +--------------------------------------------------------------------------------------------+
2026-05-03T04:58:26Z INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
2026-05-03T04:58:26Z INF |  https://abc-def-ghi-jkl.trycloudflare.com                                                |
2026-05-03T04:58:26Z INF +--------------------------------------------------------------------------------------------+
```

**LƯU Ý:** Lưu lại URL này! Ví dụ: `https://abc-def-ghi-jkl.trycloudflare.com`

## 🔧 Bước 4: Thêm Biến Môi Trường OLLAMA_URL

### Trên Vercel Dashboard:

1. Truy cập: https://vercel.com/dashboard
2. Chọn project **doremi-eng-mstudiotb**
3. Vào **Settings** → **Environment Variables**
4. Thêm biến mới:

```
Key: OLLAMA_BASE_URL
Value: https://abc-def-ghi-jkl.trycloudflare.com
Environment: Production, Preview, Development
```

5. Click **Save**

### Hoặc qua CLI:

```bash
npx vercel env add OLLAMA_BASE_URL production
# Paste URL tunnel khi được hỏi
```

## 🔄 Bước 5: Redeploy Ứng Dụng

Sau khi thêm biến môi trường, deploy lại:

```bash
npx vercel --prod
```

## ✅ Bước 6: Test Tunnel

### Test từ máy khác hoặc điện thoại:

```bash
curl https://abc-def-ghi-jkl.trycloudflare.com/api/tags
```

Hoặc mở trình duyệt và truy cập:
```
https://abc-def-ghi-jkl.trycloudflare.com/api/tags
```

Bạn sẽ thấy danh sách các model Ollama.

## 📝 Cập Nhật Code (Nếu Cần)

Kiểm tra các file sử dụng Ollama có đọc biến môi trường đúng không:

### File cần kiểm tra:

1. **lib/parse-rag-client.ts**
2. **lib/video-rag.ts**
3. Các API route sử dụng Ollama

### Code mẫu:

```typescript
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

const ollama = new Ollama({
  host: OLLAMA_BASE_URL
});
```

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Tunnel Tạm Thời
- URL từ `trycloudflare.com` là **tạm thời**
- Mỗi lần chạy `cloudflared tunnel` sẽ tạo URL mới
- Phải cập nhật biến môi trường mỗi khi URL thay đổi

### 2. Giải Pháp Lâu Dài

**Option A: Named Tunnel (Khuyến nghị cho production)**

1. Tạo tài khoản Cloudflare: https://dash.cloudflare.com/sign-up
2. Tạo Named Tunnel:
```bash
cloudflared tunnel login
cloudflared tunnel create ollama-tunnel
cloudflared tunnel route dns ollama-tunnel ollama.yourdomain.com
```

3. Chạy tunnel với config:
```bash
cloudflared tunnel run ollama-tunnel
```

**Option B: Dùng 9Router API thay vì Ollama**

Nếu không muốn giữ máy chạy 24/7, có thể:
- Dùng 9Router API cho tất cả tính năng AI
- Hoặc dùng OpenAI API
- Hoặc deploy Ollama lên cloud (DigitalOcean, AWS, etc.)

### 3. Bảo Mật

Tunnel công khai có nghĩa **bất kỳ ai** cũng có thể truy cập Ollama của bạn!

**Giải pháp:**
- Dùng Cloudflare Access để bảo vệ
- Hoặc thêm authentication trong code
- Hoặc giới hạn rate limit

### 4. Hiệu Năng

- Latency sẽ cao hơn (request phải đi qua Cloudflare)
- Bandwidth bị giới hạn bởi upload speed của mạng nhà bạn
- Máy phải luôn bật và kết nối internet

## 🔄 Quy Trình Làm Việc Hàng Ngày

### Khi bắt đầu làm việc:

1. **Khởi động Ollama:**
```bash
ollama serve
```

2. **Tạo tunnel:**
```bash
cloudflared tunnel --url http://localhost:11434
```

3. **Lưu URL mới** (nếu thay đổi)

4. **Cập nhật Vercel** (nếu URL thay đổi):
```bash
npx vercel env rm OLLAMA_BASE_URL production
npx vercel env add OLLAMA_BASE_URL production
# Paste URL mới
npx vercel --prod
```

### Khi kết thúc:

- Có thể tắt tunnel (Ctrl+C)
- Ollama có thể tiếp tục chạy hoặc tắt

## 🆘 Troubleshooting

### Lỗi: "Connection refused"
- Kiểm tra Ollama đang chạy: `curl http://localhost:11434/api/tags`
- Kiểm tra port 11434 không bị chặn

### Lỗi: "Tunnel disconnected"
- Kiểm tra kết nối internet
- Chạy lại lệnh `cloudflared tunnel`

### Lỗi: "Model not found"
- Kiểm tra model đã pull: `ollama list`
- Pull model nếu chưa có: `ollama pull llama2`

### Lỗi: "Timeout"
- Model lớn cần thời gian load
- Tăng timeout trong code
- Hoặc dùng model nhỏ hơn

## 📊 So Sánh Các Giải Pháp

| Giải pháp | Ưu điểm | Nhược điểm |
|-----------|---------|------------|
| **Cloudflare Tunnel (Quick)** | ✅ Miễn phí<br>✅ Setup nhanh | ❌ URL thay đổi<br>❌ Không bảo mật |
| **Cloudflare Tunnel (Named)** | ✅ URL cố định<br>✅ Có bảo mật | ❌ Cần tài khoản<br>❌ Phức tạp hơn |
| **9Router API** | ✅ Không cần máy chạy<br>✅ Ổn định | ❌ Tốn phí<br>❌ Phụ thuộc bên thứ 3 |
| **OpenAI API** | ✅ Chất lượng cao<br>✅ Nhanh | ❌ Đắt<br>❌ Phụ thuộc OpenAI |
| **Deploy Ollama lên Cloud** | ✅ Luôn online<br>✅ Nhanh | ❌ Tốn phí server<br>❌ Cần quản lý |

## 🎯 Khuyến Nghị

### Cho Development/Testing:
✅ Dùng Cloudflare Quick Tunnel (như hiện tại)

### Cho Production:
✅ Dùng 9Router API hoặc OpenAI API
✅ Hoặc deploy Ollama lên cloud server

---

**Chúc bạn setup thành công! 🚀**

Nếu cần hỗ trợ thêm, hãy cho tôi biết!
