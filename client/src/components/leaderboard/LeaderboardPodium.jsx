import React from 'react';
import { Crown, Medal, Star, Sparkles } from 'lucide-react';
import { CreditBadge } from '../common/CreditBadge';

export const LeaderboardPodium = ({ leaders = [] }) => {
  if (leaders.length < 3) return null;

  const first = leaders[0];
  const second = leaders[1];
  const third = leaders[2];

  return (
    <div className="bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campus Hall of Fame</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Top Skill Contributors
        </h2>
        <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-md mx-auto">
          Recognizing the students who have given the most help, earned top reviews, and powered our campus knowledge relay.
        </p>
      </div>

      {/* Podium Grid: 2nd place, 1st place (tallest), 3rd place */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-6">
        {/* 2nd Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <img
              src={
                second?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  second?.name || '2'
                )}&background=94a3b8&color=fff`
              }
              alt={second?.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-slate-300 shadow-lg"
            />
            <span className="absolute -bottom-2 -right-1 bg-slate-200 text-slate-800 text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
              2
            </span>
          </div>
          <p className="font-bold text-xs sm:text-sm text-slate-100 text-center truncate w-full">
            {second?.name}
          </p>
          <p className="text-[10px] text-slate-400 truncate w-full text-center">
            {second?.major?.split(' ')[0] || 'Student'}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-300">
            <Star className="w-3 h-3 fill-amber-300" />
            <span>{second?.avgRating?.toFixed(1) || '5.0'}</span>
          </div>
          {/* Podium block */}
          <div className="w-full bg-slate-800/80 border border-slate-700 rounded-t-2xl pt-4 pb-3 px-2 mt-3 text-center h-28 flex flex-col justify-between">
            <Medal className="w-5 h-5 text-slate-300 mx-auto" />
            <div className="text-[11px] font-bold text-amber-400">
              🪙 {second?.totalCreditsEarned} earned
            </div>
            <div className="text-[10px] text-slate-400">
              {second?.sessionsCompleted} sessions
            </div>
          </div>
        </div>

        {/* 1st Place (Center / Highest) */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <Crown className="w-7 h-7 text-amber-400 fill-amber-400 animate-bounce" />
            </div>
            <img
              src={
                first?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  first?.name || '1'
                )}&background=fbbf24&color=1e1b4b`
              }
              alt={first?.name}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-amber-400 shadow-xl"
            />
            <span className="absolute -bottom-2 -right-1 bg-amber-400 text-slate-900 text-xs font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg ring-2 ring-indigo-950">
              1
            </span>
          </div>
          <p className="font-extrabold text-sm sm:text-base text-amber-300 text-center truncate w-full">
            {first?.name}
          </p>
          <p className="text-[11px] text-indigo-200 truncate w-full text-center">
            {first?.major?.split(' ')[0] || 'Student'}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-amber-300 font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-300" />
            <span>{first?.avgRating?.toFixed(1) || '5.0'}</span>
          </div>
          {/* Podium block */}
          <div className="w-full bg-gradient-to-t from-amber-500/20 to-indigo-800/90 border-2 border-amber-400/60 rounded-t-2xl pt-5 pb-3 px-2 mt-3 text-center h-36 flex flex-col justify-between shadow-lg">
            <Crown className="w-6 h-6 text-amber-400 mx-auto" />
            <div className="text-xs sm:text-sm font-extrabold text-amber-300">
              🪙 {first?.totalCreditsEarned} earned
            </div>
            <div className="text-[10px] text-indigo-200 font-semibold">
              {first?.sessionsCompleted} sessions completed
            </div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center">
          <div className="relative mb-2">
            <img
              src={
                third?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  third?.name || '3'
                )}&background=d97706&color=fff`
              }
              alt={third?.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-4 ring-amber-600 shadow-lg"
            />
            <span className="absolute -bottom-2 -right-1 bg-amber-700 text-white text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
              3
            </span>
          </div>
          <p className="font-bold text-xs sm:text-sm text-slate-100 text-center truncate w-full">
            {third?.name}
          </p>
          <p className="text-[10px] text-slate-400 truncate w-full text-center">
            {third?.major?.split(' ')[0] || 'Student'}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-300">
            <Star className="w-3 h-3 fill-amber-300" />
            <span>{third?.avgRating?.toFixed(1) || '5.0'}</span>
          </div>
          {/* Podium block */}
          <div className="w-full bg-slate-800/80 border border-slate-700 rounded-t-2xl pt-4 pb-3 px-2 mt-3 text-center h-24 flex flex-col justify-between">
            <Medal className="w-5 h-5 text-amber-600 mx-auto" />
            <div className="text-[11px] font-bold text-amber-400">
              🪙 {third?.totalCreditsEarned} earned
            </div>
            <div className="text-[10px] text-slate-400">
              {third?.sessionsCompleted} sessions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
