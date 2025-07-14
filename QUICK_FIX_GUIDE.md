# 🚨 Quick Fix: Google Drive Storage Quota Issue

## The Problem
Service Accounts don't have their own Google Drive storage. You're getting this error:
> "Service Accounts do not have storage quota"

## ✅ Quick Solution (Choose One)

### Option 1: Share Drive Folder with Service Account (Recommended)

1. **Go to your Google Drive** (drive.google.com)
2. **Create a new folder** called "Document Management System"
3. **Right-click the folder** → "Share"
4. **Add this email** (from your service account): 
   ```
   document-manager-service@documenttr.iam.gserviceaccount.com
   ```
5. **Give it "Editor" permissions**
6. **Copy the folder ID** from the URL (e.g., `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`)
7. **Add to your `.env` file**:
   ```env
   GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
   GOOGLE_STORAGE_EMAIL=your-email@gmail.com
   ```

### Option 2: Use Your Personal Google Account Storage

1. **Update your `.env` file**:
   ```env
   MONGO_URI=mongodb://localhost:27017/documentManagement
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./google-service-account-key.json
   GOOGLE_STORAGE_EMAIL=your-personal-email@gmail.com
   FRONTEND_URL=http://localhost:5173
   PORT=5000
   NODE_ENV=development
   ```

2. **Replace `your-personal-email@gmail.com`** with your actual Gmail address

## 🔧 Create the .env file

Create a `.env` file in your backend folder with this content:

```env
MONGO_URI=mongodb://localhost:27017/documentManagement
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./google-service-account-key.json
GOOGLE_STORAGE_EMAIL=your-email@gmail.com
FRONTEND_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

**Important**: Replace `your-email@gmail.com` with your actual email address!

## 🚀 Test the Fix

1. **Save your `.env` file**
2. **Restart your backend server**:
   ```bash
   cd backend
   npm start
   ```
3. **Try uploading a file**

## 📁 Alternative: Create Shared Folder Programmatically

The updated code will automatically:
1. Try to create a shared folder
2. Share it with the service account
3. Use that folder for all uploads

## 🔍 Verify Setup

Your backend logs should show:
```
Google Drive Service initialized for shared storage
Created new shared folder: [folder_id]
```

## ⚠️ If Still Having Issues

1. **Check your email** in the service account JSON file:
   ```
   "client_email": "document-manager-service@documenttr.iam.gserviceaccount.com"
   ```

2. **Manually share a Google Drive folder** with this email address

3. **Use the folder ID** in your environment variables

## 🎯 Why This Works

- Your personal Google account provides the storage space
- The service account gets permission to write to your shared folder
- Files are stored in your Google Drive but managed by the service account

This solution gives you unlimited storage (within your Google account limits) and maintains security!
