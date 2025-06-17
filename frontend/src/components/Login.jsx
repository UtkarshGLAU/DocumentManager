// src/components/Login.jsx
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";


export default function Login({ setUser }) {
  const handleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Send to backend
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
    });

    setUser({ ...user, isAdmin: res.data.isAdmin });
  } catch (err) {
    console.error("Login failed:", err);
  }
};

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>
      <button className="login-btn" onClick={handleLogin}>Login with Google</button>
    </div>
  );
}
