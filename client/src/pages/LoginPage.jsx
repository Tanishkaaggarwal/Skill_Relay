import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, Mail, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api/client';

export const LoginPage = () => {
  const { login, demoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/feed');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const res = await api.get('/auth/demo-users');
        if (res.data.success) {
          setDemoUsers(res.data.users);
        }
      } catch (err) {
        console.error('Failed to load demo accounts:', err);
      }
    };
    fetchDemoUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(demoEmail);
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Left Side: Standard Login Form (5 cols) */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900">Skill Relay</span>
            </div>

            <h2 className="text-2xl font-bold text-slate-900">Welcome back!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Log in with your college email to access the help exchange.
            </p>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 transition text-sm disabled:opacity-50 mt-2"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline">
              Sign up free (100 credits bonus)
            </Link>
          </div>
        </div>

        {/* Right Side: 1-Click Demo Profiles (6 cols) */}
        <div className="lg:col-span-6 bg-slate-50 p-8 sm:p-10 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Instant Evaluator Testing</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">1-Click Demo Student Personas</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select any pre-seeded campus account to test matching, chat, and mutual credit settlement right away:
            </p>

            <div className="mt-4 space-y-2.5">
              {demoUsers.map((dUser) => (
                <button
                  key={dUser._id}
                  onClick={() => handleDemoSelect(dUser.email)}
                  disabled={loading}
                  className="w-full p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-md transition text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                      {dUser.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">
                        {dUser.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{dUser.major}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      🪙 {dUser.creditBalance}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-400 text-center">
            Password for all demo accounts: <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono">password123</code>
          </div>
        </div>
      </div>
    </div>
  );
};
