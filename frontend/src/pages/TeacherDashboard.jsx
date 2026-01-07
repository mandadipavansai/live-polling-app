// 
import React, { useState, useEffect } from 'react';
import PollForm from '../components/PollForm';
import ResultChart from '../components/ResultChart';
import ChatPopup from '../components/ChatPopup';
import { useSocket } from '../hooks/useSocket';
import { usePollTimer } from '../hooks/usePollTimer';

const TeacherDashboard = () => {
  const socket = useSocket();
  const [results, setResults] = useState([]);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeStudents, setActiveStudents] = useState([]);


  const remainingTime = usePollTimer(currentPoll ? currentPoll.duration : 0, () => {
    fetchHistory(); 
  });


  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/polls/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleExport = () => {
    if (history.length === 0) return alert("No history to export!");
    let csvContent = "data:text/csv;charset=utf-8,Date,Question,Option,Votes\n";
    history.forEach(poll => {
      const date = new Date(poll.createdAt).toLocaleDateString();
      poll.options.forEach(opt => {
        const optionText = typeof opt === 'object' ? opt.option : opt;
        const count = typeof opt === 'object' ? opt.count : 0;
        csvContent += `${date},"${poll.question}","${optionText}",${count}\n`;
      });
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "poll_history_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure? This will delete all past polls forever.")) return;
    try {
      await fetch('http://localhost:5001/api/polls/history', { method: 'DELETE' });
      setHistory([]); 
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);


  useEffect(() => {
    if (!socket) return;


    socket.emit('request_state', {});         
    socket.emit('request_participants');     


    socket.on('poll_created', (poll) => {
      setCurrentPoll(poll);
      setResults([]);
    });


    socket.on('sync_state', (poll) => {
      setCurrentPoll(poll);
    });

    socket.on('update_results', (newResults) => {
      setResults(newResults);
    });


    socket.on('update_student_list', (students) => {
      setActiveStudents(students);
    });

    return () => {
      socket.off('poll_created');
      socket.off('sync_state');
      socket.off('update_results');
      socket.off('update_student_list');
    };
  }, [socket]);

  const handleKick = (studentId) => {
    if (window.confirm("Are you sure you want to remove this student?")) {
      socket.emit('kick_student', studentId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans relative">
      <div className="container mx-auto px-4 py-8">
        

        <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Teacher Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage polls and students.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-green-50 px-4 py-2 rounded-full border border-green-100">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mr-3"></span>
            <span className="text-green-700 font-bold text-sm">Active Students: {activeStudents.length}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          

          <div className="xl:col-span-4 space-y-6">
            <PollForm />
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Classroom Roster</h3>
              <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {activeStudents.length === 0 ? (
                  <p className="text-gray-400 text-sm italic py-2">No students joined yet.</p>
                ) : (
                  activeStudents.map((s) => (
                    <div key={s.studentId} className="flex justify-between items-center py-3 border-b last:border-0 hover:bg-gray-50 px-2 rounded transition">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs">S</span>
                        {s.name}
                      </span>
                      <button 
                        onClick={() => handleKick(s.studentId)}
                        className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1 rounded-full hover:bg-red-50 transition shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>


          <div className="xl:col-span-5 flex flex-col">
             {currentPoll && remainingTime > 0 ? (
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 relative overflow-hidden min-h-[400px]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider animate-pulse">Live Now</span>
                  <span className="text-gray-500 text-xl font-mono font-bold">{remainingTime}s</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">{currentPoll.question}</h3>
                <ResultChart results={results} />
              </div>
            ) : (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-dashed border-gray-300 text-center h-full min-h-[400px] flex flex-col justify-center items-center opacity-75">
                <div className="text-6xl mb-4 grayscale opacity-50">📡</div>
                <p className="text-gray-600 font-medium text-lg">No active poll</p>
                <p className="text-sm text-gray-400 mt-2">Use the form on the left to launch one.</p>
              </div>
            )}
          </div>


          <div className="xl:col-span-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Past Polls</h3>
                <div className="flex gap-2">
                  <button onClick={handleExport} className="text-gray-500 hover:text-green-600 text-xs font-bold uppercase tracking-wide transition flex items-center gap-1" title="Download CSV">⬇ CSV</button>
                  <button onClick={fetchHistory} className="text-blue-500 hover:text-blue-700 text-xs font-bold uppercase tracking-wide">Refresh</button>
                  <button onClick={handleClearHistory} className="text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wide" title="Delete All History">Clear</button>
                </div>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {history.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center italic mt-10">No history available.</p>
                ) : (
                  history.map((poll) => (
                    <div key={poll._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors group cursor-default">
                      <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                        {new Date(poll.createdAt).toLocaleTimeString()}
                      </div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-3 line-clamp-2">{poll.question}</h4>
                      <div className="space-y-1 mb-2">
                        {poll.options.map((opt, i) => (
                          <div key={i} className="flex justify-between text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-100">
                            <span>{typeof opt === 'object' ? opt.option : opt}</span>
                            <span className="font-bold">{typeof opt === 'object' ? opt.count : 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatPopup userName="Teacher" role="Teacher" />
    </div>
  );
};

export default TeacherDashboard;