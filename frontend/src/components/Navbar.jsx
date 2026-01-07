import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'bg-blue-700' : '';

  return (
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight hover:text-blue-100">
          Intervue Polls
        </Link>
        <div className="flex space-x-2">
          <Link 
            to="/teacher" 
            className={`px-4 py-2 rounded-md font-medium transition duration-200 hover:bg-blue-700 ${isActive('/teacher')}`}
          >
            Teacher
          </Link>
          <Link 
            to="/student" 
            className={`px-4 py-2 rounded-md font-medium transition duration-200 hover:bg-blue-700 ${isActive('/student')}`}
          >
            Student
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;