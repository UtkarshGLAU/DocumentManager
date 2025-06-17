import { useEffect, useState } from "react";
import axios from "axios";

export default function DocumentList({ user }) {
  const [docs, setDocs] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchUploader, setSearchUploader] = useState("");
  const [searchTags, setSearchTags] = useState("");

  const fetchDocs = () => {
    axios
      .get("http://localhost:5000/api/docs/all", {
        params: {
          uid: user.uid,
          isAdmin: user.isAdmin,
        },
      })
      .then((res) => setDocs(res.data))
      .catch((err) => console.error("Failed to fetch docs:", err));
  };

  useEffect(() => {
    if (user) fetchDocs();
  }, [user]);

  const handleDelete = (docId) => {
    if (!window.confirm("Are you sure you want to delete this version?"))
      return;

    axios
      .delete(`http://localhost:5000/api/docs/${docId}`, {
        params: { isAdmin: user.isAdmin },
      })
      .then(() => fetchDocs())
      .catch((err) => console.error("Delete failed:", err));
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
    return "";
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
                .map((doc) => (
                  <li key={doc._id}>
                    <span>
                      Version {doc.version} — Uploaded by {doc.uploader.name}
                    </span>
                    <a
                      href={`http://localhost:5000/uploads/${doc.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginLeft: "0.5rem" }}
                    >
                      📥 Download
                    </a>
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
                    {user.isAdmin && (
                      <button
                        className="delete-btn"
                        style={{ marginLeft: "1rem", color: "red" }}
                        onClick={() => handleDelete(doc._id)}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
