import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Sparkles } from 'lucide-react';
import api from '../../api/client';

export const DemoSwitcher = () => {
  const { user, demoLogin } = useAuth();
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDemoUsers = async () => {
      try {
        const res = await api.get('/auth/demo-users');
        if (res.data.success) {
          setDemoUsers(res.data.users);
        }
      } catch (err) {
        console.error('Failed to load demo accounts:', err);
      }
    };
    loadDemoUsers();
  }, []);

  if (demoUsers.length === 0) return null;

  const handleSwitch = async (email) => {
    if (user?.email === email) return;
    setLoading(true);
    try {
      await demoLogin(email);
    } catch (err) {
      console.error('Demo switch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-indigo-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold text-slate-200">1-Click Demo Persona Switcher:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {demoUsers.map((dUser) => {
            const isActive = user?.email === dUser.email;
            return (
              <button
                key={dUser._id}
                onClick={() => handleSwitch(dUser.email)}
                disabled={loading}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 font-semibold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isActive && <UserCheck className="w-3 h-3 text-emerald-400" />}
                <span>{dUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  ({dUser.major?.split(' ')[0] || 'Student'})
                </span>
                <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded text-amber-300">
                  🪙 {dUser.creditBalance}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
