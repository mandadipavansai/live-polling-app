import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';

const ChatPopup = ({ userName, role }) => {
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const [unreadCount, setUnreadCount] = useState(0); 
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveChat = (msg) => {
      setMessages((prev) => [...prev, msg]);
      

      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on('receive_chat', handleReceiveChat);
    return () => socket.off('receive_chat', handleReceiveChat);
  }, [socket, isOpen]);


  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0); 
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit('send_chat', { user: userName, text: input, role });
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-lg shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden animate-fade-in-up">
          <div className="bg-blue-600 text-white p-3 font-bold flex justify-between items-center">
            <span>Classroom Chat</span>
            <button onClick={toggleChat} className="text-white hover:text-gray-200 text-xl">×</button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 flex ${m.user === userName ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] p-2 rounded-lg text-sm ${m.user === userName ? 'bg-blue-500 text-white' : 'bg-white border text-gray-800 shadow-sm'}`}>
                  <p className="font-bold text-xs opacity-75 mb-0.5">{m.user} <span className="text-[10px]">({m.role})</span></p>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="p-2 border-t bg-white flex">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit" className="ml-2 bg-blue-600 text-white px-3 rounded text-sm hover:bg-blue-700">Send</button>
          </form>
        </div>
      )}


      <button 
        onClick={toggleChat} 
        className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition transform hover:scale-105"
      >
        💬

        {unreadCount > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatPopup;