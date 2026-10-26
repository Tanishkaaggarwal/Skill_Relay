import React, { useState, useEffect } from 'react';
import { LeaderboardPodium } from '../components/leaderboard/LeaderboardPodium';
import { RatingStars } from '../components/common/RatingStars';
import { Trophy, Medal, Star, Coins, Sparkles, Filter } from 'lucide-react';
import api from '../api/client';

export const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('credits'); // 'credits' | 'sessions' | 'rating'

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leaderboard?sortBy=${sortBy}`);
      if (res.data.success) {
        setLeaders(res.data.leaders);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Podium for top 3 */}
      {!loading && <LeaderboardPodium leaders={leaders} />}

      {/* Leaderboard Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-lg">
              Campus Contributor Rankings
            </h3>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'credits', label: '🪙 Credits Earned' },
              { id: 'sessions', label: '⚡ Sessions Done' },
              { id: 'rating', label: '⭐ Highest Rated' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  sortBy === s.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading rankings...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Rank</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Honor Badge</th>
                  <th className="py-3.5 px-4">Sessions Done</th>
                  <th className="py-3.5 px-4">Avg Rating</th>
                  <th className="py-3.5 px-5 text-right">Total Credits Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaders.map((leader) => {
                  const isTop3 = leader.rank <= 3;
                  return (
                    <tr
                      key={leader._id}
                      className={`hover:bg-indigo-50/40 transition ${
                        isTop3 ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            leader.rank === 1
                              ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                              : leader.rank === 2
                              ? 'bg-slate-300 text-slate-900 ring-2 ring-slate-200'
                              : leader.rank === 3
                              ? 'bg-amber-700 text-white ring-2 ring-amber-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {leader.rank}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              leader.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                leader.name
                              )}&background=6366f1&color=fff`
                            }
                            alt={leader.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {leader.name}
                            </div>
                            <div className="text-[11px] text-slate-500">{leader.major}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-bold px-2.5 py-1 rounded-full text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {leader.badge}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-semibold text-slate-800">
                        {leader.sessionsCompleted} sessions
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <RatingStars rating={leader.avgRating || 5} size="sm" />
                          <span className="font-bold text-slate-800">
                            {leader.avgRating?.toFixed(1) || '5.0'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({leader.reviewCount || 0})
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap text-right font-black text-amber-600 text-sm">
                        🪙 {leader.totalCreditsEarned}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
