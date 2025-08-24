"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect if not authenticated, only after loading is done and both no token and no user
  React.useEffect(() => {
    if (!loading) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token && !user) {
        router.replace('/'); // use replace so Back button doesn’t flicker back here
      }
    }
  }, [loading, user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsUpdating(true);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          email,
          password: newPassword || undefined
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setSuccess('Profile updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated (no token and no user), don't show fallback UI, just wait for redirect
  if (
    !loading &&
    !user &&
    (typeof window !== 'undefined' && !localStorage.getItem('token'))
  ) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <h1
            onClick={() => router.push('/quiz')}
            className="text-xl font-bold text-indigo-600 cursor-pointer"
          >
            MCQ Quiz
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Home
          </button>
        </div>
      </header>
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto bg-blue-600 rounded-full flex items-center justify-center text-3xl text-white font-bold mb-4">
              {user?.username ? user.username[0].toUpperCase() : '?'}
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Profile</h2>
            <p className="mt-2 text-lg text-gray-600">@{user?.username || 'unknown'}</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">{success}</div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={user?.username || ''}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">Username cannot be changed</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
