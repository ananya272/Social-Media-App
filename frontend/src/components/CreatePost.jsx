import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import api from '../api/axios'

export default function CreatePost({ onCreated }) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [EmojiPicker, setEmojiPicker] = useState(null)
  const [emojiData, setEmojiData] = useState(null)

  const emojis = useMemo(() => ['😀','😂','😍','🔥','👏','🎉','👍','🙏','😢','🤔','😎','🥳'], [])

  useEffect(() => {
    let mounted = true
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
      <div className="relative">
        <textarea
          className="input min-h-28 w-full"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-2 flex items-center gap-2">
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
                    <EmojiPicker data={emojiData} onEmojiSelect={(emoji) => { setText((t) => t + (emoji.native || '')); setPickerOpen(false) }} theme="dark" previewPosition="none" />
                  ) : (
                    <div className="flex gap-1 text-lg">
                      {emojis.map((em) => (
                        <button type="button" key={em} className="px-2 py-1 rounded hover:bg-white/10" onClick={() => { setText((t) => t + em); setPickerOpen(false) }}>
                          {em}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ),
            document.body
          )}
        </div>
      </div>
      {error && <div className="text-rose-300 text-sm">{error}</div>}
      <div className="ml-auto">
        <button className="btn-primary" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
