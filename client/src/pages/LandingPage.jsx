import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  Coins,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      step: '01',
      title: 'Post a Request or Offer',
      desc: 'Stuck on a tricky coding bug, lab report, or slide deck? Post an ask. Got skills to share? Post an offer.',
      icon: HelpCircle,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      step: '02',
      title: 'Match & Live Collaborate',
      desc: 'Connect with a peer in 1 click. Coordinate, chat, and solve the problem in real-time.',
      icon: Users,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      step: '03',
      title: 'Mutual Confirmation & Credits',
      desc: 'Once the session is complete, both parties confirm. Credits transfer atomically to reward the helper.',
      icon: Coins,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      step: '04',
      title: 'Climb the Campus Leaderboard',
      desc: 'Earn 5-star ratings, collect contributor badges, and gain recognized peer reputation on campus.',
      icon: Trophy,
      color: 'bg-rose-100 text-rose-700',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-200/50 via-emerald-200/30 to-amber-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/80 px-4 py-1.5 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Campus Help Exchange Powered by Credits, Not Cash</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Unlock your campus brainpower with{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Skill Relay
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The biggest barrier to getting help isn't that no one can help — it's not knowing who to ask.
            Trade skills, review resumes, debug code, and earn verified campus credits.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/feed' : '/register'}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
            >
              <span>{isAuthenticated ? 'Go to Exchange Board' : 'Get 100 Free Credits'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl border border-slate-200 shadow-sm transition flex items-center justify-center text-base"
            >
              <span>Explore Demo Accounts</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-md">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">100</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Starting Credits for All</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Peer Mutual Confirmation</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">0 Cash</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Pure Skill Barter Economy</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-600">Live</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Real-Time Chat & Ledger</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Simple 4-Step Cycle
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              How Skill Relay Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-200/90 relative hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${s.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-slate-300">{s.step}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-base mb-2">{s.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Escrow Guarantee */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Atomic Credit Safety</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Credits Move Only When Both Sides Are Satisfied
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                No surprises or direct wallet drains. When a session begins, credits are held safely in escrow.
                Only when <strong>both requester and helper</strong> click "Mark Complete" does the server atomically
                transfer credits and update the transaction ledger.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl w-full md:w-auto text-center space-y-3">
              <div className="text-3xl">🪙 🤝 🎓</div>
              <div className="text-xs font-bold text-amber-300">Protected Peer Transactions</div>
              <div className="text-[11px] text-slate-400">
                100 Starting Credits · Verified College Domain
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Skill Relay. Campus Peer Knowledge & Skill Exchange Prototype.</p>
        </div>
      </footer>
    </div>
  );
};
