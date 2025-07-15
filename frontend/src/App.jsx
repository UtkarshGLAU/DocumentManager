import { useState, useEffect } from "react"
import Login from "./components/Login"
import Upload from "./components/Upload"
import DocumentList from "./components/DocumentList"
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { provider } from "./firebase"
import axios from "axios"
import "./App.css"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth()

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null)
        // Don't clear the Google Drive access token on logout
        // This allows the system to detect previous permissions on next login
        console.log('🔐 User logged out, but Google Drive token preserved for next login')
      })
      .catch((error) => {
        console.error("Logout error:", error)
      })
  }

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
        return { text: '👑 Admin', color: '#ff6b6b' };
      case 'user':
        return { text: '📤 User', color: '#4ecdc4' };
      case 'guest':
        return { text: '🔍 Guest', color: '#95a5a6' };
      default:
        return { text: '🔍 Guest', color: '#95a5a6' };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userCred) => {
      if (userCred) {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
          
          // Check if user has drive access token
          const storedToken = localStorage.getItem('googleDriveAccessToken');
          const hasGoogleDriveAccess = !!storedToken;
          
          console.log('🔍 Auth state changed - checking drive access:', hasGoogleDriveAccess);
          
          // Send user data to backend to check role and permissions
          const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            uid: userCred.uid,
            email: userCred.email,
            name: userCred.displayName,
            photo: userCred.photoURL,
            hasGoogleDriveAccess
          })

          // Get ID token to check for custom claims
          const token = await userCred.getIdTokenResult()

          setUser({
            name: userCred.displayName,
            email: userCred.email,
            uid: userCred.uid,
            photoURL: userCred.photoURL,
            isAdmin: res.data.isAdmin || token.claims.admin || false,
            role: res.data.role || 'guest',
            hasDrivePermission: res.data.hasDrivePermission || false,
          })
          
          console.log('✅ User set with role:', res.data.role, 'hasDrivePermission:', res.data.hasDrivePermission);
        } catch (error) {
          console.error("Error setting user:", error)
          // Fallback to basic user info if backend call fails
          const token = await userCred.getIdTokenResult()
          const storedToken = localStorage.getItem('googleDriveAccessToken');
          
          setUser({
            name: userCred.displayName,
            email: userCred.email,
            uid: userCred.uid,
            photoURL: userCred.photoURL,
            isAdmin: token.claims.admin || false,
            role: storedToken ? 'user' : 'guest',
            hasDrivePermission: !!storedToken,
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth])

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {user ? (
        <div>
          <div className="header">
            <h1>📄 Document Manager</h1>
            <div className="user-info">
              <span>Welcome, {user.name || user.email}</span>
              <button onClick={handleLogout} className="logout" style={{ marginLeft: "1rem", color: "red" }}>
                Logout
              </button>
            </div>
          </div>
          <div className="main-content">
            <div className="welcome-section">
              <h2>Welcome {user.name || user.email}</h2>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ 
                  backgroundColor: getUserRoleDisplay(user.role).color, 
                  color: 'white', 
                  padding: '5px 10px', 
                  borderRadius: '15px',
                  fontSize: '14px'
                }}>
                  {getUserRoleDisplay(user.role).text}
                </span>
              </div>

              {user.role === 'guest' && (
                <div style={{ 
                  backgroundColor: '#fff3cd', 
                  border: '1px solid #ffeaa7', 
                  padding: '15px', 
                  borderRadius: '5px',
                  marginBottom: '20px'
                }}>
                  <h4>🔍 Guest Access</h4>
                  <p>You currently have guest access. You can view and download public documents.</p>
                  {!user.hasDrivePermission && (
                    <>
                      <p>To upload your own files, please grant Google Drive permission:</p>
                      <button 
                        onClick={handleGrantDrivePermission}
                        style={{
                          backgroundColor: '#4285f4',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Grant Google Drive Permission
                      </button>
                    </>
                  )}
                  {user.hasDrivePermission && (
                    <div>
                      <p style={{ color: '#28a745', fontWeight: 'bold' }}>
                        ✅ You have previously granted Google Drive permission! 
                      </p>
                      <p style={{ fontSize: '14px', color: '#666' }}>
                        Your access should be upgraded automatically. If you still see Guest access, try refreshing:
                      </p>
                      <button 
                        onClick={() => window.location.reload()}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          marginRight: '10px'
                        }}
                      >
                        🔄 Refresh Page
                      </button>
                      <button 
                        onClick={handleGrantDrivePermission}
                        style={{
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        🔄 Refresh Permissions
                      </button>
                    </div>
                  )}
                </div>
              )}

              {user.role === 'user' && (
                <div style={{ 
                  backgroundColor: '#d4edda', 
                  border: '1px solid #c3e6cb', 
                  padding: '15px', 
                  borderRadius: '5px',
                  marginBottom: '20px'
                }}>
                  <h4>📤 Full User Access</h4>
                  <p>You have full access! You can upload, manage, and delete your own documents.</p>
                </div>
              )}

              {user.role === 'admin' && (
                <div style={{ 
                  backgroundColor: '#f8d7da', 
                  border: '1px solid #f5c6cb', 
                  padding: '15px', 
                  borderRadius: '5px',
                  marginBottom: '20px'
                }}>
                  <h4>👑 Admin Access</h4>
                  <p>You have administrator privileges. You can manage all documents in the system.</p>
                </div>
              )}

              {(user.role === 'user' || user.role === 'admin') && <Upload user={user} />}
              {user && <DocumentList user={user} />}
            </div>
          </div>
        </div>
      ) : (
        <Login />
      )}
    </div>
  )
}

export default App
