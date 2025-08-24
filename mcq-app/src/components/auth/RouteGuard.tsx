"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { isClient } from '@/lib/utils/navigation';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted && !loading && isClient()) {
      // Only set authorized when we're mounted, done loading, and on client
      setAuthorized(true);
    }
  }, [loading, mounted]);

  // Show nothing while loading or not mounted
  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
