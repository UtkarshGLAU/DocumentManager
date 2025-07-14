#!/bin/bash

# 🚀 Quick Deployment Script for Document Management System

echo "🚀 Starting deployment preparation..."

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Clean up any development artifacts
echo "🧹 Cleaning up development files..."
rm -f backend/uploads/* 2>/dev/null || true
rm -rf backend/node_modules/.cache 2>/dev/null || true
rm -rf frontend/node_modules/.cache 2>/dev/null || true
rm -rf frontend/dist 2>/dev/null || true

echo "✅ Cleanup completed"

# Test backend build
echo "🔧 Testing backend dependencies..."
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Backend npm install failed"
    exit 1
fi
cd ..

echo "✅ Backend dependencies verified"

# Test frontend build
echo "🔧 Testing frontend build..."
cd frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
cd ..

echo "✅ Frontend build successful"

# Commit changes
echo "📝 Committing changes..."
git add .
git status

echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: git commit -m 'Ready for production deployment'"
echo "2. Run: git push origin main"
echo "3. Deploy backend on Render (see EASY_DEPLOYMENT_GUIDE.md)"
echo "4. Deploy frontend on Vercel (see EASY_DEPLOYMENT_GUIDE.md)"
echo "5. Update environment variables with production URLs"
echo ""
echo "📖 Full instructions in EASY_DEPLOYMENT_GUIDE.md"
