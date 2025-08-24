import React, { useState } from 'react';

interface RegisterFormProps {
  onToggleForm: () => void;
  onRegister: (username: string, email: string | undefined, password: string) => Promise<void>;
}

export default function RegisterForm({ onToggleForm, onRegister }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      if (!username.trim()) {
        setError('Username is required');
        return;
      }

      if (!password.trim()) {
        setError('Password is required');
        return;
      }

      if (email && !email.match(/^\S+@\S+\.\S+$/)) {
        setError('Please enter a valid email address');
        return;
      }

      // Additional validation for username format
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError('Username can only contain letters, numbers, and underscores');
        return;
      }

      if (username.length < 3) {
        setError('Username must be at least 3 characters long');
        return;
      }

      console.log('Submitting registration with:', { 
        username, 
        email, 
        passwordLength: password.length,
        hasPassword: !!password 
      });
      
      try {
        await onRegister(username, email || undefined, password);
      } catch (err: any) {
        // Check for specific error codes
        if (err.message.includes('Username already exists')) {
          setError('This username is already taken. Please choose another one.');
        } else if (err.message.includes('Email already exists')) {
          setError('This email is already registered. Please use another email or try logging in.');
        } else {
          setError(err.message || 'Failed to register');
        }
        throw err; // Re-throw to maintain the error state
      }
    } catch (err: any) {
      const message = err.message || 'Failed to register';
      console.error('Registration error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={onToggleForm}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}
