import React, { useState, useEffect } from 'react';
import { Clock, Heart, Plus, Calendar, Edit3, Trash2, X } from 'lucide-react';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { CONFIG } from '../config';

export const TimelinePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTimeline();
  }, []);

  const fetchTimeline = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/timeline', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (evt = null) => {
    if (evt) {
      setEditingEvent(evt);
      setTitle(evt.title);
      setDescription(evt.description || '');
      setEventDate(evt.event_date ? evt.event_date.split('T')[0] : '');
    } else {
      setEditingEvent(null);
      setTitle('');
      setDescription('');
      setEventDate(new Date().toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !eventDate) return;

    try {
      const token = localStorage.getItem('token');
      const payload = { title, description, event_date: eventDate };

      let res;
      if (editingEvent) {
        res = await fetch(`/api/timeline/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setToast({ message: editingEvent ? 'Timeline updated!' : 'Event added to timeline! 🌸', type: 'success' });
        setIsModalOpen(false);
        fetchTimeline();
      }
    } catch (err) {
      setToast({ message: 'Error saving timeline event', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/timeline/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: 'Event deleted', type: 'success' });
        setDeletingId(null);
        fetchTimeline();
      }
    } catch (err) {
      setToast({ message: 'Error deleting event', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-white/80 shadow-romantic">
        <div>
          <h2 className="text-2xl font-serif font-bold text-burgundy-700 flex items-center gap-2">
            <Clock className="w-6 h-6 text-rose-500" />
            <span>Our Timeline 🌸</span>
          </h2>
          <p className="text-xs text-rose-700 mt-1">
            Chronological milestones of our journey together across time.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-burgundy-600 text-white font-medium text-sm shadow-md hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Vertical Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-rose-100/60 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-10 rounded-3xl text-center max-w-md mx-auto space-y-3">
          <Clock className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs text-rose-700 italic font-serif">
            "{CONFIG.EMPTY_STATES.TIMELINE}"
          </p>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-10 space-y-8 before:absolute before:left-3 md:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-rose-300 before:via-rose-500 before:to-burgundy-600">
          {events.map((evt) => (
            <div key={evt.id} className="relative group">
              
              {/* Timeline Node Dot */}
              <div className="absolute -left-6 md:-left-10 top-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-125 transition-transform">
                <Heart className="w-3 h-3 fill-white" />
              </div>

              {/* Event Card */}
              <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-romantic hover:shadow-romantic-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-rose-600 bg-rose-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(evt.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>

                  <h3 className="font-serif font-bold text-xl text-burgundy-700 pt-1">
                    {evt.title}
                  </h3>

                  {evt.description && (
                    <p className="text-xs text-rose-800 leading-relaxed font-sans">
                      {evt.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenModal(evt)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(evt.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-100 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Milestone"
        message="Are you sure you want to remove this milestone from our timeline? ❤️"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card p-6 md:p-8 rounded-3xl max-w-lg w-full border border-rose-200 shadow-romantic-lg relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-rose-400 hover:text-burgundy-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-burgundy-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>{editingEvent ? 'Edit Milestone' : 'Add Milestone 🌸'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Moved into our apartment 🏡"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="Describe this milestone moment..."
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
                  required
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
                  Save Milestone
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TimelinePage;
