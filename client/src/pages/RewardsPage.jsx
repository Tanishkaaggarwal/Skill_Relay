import React from 'react';
import { Gift, Sparkles, Coffee, BookOpen, Clock, Tag, Lock } from 'lucide-react';
import { CreditBadge } from '../components/common/CreditBadge';
import { useAuth } from '../context/AuthContext';

export const RewardsPage = () => {
  const { user } = useAuth();

  const perkItems = [
    {
      title: 'Campus Café Artisan Espresso / Matcha',
      category: 'Dining & Food',
      cost: 80,
      icon: Coffee,
      color: 'bg-amber-100 text-amber-700',
      description: 'Redeem credits for a free craft beverage at any student union coffee shop.',
    },
    {
      title: 'Reserved Quiet Study Pod (2 Hours)',
      category: 'Campus Facilities',
      cost: 120,
      icon: Clock,
      color: 'bg-indigo-100 text-indigo-700',
      description: 'Guaranteed quiet acoustic study room reservation during midterms and finals.',
    },
    {
      title: 'Campus Bookstore 20% Off Merch Voucher',
      category: 'Swag & Apparel',
      cost: 150,
      icon: Tag,
      color: 'bg-emerald-100 text-emerald-700',
      description: 'Discount code applicable to hoodies, tees, stationery, and supplies.',
    },
    {
      title: '3D Maker Lab Free Filament & Priority Queue',
      category: 'Tech & Engineering',
      cost: 200,
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-700',
      description: 'Free PLA filament spool allowance and rapid priority job queue in the maker lab.',
    },
    {
      title: 'Alumni Network 1-on-1 Mentorship Spotlight',
      category: 'Career & Industry',
      cost: 300,
      icon: BookOpen,
      color: 'bg-rose-100 text-rose-700',
      description: 'Exclusive 30-minute networking session with industry alumni in your field.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-emerald-500/15 border border-amber-300/60 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-900 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 2 Feature Preview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Credit-to-Perks Redemption Store
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              In Phase 2, platform credits earned from helping your peers can be redeemed for campus perks, dining vouchers, and academic resources!
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center min-w-[200px]">
            <span className="text-xs text-slate-400 font-semibold uppercase">Your Balance</span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">
              🪙 {user?.creditBalance ?? 100}
            </div>
            <span className="text-[10px] text-slate-500">Credits available</span>
          </div>
        </div>
      </div>

      {/* Perks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {perkItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CreditBadge amount={item.cost} size="sm" variant="amber" />
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.category}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Redeem (Coming Soon in Phase 2)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
