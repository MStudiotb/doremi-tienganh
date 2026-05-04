@echo off
echo ========================================
echo DOREMI - Deploy to GitHub
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    echo.
)

REM Add all files
echo Adding all files to git...
git add .
echo.

REM Commit with timestamp
echo Committing changes...
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
git commit -m "Deploy: %timestamp%"
echo.

REM Check if remote exists
git remote -v | findstr origin >nul
if errorlevel 1 (
    echo.
    echo ========================================
    echo SETUP REQUIRED
    echo ========================================
    echo Please set up your GitHub repository first:
    echo 1. Create a new repository on GitHub named: doremi-eng-v2
    echo 2. Run this command:
    echo    git remote add origin https://github.com/YOUR_USERNAME/doremi-eng-v2.git
    echo 3. Run this script again
    echo ========================================
    pause
    exit /b
)

REM Push to GitHub
echo Pushing to GitHub...
git branch -M main
git push -u origin main
echo.

echo ========================================
echo SUCCESS!
echo ========================================
echo Code has been pushed to GitHub
echo Next steps:
echo 1. Go to https://vercel.com
echo 2. Import your repository
echo 3. Add environment variables
echo 4. Deploy!
echo ========================================
pause
