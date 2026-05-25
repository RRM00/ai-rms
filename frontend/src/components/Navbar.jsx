import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-orange-400 mr-4">
                AI-RMS
              </span>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-inner'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                POS Menu
              </NavLink>
              
              <NavLink
                to="/kitchen"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-inner'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                Kitchen Display
              </NavLink>

              {user?.role === 'admin' && (
                <>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-900/50 text-brand-300 shadow-inner ring-1 ring-brand-500/50'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                >
                  Admin Dash
                </NavLink>
                <NavLink
                  to="/analytics"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-900/50 text-brand-300 shadow-inner ring-1 ring-brand-500/50'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`
                  }
                >
                  AI Analytics
                </NavLink>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NavLink
              to="/feedback"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  isActive ? 'text-brand-400 bg-slate-800' : 'text-slate-400 hover:text-brand-300'
                }`
              }
            >
              Leave Feedback
            </NavLink>

            {user && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-700">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-200">{user.name}</span>
                  <span className="text-xs text-brand-400 tracking-wider uppercase">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-slate-800"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
