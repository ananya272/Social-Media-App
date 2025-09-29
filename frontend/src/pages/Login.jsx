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
    <div className="mx-auto max-w-6xl px-6 py-10 grid md:grid-cols-2 items-center gap-10">
      {/* Left brand section (like Facebook) */}
      <div>
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
      <div>
        <div className="card p-8">
          <h2 className="text-2xl font-semibold mb-6">Log in to SocialHub</h2>
          <form onSubmit={onSubmit} className="grid gap-4">
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
            {apiError && <div className="text-rose-300">{apiError}</div>}
            <button disabled={submitting} type="submit" className="btn-primary w-full">
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>
          <div className="mt-6 h-px bg-white/10" />
          <p className="mt-4 text-slate-300 text-center">
            New here? <Link to="/signup" className="text-indigo-300 hover:text-indigo-200">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
