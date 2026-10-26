import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditBadge } from '../components/common/CreditBadge';
import { RatingStars } from '../components/common/RatingStars';
import {
  Clock,
  User,
  Star,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Send,
  Trash2,
} from 'lucide-react';
import api from '../api/client';

export const PostDetailPage = () => {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchPost = async () => {
    try {
      const res = await api.get(`/posts/${id}`);
      if (res.data.success) {
        setPost(res.data.post);
      }
    } catch (err) {
      console.error('Failed to load post:', err);
      setError('Post could not be found or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-400">
        Loading post details...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Post Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This post may have been removed.'}</p>
        <Link
          to="/feed"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Feed
        </Link>
      </div>
    );
  }

  const isAuthor = user?._id === post.author?._id;
  const isRequest = post.type === 'request';
  const hasApplied = post.applicants?.some((app) => (app.user?._id || app.user) === user?._id);

  // Handle applying to a post (Offering help or booking skill)
  const handleApply = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      const res = await api.post(`/posts/${id}/apply`, {
        message: applyMessage.trim(),
      });

      if (res.data.success) {
        setSuccessMsg(
          isRequest
            ? '🎉 Your offer to help has been sent to the student!'
            : '🎉 Your skill booking request has been sent to the mentor!'
        );
        setIsApplying(false);
        setPost(res.data.post);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit response.');
    } finally {
      setActionLoading(false);
    }
  };

  // Author accepts an applicant and starts session
  const handleAcceptApplicant = async (applicantId) => {
    setError('');
    setActionLoading(true);

    try {
      const res = await api.post('/sessions/accept', {
        postId: post._id,
        applicantId,
      });

      if (res.data.success) {
        refreshUser();
        // Redirect to newly created session workspace
        navigate(`/sessions/${res.data.session._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate session.');
      setActionLoading(false);
    }
  };

  // Author deletes post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <Link
        to="/feed"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Exchange Board</span>
      </Link>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Post Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header Badges */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${
                isRequest
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isRequest ? '🆘 Help Request' : '✨ Skill Offer'}
            </span>

            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {post.urgency === 'quick_ask'
                ? '⚡ Quick Ask (15–30m)'
                : post.urgency === 'full_session'
                ? '⏳ Full Session (~1h)'
                : '🔄 Flexible Time'}
            </span>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                post.status === 'open'
                  ? 'bg-emerald-100 text-emerald-800'
                  : post.status === 'matched'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              Status: {post.status.toUpperCase()}
            </span>
          </div>

          <CreditBadge amount={post.creditAmount} size="lg" variant="amber" />
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {post.title}
          </h1>
          <p className="text-slate-700 text-sm leading-relaxed mt-4 whitespace-pre-line">
            {post.description}
          </p>
        </div>

        {/* Skill Tags */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Relevant Skill Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {post.skillTags?.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-xl"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Details Box */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={
                post.author?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  post.author?.name || 'User'
                )}&background=6366f1&color=fff`
              }
              alt={post.author?.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{post.author?.name}</span>
                {isAuthor && (
                  <span className="text-[11px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{post.author?.major || 'Campus Student'}</p>
              <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                <RatingStars rating={post.author?.avgRating || 5} size="sm" />
                <span className="font-bold">{post.author?.avgRating?.toFixed(1) || '5.0'}</span>
                <span className="text-slate-400">({post.author?.reviewCount || 0} reviews)</span>
              </div>
            </div>
          </div>

          {isAuthor && post.status === 'open' && (
            <button
              onClick={handleDeletePost}
              className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Post</span>
            </button>
          )}
        </div>
      </div>

      {/* Action / Applicant Area */}
      {post.status === 'matched' && post.matchedSession && (
        <div className="bg-indigo-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Live Session Active
            </span>
            <h3 className="text-lg font-bold">This post has an active workspace!</h3>
            <p className="text-xs text-indigo-200">
              Join the real-time chat, collaborate with your partner, and confirm completion.
            </p>
          </div>
          <Link
            to={`/sessions/${post.matchedSession}`}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-md transition text-sm flex items-center gap-2 whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Session Workspace</span>
          </Link>
        </div>
      )}

      {/* If Author: View Applicants and Accept */}
      {isAuthor && post.status === 'open' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Peer Connections & Applications ({post.applicants?.length || 0})
            </h3>
            <span className="text-xs text-slate-500">
              Select a peer to initiate the session workspace
            </span>
          </div>

          {post.applicants?.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No students have responded to this post yet. You will get a notification when someone applies!
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-slate-100">
              {post.applicants?.map((app) => (
                <div
                  key={app._id}
                  className="pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        app.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          app.user?.name || 'Applicant'
                        )}&background=6366f1&color=fff`
                      }
                      alt={app.user?.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 mt-1"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{app.user?.name}</h4>
                      <p className="text-xs text-slate-500">{app.user?.major}</p>
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="font-bold">{app.user?.avgRating?.toFixed(1) || '5.0'}</span>
                        <span className="text-slate-400">({app.user?.reviewCount || 0} reviews)</span>
                      </div>
                      {app.message && (
                        <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-xl mt-2 border border-slate-200/80">
                          "{app.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptApplicant(app.user?._id)}
                    disabled={actionLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept & Start Session</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* If NOT Author: Apply / Connect Form */}
      {!isAuthor && post.status === 'open' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {isRequest ? 'Offer Your Help to This Student' : 'Request This Mentor’s Skill'}
            </h3>
          </div>

          {hasApplied ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">
                  You have already responded to this post!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  The post author will receive a notification and can accept your connection to open the session workspace.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Intro Note / Proposed Time (Optional)
                </label>
                <textarea
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  rows={2}
                  placeholder={
                    isRequest
                      ? 'e.g. Hey! I have built several full-stack React projects and can help you debug this right now.'
                      : 'e.g. Hi! I need advice on polishing my resume before Thursday.'
                  }
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Credits move only when both sides confirm completion.</span>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition disabled:opacity-50 flex items-center gap-2 ${
                    isRequest
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {actionLoading
                      ? 'Sending...'
                      : isRequest
                      ? 'Send Help Offer'
                      : 'Send Skill Request'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
