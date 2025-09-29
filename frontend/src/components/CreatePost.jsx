import { useState } from 'react'
import api from '../api/axios'

export default function CreatePost({ onCreated }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!text.trim()) {
      setError('Say something...')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/posts', { text })
      setText('')
      onCreated?.(data)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="card p-5 grid gap-3 w-full">
      <textarea
        className="input min-h-28"
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <div className="text-rose-300 text-sm">{error}</div>}
      <div className="ml-auto">
        <button className="btn-primary" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
