@echo off
echo ========================================
echo DOREMI - Build Android APK
echo ========================================
echo.

echo Step 1: Building Next.js...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo Step 2: Creating static export...
call npx next export
if errorlevel 1 (
    echo ERROR: Export failed!
    pause
    exit /b 1
)
echo.

echo Step 3: Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)
echo.

echo ========================================
echo SUCCESS!
echo ========================================
echo Next steps:
echo 1. Open Android Studio: npx cap open android
echo 2. Build APK: Build -^> Build Bundle(s) / APK(s) -^> Build APK(s)
echo 3. APK location: android/app/build/outputs/apk/debug/app-debug.apk
echo.
echo Or run: npx cap open android
echo ========================================
pause
