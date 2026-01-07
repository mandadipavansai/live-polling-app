import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-blue-600 mb-4 tracking-tight">Intervue Live Polls</h1>
        <p className="text-lg text-gray-500 max-w-md mx-auto">
          Real-time interaction platform for classrooms. Select your role to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-6">
        {/* Teacher Card */}
        <Link to="/teacher" className="group">
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              👨‍🏫
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">I am a Teacher</h2>
            <p className="text-gray-500">Create polls, manage sessions, and view live results.</p>
          </div>
        </Link>

        {/* Student Card */}
        <Link to="/student" className="group">
          <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
              🎓
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">I am a Student</h2>
            <p className="text-gray-500">Join active sessions, vote instantly, and see progress.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;