export default function PostCard({ post, onDelete }) {
  const author = post.userId
  const dateText = new Date(post.createdAt).toLocaleString()
  return (
    <article className="card p-5 w-full">
      <header className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white/80">
          {author?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div className="font-semibold text-white">{author?.username || 'User'}</div>
          <div className="text-xs text-slate-400">{dateText}</div>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(post)} className="ml-auto text-sm text-rose-300 hover:text-rose-200">Delete</button>
        )}
      </header>
      <div className="text-slate-100 whitespace-pre-wrap">{post.text}</div>
      {post.image && (
        <img alt="post" src={post.image} className="mt-3 rounded-lg max-h-96 object-cover w-full" />
      )}
      <footer className="mt-3 flex items-center gap-4 text-slate-300 text-sm">
        <span>❤ {post.likes?.length || 0}</span>
        <span>💬 {post.comments?.length || 0}</span>
      </footer>
    </article>
  )
}
