// src/components/Upload.jsx
import { useState } from "react";
import axios from "axios";

export default function Upload({ user }) {
  const [file, setFile] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    
    try {
      // Get the stored Google OAuth access token
      const googleAccessToken = localStorage.getItem('googleDriveAccessToken');
      
      console.log('🔍 Debug: Checking for Google Drive access token...');
      console.log('🔍 Token found:', googleAccessToken ? 'YES' : 'NO');
      console.log('🔍 Token length:', googleAccessToken ? googleAccessToken.length : 0);
      console.log('🔍 Token preview:', googleAccessToken ? googleAccessToken.substring(0, 20) + '...' : 'null');
      
      if (googleAccessToken) {
        console.log('✅ Using stored Google Drive access token');
      } else {
        console.warn('⚠️ No Google Drive access token found - will use local storage');
        console.log('💡 Try logging out and logging back in to grant Google Drive permissions');
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("uid", user.uid);
      formData.append("email", user.email);
      formData.append("isPrivate", isPrivate);
      formData.append("name", user.name || user.displayName);
      formData.append("isAdmin", user.isAdmin);
      formData.append("tags", tags);      
      // Send the Google OAuth access token (not Firebase ID token)
      if (googleAccessToken) {
        formData.append("accessToken", googleAccessToken);
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      
      const res = await axios.post(
        `${API_BASE_URL}/api/docs/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      alert("✅ Upload successful: " + res.data.document.originalName);
      
      // Reset form
      setFile(null);
      setIsPrivate(false);
      setTags("");
      
      // Refresh the document list if there's a refresh function available
      if (window.refreshDocuments) {
        window.refreshDocuments();
      }
      
    } catch (err) {
      console.error('Upload error:', err);
      
      let errorMessage = "Upload failed: " + (err.response?.data?.error || err.message);
      
      // Provide helpful guidance for common issues
      if (err.response?.status === 500 && errorMessage.includes('Google Drive')) {
        errorMessage += "\n\n💡 Tips:\n- Make sure you granted Google Drive permissions during login\n- Try logging out and logging back in\n- Check your Google Drive storage space";
      }
      
      alert("❌ " + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-section">
      <h3>📤 Upload to Google Drive</h3>
      <form
        className="upload-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleUpload();
        }}
      >
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          value={file ? undefined : ""}
          disabled={uploading}
        />
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="private"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
            disabled={uploading}
          />
          <label htmlFor="private">🔒 Private Document</label>
        </div>
        <input
          type="text"
          placeholder="🏷️ Tags (e.g. urgent, review)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{ marginTop: "0.5rem", padding: "5px", width: "100%" }}
          disabled={uploading}
        />
        <button type="submit" disabled={!file || uploading}>
          {uploading ? "⏳ Uploading..." : "📤 Upload to Google Drive"}
        </button>
      </form>
    </div>
  );
}
