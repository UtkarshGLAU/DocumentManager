import Upload from "../components/Upload"
import DocumentList from "../components/DocumentList"
import { getAuth } from "firebase/auth"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { provider } from "../firebase"
import axios from "axios"

export default function Home({ user, setUser }) {
  const auth = getAuth()

  const handleGrantDrivePermission = async () => {
    try {
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
    }
  };

  const getUserRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return { text: '👑 Admin', color: 'role-badge--admin' };
      case 'user':
        return { text: '📤 User', color: 'role-badge--user' };
      case 'guest':
        return { text: '🔍 Guest', color: 'role-badge--guest' };
      default:
        return { text: '🔍 Guest', color: 'role-badge--guest' };
    }
  };

  return (
    <div className="main-content">
      <div className="welcome-section">
        <h2>Welcome {user.name || user.email}</h2>
        <div className="mb-md">
          <span className={`role-badge ${getUserRoleDisplay(user.role).color}`}>
            {getUserRoleDisplay(user.role).text}
          </span>
        </div>

        {user.role === 'guest' && (
          <div className="role-notification role-notification--guest">
            <h4>🔍 Guest Access</h4>
            <p>You currently have guest access. You can view and download public documents.</p>
            {!user.hasDrivePermission && (
              <>
                <p>To upload your own files, please grant Google Drive permission:</p>
                <button 
                  onClick={handleGrantDrivePermission}
                  className="form-button form-button--primary mt-sm"
                >
                  Grant Google Drive Permission
                </button>
              </>
            )}
            {user.hasDrivePermission && (
              <div>
                <p className="text-success font-bold">
                  ✅ You have previously granted Google Drive permission! 
                </p>
                <p className="text-sm text-muted">
                  Your access should be upgraded automatically. If you still see Guest access, try refreshing:
                </p>
                <div className="flex gap-sm mt-sm">
                  <button 
                    onClick={() => window.location.reload()}
                    className="form-button form-button--secondary"
                  >
                    🔄 Refresh Page
                  </button>
                  <button 
                    onClick={handleGrantDrivePermission}
                    className="form-button form-button--info"
                  >
                    🔄 Refresh Permissions
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {user.role === 'user' && (
          <div className="role-notification role-notification--user">
            <h4>📤 Full User Access</h4>
            <p>You have full access! You can upload, manage, and delete your own documents.</p>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="role-notification role-notification--admin">
            <h4>👑 Admin Access</h4>
            <p>You have administrator privileges. You can manage all documents in the system.</p>
          </div>
        )}

        {(user.role === 'user' || user.role === 'admin') && <Upload user={user} />}
        {user && <DocumentList user={user} />}
      </div>
    </div>
  )
}
