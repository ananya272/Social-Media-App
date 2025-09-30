import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios'
import PostCard from '../components/PostCard.jsx'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ bio: '', profilePic: '' })

  const canEdit = useMemo(() => !!user, [user])

  const load = async () => {
    if (!user?.id) return
    try {
      setError('')
      setLoading(true)
      const { data } = await api.get('/posts', { params: { userId: user.id } })
      setPosts(data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user?.id])

  useEffect(() => {
    if (user) setForm({ bio: user.bio || '', profilePic: user.profilePic || '' })
  }, [user])

  const onUpdated = (updated) => {
    setPosts((p) => p.map((x) => (x._id === updated._id ? updated : x)))
  }

  const onDelete = async (post) => {
    try {
      await api.delete(`/posts/${post._id}`)
      setPosts((p) => p.filter((x) => x._id !== post._id))
    } catch {}
  }

  const onSaveProfile = async (e) => {
    e.preventDefault()
    try {
      const { data: updatedUser } = await api.patch('/users/me', {
        bio: form.bio,
        profilePic: form.profilePic || ''
      })
      setUser((u) => ({ ...u, ...updatedUser }))
      setEditing(false)
    } catch (err) {
      console.error('Update profile error:', err)
      alert(err?.response?.data?.error || 'Failed to update profile')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="card p-8 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
        <h2 className="text-3xl font-semibold mb-4">Profile</h2>
        {user ? (
          <div className="flex items-start gap-4 text-slate-200">
            {user.profilePic ? (
              <img src={user.profilePic} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white/80 text-xl">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1">
              <div className="text-xl font-semibold text-white">{user.username}</div>
              <div className="text-slate-300">{user.email}</div>
              {user.bio && <div className="mt-1 text-slate-200">{user.bio}</div>}
              {canEdit && (
                <button className="mt-3 btn-primary transition-transform duration-200 hover:scale-[1.02]" onClick={() => setEditing((v) => !v)}>
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-slate-300">No user loaded.</p>
        )}

        {editing && (
          <form onSubmit={onSaveProfile} className="mt-5 grid gap-3 animate-fade-in">
            <div>
              <label className="label">Bio</label>
              <textarea className="input min-h-24" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </div>
            <div>
              <label className="label">Profile picture URL</label>
              <input className="input" value={form.profilePic} onChange={(e) => setForm((f) => ({ ...f, profilePic: e.target.value }))} />
            </div>
            <div className="ml-auto">
              <button className="btn-primary transition-all duration-300 hover:scale-105 active:scale-95">
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-white">Your posts</h3>
        {loading && <div className="text-slate-300">Loading...</div>}
        {error && <div className="text-rose-300">{error}</div>}
        {!loading && posts.length === 0 && <div className="card p-6 text-slate-300">No posts yet.</div>}
        {posts.map((post) => (
          <PostCard key={post._id} post={post} onUpdated={onUpdated} onDelete={post.userId?._id === user?.id ? onDelete : undefined} />
        ))}
      </div>
    </div>
  )
}
