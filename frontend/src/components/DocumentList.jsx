import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function DocumentList({ user }) {
  const [docs, setDocs] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchUploader, setSearchUploader] = useState("");
  const [searchTags, setSearchTags] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchDocs = useCallback(() => {
    if (!user) return;
    
    axios
      .get(`${API_BASE_URL}/api/docs/all`, {
        params: {
          uid: user.uid,
          role: user.role,
        },
      })
      .then((res) => setDocs(res.data))
      .catch((err) => console.error("Failed to fetch docs:", err));
  }, [user, API_BASE_URL]);

  useEffect(() => {
    fetchDocs();
    // Make refresh function globally available
    window.refreshDocuments = fetchDocs;
    
    // Cleanup
    return () => {
      if (window.refreshDocuments === fetchDocs) {
        delete window.refreshDocuments;
      }
    };
  }, [fetchDocs]);

  const handleDelete = (docId) => {
    if (!window.confirm("Are you sure you want to delete this version?"))
      return;

    // Get the stored Google OAuth access token for Drive API access
    const googleAccessToken = localStorage.getItem('googleDriveAccessToken');
    
    const requestData = {
      params: { 
        uid: user.uid,
        role: user.role 
      }
    };
    
    // Add access token to request if available
    if (googleAccessToken) {
      requestData.data = { accessToken: googleAccessToken };
      console.log('📤 Sending Google OAuth token for file deletion');
    } else {
      console.warn('⚠️ No Google Drive access token found - Drive file may not be deleted');
    }

    axios
      .delete(`${API_BASE_URL}/api/docs/${docId}`, requestData)
      .then(() => {
        console.log('✅ Document deleted successfully');
        fetchDocs();
      })
      .catch((err) => {
        console.error("❌ Delete failed:", err);
        alert("Delete failed: " + (err.response?.data?.error || err.message));
      });
  };

  const filteredDocs = docs.filter((doc) => {
    const matchesName = doc.originalName
      .toLowerCase()
      .includes(searchName.toLowerCase());
    const matchesUploader = doc.uploader.name
      .toLowerCase()
      .includes(searchUploader.toLowerCase());
    const matchesTags =
      searchTags.trim() === "" ||
      (doc.tags &&
        doc.tags.some((tag) =>
          tag.toLowerCase().includes(searchTags.toLowerCase())
        ));

    return matchesName && matchesUploader && matchesTags;
  });

  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.originalName]) acc[doc.originalName] = [];
    acc[doc.originalName].push(doc);
    return acc;
  }, {});

  // Helper for file type emoji
  const getFileEmoji = (name) => {
    if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name)) return "🖼️ ";
    if (/\.(pdf)$/i.test(name)) return "📄 ";
    if (/\.(csv|xls|xlsx)$/i.test(name)) return "📊 ";
    if (/\.(doc|docx)$/i.test(name)) return "📝 ";
    if (/\.(txt)$/i.test(name)) return "📋 ";
    return "📄 ";
  };

  // Helper to get appropriate download link
  const getDownloadLink = (doc) => {
    if (doc.storageType === 'gdrive' && doc.googleDriveDownloadLink) {
      return doc.googleDriveDownloadLink;
    } else if (doc.storageType === 'local' || doc.filename) {
      // Fallback for legacy local files
      return `${API_BASE_URL}/uploads/${doc.filename}`;
    }
    return null;
  };

  // Helper to get view link (for Google Drive files)
  const getViewLink = (doc) => {
    if (doc.storageType === 'gdrive' && doc.googleDriveViewLink) {
      return doc.googleDriveViewLink;
    }
    return null;
  };

  return (
    <div className="document-section">
      <div
        className="document-section-header"
        style={{ display: "flex", alignItems: "center", gap: "1rem" }}
      >
        <h3>📁 Document Versions</h3>
        <button className="refresh-btn" onClick={fetchDocs}>
          🔄 Refresh
        </button>
      </div>
      <div
        className="search-boxes"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search by document name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <input
          type="text"
          placeholder="👤 Search by uploader name..."
          value={searchUploader}
          onChange={(e) => setSearchUploader(e.target.value)}
        />
        <input
          type="text"
          placeholder="🏷️ Search by tags..."
          value={searchTags}
          onChange={(e) => setSearchTags(e.target.value)}
        />
      </div>

      {Object.keys(groupedDocs).map((name) => {
        const grouped = groupedDocs[name];
        return (
          <div
            key={name}
            className="document-card"
            style={{
              marginBottom: "1rem",
              padding: "10px",
              border: "1px solid gray",
            }}
          >
            <h4>
              {getFileEmoji(name)}
              {name}
            </h4>
            <ul>
              {grouped
                .sort((a, b) => b.version - a.version)
                .map((doc) => {
                  const downloadLink = getDownloadLink(doc);
                  const viewLink = getViewLink(doc);
                  
                  return (
                    <li key={doc._id}>
                      <span>
                        Version {doc.version} — Uploaded by {doc.uploader.name}
                        {doc.storageType === 'gdrive' && ' 📥 (Google Drive)'}
                      </span>
                      
                      {/* Download link */}
                      {downloadLink && (
                        <a
                          href={downloadLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginLeft: "0.5rem" }}
                        >
                          📥 Download
                        </a>
                      )}
                      
                      {/* View link for Google Drive files */}
                      {viewLink && (
                        <a
                          href={viewLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginLeft: "0.5rem" }}
                        >
                          👁️ View
                        </a>
                      )}
                      
                      {doc.tags?.length > 0 && (
                        <span
                          className="tag"
                          style={{
                            marginLeft: "0.5rem",
                            fontStyle: "italic",
                            color: "#555",
                          }}
                        >
                          🏷️ {doc.tags.join(", ")}
                        </span>
                      )}
                      {/* Show delete button for admins (all files) or users (own files only) */}
                      {(user.role === 'admin' || (user.role === 'user' && doc.uploader.uid === user.uid)) && (
                        <button
                          className="delete-btn"
                          style={{ marginLeft: "1rem", color: "red" }}
                          onClick={() => handleDelete(doc._id)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
