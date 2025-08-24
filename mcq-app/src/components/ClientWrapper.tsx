"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Always render children - we'll handle mounting in the auth context
  return <>{children}</>;
}
