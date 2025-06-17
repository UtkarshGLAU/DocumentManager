// src/App.jsx
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Upload from "./components/Upload";
import DocumentList from "./components/DocumentList";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        window.location.reload(); // optional, or set user to null manually
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userCred) => {
      if (userCred) {
        userCred.getIdTokenResult().then((token) => {
          setUser({
            name: userCred.displayName,
            email: userCred.email,
            uid: userCred.uid,
            isAdmin: token.claims.admin || false,
          });
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <div class="header">
            <h1>📄 Document Manager</h1>
            <button
              onClick={handleLogout}
              className="logout"
              style={{ marginLeft: "1rem", color: "red" }}
            >
              Logout
            </button>
          </div>
          <div class="main-content">
            {user.isAdmin && <Upload user={user} />}

            <div className="welcome-section">
              <h2>Welcome {user.displayName}</h2>
              {user.isAdmin ? (
                <p>🔐 You are an admin</p>
              ) : (
                <p>🙋 You are a regular user</p>
              )}
              {user && <DocumentList user={user} />}
            </div>
          </div>
        </div>
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
}

export default App;
