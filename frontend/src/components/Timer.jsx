import React from 'react';

const Timer = ({ time }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md w-full max-w-xs mx-auto my-4">
      <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Time Remaining</span>
      <div className={`text-5xl font-bold mt-2 ${time < 10 ? 'text-red-500' : 'text-blue-600'}`}>
        {time}s
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
        <div 
          className={`h-2.5 rounded-full ${time < 10 ? 'bg-red-500' : 'bg-blue-600'}`} 
          style={{ width: `${(time / 60) * 100}%`, transition: 'width 1s linear' }}
        ></div>
      </div>
    </div>
  );
};

export default Timer;