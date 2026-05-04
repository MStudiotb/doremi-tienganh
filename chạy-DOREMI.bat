@echo off
cd /d "%~dp0"
title DOREMI - DI HOC DI - Port 20128

echo ========================================
echo Starting DOREMI Server on Port 20128
echo ========================================
echo.

if not exist "node_modules\" (
    echo [!] node_modules not found. Installing...
    call npm install
    if errorlevel 1 goto :error
    echo.
)

if not exist ".next\BUILD_ID" (
    echo [!] Build not found. Building project...
    call npm run build
    if errorlevel 1 goto :error
    echo.
)

echo Server URL: http://localhost:20128
echo Press Ctrl+C to stop the server
echo.

set PORT=20128
call "%~dp0node_modules\.bin\next.cmd" start
if errorlevel 1 goto :error
goto :end

:error
echo.
echo ========================================
echo [X] An error occurred. See messages above.
echo ========================================
pause
exit /b 1

:end
echo.
echo Server stopped.
pause
