const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.initialized = false;
    this.authMethod = null; // Track authentication method: 'oauth', 'service_account', or 'personal'
  }

  // Initialize with service account using domain-wide delegation
  async initializeWithServiceAccount(userEmail = null) {
    try {
      let auth;
      
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
        // Use key file
        auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
          scopes: ['https://www.googleapis.com/auth/drive.file'],
          subject: userEmail || process.env.GOOGLE_IMPERSONATION_EMAIL // Impersonate a user with Drive storage
        });
      } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        // Use inline JSON key (for production deployment)
        const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        auth = new google.auth.GoogleAuth({
          credentials: serviceAccountKey,
          scopes: ['https://www.googleapis.com/auth/drive.file'],
          subject: userEmail || process.env.GOOGLE_IMPERSONATION_EMAIL
        });
      } else {
        throw new Error('No Google service account credentials found. Please set GOOGLE_SERVICE_ACCOUNT_KEY_FILE or GOOGLE_SERVICE_ACCOUNT_KEY environment variable.');
      }

      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;
      this.authMethod = 'service_account';
      console.log('Google Drive Service initialized with service account delegation');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive with service account:', error.message);
      return false;
    }
  }

  // Alternative: Initialize with OAuth token (from frontend)
  initializeWithOAuthToken(accessToken) {
    try {
      // Check if this is a Firebase ID token vs Google OAuth token
      if (accessToken && accessToken.startsWith('eyJ')) {
        console.log('Received Firebase ID token, skipping OAuth method...');
        return false; // Skip this method to try service account instead
      }
      
      // Handle proper Google OAuth access token
      if (!accessToken) {
        console.log('No access token provided');
        return false;
      }
      
      const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      auth.setCredentials({ access_token: accessToken });

      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;
      this.authMethod = 'oauth';
      console.log('✅ Google Drive Service initialized with OAuth token (user\'s storage)');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive with OAuth token:', error.message);
      return false;
    }
  }

  // Simple approach: Use your personal Google account for storage
  async initializeWithPersonalAccount() {
    try {
      // This uses the service account but stores files in a specific user's drive
      const personalEmail = process.env.GOOGLE_STORAGE_EMAIL || 'your-email@gmail.com';
      
      let auth;
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
        auth = new google.auth.GoogleAuth({
          keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
          scopes: ['https://www.googleapis.com/auth/drive.file']
        });
      } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        auth = new google.auth.GoogleAuth({
          credentials: serviceAccountKey,
          scopes: ['https://www.googleapis.com/auth/drive.file']
        });
      }

      // Create a shared drive or use folder sharing approach
      this.drive = google.drive({ version: 'v3', auth });
      this.initialized = true;
      this.authMethod = 'personal';
      console.log('Google Drive Service initialized for shared storage');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive with personal account:', error.message);
      return false;
    }
  }

  // Auto-initialize with best available method
  async initialize(accessToken = null, userEmail = null) {
    // Method 1: Use OAuth token if provided (uses user's own storage quota)
    if (accessToken && this.initializeWithOAuthToken(accessToken)) {
      console.log('Using OAuth token for user\'s personal storage');
      return true;
    }
    
    // Method 2: Fallback to centralized storage (your shared folder)
    // This will use the main admin's shared folder as backup
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      console.log('Falling back to centralized shared folder storage...');
      if (await this.initializeWithPersonalAccount()) {
        return true;
      }
    }
    
    // Method 3: For shared folder approach (only if we have domain-wide delegation)
    if (process.env.GOOGLE_WORKSPACE_DOMAIN) {
      console.log('Using domain delegation...');
      if (await this.initializeWithServiceAccount(userEmail)) {
        return true;
      }
    }
    
    throw new Error('Failed to initialize Google Drive service. Please ensure you have a valid OAuth token or domain-wide delegation setup.');
  }

  // Upload file to Google Drive
  async uploadFile(fileBuffer, fileName, mimeType, folderId = null) {
    if (!this.initialized) {
      throw new Error('Google Drive service not initialized');
    }

    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);

      // Determine target folder based on authentication method
      let targetFolderId = folderId;
      
      // If using OAuth (personal storage), create/use DMS folder
      if (!targetFolderId && this.authMethod === 'oauth') {
        console.log('🔍 Using OAuth - creating/finding DMS folder in user\'s Drive');
        targetFolderId = await this.getOrCreateDMSFolder();
      } else if (!targetFolderId) {
        // For service account, use the shared folder
        targetFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (targetFolderId) {
          console.log(`🔍 Using service account - uploading to shared folder: ${targetFolderId}`);
        }
      }

      const fileMetadata = {
        name: fileName,
        parents: targetFolderId ? [targetFolderId] : undefined
      };

      const media = {
        mimeType: mimeType,
        body: bufferStream
      };

      const uploadLocation = targetFolderId ? `DMS folder (${targetFolderId})` : 'root of personal Drive';
      console.log(`📤 Uploading file ${fileName} to ${uploadLocation}`);

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, parents'
      });

      console.log(`✅ File uploaded successfully. File ID: ${response.data.id}`);

      // Make file publicly accessible for easier access
      try {
        await this.drive.permissions.create({
          fileId: response.data.id,
          resource: {
            role: 'reader',
            type: 'anyone'
          }
        });
        console.log('✅ File made publicly accessible');
      } catch (permError) {
        console.warn('⚠️ Could not set public permissions:', permError.message);
        // Continue even if permission setting fails
      }

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        downloadLink: `https://drive.google.com/uc?id=${response.data.id}&export=download`
      };
    } catch (error) {
      console.error('❌ Error uploading to Google Drive:', error.message);
      console.error('🔍 Full error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('storage quota') || error.message.includes('Storage quota exceeded')) {
        throw new Error('Google Drive storage quota exceeded. This may be due to service account limitations. Please ensure you have shared a folder with the service account and it has sufficient permissions.');
      } else if (error.message.includes('Service Accounts do not have storage quota')) {
        throw new Error('Service account storage issue. Please share a Google Drive folder with the service account email: document-manager-service@documenttr.iam.gserviceaccount.com');
      } else if (error.message.includes('File not found') || error.message.includes('parents')) {
        throw new Error(`Shared folder not accessible. Please verify that folder ID ${process.env.GOOGLE_DRIVE_FOLDER_ID} is shared with the service account: document-manager-service@documenttr.iam.gserviceaccount.com`);
      } else {
        throw new Error(`Google Drive upload failed: ${error.message}`);
      }
    }
  }

  // Create or get the DMS folder in user's Drive
  async getOrCreateDMSFolder() {
    try {
      // First, search for existing DMS folder
      const response = await this.drive.files.list({
        q: "name='Document Management System' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files && response.data.files.length > 0) {
        const folderId = response.data.files[0].id;
        console.log(`📁 Found existing DMS folder: ${folderId}`);
        return folderId;
      }

      // Create new DMS folder if it doesn't exist
      console.log('📁 Creating new Document Management System folder...');
      const folderMetadata = {
        name: 'Document Management System',
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id, name'
      });

      console.log(`✅ Created DMS folder: ${folder.data.id}`);
      return folder.data.id;
    } catch (error) {
      console.error('❌ Error creating/finding DMS folder:', error.message);
      throw new Error(`Failed to create/access DMS folder: ${error.message}`);
    }
  }

  // Create or get shared folder (legacy method for service account)
  async createSharedFolder(folderName = 'Document Management System') {
    if (!this.initialized) {
      throw new Error('Google Drive service not initialized');
    }

    try {
      // First, try to find existing folder
      const searchResponse = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)'
      });

      if (searchResponse.data.files.length > 0) {
        const folderId = searchResponse.data.files[0].id;
        console.log(`Using existing folder: ${folderId}`);
        return folderId;
      }

      // Create new folder
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id, name'
      });

      const folderId = response.data.id;
      console.log(`Created new shared folder: ${folderId}`);
      
      // Share the folder with service account
      try {
        await this.drive.permissions.create({
          fileId: folderId,
          resource: {
            role: 'writer',
            type: 'user',
            emailAddress: 'document-manager-service@documenttr.iam.gserviceaccount.com'
          }
        });
      } catch (shareError) {
        console.warn('Could not share folder with service account:', shareError.message);
      }

      return folderId;
    } catch (error) {
      console.error('Error creating shared folder:', error.message);
      throw new Error(`Failed to create shared folder: ${error.message}`);
    }
  }

  // Delete file from Google Drive
  async deleteFile(fileId) {
    if (!this.initialized) {
      throw new Error('Google Drive service not initialized');
    }

    try {
      await this.drive.files.delete({
        fileId: fileId
      });
      console.log(`File ${fileId} deleted from Google Drive`);
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error.message);
      throw new Error(`Google Drive delete failed: ${error.message}`);
    }
  }

  // Get file info
  async getFileInfo(fileId) {
    if (!this.initialized) {
      throw new Error('Google Drive service not initialized');
    }

    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, size, mimeType, webViewLink, webContentLink'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file info from Google Drive:', error.message);
      throw new Error(`Google Drive get file info failed: ${error.message}`);
    }
  }
}

module.exports = new GoogleDriveService();
