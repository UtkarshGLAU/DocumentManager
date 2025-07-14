# 📄 Document Management System

A modern, cloud-ready document management system with Google Drive integration, Firebase authentication, and role-based access control.

## ✨ Features

- 📤 **Google Drive Storage**: Files stored securely in user's Google Drive
- 🔐 **Firebase Authentication**: Secure Google OAuth login
- 👑 **Role-Based Access**: Admin and regular user permissions
- 🏷️ **Document Tagging**: Organize with custom tags
- 📱 **Responsive Design**: Works on all devices
- ☁️ **Cloud Deployment**: Ready for Render + Vercel deployment
- 🔄 **Version Control**: Track document versions
- 🔍 **Advanced Search**: Search by name, uploader, or tags
- 🗂️ **Organized Storage**: Auto-creates "Document Management System" folder in user's Drive

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Configure Environment**:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
   - Update with your credentials

3. **Run Development Servers**:
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm start
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

## 🛠️ Technology Stack

- **Frontend**: React, Vite, Firebase Auth, CSS3
- **Backend**: Node.js, Express, MongoDB, Google Drive API
- **Deployment**: Vercel (Frontend) + Render (Backend)

## 📋 Prerequisites

- Node.js 16+
- MongoDB database
- Google Cloud project with Drive API
- Firebase project with Google Auth

## 📊 Project Structure

```
documentManagement/
├── backend/                 # Node.js API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Google Drive service
│   └── server.js           # Express server
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.jsx         # Main application
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## 🔐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=https://your-app.vercel.app
PORT=5000
```

### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

## 🧪 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User authentication | No |
| GET | `/api/docs/all` | Get user documents | Yes |
| POST | `/api/docs/upload` | Upload document | Admin |
| DELETE | `/api/docs/:id` | Delete document | Admin |
| GET | `/health` | Health check | No |

## 👥 User Roles

- **Admin**: Can upload, view, and delete all documents
- **Regular User**: Can view public documents and their own private documents

