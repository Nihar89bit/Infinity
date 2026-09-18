import React, { useState, useEffect } from 'react';
import { Calendar, Heart, Plus, Cake, Sparkles, Gift, Trash2, Edit3, X } from 'lucide-react';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { CONFIG } from '../config';

export const CountdownsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventType, setEventType] = useState('anniversary');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events', {
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

  const calculateDays = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today is the day! 🎉', type: 'today' };
    if (diffDays > 0) return { text: `${diffDays} days to go`, type: 'upcoming', days: diffDays };
    return { text: `${Math.abs(diffDays)} days ago`, type: 'past', days: Math.abs(diffDays) };
  };

  const handleOpenModal = (evt = null) => {
    if (evt) {
      setEditingEvent(evt);
      setTitle(evt.title);
      setEventDate(evt.event_date ? evt.event_date.split('T')[0] : '');
      setEventType(evt.event_type || 'anniversary');
      setNotes(evt.notes || '');
    } else {
      setEditingEvent(null);
      setTitle('');
      setEventDate(new Date().toISOString().split('T')[0]);
      setEventType('anniversary');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !eventDate) return;

    try {
      const token = localStorage.getItem('token');
      const payload = { title, event_date: eventDate, event_type: eventType, notes };

      let res;
      if (editingEvent) {
        res = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setToast({ message: editingEvent ? 'Special date updated!' : 'Special date added to countdown! 🗓️', type: 'success' });
        setIsModalOpen(false);
        fetchEvents();
      }
    } catch (err) {
      setToast({ message: 'Error saving event', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${deletingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setToast({ message: 'Special date removed', type: 'success' });
        setDeletingId(null);
        fetchEvents();
      }
    } catch (err) {
      setToast({ message: 'Failed to delete event', type: 'error' });
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'anniversary': return Heart;
      case 'birthday': return Cake;
      case 'first_meeting': return Sparkles;
      case 'trip': return Gift;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-white/80 shadow-romantic">
        <div>
          <h2 className="text-2xl font-serif font-bold text-burgundy-700 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-rose-500" />
            <span>Special Days & Countdowns 🗓️</span>
          </h2>
          <p className="text-xs text-rose-700 mt-1">
            Countdowns to our anniversaries, birthdays, and unforgettable dates.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-burgundy-600 text-white font-medium text-sm shadow-md hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Special Day</span>
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-rose-100/60 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-10 rounded-3xl text-center max-w-md mx-auto space-y-3">
          <Calendar className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs text-rose-700 italic font-serif">
            "{CONFIG.EMPTY_STATES.SPECIAL_DAYS}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const Icon = getEventIcon(evt.event_type);
            const status = calculateDays(evt.event_date);
            return (
              <div
                key={evt.id}
                className="glass-card p-6 rounded-3xl border border-white/80 shadow-romantic hover:shadow-romantic-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5 fill-rose-300" />
                    </div>

                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      status.type === 'today'
                        ? 'bg-amber-400 text-white animate-bounce shadow-md'
                        : status.type === 'upcoming'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-100 text-rose-600'
                    }`}>
                      {status.text}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-xl text-burgundy-700 mb-1">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-rose-600 font-mono mb-2">
                    {new Date(evt.event_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>

                  {evt.notes && (
                    <p className="text-xs text-rose-800/80 italic">
                      "{evt.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-rose-100">
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
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Special Date"
        message="Are you sure you want to remove this date from countdowns? ❤️"
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
              <Calendar className="w-5 h-5 text-rose-500" />
              <span>{editingEvent ? 'Edit Special Day' : 'Add Special Day 🗓️'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Event Category
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  <option value="anniversary">Anniversary ❤️</option>
                  <option value="birthday">Birthday 🎂</option>
                  <option value="first_meeting">First Meeting 🌸</option>
                  <option value="trip">Couple Vacation ✈️</option>
                  <option value="custom">Custom Special Day 🌟</option>
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
                  placeholder="e.g. Next Anniversary ❤️"
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
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Notes / Plans (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Dinner reservations at 7 PM"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
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
                  Save Date
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CountdownsPage;
