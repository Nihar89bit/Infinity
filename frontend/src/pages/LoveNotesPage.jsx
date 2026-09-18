import React, { useState, useEffect } from 'react';
import { Mail, Heart, Plus, Bookmark, Trash2, Edit3, Calendar, Sparkles, X } from 'lucide-react';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { CONFIG } from '../config';

export const LoveNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Modals & Active state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Why I Love You');
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = ['All', 'Why I Love You', 'Open When...', 'Future', 'Random Thought'];

  useEffect(() => {
    fetchNotes();
  }, [activeCategory]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const param = activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : '';
      const res = await fetch(`/api/notes${param}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to fetch love notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWriteModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category || 'Why I Love You');
      setNoteDate(note.note_date ? note.note_date.split('T')[0] : new Date().toISOString().split('T')[0]);
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setCategory('Why I Love You');
      setNoteDate(new Date().toISOString().split('T')[0]);
    }
    setIsWriteModalOpen(true);
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setToast({ message: 'Title and note message are required ❤️', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = { title, content, category, note_date: noteDate };

      let res;
      if (editingNote) {
        res = await fetch(`/api/notes/${editingNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setToast({ message: editingNote ? 'Love note updated! ❤️' : 'Love letter sealed with a kiss! 💌', type: 'success' });
        setIsWriteModalOpen(false);
        fetchNotes();
      }
    } catch (err) {
      setToast({ message: 'Error saving love note', type: 'error' });
    }
  };

  const toggleBookmark = async (note) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_bookmarked: note.is_bookmarked ? 0 : 1 })
      });
      if (res.ok) {
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/notes/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: 'Note deleted', type: 'success' });
        setDeletingId(null);
        if (viewingNote && viewingNote.id === deletingId) setViewingNote(null);
        fetchNotes();
      }
    } catch (err) {
      setToast({ message: 'Failed to delete note', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-white/80 shadow-romantic">
        <div>
          <h2 className="text-2xl font-serif font-bold text-burgundy-700 flex items-center gap-2">
            <Mail className="w-6 h-6 text-rose-500" />
            <span>Love Notes 💕</span>
          </h2>
          <p className="text-xs text-rose-700 mt-1">
            Private handwritten love letters created exclusively for you.
          </p>
        </div>

        <button
          onClick={() => handleOpenWriteModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-burgundy-600 text-white font-medium text-sm shadow-md hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Write a Note</span>
        </button>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white/80 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-rose-100/60 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="glass-card p-10 rounded-3xl text-center max-w-md mx-auto space-y-3">
          <Mail className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs text-rose-700 italic font-serif">
            "{CONFIG.EMPTY_STATES.LOVE_NOTES}"
          </p>
          <button
            onClick={() => handleOpenWriteModal()}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-2xl"
          >
            Write Our First Love Letter 💌
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setViewingNote(note)}
              className="love-letter p-6 rounded-3xl border border-rose-200 shadow-romantic hover:shadow-romantic-lg transition-all cursor-pointer group flex flex-col justify-between h-56 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-rose-600 bg-rose-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {note.category || 'Love Letter'}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBookmark(note); }}
                    className="text-rose-400 hover:text-rose-600"
                  >
                    <Bookmark className={`w-4 h-4 ${note.is_bookmarked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                <h3 className="font-handwriting text-2xl font-bold text-burgundy-700 mb-2 truncate">
                  {note.title}
                </h3>

                <p className="text-xs text-rose-900/90 font-serif leading-relaxed line-clamp-3 italic">
                  "{note.content}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-rose-200/50 text-[10px] text-rose-500">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  {new Date(note.note_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-rose-400 group-hover:text-rose-600 font-medium">Read Letter 💌</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Love Note"
        message="Are you sure you want to delete this love note? ❤️"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* View Letter Modal */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="love-letter p-8 rounded-3xl max-w-lg w-full border border-rose-300 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            
            <button
              onClick={() => setViewingNote(null)}
              className="absolute top-4 right-4 text-rose-500 hover:text-burgundy-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-rose-600 bg-rose-100 px-3 py-1 rounded-full uppercase tracking-wider">
              {viewingNote.category}
            </span>

            <h3 className="font-handwriting text-3xl font-bold text-burgundy-700">
              {viewingNote.title}
            </h3>

            <p className="text-sm text-rose-900 leading-relaxed font-serif whitespace-pre-wrap pt-2 border-t border-rose-200">
              {viewingNote.content}
            </p>

            <div className="pt-4 flex items-center justify-between border-t border-rose-200 text-xs text-rose-600 font-medium">
              <span>{new Date(viewingNote.note_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>

              <div className="flex gap-2">
                <button
                  onClick={() => { setViewingNote(null); handleOpenWriteModal(viewingNote); }}
                  className="p-1.5 rounded-lg bg-rose-100 text-burgundy-700 hover:bg-rose-200"
                  title="Edit Note"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(viewingNote.id)}
                  className="p-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Write / Edit Note Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-lg w-full border border-rose-200 shadow-romantic-lg relative">
            
            <button
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute top-4 right-4 text-rose-400 hover:text-burgundy-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-burgundy-700 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-rose-500" />
              <span>{editingNote ? 'Edit Love Note' : 'Write A Love Note 💌'}</span>
            </h3>

            <form onSubmit={handleSubmitNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="Why I Love You">Why I Love You ❤️</option>
                  <option value="Open When...">Open When... 💌</option>
                  <option value="Future">Things I Want To Do With You 🌎</option>
                  <option value="Random Thought">Random Thought About You 🥰</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Why I Love You ❤️"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Message Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="5"
                  placeholder="Write your heartfelt letter here..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-burgundy-600 text-white text-xs font-semibold shadow-md"
                >
                  Seal & Save Note
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoveNotesPage;
