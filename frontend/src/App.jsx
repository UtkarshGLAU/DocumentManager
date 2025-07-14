import { useState, useEffect } from "react"
import Login from "./components/Login"
import Upload from "./components/Upload"
import DocumentList from "./components/DocumentList"
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth"
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
        // Clear stored Google Drive access token
        localStorage.removeItem('googleDriveAccessToken')
        console.log('🔐 Google Drive access token cleared')
      })
      .catch((error) => {
        console.error("Logout error:", error)
      })
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userCred) => {
      if (userCred) {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
          
          // Send user data to backend to check admin status
          const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            uid: userCred.uid,
            email: userCred.email,
            name: userCred.displayName,
            photo: userCred.photoURL,
          })

          // Get ID token to check for custom claims
          const token = await userCred.getIdTokenResult()

          setUser({
            name: userCred.displayName,
            email: userCred.email,
            uid: userCred.uid,
            photoURL: userCred.photoURL,
            isAdmin: res.data.isAdmin || token.claims.admin || false,
          })
        } catch (error) {
          console.error("Error setting user:", error)
          // Fallback to basic user info if backend call fails
          const token = await userCred.getIdTokenResult()
          setUser({
            name: userCred.displayName,
            email: userCred.email,
            uid: userCred.uid,
            photoURL: userCred.photoURL,
            isAdmin: token.claims.admin || false,
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
            {user.isAdmin && <Upload user={user} />}

            <div className="welcome-section">
              <h2>Welcome {user.name || user.email}</h2>
              {user.isAdmin ? <p>🔐 You are an admin</p> : <p>🙋 You are a regular user</p>}
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
