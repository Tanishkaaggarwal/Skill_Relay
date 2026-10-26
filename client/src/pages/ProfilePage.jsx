import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TransactionHistoryTable } from '../components/ledger/TransactionHistoryTable';
import { RatingStars } from '../components/common/RatingStars';
import { CreditBadge } from '../components/common/CreditBadge';
import { Modal } from '../components/common/Modal';
import {
  User,
  Coins,
  Trophy,
  Star,
  CheckCircle2,
  Edit3,
  BookOpen,
  MapPin,
  Sparkles,
  Layers,
  Calendar,
} from 'lucide-react';
import api from '../api/client';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    campus: user?.campus || '',
    major: user?.major || '',
    bio: user?.bio || '',
    skillsOffered: user?.skillsOffered?.join(', ') || '',
    skillsWanted: user?.skillsWanted?.join(', ') || '',
  });

  const fetchData = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const [txRes, statsRes, reviewsRes] = await Promise.all([
        api.get('/transactions/my-history'),
        api.get('/transactions/stats'),
        api.get(`/reviews/user/${user._id}`),
      ]);

      if (txRes.data.success) setTransactions(txRes.data.transactions);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (reviewsRes.data.success) setReviews(reviewsRes.data.reviews);
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (user) {
      setEditForm({
        name: user.name || '',
        campus: user.campus || '',
        major: user.major || '',
        bio: user.bio || '',
        skillsOffered: user.skillsOffered?.join(', ') || '',
        skillsWanted: user.skillsWanted?.join(', ') || '',
      });
    }
  }, [user?._id]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', {
        ...editForm,
        skillsOffered: editForm.skillsOffered.split(',').map((s) => s.trim()).filter(Boolean),
        skillsWanted: editForm.skillsWanted.split(',').map((s) => s.trim()).filter(Boolean),
      });

      if (res.data.success) {
        setIsEditModalOpen(false);
        refreshUser();
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || 'User'
                )}&background=4f46e5&color=fff`
              }
              alt={user?.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-indigo-100 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Campus Member
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{user?.email}</p>
              <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  {user?.major || 'General Studies'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user?.campus || 'Main Campus'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Bio */}
        {user?.bio && (
          <p className="mt-5 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
            "{user.bio}"
          </p>
        )}

        {/* Skills Grid */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Skills I Can Offer (Giver)</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {user?.skillsOffered?.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Skills I Want to Learn (Attainer)</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {user?.skillsWanted?.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-xl"
                >
                  🔍 {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Credit & Analytics Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-tr from-amber-500/10 to-amber-500/5 border border-amber-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase">Available Balance</span>
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-950 mt-2">
            🪙 {user?.creditBalance ?? 0}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">Ready to spend on requests</p>
        </div>

        <div className="bg-gradient-to-tr from-emerald-500/10 to-emerald-500/5 border border-emerald-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase">Total Earned</span>
            <Trophy className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-950 mt-2">
            +{user?.totalCreditsEarned ?? 0}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">From helping fellow students</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Sessions Done</span>
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {user?.sessionsCompleted ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Mutual completed sessions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Peer Rating</span>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2 flex items-center gap-2">
            {user?.avgRating?.toFixed(1) ?? '5.0'}
            <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Based on {user?.reviewCount ?? 0} peer review{user?.reviewCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <TransactionHistoryTable transactions={transactions} />

      {/* Peer Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-bold text-slate-800 text-base">Reviews Received from Peers</h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{reviews.length} reviews</span>
        </div>

        {reviews.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No reviews received yet. Complete sessions to build your campus rating!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        rev.reviewer?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          rev.reviewer?.name || 'R'
                        )}&background=6366f1&color=fff`
                      }
                      alt={rev.reviewer?.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{rev.reviewer?.name}</h5>
                      <p className="text-[10px] text-slate-400">{rev.reviewer?.major}</p>
                    </div>
                  </div>
                  <RatingStars rating={rev.rating} size="sm" />
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-700 italic">"{rev.comment}"</p>
                )}
                <div className="text-[10px] text-slate-400 text-right">
                  {new Date(rev.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Major
              </label>
              <input
                type="text"
                value={editForm.major}
                onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus Location
              </label>
              <input
                type="text"
                value={editForm.campus}
                onChange={(e) => setEditForm({ ...editForm, campus: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skills You Can Offer (comma-separated)
            </label>
            <input
              type="text"
              value={editForm.skillsOffered}
              onChange={(e) => setEditForm({ ...editForm, skillsOffered: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skills You Want to Learn (comma-separated)
            </label>
            <input
              type="text"
              value={editForm.skillsWanted}
              onChange={(e) => setEditForm({ ...editForm, skillsWanted: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Bio
            </label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
