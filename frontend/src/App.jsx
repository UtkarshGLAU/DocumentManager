import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./components/Login"
import Navigation from "./components/Navigation"
import Home from "./pages/Home"
import About from "./pages/About"
import Settings from "./pages/Settings"
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
        // Don't clear the Google Drive access token on logout
        // This allows the system to detect previous permissions on next login
        console.log('🔐 User logged out, but Google Drive token preserved for next login')
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
          
          // Check if user has drive access token
          const storedToken = localStorage.getItem('googleDriveAccessToken');
          const hasGoogleDriveAccess = !!storedToken;
          
          console.log('🔍 Auth state changed - checking drive access:', hasGoogleDriveAccess);
          
          // Send user data to backend to check role and permissions
          const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            uid: userCred.uid,
            email: userCred.email,
            name: userCred.displayName,
            photo: userCred.photoURL,
            hasGoogleDriveAccess
          })

          // Get ID token to check for custom claims
          const token = await userCred.getIdTokenResult()

          setUser({
            name: userCred.displayName,
            email: userCred.email,
            uid: userCred.uid,
            photoURL: userCred.photoURL,
            isAdmin: res.data.isAdmin || token.claims.admin || false,
            role: res.data.role || 'guest',
            hasDrivePermission: res.data.hasDrivePermission || false,
          })
          
          console.log('✅ User set with role:', res.data.role, 'hasDrivePermission:', res.data.hasDrivePermission);
        } catch (error) {
          console.error("Error setting user:", error)
          // Fallback to basic user info if backend call fails
          const token = await userCred.getIdTokenResult()
          const storedToken = localStorage.getItem('googleDriveAccessToken');
          
          setUser({
            name: userCred.displayName,
            email: userCred.email,
            uid: userCred.uid,
            photoURL: userCred.photoURL,
            isAdmin: token.claims.admin || false,
            role: storedToken ? 'user' : 'guest',
            hasDrivePermission: !!storedToken,
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
        <div className="flex-center flex-column">
          <div className="spinner"></div>
          <p className="mt-md">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {user ? (
        <Router>
          <Navigation user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Home user={user} setUser={setUser} />} />
            <Route path="/about" element={<About />} />
            <Route path="/settings" element={<Settings user={user} setUser={setUser} />} />
          </Routes>
        </Router>
      ) : (
        <Login />
      )}
    </div>
  )
}

export default App
