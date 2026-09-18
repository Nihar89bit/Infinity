import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Plus, Edit3, Trash2, Calendar, Sparkles, X } from 'lucide-react';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { CONFIG } from '../config';

export const OurStoryPage = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [stageType, setStageType] = useState('custom');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/story', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStages(data);
      }
    } catch (err) {
      console.error('Failed to fetch story:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (stage = null) => {
    if (stage) {
      setEditingStage(stage);
      setTitle(stage.title);
      setSubtitle(stage.subtitle || '');
      setContent(stage.content);
      setStageType(stage.stage_type);
      setEventDate(stage.event_date ? stage.event_date.split('T')[0] : '');
    } else {
      setEditingStage(null);
      setTitle('');
      setSubtitle('');
      setContent('');
      setStageType('custom');
      setEventDate(new Date().toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setToast({ message: 'Please enter title and content ❤️', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        title,
        subtitle,
        content,
        stage_type: stageType,
        event_date: eventDate
      };

      let res;
      if (editingStage) {
        res = await fetch(`/api/story/${editingStage.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/story', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setToast({ message: editingStage ? 'Story updated! ❤️' : 'New chapter added! 💌', type: 'success' });
        setIsModalOpen(false);
        fetchStory();
      }
    } catch (err) {
      setToast({ message: 'Error saving story chapter', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/story/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: 'Chapter deleted', type: 'success' });
        setDeletingId(null);
        fetchStory();
      }
    } catch (err) {
      setToast({ message: 'Failed to delete chapter', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-white/80 shadow-romantic">
        <div>
          <h2 className="text-2xl font-serif font-bold text-burgundy-700 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-500" />
            <span>Our Story 💌</span>
          </h2>
          <p className="text-xs text-rose-700 mt-1">
            The narrative of how two lives intertwined into one beautiful journey.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-burgundy-600 text-white font-medium text-sm shadow-md hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Story Chapter</span>
        </button>
      </div>

      {/* Story Narrative Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-rose-100/60 animate-pulse" />
          ))}
        </div>
      ) : stages.length === 0 ? (
        <div className="glass-card p-10 rounded-3xl text-center max-w-md mx-auto space-y-3">
          <Heart className="w-8 h-8 text-rose-400 mx-auto fill-rose-200" />
          <p className="text-xs text-rose-700 italic font-serif">
            "{CONFIG.EMPTY_STATES.OUR_STORY}"
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {stages.map((stage, idx) => (
            <div
              key={stage.id}
              className="glass-card p-6 md:p-8 rounded-3xl border border-white/90 shadow-romantic hover:shadow-romantic-lg transition-all relative overflow-hidden group"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-pink-500 to-burgundy-600" />

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 font-serif font-bold text-xs flex items-center justify-center border border-rose-200">
                      {idx + 1}
                    </span>
                    <h3 className="font-serif font-bold text-xl md:text-2xl text-burgundy-700">
                      {stage.title}
                    </h3>
                  </div>

                  {stage.subtitle && (
                    <p className="text-xs font-semibold text-rose-500 italic">
                      "{stage.subtitle}"
                    </p>
                  )}

                  <p className="text-sm text-rose-900 leading-relaxed pt-2 font-sans">
                    {stage.content}
                  </p>

                  {stage.event_date && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(stage.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  )}

                </div>

                {/* Edit / Delete Buttons */}
                <div className="flex items-center gap-2 self-end md:self-start opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(stage)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-100 transition-colors"
                    title="Edit Stage"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(stage.id)}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                    title="Delete Stage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Story Chapter"
        message="Are you sure you want to delete this story entry? ❤️"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-lg w-full border border-rose-200 shadow-romantic-lg relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-rose-400 hover:text-burgundy-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-burgundy-700 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-rose-500" />
              <span>{editingStage ? 'Edit Story Chapter' : 'Add Story Chapter ❤️'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Title (e.g. "How It Started 💕")
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. First Conversation 💬"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. That conversation I will never forget."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Story Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="4"
                  placeholder="Write the full memory story here..."
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
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-900"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-burgundy-600 text-white text-xs font-semibold shadow-md"
                >
                  Save Chapter
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OurStoryPage;
