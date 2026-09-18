import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Trash2, 
  Edit3, 
  Calendar, 
  Search, 
  Filter, 
  Heart, 
  Plus, 
  X,
  Eye
} from 'lucide-react';
import { Lightbox } from '../components/Lightbox';
import { ConfirmModal } from '../components/ConfirmModal';
import { Toast } from '../components/Toast';
import { CONFIG } from '../config';

export const MemoriesPage = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Edit / Delete state
  const [editingMemory, setEditingMemory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Toast alert
  const [toast, setToast] = useState({ message: '', type: 'success' });

  useEffect(() => {
    fetchMemories();
  }, [sortOrder, search]);

  const fetchMemories = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        sort: sortOrder,
        search: search
      });

      const res = await fetch(`/api/memories?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setToast({ message: 'Only JPG, JPEG, PNG, and WEBP images allowed!', type: 'error' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'Photo must be under 10MB', type: 'error' });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setToast({ message: 'Please choose a photo to upload ❤️', type: 'error' });
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('title', title || 'Our Memory ❤️');
      formData.append('caption', caption || '');
      formData.append('memory_date', memoryDate);

      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setToast({ message: 'Memory uploaded to gallery! 📸', type: 'success' });
        setIsUploadOpen(false);
        resetForm();
        fetchMemories();
      } else {
        setToast({ message: data.error || 'Upload failed', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Server error uploading memory', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setTitle('');
    setCaption('');
    setMemoryDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/memories/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setToast({ message: 'Memory removed from gallery ❤️', type: 'success' });
        setDeletingId(null);
        fetchMemories();
      }
    } catch (err) {
      setToast({ message: 'Failed to delete memory', type: 'error' });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMemory) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/memories/${editingMemory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editingMemory.title,
          caption: editingMemory.caption,
          memory_date: editingMemory.memory_date
        })
      });

      if (res.ok) {
        setToast({ message: 'Memory details updated! ❤️', type: 'success' });
        setEditingMemory(null);
        fetchMemories();
      }
    } catch (err) {
      setToast({ message: 'Failed to update memory', type: 'error' });
    }
  };

  const token = localStorage.getItem('token');

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-white/80 shadow-romantic">
        <div>
          <h2 className="text-2xl font-serif font-bold text-burgundy-700 flex items-center gap-2">
            <Camera className="w-6 h-6 text-rose-500" />
            <span>Our Memories 📸</span>
          </h2>
          <p className="text-xs text-rose-700 mt-1">
            Private photo scrapbook stored securely for the two of us.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-burgundy-600 text-white font-medium text-sm shadow-md hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Search & Sort Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/80 border border-rose-200 text-rose-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-rose-500" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="py-2 px-3 rounded-2xl bg-white/80 border border-rose-200 text-rose-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-rose-100/60 animate-pulse" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 rounded-3xl text-center border border-rose-200 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-500">
            <Heart className="w-8 h-8 fill-rose-300 text-rose-500 animate-bounce" />
          </div>
          <h3 className="text-lg font-serif font-bold text-burgundy-700">
            No memories uploaded yet
          </h3>
          <p className="text-xs text-rose-700 leading-relaxed italic">
            "{CONFIG.EMPTY_STATES.MEMORIES}"
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-semibold shadow-md hover:bg-rose-700 transition-colors"
          >
            Upload Our First Photo ❤️
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {memories.map((mem, idx) => (
            <div
              key={mem.id}
              className="glass-card rounded-3xl overflow-hidden border border-white/80 shadow-romantic hover:shadow-romantic-lg transition-all group relative flex flex-col"
            >
              {/* Photo Area */}
              <div 
                onClick={() => setLightboxIndex(idx)}
                className="relative h-60 overflow-hidden cursor-pointer bg-rose-950/10"
              >
                <img
                  src={`/api/media/${mem.image_filename}?token=${token}`}
                  alt={mem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Hover overlay with eye icon */}
                <div className="absolute inset-0 bg-burgundy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-md">
                    <Eye className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Memory Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-serif font-bold text-base text-burgundy-700 truncate">
                      {mem.title || 'Our Memory'}
                    </h3>
                    {mem.memory_date && (
                      <span className="text-[10px] font-semibold text-rose-500 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {new Date(mem.memory_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  {mem.caption && (
                    <p className="text-xs text-rose-800/80 line-clamp-2 italic">
                      "{mem.caption}"
                    </p>
                  )}
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-rose-100/60">
                  <button
                    onClick={() => setEditingMemory(mem)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-burgundy-700 hover:bg-rose-100 transition-colors"
                    title="Edit Caption"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(mem.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Viewer Modal */}
      <Lightbox
        memories={memories}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex(prev => (prev > 0 ? prev - 1 : memories.length - 1))}
        onNext={() => setLightboxIndex(prev => (prev < memories.length - 1 ? prev + 1 : 0))}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Memory"
        message="Are you sure you want to delete this memory from our gallery? ❤️"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Upload Memory Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-lg w-full border border-rose-200 shadow-romantic-lg relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => { setIsUploadOpen(false); resetForm(); }}
              className="absolute top-4 right-4 text-rose-400 hover:text-burgundy-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-burgundy-700 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-500" />
              <span>Add A New Memory ❤️</span>
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer relative ${
                  dragActive
                    ? 'border-rose-500 bg-rose-100/50'
                    : previewUrl
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-rose-200 hover:border-rose-400 bg-white/50'
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                {previewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-md"
                    />
                    <p className="text-xs text-rose-600 font-medium">Click or drag another image to change</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-10 h-10 text-rose-400 mx-auto" />
                    <p className="text-sm font-semibold text-burgundy-700">
                      Drag & Drop your photo here
                    </p>
                    <p className="text-xs text-rose-500">
                      Supports JPG, PNG, WEBP (Max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Memory Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Our First Picture ❤️"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Caption / Notes
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows="3"
                  placeholder="That random day that became a beautiful memory..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Memory Date
                </label>
                <input
                  type="date"
                  value={memoryDate}
                  onChange={(e) => setMemoryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-900"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsUploadOpen(false); resetForm(); }}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-burgundy-600 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Save to Scrapbook</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit Memory Modal */}
      {editingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card p-6 rounded-3xl max-w-md w-full border border-rose-200 shadow-romantic-lg relative">
            <button
              onClick={() => setEditingMemory(null)}
              className="absolute top-4 right-4 text-rose-400 hover:text-burgundy-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-burgundy-700 mb-4">
              Edit Memory Details
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingMemory.title}
                  onChange={(e) => setEditingMemory({ ...editingMemory, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Caption
                </label>
                <textarea
                  value={editingMemory.caption}
                  onChange={(e) => setEditingMemory({ ...editingMemory, caption: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editingMemory.memory_date ? editingMemory.memory_date.split('T')[0] : ''}
                  onChange={(e) => setEditingMemory({ ...editingMemory, memory_date: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMemory(null)}
                  className="flex-1 py-2 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemoriesPage;
