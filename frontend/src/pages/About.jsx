export default function About() {
  return (
    <div className="main-content">
      <div className="welcome-section">
        <h2>📄 About This Document Management System</h2>

        <div className="about-content">
          <p>
            This is a personal project I built to explore secure and efficient document management using modern web technologies.
            It integrates with Google Drive to provide privacy-first storage, and includes key features like authentication, role-based access, and version control.
          </p>
          <br/>

          <div className="feature-grid">
            <div className="feature-card">
              <h3>🔐 Secure Authentication</h3>
              <p>Google OAuth via Firebase ensures user identity and protects access to documents with enterprise-grade security.</p>
            </div>

            <div className="feature-card">
              <h3>☁️ Cloud Storage</h3>
              <p>Documents are stored securely in the user’s own Google Drive, giving them full ownership and access control.</p>
            </div>

            <div className="feature-card">
              <h3>👥 Role-Based Access</h3>
              <p>Manage permissions easily with support for Guest, User, and Admin roles.</p>
            </div>

            <div className="feature-card">
              <h3>🏷️ Smart Organization</h3>
              <p>Tagging and powerful search features make it easy to find documents quickly.</p>
            </div>

            <div className="feature-card">
              <h3>📱 Responsive Design</h3>
              <p>Access and manage your documents on any device with a clean, mobile-friendly UI.</p>
            </div>

            <div className="feature-card">
              <h3>🔄 Version Control</h3>
              <p>Track changes and access previous versions to never lose important information.</p>
            </div>
          </div>

          <div className="tech-stack">
            <h3>🛠️ Tech Stack</h3>
            <div className="tech-list">
              <div className="tech-item">
                <strong>Frontend:</strong> React, Vite, Firebase Auth
              </div>
              <div className="tech-item">
                <strong>Backend:</strong> Node.js, Express, MongoDB
              </div>
              <div className="tech-item">
                <strong>Storage:</strong> Google Drive API
              </div>
              <div className="tech-item">
                <strong>Deployment:</strong> Vercel + Render
              </div>
            </div>
          </div>

          <div className="privacy-section">
            <h3>🔒 Privacy & Security</h3>
            <p>
              Your documents remain in your Google Drive account — this app only accesses what’s required to provide functionality.
              Nothing is stored on any external server beyond authentication metadata.
            </p>
          </div>

          <div className="contact-section">
            <h3>📧 Contact & GitHub</h3>
            <p>
              This is a solo project built by me to learn and demonstrate real-world integration of cloud storage and secure access.
              If you have suggestions, find bugs, or want to contribute, feel free to check out the code or open an issue.
            </p>
            <p>
              🔗 GitHub Repo: <a href="https://github.com/UtkarshGLAU/DocumentManager" target="_blank" rel="noopener noreferrer">GitHub</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
