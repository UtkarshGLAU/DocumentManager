// src/components/Upload.jsx
import { useState, useRef } from "react";
import axios from "axios";

export default function Upload({ user }) {
  const [file, setFile] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) {
      console.log('✅ File selected:', selectedFile.name, selectedFile.size, 'bytes');
      console.log('🔍 File type:', selectedFile.type);
      console.log('🔍 File last modified:', selectedFile.lastModified);
      console.log('🔍 Browser info:', navigator.userAgent);
    }
  };

  const triggerFileSelect = () => {
    console.log('🔍 Custom file select button clicked');
    if (fileInputRef.current) {
      console.log('✅ File input ref exists, triggering click');
      fileInputRef.current.click();
    } else {
      console.error('❌ File input ref not found');
    }
  };

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
      formData.append("role", user.role);
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
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="file-input" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            📁 Choose File:
          </label>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          
          {/* Custom file input button */}
          <div
            onClick={triggerFileSelect}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px dashed #cbd5e0',
              borderRadius: '8px',
              backgroundColor: uploading ? '#f5f5f5' : 'white',
              cursor: uploading ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: file ? '#28a745' : '#6c757d'
            }}
            onMouseOver={(e) => {
              if (!uploading) {
                e.target.style.borderColor = '#4f46e5';
                e.target.style.backgroundColor = '#f7fafc';
              }
            }}
            onMouseOut={(e) => {
              if (!uploading) {
                e.target.style.borderColor = '#cbd5e0';
                e.target.style.backgroundColor = 'white';
              }
            }}
          >
            {file ? `✅ ${file.name}` : '📁 Click to select a file'}
          </div>
          
          {/* Fallback: Standard file input for browsers that need it */}
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            disabled={uploading}
            style={{
              width: '100%',
              padding: '8px',
              border: '2px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: uploading ? '#f5f5f5' : 'white',
              cursor: uploading ? 'not-allowed' : 'pointer',
              marginTop: '8px'
            }}
          />
          
          {file && (
            <p style={{ marginTop: '0.5rem', color: '#28a745', fontSize: '14px' }}>
              ✅ Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          )}
        </div>
        
        <div className="checkbox-container" style={{ marginBottom: '1rem' }}>
          <input
            type="checkbox"
            id="private"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
            disabled={uploading}
          />
          <label htmlFor="private" style={{ marginLeft: '0.5rem' }}>🔒 Private Document</label>
        </div>
        
        <input
          type="text"
          placeholder="🏷️ Tags (e.g. urgent, review)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{ 
            marginTop: "0.5rem", 
            marginBottom: "1rem",
            padding: "8px", 
            width: "100%",
            border: "2px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px"
          }}
          disabled={uploading}
        />
        
        <button 
          type="submit" 
          disabled={!file || uploading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: (!file || uploading) ? '#ccc' : '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: (!file || uploading) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {uploading ? "⏳ Uploading..." : "📤 Upload to Google Drive"}
        </button>
      </form>
    </div>
  );
}
