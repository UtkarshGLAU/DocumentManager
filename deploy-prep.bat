@echo off
REM 🚀 Quick Deployment Script for Document Management System (Windows)

echo 🚀 Starting deployment preparation...

REM Check if we're in the right directory
if not exist "README.md" (
    echo ❌ Error: Please run this script from the project root directory
    exit /b 1
)
if not exist "backend" (
    echo ❌ Error: Backend directory not found
    exit /b 1
)
if not exist "frontend" (
    echo ❌ Error: Frontend directory not found
    exit /b 1
)

echo ✅ Project structure verified

REM Clean up any development artifacts
echo 🧹 Cleaning up development files...
if exist "backend\uploads\*" del /q "backend\uploads\*" 2>nul
if exist "backend\node_modules\.cache" rmdir /s /q "backend\node_modules\.cache" 2>nul
if exist "frontend\node_modules\.cache" rmdir /s /q "frontend\node_modules\.cache" 2>nul
if exist "frontend\dist" rmdir /s /q "frontend\dist" 2>nul

echo ✅ Cleanup completed

REM Test backend dependencies
echo 🔧 Testing backend dependencies...
cd backend
call npm install --production
if errorlevel 1 (
    echo ❌ Backend npm install failed
    exit /b 1
)
cd ..

echo ✅ Backend dependencies verified

REM Test frontend build
echo 🔧 Testing frontend build...
cd frontend
call npm install
call npm run build
if errorlevel 1 (
    echo ❌ Frontend build failed
    exit /b 1
)
cd ..

echo ✅ Frontend build successful

REM Show git status
echo 📝 Checking git status...
git add .
git status

echo.
echo 🎉 Deployment preparation complete!
echo.
echo 📋 Next steps:
echo 1. Run: git commit -m "Ready for production deployment"
echo 2. Run: git push origin main
echo 3. Deploy backend on Render (see EASY_DEPLOYMENT_GUIDE.md)
echo 4. Deploy frontend on Vercel (see EASY_DEPLOYMENT_GUIDE.md)
echo 5. Update environment variables with production URLs
echo.
echo 📖 Full instructions in EASY_DEPLOYMENT_GUIDE.md
pause
