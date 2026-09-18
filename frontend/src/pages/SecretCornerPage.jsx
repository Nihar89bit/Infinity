import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, Plus, Trash2, Edit3, Sparkles, CheckSquare, Calendar, ShieldCheck, X } from 'lucide-react';
import { PinModal } from '../components/PinModal';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { CONFIG } from '../config';

export const SecretCornerPage = () => {
  const [unlockedPin, setUnlockedPin] = useState(sessionStorage.getItem('secret_pin') || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('bucket_list');
  const [targetDate, setTargetDate] = useState('');

  const categories = [
    { id: 'All', label: 'All Secrets' },
    { id: 'bucket_list', label: 'Bucket List 📝' },
    { id: 'future_plan', label: 'Future Plans ✈️' },
    { id: 'secret_note', label: 'Secret Notes 🔐' },
    { id: 'private_message', label: 'Private Messages 💌' },
  ];

  useEffect(() => {
    if (unlockedPin) {
      fetchSecrets(unlockedPin);
    }
  }, [unlockedPin, activeCategory]);

  const fetchSecrets = async (pinCode) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const param = activeCategory !== 'All' ? `?category=${activeCategory}` : '';
      const res = await fetch(`/api/secret${param}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Secret-PIN': pinCode
        }
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        // Token or PIN expired
        sessionStorage.removeItem('secret_pin');
        setUnlockedPin('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (validPin) => {
    setUnlockedPin(validPin);
    sessionStorage.setItem('secret_pin', validPin);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setTitle(item.title);
      setContent(item.content);
      setCategory(item.category || 'bucket_list');
      setTargetDate(item.target_date ? item.target_date.split('T')[0] : '');
    } else {
      setEditingItem(null);
      setTitle('');
      setContent('');
      setCategory('bucket_list');
      setTargetDate('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      const token = localStorage.getItem('token');
      const payload = { title, content, category, target_date: targetDate || null };

      let res;
      if (editingItem) {
        res = await fetch(`/api/secret/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Secret-PIN': unlockedPin
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/secret', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Secret-PIN': unlockedPin
          },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setToast({ message: editingItem ? 'Secret updated!' : 'Entry locked into vault 🔐', type: 'success' });
        setIsModalOpen(false);
        fetchSecrets(unlockedPin);
      }
    } catch (err) {
      setToast({ message: 'Error saving secret item', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/secret/${deletingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Secret-PIN': unlockedPin
        }
      });
      if (res.ok) {
        setToast({ message: 'Secret entry deleted', type: 'success' });
        setDeletingId(null);
        fetchSecrets(unlockedPin);
      }
    } catch (err) {
      setToast({ message: 'Failed to delete secret', type: 'error' });
    }
  };

  if (!unlockedPin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <PinModal isOpen={true} onUnlock={handleUnlock} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

      {/* Mysterious Dark Header */}
      <div className="glass-card-dark p-6 md:p-8 rounded-3xl border border-rose-500/30 text-rose-100 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/80 text-rose-400 text-xs font-semibold border border-rose-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vault Unlocked 🔐</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white flex items-center gap-2">
            <span>Secret Corner 🔐</span>
          </h2>
          <p className="text-xs text-rose-300/80 mt-1">
            Our confidential future travel plans, couple bucket list, and private messages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-burgundy-700 text-white font-medium text-xs shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Secret</span>
          </button>
          
          <button
            onClick={() => { sessionStorage.removeItem('secret_pin'); setUnlockedPin(''); }}
            className="px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-rose-200 text-xs font-medium border border-white/10"
            title="Lock Vault"
          >
            Lock 🔒
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-rose-950/40 text-rose-200 border border-rose-800/40 hover:bg-rose-900/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Secrets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-rose-950/40 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card-dark p-10 rounded-3xl text-center max-w-md mx-auto space-y-3 border border-rose-500/20">
          <Lock className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs text-rose-300 italic font-serif">
            "{CONFIG.EMPTY_STATES.SECRET_CORNER}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card-dark p-6 rounded-3xl border border-rose-500/20 shadow-2xl relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/80 border border-rose-800 px-3 py-0.5 rounded-full uppercase tracking-wider">
                    {item.category.replace('_', ' ')}
                  </span>

                  {item.target_date && (
                    <span className="text-[10px] text-rose-300 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-rose-400" />
                      {new Date(item.target_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-xl text-white mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-rose-200/90 leading-relaxed whitespace-pre-wrap font-sans">
                  {item.content}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-rose-500/10">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-white/10"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(item.id)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-white/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Secret Entry"
        message="Are you sure you want to delete this secret entry from our vault? 🔐"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      {/* Add / Edit Secret Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-card-dark p-6 md:p-8 rounded-3xl max-w-lg w-full border border-rose-500/30 text-rose-100 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-rose-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              <span>{editingItem ? 'Edit Secret Entry' : 'New Secret Vault Entry 🔐'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="bucket_list">Couple Bucket List 📝</option>
                  <option value="future_plan">Future Travel Plan ✈️</option>
                  <option value="secret_note">Confidential Secret Note 🔐</option>
                  <option value="private_message">Private Message 💌</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Overwater Bungalow in Maldives 🏝️"
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-rose-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-300 mb-1">
                  Details / Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="4"
                  placeholder="Write the secret details or list items..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-rose-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-300 mb-1">
                  Target / Future Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-100 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-rose-800 text-rose-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-burgundy-700 text-white text-xs font-semibold shadow-md"
                >
                  Lock into Vault
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SecretCornerPage;
