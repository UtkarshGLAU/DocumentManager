import { Link, useLocation } from "react-router-dom"

export default function Navigation({ user, onLogout }) {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link nav-link--active' : 'nav-link'
  }

  return (
    <div className="header">
      <div className="header-content">
        <h1>📄 Document Manager</h1>
        
        <nav className="navigation">
          <Link to="/" className={isActive('/')}>
            🏠 Home
          </Link>
          <Link to="/about" className={isActive('/about')}>
            📄 About
          </Link>
          <Link to="/settings" className={isActive('/settings')}>
            ⚙️ Settings
          </Link>
        </nav>
        
        <div className="user-info">
          <span>Welcome, {user.name || user.email}</span>
          <button onClick={onLogout} className="logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
