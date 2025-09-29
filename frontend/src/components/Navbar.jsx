import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const linkCls = (to) => `px-4 py-2.5 rounded-lg text-base md:text-lg font-medium ${
    pathname === to ? 'bg-white/10 text-white' : 'text-slate-200 hover:text-white hover:bg-white/10'
  }`

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/5 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-5 py-4 md:py-5 flex items-center gap-4 md:gap-6">
        <Link to="/" className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">Social<span className="text-indigo-400">Hub</span></Link>
        <nav className="ml-auto flex items-center gap-2 md:gap-3">
          {isAuthenticated ? (
            <>
              <Link className={linkCls('/')} to="/">Home</Link>
              <Link className={linkCls('/profile')} to="/profile">Profile</Link>
              <Link className={linkCls('/notifications')} to="/notifications">Notifications</Link>
              <button className="btn-primary ml-2 md:ml-3 px-5 py-2.5 text-base md:text-lg" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className={linkCls('/login')} to="/login">Login</Link>
              <Link className={linkCls('/signup')} to="/signup">Signup</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
