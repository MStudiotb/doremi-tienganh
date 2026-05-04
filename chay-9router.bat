@echo off
echo ========================================
echo Starting 9Router Server on Port 20128
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .next build exists
if not exist ".next\" (
    echo Building the project...
    call npm run build
    echo.
)

echo Starting server...
echo Server will be available at: http://localhost:20128
echo Press Ctrl+C to stop the server
echo.

set PORT=20128
npm start
