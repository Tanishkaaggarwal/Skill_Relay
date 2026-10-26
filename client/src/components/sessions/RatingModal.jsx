import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { RatingStars } from '../common/RatingStars';
import { useAuth } from '../../context/AuthContext';
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';

export const RatingModal = ({ isOpen, onClose, session, onReviewSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!session) return null;

  const isRequester = session.requester?._id === user?._id;
  const partnerUser = isRequester ? session.helper : session.requester;
  const partnerRole = isRequester ? 'Helper' : 'Requester';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/reviews', {
        sessionId: session._id,
        rating,
        comment: comment.trim(),
      });

      if (res.data.success) {
        setSubmitted(true);
        if (onReviewSubmitted) onReviewSubmitted(res.data.review);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate & Review Your Partner" maxWidth="max-w-md">
      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Thank you for your feedback!</h4>
          <p className="text-xs text-slate-500">Your review will help strengthen the campus community.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Partner Info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={
                partnerUser?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  partnerUser?.name || 'Partner'
                )}&background=6366f1&color=fff`
              }
              alt={partnerUser?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200"
            />
            <div>
              <p className="font-bold text-slate-800 text-sm">{partnerUser?.name}</p>
              <p className="text-xs text-slate-500">
                {partnerRole} · {partnerUser?.major || 'Student'}
              </p>
            </div>
          </div>

          {/* Star Rating Picker */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              How would you rate this session?
            </label>
            <div className="flex justify-center">
              <RatingStars rating={rating} size="lg" interactive={true} onSelect={setRating} />
            </div>
            <p className="text-xs text-indigo-600 font-semibold mt-1.5">
              {rating === 5 && '⭐️ Outstanding help!'}
              {rating === 4 && '⭐️ Very good session'}
              {rating === 3 && '⭐️ Average session'}
              {rating === 2 && '⭐️ Could be improved'}
              {rating === 1 && '⭐️ Poor experience'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Feedback & Comments (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="e.g. Explained difficult concepts patiently, great communication!"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              maxLength={500}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Skip / Later
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
