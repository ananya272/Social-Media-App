import { useAuth } from '../context/AuthContext.jsx'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import CreatePost from '../components/CreatePost.jsx'
import PostCard from '../components/PostCard.jsx'

export default function Home() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      {!loading && posts.length === 0 && (
        <div className="card p-8 text-center text-slate-300">No posts yet. Be the first to post!</div>
      )}
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onDelete={post.userId?._id === user?.id ? onDelete : undefined} />
      ))}
    </div>
  )
}
