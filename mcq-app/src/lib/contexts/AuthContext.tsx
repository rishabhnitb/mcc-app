"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isClient, navigateToQuizSetup, navigateToLogin } from '@/lib/utils/navigation';

interface User {
  id: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string | undefined, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isClient() || initialized) {
      return;
    }

    const initializeAuth = () => {
      try {
        // Check for stored token and user data
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [initialized]);

  const login = async (username: string, password: string) => {
    if (!isClient()) {
      console.log('Login blocked: not ready');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting login for user:', username);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log('Login response status:', res.status);

      if (!res.ok) {
        console.error('Login failed:', data);
        throw new Error(data.message || 'Invalid credentials');
      }

      // Store user data after successful login
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update user state and ensure it's set before navigation
      console.log('Login successful, setting user state...');
      setUser(data.user);
      
      // Navigate to quiz setup after successful login using our navigation utility
      if (window.location.pathname === '/') {
        console.log('Login successful, preparing navigation to quiz setup...');
        navigateToQuizSetup();
      } else {
        console.log('Login successful but not on login page, staying on current page');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string | undefined, password: string) => {
    if (!isClient()) {
      console.log('Register blocked: not ready');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store user data after successful registration
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      // Navigate to quiz setup after successful registration
      navigateToQuizSetup();
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (!isClient()) {
      console.log('Logout blocked: not ready');
      return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigateToLogin();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
