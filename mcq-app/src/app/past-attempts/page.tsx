"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface QuizAttempt {
  _id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export default function PastAttempts() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [fetchingAttempts, setFetchingAttempts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await fetch('/api/quiz/attempts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        setAttempts(data.attempts);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch quiz attempts');
      } finally {
        setFetchingAttempts(false);
      }
    };

    if (user) {
      fetchAttempts();
    }
  }, [user]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Past Quiz Attempts</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        {fetchingAttempts ? (
          <div className="text-center text-gray-600">Loading attempts...</div>
        ) : attempts.length === 0 ? (
          <div className="text-center text-gray-600">No quiz attempts yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attempt.topic}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {attempt.score} / {attempt.totalQuestions}
                      <span className="ml-2 text-xs">
                        ({Math.round((attempt.score / attempt.totalQuestions) * 100)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attempt.date).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
