# 🚀 Easy Deployment Guide

Complete step-by-step guide to deploy your Document Management System to production.

## 📋 Prerequisites

- MongoDB Atlas account (free tier available)
- Google Cloud Console project
- Render account (for backend)
- Vercel account (for frontend)

## 🔧 Environment Variables Setup

### Backend Environment Variables

Create these in Render dashboard:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
FRONTEND_URL=https://your-app-name.vercel.app
PORT=5000
```

### Frontend Environment Variables  

Create these in Vercel dashboard:

```env
VITE_API_BASE_URL=https://your-backend-name.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🗄️ Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free account and cluster
3. Create database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`

## 🔑 Step 2: Setup Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google Drive API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Application type: "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `https://your-app-name.vercel.app` (for production)
7. Copy Client ID and Client Secret

## 🔥 Step 3: Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Add web app to your project
4. Enable Authentication → Sign-in method → Google
5. Add your domain to authorized domains
6. Copy Firebase config values

## 🚀 Step 4: Deploy Backend to Render

1. Go to [Render](https://render.com/)
2. Connect your GitHub repository
3. Create new "Web Service"
4. Select your repository and branch
5. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Add all backend environment variables listed above

## ⚡ Step 5: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add all frontend environment variables listed above

## 🔄 Step 6: Update Cross-References

After both deployments:

1. **Update Backend FRONTEND_URL**:
   - In Render dashboard, update `FRONTEND_URL` to your Vercel URL
   
2. **Update Frontend API URL**:
   - In Vercel dashboard, update `VITE_API_BASE_URL` to your Render URL

3. **Update Google OAuth Redirect URIs**:
   - Add your production URLs to Google Cloud Console OAuth settings

## ✅ Step 7: Post-Deployment Verification

Test these URLs:

- `https://your-backend.onrender.com/health` → Should return "OK"
- `https://your-frontend.vercel.app` → Should load the app
- Login functionality → Should work with Google OAuth
- File upload → Should store in user's Google Drive
- File download/delete → Should work properly

## 🛠️ Troubleshooting

### Common Issues:

1. **CORS Errors**: Verify `FRONTEND_URL` matches your Vercel URL exactly
2. **OAuth Errors**: Check redirect URIs in Google Cloud Console
3. **Firebase Errors**: Verify all Firebase config values
4. **Database Errors**: Check MongoDB connection string and IP whitelist
5. **API Errors**: Check Render logs and environment variables

### Debug Steps:

1. Check Render application logs
2. Check Vercel function logs  
3. Verify all environment variables are set correctly
4. Test API endpoints directly
5. Check browser developer console for errors

## 📱 Testing Guide

After deployment, test:

- [ ] User login with Google
- [ ] Admin user can upload files
- [ ] Files appear in user's Google Drive "Document Management System" folder
- [ ] Regular users can view files
- [ ] Admin can delete files
- [ ] Files are properly removed from Google Drive
- [ ] Search and filtering work
- [ ] Responsive design on mobile

## 🔒 Security Checklist

- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded credentials in code
- [ ] Google OAuth redirect URIs are properly configured
- [ ] MongoDB Atlas IP whitelist is configured
- [ ] HTTPS is enabled on both frontend and backend

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Render and Vercel logs
3. Verify all environment variables
4. Test locally first to isolate the issue

---

🎉 **Congratulations!** Your Document Management System is now live and production-ready!
