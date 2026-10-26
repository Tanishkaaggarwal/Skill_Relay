import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { CreditBadge } from '../common/CreditBadge';
import { AlertCircle, Plus, Sparkles, HelpCircle, Check } from 'lucide-react';
import api from '../../api/client';

export const PostCreateModal = ({ isOpen, onClose, onPostCreated }) => {
  const { user, refreshUser } = useAuth();
  const [type, setType] = useState('request'); // 'request' | 'offer'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillTagsInput, setSkillTagsInput] = useState('');
  const [urgency, setUrgency] = useState('quick_ask');
  const [creditAmount, setCreditAmount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonTags = [
    'React',
    'Python',
    'Figma',
    'UI/UX',
    'Resume Review',
    'Git',
    'Calculus',
    'Linear Algebra',
    'Organic Chemistry',
    'Spanish',
    'Public Speaking',
    'Data Structures',
  ];

  const handleUrgencyChange = (newUrgency) => {
    setUrgency(newUrgency);
    if (newUrgency === 'quick_ask') setCreditAmount(20);
    else if (newUrgency === 'full_session') setCreditAmount(50);
  };

  const handleTagClick = (tag) => {
    const currentTags = skillTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      setSkillTagsInput(currentTags.length > 0 ? `${skillTagsInput}, ${tag}` : tag);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please fill in both title and description.');
      return;
    }

    const tags = skillTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      setError('Please add at least one skill tag (e.g. React, Figma).');
      return;
    }

    if (type === 'request' && (user?.creditBalance || 0) < creditAmount) {
      setError(
        `Insufficient credit balance! You have ${user?.creditBalance || 0} credits, but this request requires ${creditAmount} credits.`
      );
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/posts', {
        type,
        title: title.trim(),
        description: description.trim(),
        skillTags: tags,
        urgency,
        creditAmount: Number(creditAmount),
      });

      if (res.data.success) {
        // Reset form
        setTitle('');
        setDescription('');
        setSkillTagsInput('');
        onClose();
        if (onPostCreated) onPostCreated(res.data.post);
        refreshUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Campus Skill Exchange Post" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Post Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            I want to...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType('request');
                if (urgency === 'quick_ask') setCreditAmount(20);
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                type === 'request'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Ask for Help (Request)</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Spend credits when a helper successfully unblocks you.
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('offer');
                if (urgency === 'quick_ask') setCreditAmount(20);
              }}
              className={`p-3 rounded-xl border text-left flex items-start gap-3 transition ${
                type === 'offer'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Offer Help (Skill Offer)</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Earn credits by sharing your knowledge with peers.
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Post Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === 'request'
                ? 'e.g., Need help debugging Next.js App Router nested layouts'
                : 'e.g., Can coach you on Figma Auto-Layout & Design Systems'
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            required
            maxLength={120}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Detailed Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={
              type === 'request'
                ? 'Describe what you are stuck on, your current approach, and what specific help you need...'
                : 'Describe your expertise, what topics you cover, and how you structure the session...'
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            required
            maxLength={1500}
          />
        </div>

        {/* Skill Tags & Suggestions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Skill Tags (comma separated)
          </label>
          <input
            type="text"
            value={skillTagsInput}
            onChange={(e) => setSkillTagsInput(e.target.value)}
            placeholder="e.g. React, TypeScript, Frontend"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            required
          />
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick suggestions:</span>
            {commonTags.slice(0, 7).map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-md font-medium transition"
              >
                +{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency and Credit Setting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Estimated Duration / Urgency
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'quick_ask', label: '⚡ Quick Ask (15–30 min)', credits: 20 },
                { id: 'full_session', label: '⏳ Full Session (~1 hour)', credits: 50 },
                { id: 'flexible', label: '🔄 Custom / Flexible', credits: creditAmount },
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleUrgencyChange(item.id)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-between transition ${
                    urgency === item.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[11px] text-amber-600 font-bold">🪙 {item.credits}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Credits Allocated
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Reward / Cost:</span>
                <CreditBadge amount={creditAmount} size="sm" variant="amber" />
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={creditAmount}
                onChange={(e) => {
                  setCreditAmount(Number(e.target.value));
                  setUrgency('flexible');
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>10 credits (quick bug)</span>
                <span>100 credits (deep workshop)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish to Campus Feed'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
