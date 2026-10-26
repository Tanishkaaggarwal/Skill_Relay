import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to server');
      if (user?._id) {
        newSocket.emit('register_user', user._id);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Update registered user on auth change
  useEffect(() => {
    if (socket && user?._id) {
      socket.emit('register_user', user._id);
    }
  }, [socket, user]);

  const joinSession = (sessionId) => {
    if (socket && sessionId) {
      socket.emit('join_session', { sessionId, user });
    }
  };

  const leaveSession = (sessionId) => {
    if (socket && sessionId) {
      socket.emit('leave_session', { sessionId, user });
    }
  };

  const sendMessage = (sessionId, content) => {
    if (socket && sessionId && user?._id) {
      socket.emit('send_message', {
        sessionId,
        senderId: user._id,
        content,
      });
    }
  };

  const notifySessionUpdate = (sessionId, updatedSession) => {
    if (socket && sessionId) {
      socket.emit('session_confirmation_updated', {
        sessionId,
        updatedSession,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        joinSession,
        leaveSession,
        sendMessage,
        notifySessionUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
