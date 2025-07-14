import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function Login() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      // 🔐 Extract Google OAuth access token for Drive API
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;

      console.log("🔍 Debug: Login result analysis...");
      console.log("🔍 Credential object:", credential ? 'EXISTS' : 'NULL');
      console.log("🔍 Access token:", accessToken ? 'EXISTS' : 'NULL');
      console.log("🔍 Token length:", accessToken ? accessToken.length : 0);
      console.log("🔍 Token preview:", accessToken ? accessToken.substring(0, 20) + '...' : 'null');

      // Store the access token in localStorage for use in uploads
      if (accessToken) {
        localStorage.setItem('googleDriveAccessToken', accessToken);
        console.log('✅ Google Drive access token stored successfully');
        console.log('🔍 Stored token verification:', localStorage.getItem('googleDriveAccessToken') ? 'SUCCESS' : 'FAILED');
      } else {
        console.warn('⚠️ No Google access token received - uploads may use local storage');
        console.warn('🔍 This might be because Drive scope was not granted during login');
      }

    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <button className="login-btn heartbeat" onClick={handleLogin}>
        Login with Google (Drive Access)
      </button>
      <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
        This will grant access to your Google Drive for file storage
      </p>
    </div>
  );
}
