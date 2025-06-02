import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-blue-800">CMS</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-700 hover:text-gray-900 hover:border-gray-300 transition duration-150 ease-in-out"
              >
                Home
              </Link>
              {user && (
                <Link
                  to={user.role === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-700 hover:text-gray-900 hover:border-gray-300 transition duration-150 ease-in-out"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 mr-1" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 transition ease-in-out duration-150"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-800 bg-white hover:bg-gray-50 border-blue-800 transition ease-in-out duration-150"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 transition ease-in-out duration-150"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-900 transition duration-150 ease-in-out"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition duration-150 ease-in-out"
            onClick={toggleMenu}
          >
            Home
          </Link>
          {user && (
            <Link
              to={user.role === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition duration-150 ease-in-out"
              onClick={toggleMenu}
            >
              Dashboard
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 text-gray-500" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-gray-800">{user.name}</div>
                <div className="text-sm font-medium leading-none text-gray-500 mt-1">{user.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="ml-auto flex-shrink-0 bg-blue-800 p-1 rounded-full text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-around px-4 py-2">
              <Link
                to="/login"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-800 bg-white hover:bg-gray-50 border-blue-800 transition ease-in-out duration-150"
                onClick={toggleMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700 transition ease-in-out duration-150"
                onClick={toggleMenu}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;