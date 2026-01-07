import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';

const PollForm = () => {
  const socket = useSocket();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, '']);

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim() !== '');
    
    if (!question || validOptions.length < 2) {
      alert('Please provide a question and at least two options.');
      return;
    }

    socket.emit('create_poll', {
      question,
      options: validOptions,
      duration: parseInt(duration)
    });

    // Reset form optional, but usually better to keep it until confirmed
    setQuestion('');
    setOptions(['', '']);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Create a New Poll</h2>

      <div className="mb-5">
        <label className="block text-gray-700 font-semibold mb-2">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="e.g., What is the capital of France?"
          required
        />
      </div>

      <div className="mb-5">
        <label className="block text-gray-700 font-semibold mb-2">Options</label>
        {options.map((opt, index) => (
          <input
            key={index}
            type="text"
            value={opt}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder={`Option ${index + 1}`}
            required
          />
        ))}
        <button
          type="button"
          onClick={addOption}
          className="text-blue-600 hover:text-blue-800 text-sm font-semibold mt-1 flex items-center"
        >
          + Add another option
        </button>
      </div>

      <div className="mb-8">
        <label className="block text-gray-700 font-semibold mb-2">Duration (Seconds)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          min="10"
          max="300"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-bold hover:bg-blue-700 transform hover:-translate-y-0.5 transition duration-200 shadow-md"
      >
        Launch Poll
      </button>
    </form>
  );
};

export default PollForm;