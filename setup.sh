#!/bin/bash

# Document Management System - Quick Setup Script

echo "🚀 Setting up Document Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Node.js and Git are installed"

# Setup Backend
echo "📦 Setting up backend dependencies..."
cd backend
npm install

# Create env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created backend .env file from template. Please update with your values."
fi

# Setup Frontend
echo "📦 Setting up frontend dependencies..."
cd ../frontend
npm install

# Create env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created frontend .env file from template. Please update with your values."
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your MongoDB URI and Google credentials"
echo "2. Update frontend/.env with your Firebase and API configuration"
echo "3. Run 'npm start' in backend folder"
echo "4. Run 'npm run dev' in frontend folder"
echo ""
echo "📖 For detailed setup instructions, see EASY_DEPLOYMENT_GUIDE.md"
