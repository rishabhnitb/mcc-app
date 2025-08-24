"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { navigateToProfile, navigateToPastAttempts } from '@/lib/utils/navigation';

export default function UserHeader() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    navigateToProfile();
  };

  const handlePastAttemptsClick = () => {
    setIsMenuOpen(false);
    navigateToPastAttempts();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">MCQ Quiz App</h1>
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <span className="text-gray-700">{user?.username}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transform transition-transform ${
                isMenuOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1">
              <button
                onClick={handleProfileClick}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={handlePastAttemptsClick}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Past Attempts
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
