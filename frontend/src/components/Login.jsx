import { signInWithPopup } from "firebase/auth"
import { auth, provider } from "../firebase"

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <button className="login-btn" onClick={handleLogin}>
        Login with Google
      </button>
    </div>
  )
}
