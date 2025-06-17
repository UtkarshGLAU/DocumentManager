// src/components/Upload.jsx
import { useState } from "react";
import axios from "axios";

export default function Upload({ user }) {
  const [file, setFile] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", user.uid);
    formData.append("email", user.email);
    formData.append("isPrivate", isPrivate);
    formData.append("name", user.displayName);
    formData.append("isAdmin", user.isAdmin);
    formData.append("tags", tags);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/docs/upload",
        formData
      );
      alert("Upload successful: " + res.data.document.originalName);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div className="upload-section">
      <h3>📤 Upload Document</h3>
      <form
        className="upload-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleUpload();
          setFile(null);
          setIsPrivate(false);
          setTags("");
        }}
      >
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          value={file ? undefined : ""}
        />
        <div className="checkbox-container">
          <input
            type="checkbox"
            id="private"
            checked={isPrivate}
            onChange={() => setIsPrivate(!isPrivate)}
          />
          <label htmlFor="private">🔒 Private Document</label>
        </div>
        <input
          type="text"
          placeholder="🏷️ Tags (e.g. urgent, review)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{ marginTop: "0.5rem", padding: "5px", width: "100%" }}
        />
        <button type="submit">Upload Document</button>
      </form>
    </div>
  );
}
