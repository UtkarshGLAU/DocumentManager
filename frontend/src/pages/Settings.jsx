import { useState } from "react"
import axios from "axios"

export default function Settings({ user, setUser }) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleGrantDrivePermission = async () => {
    try {
      setIsUpdating(true)
      
      // First check if user already has a valid token stored
      const existingToken = localStorage.getItem('googleDriveAccessToken');
      
      if (existingToken) {
        console.log('🔍 Found existing Google Drive token, verifying and updating user status...');
        
        // Try to update user's drive permission status with existing token
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
          const response = await axios.post(`${API_BASE_URL}/api/auth/grant-drive-permission`, {
            uid: user.uid
          });

          if (response.data.success) {
            setUser({
              ...user,
              role: response.data.role,
              hasDrivePermission: response.data.hasDrivePermission
            });
            
            console.log('✅ Drive permission status updated successfully with existing token');
            alert('Drive permission updated! You now have User access.');
            return;
          }
        } catch (backendError) {
          console.log('⚠️ Existing token might be invalid, requesting new permissions...', backendError.message);
          // If existing token doesn't work, continue to request new permissions
        }
      }
      
      // Request new permissions via popup
      console.log('🔍 Requesting new Google Drive permissions...');
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
      const { getAuth } = await import("firebase/auth");
      const { provider } = await import("../firebase");
      
      const auth = getAuth();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;

      if (accessToken) {
        localStorage.setItem('googleDriveAccessToken', accessToken);
        console.log('✅ New Google Drive access token obtained');
        
        // Update user's drive permission status
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const response = await axios.post(`${API_BASE_URL}/api/auth/grant-drive-permission`, {
          uid: user.uid
        });

        if (response.data.success) {
          setUser({
            ...user,
            role: response.data.role,
            hasDrivePermission: response.data.hasDrivePermission
          });
          
          console.log('✅ Drive permission granted successfully');
          alert('Drive permission granted! You can now upload files.');
        }
      } else {
        alert('Google Drive permission was not granted. Please try again and allow access to Google Drive.');
      }
    } catch (error) {
      console.error("Error granting drive permission:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        alert('Permission request cancelled. Please try again to grant Google Drive access.');
      } else {
        alert('Failed to grant drive permission. Please try again.');
      }
    } finally {
      setIsUpdating(false)
    }
  };

  const handleRevokeDrivePermission = () => {
    if (window.confirm('Are you sure you want to revoke Google Drive access? This will downgrade your account to Guest access.')) {
      localStorage.removeItem('googleDriveAccessToken');
      setUser({
        ...user,
        role: 'guest',
        hasDrivePermission: false
      });
      alert('Google Drive access has been revoked. You now have Guest access.');
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This will log you out.')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="main-content">
      <div className="welcome-section">
        <h2>⚙️ Settings</h2>
        
        <div className="settings-content">
          {/* Account Information */}
          <div className="settings-section">
            <h3>👤 Account Information</h3>
            <div className="account-info">
              <div className="info-item">
                <strong>Name:</strong> {user.name || 'Not provided'}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="info-item">
                <strong>Role:</strong> 
                <span className={`role-badge ${
                  user.role === 'admin' ? 'role-badge--admin' :
                  user.role === 'user' ? 'role-badge--user' : 'role-badge--guest'
                }`}>
                  {user.role === 'admin' ? '👑 Admin' : 
                   user.role === 'user' ? '📤 User' : '🔍 Guest'}
                </span>
              </div>
              <div className="info-item">
                <strong>Google Drive Access:</strong> 
                <span className={user.hasDrivePermission ? 'text-success' : 'text-warning'}>
                  {user.hasDrivePermission ? '✅ Granted' : '❌ Not granted'}
                </span>
              </div>
            </div>
          </div>

          {/* Google Drive Permissions */}
          <div className="settings-section">
            <h3>🔐 Google Drive Permissions</h3>
            <p className="section-description">
              Manage your Google Drive access permissions for file storage and management.
            </p>
            
            <div className="permission-controls">
              {!user.hasDrivePermission ? (
                <button 
                  onClick={handleGrantDrivePermission}
                  disabled={isUpdating}
                  className="form-button form-button--primary"
                >
                  {isUpdating ? '⏳ Updating...' : '🔓 Grant Google Drive Permission'}
                </button>
              ) : (
                <div className="permission-granted">
                  <p className="text-success">✅ Google Drive permission is granted</p>
                  <button 
                    onClick={handleRevokeDrivePermission}
                    className="form-button form-button--danger mt-sm"
                  >
                    🔒 Revoke Google Drive Access
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="settings-section">
            <h3>🔒 Privacy & Data</h3>
            <p className="section-description">
              Control your data and privacy settings.
            </p>
            
            <div className="privacy-controls">
              <button 
                onClick={clearAllData}
                className="form-button form-button--danger"
              >
                🗑️ Clear All Local Data
              </button>
              <p className="text-sm text-muted mt-sm">
                This will clear all stored tokens and data from your browser and log you out.
              </p>
            </div>
          </div>

          {/* Help & Support */}
          <div className="settings-section">
            <h3>❓ Help & Support</h3>
            <div className="help-content">
              <div className="help-item">
                <strong>Guest Access:</strong> View and download public documents
              </div>
              <div className="help-item">
                <strong>User Access:</strong> Upload, manage, and delete your own documents
              </div>
              <div className="help-item">
                <strong>Admin Access:</strong> Manage all documents in the system
              </div>
              <div className="help-item">
                <strong>Storage:</strong> All files are stored in your personal Google Drive
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
