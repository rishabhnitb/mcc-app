"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/quiz-setup');
    }
  }, [user, router]);

  const handleLogin = async (username: string, password: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to quiz setup
      console.log('Login successful, redirecting...');
      router.push('/quiz-setup');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message);
      throw error;
    }
  };

  const handleRegister = async (username: string, email: string | undefined, password: string) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // After successful registration, log in
      await handleLogin(username, password);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // If already logged in, useEffect will handle redirect
  if (user) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 min-h-screen flex flex-col items-center justify-center py-6 px-2 backdrop-blur-lg">
      <main className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] p-4 sm:p-8 w-full max-w-2xl mx-auto border border-indigo-100 hover:shadow-[0_20px_60px_rgba(8,_112,_184,_0.8)] transition-all duration-300">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-sans tracking-tight animate-fade-in">
          MCQ Quiz
        </h1>
        {error && (
          <div className="text-red-500 text-center mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        {showRegister ? (
          <RegisterForm 
            onToggleForm={() => setShowRegister(false)}
            onRegister={handleRegister}
          />
        ) : (
          <LoginForm 
            onToggleForm={() => setShowRegister(true)}
            onLogin={handleLogin}
          />
        )}
      </main>
    </div>
  );
}
