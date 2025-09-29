import { useAuth } from '../context/AuthContext.jsx'

export default function Profile() {
  const { user } = useAuth()
  return (
    <div className="w-full">
      <div className="card p-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold mb-4">Profile</h2>
        {user ? (
          <div className="space-y-2 text-slate-200">
            <div><span className="text-slate-400">Username:</span> {user.username}</div>
            <div><span className="text-slate-400">Email:</span> {user.email}</div>
            {user.bio && <div><span className="text-slate-400">Bio:</span> {user.bio}</div>}
          </div>
        ) : (
          <p className="text-slate-300">No user loaded.</p>
        )}
      </div>
    </div>
  )
}
