import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { CreditBadge } from './CreditBadge';
import {
  Zap,
  PlusCircle,
  Bell,
  Trophy,
  Gift,
  Layers,
  MessageSquare,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

export const Navbar = ({ onOpenCreatePost }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, latestToast, setLatestToast, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close popups on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Exchange Board', path: '/feed', icon: Layers },
    { name: 'My Sessions', path: '/my-sessions', icon: MessageSquare },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Perks Store', path: '/rewards', icon: Gift, badge: 'Phase 2' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={isAuthenticated ? '/feed' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 via-slate-900 to-emerald-600 bg-clip-text text-transparent">
                  Skill Relay
                </span>
                <span className="hidden sm:inline-block text-[10px] block font-semibold text-slate-400 -mt-1 tracking-wider uppercase">
                  Campus Help Exchange
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded-full border border-slate-200">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right Action Bar */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Create Post Button */}
                  <button
                    onClick={onOpenCreatePost}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg transition transform hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Post Request/Offer</span>
                    <span className="sm:hidden">Post</span>
                  </button>

                  {/* Credit Balance Badge (Clickable to Profile Ledger) */}
                  <Link to="/profile" title="View Transaction Ledger & Credits">
                    <CreditBadge amount={user?.creditBalance ?? 0} size="md" variant="amber" />
                  </Link>

                  {/* Notification Center */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/80 transition"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown Panel */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">Notifications</span>
                            {unreadCount > 0 && (
                              <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-sm">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div
                                key={n._id}
                                onClick={() => {
                                  markAsRead(n._id);
                                  if (n.link) {
                                    setShowNotifications(false);
                                    navigate(n.link);
                                  }
                                }}
                                className={`p-3.5 hover:bg-indigo-50/50 cursor-pointer transition flex items-start gap-3 ${
                                  !n.read ? 'bg-indigo-50/20 font-medium' : ''
                                }`}
                              >
                                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 flex-shrink-0 mt-0.5">
                                  <Bell className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 text-xs">
                                  <p className="font-semibold text-slate-800">{n.title}</p>
                                  <p className="text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                                  <span className="text-[10px] text-slate-400 mt-1 block">
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1 flex-shrink-0" />
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Avatar & Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                    >
                      <img
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`}
                        alt={user?.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-200"
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2">
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="font-bold text-slate-800 text-sm truncate">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                          <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                            ⭐ {user?.avgRating?.toFixed(1)} ({user?.reviewCount || 0} reviews)
                          </p>
                        </div>

                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <UserIcon className="w-4 h-4" />
                          Profile & Credit Ledger
                        </Link>

                        <Link
                          to="/my-sessions"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <MessageSquare className="w-4 h-4" />
                          My Help Sessions
                        </Link>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left border-t border-slate-100 mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl shadow-sm transition"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Floating Socket Toast Notification */}
      {latestToast && (
        <div
          onClick={() => {
            if (latestToast.link) navigate(latestToast.link);
            setLatestToast(null);
          }}
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-sm flex items-start gap-3 cursor-pointer hover:bg-slate-800 transition transform animate-bounce duration-300"
        >
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">{latestToast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{latestToast.message}</p>
          </div>
        </div>
      )}
    </>
  );
};
