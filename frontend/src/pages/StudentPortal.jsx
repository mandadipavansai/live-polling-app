import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { usePollTimer } from '../hooks/usePollTimer';
import Timer from '../components/Timer';
import ResultChart from '../components/ResultChart';
import ChatPopup from '../components/ChatPopup';

const StudentPortal = () => {
  const socket = useSocket();
  
  // 1. Force Cleanup of localStorage (fix for old bugs)
  useEffect(() => {
    localStorage.clear();
  }, []);

  // 2. Use Session Storage (Unique per New Tab)
  const [studentName, setStudentName] = useState(sessionStorage.getItem('studentName') || '');
  const [isJoined, setIsJoined] = useState(!!sessionStorage.getItem('studentName'));
  const [poll, setPoll] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [results, setResults] = useState([]);

  // Timer Hook
  const remainingTime = usePollTimer(poll ? poll.remainingTime : 0, () => {
    if (!hasVoted) setHasVoted(true); 
  });

  // --- Join Logic ---
  const handleJoin = (e) => {
    e.preventDefault();
    if (studentName.trim()) {
      // Create a UNIQUE ID for this session
      const id = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      sessionStorage.setItem('studentName', studentName);
      sessionStorage.setItem('studentId', id);
      
      setIsJoined(true);
      
      // Register with server
      socket.emit('student_join', { studentId: id, name: studentName });
      socket.emit('request_state', { studentId: id });
    }
  };

  // --- Resilience: Re-connect on Refresh ---
  useEffect(() => {
    if (socket && isJoined) {
      const id = sessionStorage.getItem('studentId');
      const name = sessionStorage.getItem('studentName');
      
      if (id && name) {
        socket.emit('student_join', { studentId: id, name });
        socket.emit('request_state', { studentId: id });
      } else {
        setIsJoined(false);
      }
    }
  }, [socket, isJoined]);

  // --- Socket Listeners ---
  useEffect(() => {
    if (!socket) return;

    socket.on('poll_created', (newPoll) => {
      setPoll({ ...newPoll, remainingTime: newPoll.duration });
      setHasVoted(false);
      setResults([]);
    });

    socket.on('sync_state', (state) => {
      setPoll(state);
      // Auto-submit logic: Only if the server says this SPECIFIC ID has voted
      setHasVoted(state.hasVoted); 
    });

    socket.on('update_results', (newResults) => {
      setResults(newResults);
    });

    socket.on('vote_success', () => {
      setHasVoted(true);
    });

    socket.on('kicked', () => {
      alert("You have been removed from the session.");
      sessionStorage.clear();
      window.location.reload();
    });

    return () => {
      socket.off('poll_created');
      socket.off('sync_state');
      socket.off('update_results');
      socket.off('vote_success');
      socket.off('kicked');
    };
  }, [socket]);

  // --- Vote Handler ---
  const handleVote = (index) => {
    if (hasVoted) return;
    const studentId = sessionStorage.getItem('studentId');
    socket.emit('submit_vote', { 
      pollId: poll._id, 
      studentId, 
      optionIndex: index 
    });
  };

  // --- Logout / Reset Function ---
  const handleLogout = () => {
    if(window.confirm("This will disconnect you. Are you sure?")) {
      sessionStorage.clear();
      window.location.reload();
    }
  };

  // --- UI RENDER ---

  // 1. Login Screen
  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form onSubmit={handleJoin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-blue-600 mb-2">Intervue Class</h1>
            <p className="text-gray-500">Enter your name to join the live session.</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Your Full Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              required
            />
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Join Session
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 2. Waiting Screen
  if (!poll) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4 relative">
        <div className="animate-bounce text-6xl mb-6">⏳</div>
        <h2 className="text-2xl font-bold text-gray-800">Waiting for Teacher...</h2>
        <p className="text-gray-500 mt-2 max-w-sm">Please stay on this page.</p>
        
        {/* Logout Button for Testing */}
        <button onClick={handleLogout} className="mt-8 text-sm text-red-500 underline hover:text-red-700">
          Not {studentName}? Logout
        </button>
        <ChatPopup userName={studentName} role="Student" />
      </div>
    );
  }

  // 3. Active Poll Screen
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex flex-col items-center relative">
      <div className="w-full max-w-xl">
        <header className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm">👤 {studentName}</span>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-600 underline">Logout</button>
          </div>
          {remainingTime > 0 ? (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">LIVE POLL</span>
          ) : (
            <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">POLL ENDED</span>
          )}
        </header>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-6 relative overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-snug">{poll.question}</h2>
          
          {remainingTime > 0 && !hasVoted ? (
            <div className="space-y-4">
              {poll.options.map((opt, index) => (
                <button
                  key={index}
                  onClick={() => handleVote(index)}
                  className="w-full text-left p-5 border-2 border-gray-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group flex items-center"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold mr-4 group-hover:bg-blue-500 group-hover:text-white transition">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {/* FIX: Handles both String and Object formats */}
                  <span className="font-medium text-gray-700 text-lg">
                    {typeof opt === 'object' ? opt.option : opt}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
               {hasVoted ? (
                 <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                   <div className="text-5xl mb-2">✅</div>
                   <p className="text-xl font-bold text-green-700">Answer Submitted</p>
                 </div>
               ) : (
                 <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                   <p className="text-red-500 font-bold text-lg">⏰ Time's Up!</p>
                 </div>
               )}
            </div>
          )}
        </div>

        {remainingTime > 0 && !hasVoted && <Timer time={remainingTime} />}

        {(hasVoted || remainingTime === 0) && (
          <div className="animate-fade-in-up">
            <ResultChart results={results} />
          </div>
        )}
      </div>
      <ChatPopup userName={studentName} role="Student" />
    </div>
  );
};

export default StudentPortal;