import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setError('')
      setLoading(true)
      const { data } = await api.get('/notifications')
      setItems(data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="w-full">
      <div className="card p-8 max-w-2xl mx-auto transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
        <h2 className="text-3xl font-semibold mb-4">Notifications</h2>
        {loading && <div className="text-slate-300">Loading...</div>}
        {error && <div className="text-rose-300">{error}</div>}
        {!loading && items.length === 0 && <p className="text-slate-300">You have no new notifications.</p>}
        <ul className="space-y-3">
          {items.map((n) => {
            const when = n.createdAt ? new Date(n.createdAt).toLocaleString() : ''
            const from = n.fromUser?.username || 'Someone'
            const icon = n.type === 'like' ? '❤' : n.type === 'comment' ? '💬' : '🔔'
            const text = n.text || (n.type === 'like' ? `${from} liked your post` : n.type === 'comment' ? `${from} commented on your post` : 'Notification')
            return (
              <li key={n._id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-start gap-3 hover:bg-white/10 transition-colors">
                <span className="text-lg">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-slate-100">{text}</div>
                  <div className="text-xs text-slate-400 mt-1">{when}</div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
