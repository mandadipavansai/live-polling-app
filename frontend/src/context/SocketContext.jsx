import React, { createContext, useMemo } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  // UPDATED URL
  const socket = useMemo(() => io('https://live-polling-761w.onrender.com'), []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};