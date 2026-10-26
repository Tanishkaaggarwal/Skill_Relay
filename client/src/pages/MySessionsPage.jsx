import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditBadge } from '../components/common/CreditBadge';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import api from '../api/client';

export const MySessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active'); // 'active' | 'completed' | 'all'

  const fetchSessions = async () => {
    try {
      const res = await api.get('/sessions/my-sessions');
      if (res.data.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (tab === 'active') return s.status === 'active' || s.status === 'pending';
    if (tab === 'completed') return s.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Help Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your ongoing collaborations and past peer exchanges.
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'active', label: 'Active', count: sessions.filter((s) => s.status === 'active').length },
            { id: 'completed', label: 'Completed', count: sessions.filter((s) => s.status === 'completed').length },
            { id: 'all', label: 'All Sessions', count: sessions.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                tab === t.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      {/* Session list */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          Loading your sessions...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No {tab === 'active' ? 'active' : tab === 'completed' ? 'completed' : ''} sessions found
          </h3>
          <p className="text-xs text-slate-500">
            Browse open requests or post an offer on the Exchange Board to start collaborating!
          </p>
          <Link
            to="/feed"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            Explore Exchange Board
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((s) => {
            const isRequester = s.requester?._id === user?._id;
            const partner = isRequester ? s.helper : s.requester;
            const isCompleted = s.status === 'completed';

            return (
              <div
                key={s._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      ● {s.status.toUpperCase()}
                    </span>
                    <CreditBadge amount={s.creditAmount} size="sm" variant="amber" />
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                    {s.postId?.title || 'Campus Peer Exchange Session'}
                  </h3>

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <img
                      src={
                        partner?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          partner?.name || 'Partner'
                        )}&background=6366f1&color=fff`
                      }
                      alt={partner?.name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        Partner: {partner?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {isRequester ? 'Helper' : 'Requester'} · {partner?.major}
                      </p>
                    </div>
                  </div>

                  {/* Confirmation Progress */}
                  {!isCompleted && (
                    <div className="flex items-center justify-between text-xs text-slate-600 bg-amber-50/60 border border-amber-200/60 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Mutual Confirmations:</span>
                      </div>
                      <span className="font-bold text-amber-900">
                        {Number(s.confirmedByRequester) + Number(s.confirmedByHelper)} / 2
                      </span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/sessions/${s._id}`}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open Live Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
