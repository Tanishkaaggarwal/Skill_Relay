import React from 'react';
import { Link } from 'react-router-dom';
import { CreditBadge } from '../common/CreditBadge';
import { Clock, Star, ArrowRight, CheckCircle2, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PostCard = ({ post, isRecommended = false }) => {
  const { user } = useAuth();
  const isAuthor = user?._id === post.author?._id;
  const isRequest = post.type === 'request';

  const urgencyLabels = {
    quick_ask: '⚡ Quick Ask (15–30m)',
    full_session: '⏳ Full Session (~1h)',
    flexible: '🔄 Flexible Time',
  };

  return (
    <div
      className={`relative bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between ${
        isRecommended
          ? 'border-indigo-300 ring-2 ring-indigo-500/20 bg-gradient-to-b from-indigo-50/30 to-white'
          : 'border-slate-200/90 shadow-sm'
      }`}
    >
      {/* Top Banner if recommended */}
      {isRecommended && (
        <div className="absolute -top-2.5 right-5 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
          <span>Skill Match For You</span>
        </div>
      )}

      <div>
        {/* Header: Type, Urgency, Credit Cost */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                isRequest
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
              }`}
            >
              {isRequest ? '🆘 Need Help' : '✨ Can Help'}
            </span>

            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-slate-400" />
              {urgencyLabels[post.urgency] || 'Flexible'}
            </span>
          </div>

          <CreditBadge amount={post.creditAmount} size="sm" variant="amber" />
        </div>

        {/* Title */}
        <Link to={`/posts/${post._id}`} className="group">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
            {post.title}
          </h3>
        </Link>

        {/* Description Snippet */}
        <p className="text-slate-600 text-xs mt-2 line-clamp-3 leading-relaxed">
          {post.description}
        </p>

        {/* Skill Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {post.skillTags?.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Author Info and Action */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={
              post.author?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=6366f1&color=fff`
            }
            alt={post.author?.name}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {post.author?.name} {isAuthor && <span className="text-indigo-600 text-[10px]">(You)</span>}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{post.author?.avgRating?.toFixed(1) || '5.0'}</span>
              <span className="text-slate-400">· {post.author?.major?.split(' ')[0] || 'Campus'}</span>
            </div>
          </div>
        </div>

        <Link
          to={`/posts/${post._id}`}
          className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition shadow-sm ${
            isAuthor
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              : isRequest
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <span>
            {isAuthor
              ? `Manage (${post.applicants?.length || 0})`
              : isRequest
              ? 'Offer Help'
              : 'Request'}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
