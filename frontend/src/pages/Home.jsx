import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import CreatePost from '../components/CreatePost.jsx'
import PostCard from '../components/PostCard.jsx'

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { search } = useLocation()
  const navigate = useNavigate()

  const params = useMemo(() => new URLSearchParams(search), [search])
  const q = params.get('q') || ''
  const activeTag = useMemo(() => {
    try {
      return decodeURIComponent(q)
    } catch {
      return q
    }
  }, [q])

  const load = async () => {
    try {
      setError('')
      setLoading(true)
      const { data } = await api.get('/posts')
      setPosts(data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCreated = (post) => {
    setPosts((p) => [post, ...p])
  }

  const onUpdated = (updated) => {
    setPosts((p) => p.map((x) => (x._id === updated._id ? updated : x)))
  }

  const onDelete = async (post) => {
    try {
      await api.delete(`/posts/${post._id}`)
      setPosts((p) => p.filter((x) => x._id !== post._id))
    } catch (err) {
      // optional toast
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      <CreatePost onCreated={onCreated} />
      {loading && <div className="text-slate-300">Loading...</div>}
      {error && <div className="text-rose-300">{error}</div>}
      {activeTag && (
        <div className="flex items-center gap-2 text-sm text-indigo-300">
          <span>Filtering by tag</span>
          <span className="px-2 py-1 rounded bg-indigo-500/10 border border-indigo-300/20">{activeTag}</span>
          <button className="text-slate-300 hover:text-white ml-auto" onClick={() => navigate('/')}>Clear</button>
        </div>
      )}
      {!loading && posts.length === 0 && (
        <div className="card p-8 text-center text-slate-300">No posts yet. Be the first to post!</div>
      )}
      {(
        (activeTag
          ? posts.filter((p) => (p.text || '').includes(activeTag))
          : posts
        )
      ).map((post) => (
        <PostCard key={post._id} post={post} onUpdated={onUpdated} onDelete={post.userId?._id === user?.id ? onDelete : undefined} />
      ))}
    </div>
  )
}
