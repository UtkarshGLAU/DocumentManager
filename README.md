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

### Option 1: Automated Setup
```bash
# On Windows
setup.bat

# On macOS/Linux
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

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

## 🚀 Deployment

📋 **For complete deployment instructions, see [EASY_DEPLOYMENT_GUIDE.md](EASY_DEPLOYMENT_GUIDE.md)**

🧪 **For testing deployed features, see [FUNCTIONALITY_TEST_GUIDE.md](FUNCTIONALITY_TEST_GUIDE.md)**

### Quick Deploy

1. **Backend**: Deploy to Render
2. **Frontend**: Deploy to Vercel  
3. **Database**: MongoDB Atlas
4. **Follow the step-by-step guide in EASY_DEPLOYMENT_GUIDE.md**

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

## 🔧 Development

1. **Backend Development**:
   ```bash
   cd backend
   npm run dev  # With nodemon
   ```

2. **Frontend Development**:
   ```bash
   cd frontend
   npm run dev  # Vite dev server
   ```

3. **Build for Production**:
   ```bash
   # Frontend
   npm run build
   
   # Backend (no build needed, uses Node.js directly)
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Google Drive Upload Fails**: Check OAuth token and Google Drive API access
2. **CORS Errors**: Verify `FRONTEND_URL` in backend environment
3. **Auth Issues**: Check Firebase configuration and authorized domains
4. **MongoDB Connection**: Verify connection string and IP whitelist

See [EASY_DEPLOYMENT_GUIDE.md](EASY_DEPLOYMENT_GUIDE.md) and [FUNCTIONALITY_TEST_GUIDE.md](FUNCTIONALITY_TEST_GUIDE.md) for detailed troubleshooting.

## 📈 Database Design

![ER Diagram SVG](Documents/UpdatedErUtkarsh.svg)

[Database Design Documentation](Documents/DocumentOfDatabaseDesign.pdf)

## 📈 Roadmap

- [ ] Bulk file upload
- [ ] Document preview
- [ ] User groups and sharing
- [ ] Full-text search
- [ ] Email notifications
- [ ] Activity logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Easy Deployment Guide](EASY_DEPLOYMENT_GUIDE.md)
- 🧪 [Functionality Test Guide](FUNCTIONALITY_TEST_GUIDE.md)
- 🐛 [Issue Tracker](https://github.com/your-username/documentManagement/issues)
- 💬 [Discussions](https://github.com/your-username/documentManagement/discussions)

---

Made with ❤️ for modern document management
