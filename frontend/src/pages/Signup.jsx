import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Signup() {
  const navigate = useNavigate()
  const { signup, login } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', bio: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters'
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
      await signup({ username: form.username, email: form.email, password: form.password, bio: form.bio })
      // Auto-login after signup for smoother UX
      await login({ email: form.email, password: form.password })
      navigate('/')
    } catch (err) {
      setApiError(err?.response?.data?.error || 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 grid md:grid-cols-2 items-center gap-10">
      {/* Left brand/marketing */}
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          Social<span className="text-indigo-400">Hub</span>
        </h1>
        <p className="mt-4 text-xl text-slate-300">Create your account to join your friends and favorite creators.</p>
        <ul className="mt-6 space-y-2 text-slate-300">
          <li>• Build your network</li>
          <li>• Share photos and updates</li>
          <li>• Discover trending content</li>
        </ul>
      </div>

      {/* Right signup card */}
      <div>
        <div className="card p-8">
          <h2 className="text-2xl font-semibold mb-6">Create your account</h2>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input
                id="username"
                className="input"
                type="text"
                name="username"
                value={form.username}
                onChange={onChange}
                placeholder="yourname"
                required
              />
              {errors.username && <small className="text-rose-300">{errors.username}</small>}
            </div>
            <div>
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
            <div>
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
            <div>
              <label className="label" htmlFor="bio">Bio (optional)</label>
              <textarea id="bio" className="input min-h-24" name="bio" value={form.bio} onChange={onChange} rows={3} placeholder="About you..." />
            </div>
            {apiError && <div className="text-rose-300">{apiError}</div>}
            <button disabled={submitting} type="submit" className="btn-primary w-full">
              {submitting ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <div className="mt-6 h-px bg-white/10" />
          <p className="mt-4 text-slate-300 text-center">
            Already have an account? <Link to="/login" className="text-indigo-300 hover:text-indigo-200">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
