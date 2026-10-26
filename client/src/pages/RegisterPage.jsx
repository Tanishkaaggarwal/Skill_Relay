import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, BookOpen, MapPin, Sparkles, AlertCircle, Coins } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    major: 'Computer Science',
    campus: 'Main Campus',
    bio: '',
    skillsOffered: 'React, Python, Git',
    skillsWanted: 'UI/UX, Resume Review',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const skillsOfferedArr = formData.skillsOffered
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const skillsWantedArr = formData.skillsWanted
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await register({
        ...formData,
        skillsOffered: skillsOfferedArr,
        skillsWanted: skillsWantedArr,
      });

      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10">
        <div className="text-center max-w-md mx-auto mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md mx-auto mb-3">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Campus Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join your peer skill exchange network and get started immediately.
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-800 shadow-sm">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>🎁 100 Starting Credits Credited Instantly!</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Taylor Smith"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="taylor@campus.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Major / Department
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science (Junior)"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus / Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  name="campus"
                  value={formData.campus}
                  onChange={handleChange}
                  placeholder="e.g. North Engineering Quad"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skills You Can Offer (Help with)
            </label>
            <input
              type="text"
              name="skillsOffered"
              value={formData.skillsOffered}
              onChange={handleChange}
              placeholder="e.g. React, Python, Calculus, Pitch Decks"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Comma-separated. Used for intelligent skill recommendations!
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Skills You Are Looking For (Wanted)
            </label>
            <input
              type="text"
              name="skillsWanted"
              value={formData.skillsWanted}
              onChange={handleChange}
              placeholder="e.g. UI/UX, Figma, Organic Chemistry, Spanish"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Short Bio (Optional)
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={2}
              placeholder="Tell other students a bit about your interests and study habits..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 transition text-sm disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Complete Sign Up & Claim 100 Credits'}
          </button>
        </form>

        <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
