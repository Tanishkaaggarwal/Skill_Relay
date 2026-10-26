import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Send, Sparkles, ShieldCheck } from 'lucide-react';
import api from '../../api/client';

export const SessionChat = ({ session, onSessionUpdated }) => {
  const { user } = useAuth();
  const { socket, joinSession, leaveSession } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);

  const sessionId = session._id;

  // Scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initial load of messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}/messages`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [sessionId]);

  // Socket room joining and listeners
  useEffect(() => {
    if (!socket || !sessionId) return;

    joinSession(sessionId);

    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => {
        // avoid duplicates
        if (prev.some((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    };

    const handleSessionUpdated = (updatedSession) => {
      if (onSessionUpdated) onSessionUpdated(updatedSession);
    };

    const handleUserTyping = ({ user: typer }) => {
      if (typer?._id !== user?._id) {
        setTypingUser(typer?.name || 'Partner');
      }
    };

    const handleUserStopTyping = () => {
      setTypingUser(null);
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('session_updated', handleSessionUpdated);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      leaveSession(sessionId);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('session_updated', handleSessionUpdated);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, sessionId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    if (socket) {
      socket.emit('typing_stop', { sessionId, user });
    }

    try {
      const res = await api.post(`/sessions/${sessionId}/messages`, {
        content: text,
      });

      if (res.data.success) {
        // Emit through socket for immediate delivery
        if (socket) {
          socket.emit('send_message', {
            sessionId,
            senderId: user._id,
            content: text,
          });
        }
      }
    } catch (err) {
      console.error('Failed to send message via API:', err);
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (socket) {
      socket.emit('typing_start', { sessionId, user });
      // Debounce stop typing
      clearTimeout(window.typingTimer);
      window.typingTimer = setTimeout(() => {
        socket.emit('typing_stop', { sessionId, user });
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Live Session Collaboration Chat
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Secured Session</span>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Loading session messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <Sparkles className="w-8 h-8 text-indigo-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Workspace is ready!</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Say hello, share links or meeting details, and coordinate your help session.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            const isSystem = msg.isSystem;

            if (isSystem) {
              return (
                <div key={msg._id || index} className="flex justify-center my-2">
                  <div className="bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-xs px-3.5 py-1.5 rounded-full max-w-md text-center shadow-sm">
                    {msg.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg._id || index}
                className={`flex gap-2.5 items-end ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <img
                    src={
                      msg.sender?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        msg.sender?.name || 'P'
                      )}&background=6366f1&color=fff`
                    }
                    alt={msg.sender?.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                )}

                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1">
                    {isMe ? 'You' : msg.sender?.name}
                  </span>
                  <div
                    className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {typingUser && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 italic pl-8">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
            <span>{typingUser} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Type a message or share a meeting link..."
          className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition flex items-center justify-center shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
