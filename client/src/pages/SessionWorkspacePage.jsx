import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MutualConfirmCard } from '../components/sessions/MutualConfirmCard';
import { RatingModal } from '../components/sessions/RatingModal';
import { SessionChat } from '../components/chat/SessionChat';
import { CreditBadge } from '../components/common/CreditBadge';
import {
  ArrowLeft,
  ShieldCheck,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react';
import api from '../api/client';

export const SessionWorkspacePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchSession = async () => {
    try {
      const res = await api.get(`/sessions/${id}`);
      if (res.data.success) {
        setSession(res.data.session);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Could not load session workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading session workspace...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Session Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'You might not be authorized to view this session.'}</p>
        <Link
          to="/my-sessions"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Go to My Sessions
        </Link>
      </div>
    );
  }

  const isRequester = session.requester?._id === user?._id;
  const isCompleted = session.status === 'completed';
  const partnerUser = isRequester ? session.helper : session.requester;
  const partnerRole = isRequester ? 'Helper' : 'Requester';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/my-sessions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Sessions</span>
        </Link>

        <div className="flex items-center gap-2">
          <CreditBadge amount={session.creditAmount} size="sm" variant="amber" />
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}
          >
            ● {session.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main Workspace Layout (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mutual Confirm & Session Info (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Mutual Confirmation Card */}
          <MutualConfirmCard
            session={session}
            onSessionUpdated={(updated) => setSession(updated)}
            onOpenRatingModal={() => setIsRatingModalOpen(true)}
          />

          {/* Post Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Session Objective</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {session.postId?.title || 'Campus Peer Help Session'}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              {session.postId?.description || 'Collaborative peer problem-solving session.'}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {session.postId?.skillTags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Partner Profile Snapshot Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Collaborating Partner
            </h4>

            <div className="flex items-center gap-3">
              <img
                src={
                  partnerUser?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    partnerUser?.name || 'User'
                  )}&background=6366f1&color=fff`
                }
                alt={partnerUser?.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200"
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{partnerUser?.name}</h4>
                <p className="text-xs text-slate-500">
                  {partnerRole} · {partnerUser?.major || 'Campus'}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{partnerUser?.avgRating?.toFixed(1) || '5.0'}</span>
                  <span className="text-slate-400">({partnerUser?.reviewCount || 0} reviews)</span>
                </div>
              </div>
            </div>

            {partnerUser?.bio && (
              <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                "{partnerUser.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Live Real-Time Chat (7 cols) */}
        <div className="lg:col-span-7">
          <SessionChat
            session={session}
            onSessionUpdated={(updated) => setSession(updated)}
          />
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        session={session}
        onReviewSubmitted={() => {
          fetchSession();
        }}
      />
    </div>
  );
};
