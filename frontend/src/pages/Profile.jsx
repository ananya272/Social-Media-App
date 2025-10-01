import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios';
import PostCard from '../components/PostCard.jsx';

export default function Profile() {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', profilePic: '', username: '', email: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isCurrentUser = useMemo(() => {
    return currentUser && profileUser && currentUser._id === profileUser._id;
  }, [currentUser, profileUser]);

  const canEdit = isCurrentUser;

  const loadUser = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await api.get(`/users/${userId || currentUser?._id}`);
      setProfileUser(data);
      setForm({
        bio: data.bio || '',
        profilePic: data.profilePic || '',
        username: data.username || '',
        email: data.email || ''
      });
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load profile');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (page = 1) => {
    try {
      setLoadingPosts(true);
      const { data } = await api.get(`/users/${userId || currentUser?._id}/posts?page=${page}`);
      setPosts(data.posts);
      setCurrentPage(data.currentPage);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (userId || currentUser?._id) {
      loadUser();
    }
  }, [userId, currentUser?._id]);

  useEffect(() => {
    if (profileUser?._id) {
      loadPosts();
    }
  }, [profileUser?._id]);

  const onUpdated = (updated) => {
    setPosts((p) => p.map((x) => (x._id === updated._id ? updated : x)));
  };

  const onDelete = async (post) => {
    if (!isCurrentUser) return;
    try {
      await api.delete(`/posts/${post._id}`);
      setPosts((p) => p.filter((x) => x._id !== post._id));
      // Refresh posts to update pagination
      loadPosts(currentPage);
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      loadPosts(newPage);
    }
  };

  const onSaveProfile = async (e) => {
    e.preventDefault();
    if (!isCurrentUser) return;
    
    try {
      const { data: updatedUser } = await api.patch(`/users/${currentUser._id}`, {
        bio: form.bio,
        profilePic: form.profilePic || '',
        username: form.username,
        email: form.email
      });
      
      setUser(updatedUser);
      setProfileUser(updatedUser);
      setEditing(false);
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err?.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 flex justify-center">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center text-slate-300">
        User not found
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="card p-8 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
        <div className="flex items-start gap-6 text-slate-200">
          <div className="flex-shrink-0">
            {profileUser.profilePic ? (
              <img 
                src={profileUser.profilePic} 
                alt="avatar" 
                className="h-24 w-24 rounded-full object-cover border-2 border-white/10" 
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center text-white/80 text-3xl">
                {profileUser.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white truncate">
                {profileUser.username}
              </h1>
              {isCurrentUser && (
                <button 
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                >
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              )}
            </div>
            
            <div className="mt-2 text-slate-300">{profileUser.email}</div>
            
            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="font-semibold">{profileUser.posts?.length || 0}</span> posts
              </div>
              <div>
                <span className="font-semibold">{profileUser.followers?.length || 0}</span> followers
              </div>
              <div>
                <span className="font-semibold">{profileUser.following?.length || 0}</span> following
              </div>
            </div>
            
            {profileUser.bio && (
              <div className="mt-3 text-slate-200 whitespace-pre-line">
                {profileUser.bio}
              </div>
            )}
          </div>
        </div>

        {editing && isCurrentUser && (
          <form onSubmit={onSaveProfile} className="mt-6 grid gap-4 animate-fade-in">
            <div className="grid gap-1">
              <label className="text-sm font-medium text-slate-300">Username</label>
              <input
                type="text"
                className="input"
                value={form.username}
                onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            
            <div className="grid gap-1">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            
            <div className="grid gap-1">
              <label className="text-sm font-medium text-slate-300">Bio</label>
              <textarea
                className="input min-h-24"
                value={form.bio}
                onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                maxLength="200"
                rows="3"
              />
              <div className="text-xs text-slate-400 text-right">
                {form.bio.length}/200
              </div>
            </div>
            
            <div className="grid gap-1">
              <label className="text-sm font-medium text-slate-300">
                Profile Picture URL
              </label>
              <input
                type="url"
                className="input"
                value={form.profilePic}
                onChange={(e) => setForm(f => ({ ...f, profilePic: e.target.value }))}
                placeholder="https://example.com/photo.jpg"
              />
              {form.profilePic && (
                <div className="mt-2">
                  <div className="text-xs text-slate-400 mb-1">Preview:</div>
                  <img 
                    src={form.profilePic} 
                    alt="Profile preview" 
                    className="h-20 w-20 rounded-full object-cover border border-white/10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm rounded-md bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Posts</h3>
        
        {loadingPosts ? (
          <div className="flex justify-center py-8">
            <div className="animate-pulse">Loading posts...</div>
          </div>
        ) : error ? (
          <div className="text-rose-300 p-4 bg-rose-500/10 rounded-md">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No posts to show.
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onUpdated={onUpdated}
                  onDelete={isCurrentUser ? onDelete : undefined}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 rounded-md bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
