import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PostCard } from '../components/posts/PostCard';
import { PostCreateModal } from '../components/posts/PostCreateModal';
import {
  Search,
  Filter,
  Sparkles,
  Layers,
  HelpCircle,
  PlusCircle,
  Clock,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import api from '../api/client';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'requests' | 'offers' | 'recommended'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filterTags = [
    'All',
    'React',
    'Python',
    'Figma',
    'UI/UX',
    'Resume Review',
    'Git',
    'Linear Algebra',
    'Organic Chemistry',
    'Spanish',
    'Calculus',
  ];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = {};
      if (activeTab === 'requests') params.type = 'request';
      if (activeTab === 'offers') params.type = 'offer';
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedSkill && selectedSkill !== 'All') params.skill = selectedSkill;
      if (selectedUrgency !== 'all') params.urgency = selectedUrgency;
      if (sortBy) params.sort = sortBy;

      if (activeTab === 'recommended') {
        const res = await api.get('/posts/recommended');
        if (res.data.success) {
          setRecommendedPosts(res.data.posts);
        }
      } else {
        const res = await api.get('/posts', { params });
        if (res.data.success) {
          setPosts(res.data.posts);
        }
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, selectedSkill, selectedUrgency, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const currentDisplayPosts = activeTab === 'recommended' ? recommendedPosts : posts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold">
            <span>👋 Welcome, {user?.name}!</span>
            <span className="text-slate-300 font-normal">({user?.major || 'Campus'})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Skill & Help Exchange Board
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
            Give help to earn credits, or spend credits to get unstuck. Both sides confirm completion before balances update.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Post</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        {/* Main Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Exchange', icon: Layers },
              { id: 'requests', label: '🆘 Requests (Need Help)', icon: HelpCircle },
              { id: 'offers', label: '✨ Offers (Can Help)', icon: Sparkles },
              { id: 'recommended', label: '🎯 Recommended For You', icon: Sparkles, badge: 'Smart' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-indigo-700 text-indigo-100'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={fetchPosts}
            title="Refresh Feed"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search Bar and Dropdown Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <form onSubmit={handleSearchSubmit} className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword (e.g. Next.js, Figma, Calculus)..."
              className="w-full pl-10 pr-20 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Search
            </button>
          </form>

          {/* Urgency Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium text-slate-700 bg-white"
            >
              <option value="all">⚡ All Urgencies</option>
              <option value="quick_ask">⚡ Quick Ask (15–30 min)</option>
              <option value="full_session">⏳ Full Session (~1 hour)</option>
              <option value="flexible">🔄 Flexible Duration</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium text-slate-700 bg-white"
            >
              <option value="newest">🕒 Newest Posts</option>
              <option value="credits_high">🪙 Highest Credits First</option>
              <option value="credits_low">🪙 Lowest Credits First</option>
              <option value="oldest">🕰 Oldest Posts</option>
            </select>
          </div>
        </div>

        {/* Skill Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] uppercase mr-1">Skills:</span>
          {filterTags.map((tag) => {
            const isSelected = selectedSkill === tag || (tag === 'All' && !selectedSkill);
            return (
              <button
                key={tag}
                onClick={() => setSelectedSkill(tag === 'All' ? '' : tag)}
                className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-16 bg-slate-100 rounded w-full" />
              <div className="h-8 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : currentDisplayPosts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No posts matched your filters</h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'recommended'
              ? 'Add more skills to your profile or check the All Exchange tab to find posts!'
              : 'Try searching for a different skill, changing your filter, or be the first to create a post!'}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create a Post</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentDisplayPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isRecommended={activeTab === 'recommended'}
            />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <PostCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={(newPost) => {
          setPosts([newPost, ...posts]);
          setActiveTab('all');
        }}
      />
    </div>
  );
};
