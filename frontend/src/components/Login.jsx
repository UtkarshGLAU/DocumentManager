import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);

      // 🔐 Extract Google OAuth access token for Drive API
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;

      console.log("🔍 Debug: Login result analysis...");
      console.log("🔍 Credential object:", credential ? 'EXISTS' : 'NULL');
      console.log("🔍 Access token:", accessToken ? 'EXISTS' : 'NULL');
      console.log("🔍 Token length:", accessToken ? accessToken.length : 0);

      // Check if we have an existing token from previous login
      const existingToken = localStorage.getItem('googleDriveAccessToken');
      console.log("🔍 Existing token:", existingToken ? 'EXISTS' : 'NULL');

      // Use new token if available, otherwise use existing token
      const tokenToUse = accessToken || existingToken;
      const hasDriveAccess = !!tokenToUse;

      // Store the token if we got a new one
      if (accessToken) {
        localStorage.setItem('googleDriveAccessToken', accessToken);
        console.log('✅ New Google Drive access token stored successfully');
      } else if (existingToken) {
        console.log('✅ Using existing Google Drive access token');
      } else {
        console.warn('⚠️ No Google access token available - user will be guest');
      }

      // Send login data to backend including drive access status
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        photo: result.user.photoURL,
        hasGoogleDriveAccess: hasDriveAccess
      });

    } catch (err) {
      console.error("Login failed:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Document Management System</h2>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h3>Choose your access level:</h3>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
          <div style={{ 
            border: '2px solid #ddd', 
            padding: '20px', 
            borderRadius: '10px', 
            maxWidth: '200px',
            backgroundColor: '#f9f9f9'
          }}>
            <h4>🔍 Guest Access</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>
              • View and download public documents
              • No upload permissions
              • No Google Drive access required
            </p>
          </div>
          <div style={{ 
            border: '2px solid #4285f4', 
            padding: '20px', 
            borderRadius: '10px', 
            maxWidth: '200px',
            backgroundColor: '#f0f8ff'
          }}>
            <h4>📤 Full User Access</h4>
            <p style={{ fontSize: '14px', color: '#666' }}>
              • Upload and manage your documents
              • Access all features
              • Requires Google Drive permissions
            </p>
          </div>
        </div>
      </div>
      
      <button 
        className="login-btn heartbeat" 
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login with Google'}
      </button>
      
      <p style={{ fontSize: '12px', marginTop: '10px', color: '#666', textAlign: 'center' }}>
        During login, you can choose to grant or deny Google Drive access.<br/>
        <strong>Grant access</strong> for full user features, or <strong>deny</strong> for guest access.
      </p>
    </div>
  );
}
