# Script tự động tải và cài đặt MongoDB Community Edition
# Chạy script này với quyền Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MONGODB COMMUNITY EDITION INSTALLER  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra quyền Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ LỖI: Script này cần chạy với quyền Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Hãy làm theo các bước sau:" -ForegroundColor Yellow
    Write-Host "1. Nhấn phím Windows" -ForegroundColor White
    Write-Host "2. Gõ 'PowerShell'" -ForegroundColor White
    Write-Host "3. Click phải vào 'Windows PowerShell'" -ForegroundColor White
    Write-Host "4. Chọn 'Run as Administrator'" -ForegroundColor White
    Write-Host "5. Chạy lại script này" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Đang chạy với quyền Administrator" -ForegroundColor Green
Write-Host ""

# Kiểm tra xem MongoDB đã được cài đặt chưa
Write-Host "🔍 Đang kiểm tra MongoDB..." -ForegroundColor Yellow

$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($mongoService) {
    Write-Host "✅ MongoDB đã được cài đặt!" -ForegroundColor Green
    Write-Host "   Trạng thái: $($mongoService.Status)" -ForegroundColor White
    
    if ($mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB đang chạy!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Bạn có thể chạy lệnh import ngay:" -ForegroundColor Cyan
        Write-Host "   node scripts/import-vocab-to-db.js" -ForegroundColor White
        Write-Host ""
        pause
        exit 0
    } else {
        Write-Host "⚠️  MongoDB chưa chạy. Đang khởi động..." -ForegroundColor Yellow
        try {
            Start-Service -Name "MongoDB"
            Write-Host "✅ Đã khởi động MongoDB thành công!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Bạn có thể chạy lệnh import ngay:" -ForegroundColor Cyan
            Write-Host "   node scripts/import-vocab-to-db.js" -ForegroundColor White
            Write-Host ""
            pause
            exit 0
        } catch {
            Write-Host "❌ Không thể khởi động MongoDB: $_" -ForegroundColor Red
            Write-Host ""
            pause
            exit 1
        }
    }
}

Write-Host "⚠️  MongoDB chưa được cài đặt" -ForegroundColor Yellow
Write-Host ""

# Hỏi người dùng có muốn tải MongoDB không
Write-Host "Bạn có muốn tải MongoDB Community Edition không?" -ForegroundColor Cyan
Write-Host "[Y] Có - Mở trang tải về" -ForegroundColor White
Write-Host "[N] Không - Thoát" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Lựa chọn của bạn (Y/N)"

if ($choice -eq "Y" -or $choice -eq "y") {
    Write-Host ""
    Write-Host "🌐 Đang mở trang tải MongoDB..." -ForegroundColor Green
    Start-Process "https://www.mongodb.com/try/download/community"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  HƯỚNG DẪN CÀI ĐẶT MONGODB" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Chọn phiên bản:" -ForegroundColor Yellow
    Write-Host "   - Version: 7.0.x (Latest)" -ForegroundColor White
    Write-Host "   - Platform: Windows" -ForegroundColor White
    Write-Host "   - Package: MSI" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Click 'Download' và chờ tải về" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "3. Chạy file .msi vừa tải về" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Trong quá trình cài đặt:" -ForegroundColor Yellow
    Write-Host "   ✅ Chọn 'Complete' installation" -ForegroundColor White
    Write-Host "   ✅ QUAN TRỌNG: Tích chọn 'Install MongoDB as a Service'" -ForegroundColor Red
    Write-Host "   ✅ Để mặc định các cài đặt khác" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Sau khi cài đặt xong:" -ForegroundColor Yellow
    Write-Host "   - Chạy lại script này để kiểm tra" -ForegroundColor White
    Write-Host "   - Hoặc chạy: node scripts/import-vocab-to-db.js" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Đã hủy cài đặt" -ForegroundColor Red
    Write-Host ""
}

pause
