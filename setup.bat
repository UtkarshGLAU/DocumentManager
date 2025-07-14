@echo off
echo 🚀 Setting up Document Management System...

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed

:: Setup Backend
echo 📦 Setting up backend dependencies...
cd backend
call npm install

:: Create env file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo 📝 Created backend .env file from template. Please update with your values.
)

:: Setup Frontend
echo 📦 Setting up frontend dependencies...
cd ..\frontend
call npm install

:: Create env file if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo 📝 Created frontend .env file from template. Please update with your values.
)

cd ..

echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Update backend\.env with your MongoDB URI and Google credentials
echo 2. Update frontend\.env with your Firebase and API configuration
echo 3. Run 'npm start' in backend folder
echo 4. Run 'npm run dev' in frontend folder
echo.
echo 📖 For detailed setup instructions, see EASY_DEPLOYMENT_GUIDE.md

pause
