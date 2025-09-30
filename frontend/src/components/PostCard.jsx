import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function PostCard({ post, onDelete, onUpdated }) {
  const [liking, setLiking] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [EmojiPicker, setEmojiPicker] = useState(null)
  const [emojiData, setEmojiData] = useState(null)

  const author = post.userId
  const dateText = new Date(post.createdAt).toLocaleString()
  const navigate = useNavigate()

  const emojis = useMemo(() => ['😀','😂','😍','🔥','👏','🎉','👍','🙏','😢','🤔','😎','🥳'], [])

  useEffect(() => {
    let mounted = true
    // Dynamic import for emoji-mart to keep bundle light and optional
    Promise.all([
      import('@emoji-mart/react'),
      import('@emoji-mart/data')
    ]).then(([reactMod, dataMod]) => {
      if (!mounted) return
      setEmojiPicker(() => reactMod.default)
      setEmojiData(dataMod.default)
    }).catch(() => {})
    return () => { mounted = false }
  }, [])

  const renderWithHashtags = (text) => {
    if (!text) return null
    const parts = text.split(/(#[\w_]+)/g)
    return parts.map((part, idx) => {
      if (/^#[\w_]+$/.test(part)) {
        const onClick = () => {
          const q = encodeURIComponent(part)
          navigate(`/?q=${q}`)
        }
        return <button key={idx} type="button" onClick={onClick} className="text-indigo-300 hover:text-indigo-200 cursor-pointer">{part}</button>
      }
      return <span key={idx}>{part}</span>
    })
  }

  const onLike = async () => {
    if (liking) return
    setLiking(true)
    try {
      const { data } = await api.put(`/posts/${post._id}/like`)
      onUpdated?.(data)
    } catch (e) {
      // optionally show toast
    } finally {
      setLiking(false)
    }
  }

  const onAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || commenting) return
    setCommenting(true)
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText })
      setCommentText('')
      onUpdated?.(data)
    } catch (e) {
      // optionally show toast
    } finally {
      setCommenting(false)
    }
  }

  const onToggleCommentLike = async (commentId) => {
    try {
      const { data } = await api.put(`/posts/${post._id}/comments/${commentId}/like`)
      onUpdated?.(data)
    } catch (_) {
      // optionally show toast
    }
  }

  return (
    <article className="card p-5 w-full">
      <header className="flex items-center gap-3 mb-3">
        {author?.profilePic ? (
          <img src={author.profilePic} alt="avatar" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white/80">
            {author?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <div className="font-semibold text-white">{author?.username || 'User'}</div>
          <div className="text-xs text-slate-400">{dateText}</div>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(post)} className="ml-auto text-sm text-rose-300 hover:text-rose-200">Delete</button>
        )}
      </header>
      <div className="text-slate-100 whitespace-pre-wrap">{renderWithHashtags(post.text)}</div>
      {post.image && (
        <img alt="post" src={post.image} className="mt-3 rounded-lg max-h-96 object-cover w-full" />
      )}
      <footer className="mt-3 flex items-center gap-4 text-slate-300 text-sm">
        <button onClick={onLike} className="text-slate-200 hover:text-white disabled:opacity-50" disabled={liking}>
          ❤ {post.likes?.length || 0}
        </button>
        <span>💬 {post.comments?.length || 0}</span>
      </footer>
      {/* Comments List */}
      {post.comments?.length > 0 && (
        <ul className="mt-3 space-y-2 text-slate-200 text-sm">
          {post.comments.map((c) => {
            const cu = c.userId
            const initial = cu?.username?.[0]?.toUpperCase() || 'U'
            return (
              <li key={c._id || c.createdAt} className="bg-white/5 rounded p-2 flex items-start gap-2">
                {cu?.profilePic ? (
                  <img src={cu.profilePic} alt="avatar" className="h-8 w-8 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white/80 shrink-0">{initial}</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-slate-300 flex items-center gap-2">
                    <span className="font-semibold text-white">{cu?.username || 'User'}</span>
                    {c.createdAt && (
                      <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                    )}
                  </div>
                  <div className="text-slate-100 whitespace-pre-wrap">{renderWithHashtags(c.text)}</div>
                  <div className="mt-1 text-xs text-slate-300 flex items-center gap-3">
                    <button type="button" className="hover:text-white" onClick={() => onToggleCommentLike(c._id)}>❤ {c.likes?.length || 0}</button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {/* Add Comment */}
      <form onSubmit={onAddComment} className="mt-3 flex items-center gap-2">
        <div className="relative">
          <button type="button" className="px-2 py-2 rounded bg-white/10 hover:bg-white/20" aria-label="Add emoji" onClick={() => setPickerOpen((v) => !v)}>
            😊
          </button>
          {pickerOpen && createPortal(
            (
              <div className="fixed inset-0 z-[1000] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setPickerOpen(false)} />
                <div className="relative z-[1001] p-2 bg-slate-900/95 border border-white/10 rounded-lg shadow-xl">
                  <div className="flex justify-end mb-1">
                    <button type="button" className="text-slate-300 hover:text-white px-2" aria-label="Close emoji picker" onClick={() => setPickerOpen(false)}>×</button>
                  </div>
                  {EmojiPicker && emojiData ? (
                    <EmojiPicker data={emojiData} onEmojiSelect={(emoji) => { setCommentText((t) => t + (emoji.native || '')); setPickerOpen(false) }} theme="dark" previewPosition="none" searchPosition="none" />
                  ) : (
                    <div className="flex gap-1">
                      {emojis.map((em) => (
                        <button type="button" key={em} onClick={() => { setCommentText((t) => t + em); setPickerOpen(false) }}>{em}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
            document.body
          )}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <div className="absolute -top-28 left-0 bg-slate-800/95 border border-white/10 rounded-lg p-2 shadow-xl hidden peer-focus:block" />
          </div>
          <input
            className="input flex-1"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button className="btn-primary" disabled={commenting || !commentText.trim()}>
            {commenting ? 'Adding...' : 'Comment'}
          </button>
        </div>
      </form>
    </article>
  )
}
