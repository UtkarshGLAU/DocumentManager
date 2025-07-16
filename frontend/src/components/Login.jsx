import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState(null);

  const handleLogin = async (accessLevel) => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);

      let accessToken = null;
      let hasDriveAccess = false;

      // Only request Google Drive permissions for full user access
      if (accessLevel === 'user') {
        // 🔐 Extract Google OAuth access token for Drive API
        const credential = GoogleAuthProvider.credentialFromResult(result);
        accessToken = credential.accessToken;

        console.log("🔍 Debug: Login result analysis...");
        console.log("🔍 Credential object:", credential ? 'EXISTS' : 'NULL');
        console.log("🔍 Access token:", accessToken ? 'EXISTS' : 'NULL');
        console.log("🔍 Token length:", accessToken ? accessToken.length : 0);

        // Check if we have an existing token from previous login
        const existingToken = localStorage.getItem('googleDriveAccessToken');
        console.log("🔍 Existing token:", existingToken ? 'EXISTS' : 'NULL');

        // Use new token if available, otherwise use existing token
        const tokenToUse = accessToken || existingToken;
        hasDriveAccess = !!tokenToUse;

        // Store the token if we got a new one
        if (accessToken) {
          localStorage.setItem('googleDriveAccessToken', accessToken);
          console.log('✅ New Google Drive access token stored successfully');
        } else if (existingToken) {
          console.log('✅ Using existing Google Drive access token');
        } else {
          console.warn('⚠️ No Google access token available - user will be guest');
        }
      } else {
        // For guest access, explicitly set no drive access
        console.log('🔍 Guest access selected - no Google Drive permissions requested');
        hasDriveAccess = false;
      }

      // Send login data to backend including drive access status
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        photo: result.user.photoURL,
        hasGoogleDriveAccess: hasDriveAccess,
        accessLevel: accessLevel
      });

    } catch (err) {
      console.error("Login failed:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container fade-in">
      <h2 className="login-title">📄 Document Management System</h2>
      
      <div className="access-level-selector">
        <h3 className="text-center mb-md">Choose your access level:</h3>
        <div className="flex gap-md">
          <div 
            className={`access-card access-card--guest ${selectedAccessLevel === 'guest' ? 'access-card--selected' : ''}`}
            onClick={() => setSelectedAccessLevel('guest')}
            style={{ cursor: 'pointer' }}
          >
            <h4>🔍 Guest Access</h4>
            <p>
              • View and download public documents<br/>
              • No upload permissions<br/>
              • No Google Drive access required
            </p>
          </div>
          <div 
            className={`access-card access-card--quest ${selectedAccessLevel === 'user' ? 'access-card--selected' : ''}`}
            onClick={() => setSelectedAccessLevel('user')}
            style={{ cursor: 'pointer' }}
          >
            <h4>📤 Full User Access</h4>
            <p>
              • Upload and manage your documents<br/>
              • Access all features<br/>
              • Requires Google Drive permissions
            </p>
          </div>
        </div>
      </div>
      
      <button 
        className="login-btn heartbeat" 
        onClick={() => handleLogin(selectedAccessLevel)}
        disabled={isLoading || !selectedAccessLevel}
      >
        {isLoading ? '⏳ Logging in...' : '🚀 Login with Google'}
      </button>
      
      <p className="login-instructions">
        {selectedAccessLevel === 'guest' ? (
          <>
            <strong>Guest Access:</strong> You'll be able to view and download public documents without Google Drive permissions.
          </>
        ) : selectedAccessLevel === 'user' ? (
          <>
            During login, you'll be asked to grant Google Drive access for full user features.
          </>
        ) : (
          <>
            Please select an access level above to continue.
          </>
        )}
      </p>
    </div>
  );
}
