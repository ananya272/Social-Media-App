import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      await login({ email: form.email, password: form.password })
      navigate('/')
    } catch (err) {
      setApiError(err?.response?.data?.error || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="w-full max-w-5xl bg-slate-800/50 backdrop-blur-lg rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="grid md:grid-cols-2">
          {/* Left brand section */}
          <div className="p-10 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 text-white">
            <h1 className="text-5xl font-extrabold tracking-tight text-white">
              Social<span className="text-indigo-400">Hub</span>
            </h1>
            <p className="mt-4 text-xl text-slate-300">
              Connect with friends and the world around you.
            </p>
            <ul className="mt-6 space-y-2 text-slate-300">
              <li>• Share moments</li>
              <li>• Follow people you care about</li>
              <li>• Discover new stories</li>
            </ul>
          </div>

          {/* Right login card */}
          <div className="p-10 bg-slate-800/70">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-slate-400">Sign in to continue to your account</p>
              </div>
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    required
                  />
                  {errors.email && <small className="text-rose-300">{errors.email}</small>}
                </div>
                <div className="space-y-1">
                  <label className="label" htmlFor="password">Password</label>
                  <input
                    id="password"
                    className="input"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="********"
                    required
                  />
                  {errors.password && <small className="text-rose-300">{errors.password}</small>}
                </div>
                {apiError && <div className="text-rose-300">{apiError}</div>}
                <button 
                  disabled={submitting} 
                  type="submit" 
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </>
                  ) : 'Log in'}
                </button>
              </form>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/70 text-slate-400">Don't have an account?</span>
                </div>
              </div>
              <div className="text-center">
                <Link 
                  to="/signup" 
                  className="inline-block w-full py-2.5 px-4 border border-white/20 rounded-lg text-slate-300 hover:bg-white/5 transition-colors duration-300"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
