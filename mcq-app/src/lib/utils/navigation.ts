"use client";

export const isClient = () => {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         window.document === document;
};

const safeNavigate = (path: string) => {
  if (!isClient()) {
    console.log('Navigation blocked: not in client context');
    return;
  }

  // Add additional safety checks
  if (typeof window === 'undefined' || !window.location) {
    console.log('Navigation blocked: window or location not available');
    return;
  }
  
  // Use requestAnimationFrame to ensure we're in a render cycle
  requestAnimationFrame(() => {
    console.log('Scheduling navigation to:', path);
    
    // Use a shorter timeout since we're already in RAF
    setTimeout(() => {
      try {
        if (window.location.pathname !== path) {
          console.log('Executing navigation to:', path);
          window.location.href = path;
        } else {
          console.log('Already at path:', path);
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }, 100);
  });
};

export const navigateToHome = () => safeNavigate('/quiz-setup');
export const navigateToLogin = () => safeNavigate('/');
export const navigateToProfile = () => safeNavigate('/profile');
export const navigateToPastAttempts = () => safeNavigate('/past-attempts');
export const navigateToQuizSetup = () => safeNavigate('/quiz-setup');

// Function to handle auth redirects
export const handleAuthRedirect = () => {
  if (!isClient()) return false;

  try {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    
    if (!token && currentPath !== '/') {
      navigateToLogin();
      return true;
    } else if (token && currentPath === '/') {
      navigateToHome();
      return true;
    }
  } catch (error) {
    console.error('Auth redirect error:', error);
  }
  
  return false;
};
