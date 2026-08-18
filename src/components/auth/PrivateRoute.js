'use client';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { user, loading, initialized } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!initialized || loading) return;

    if (!user) {
      // Store the current path for redirect after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_redirect', pathname);
      }
      router.replace('/login');
    }
  }, [user, loading, initialized, pathname, router]);

  // Show loading spinner while auth is initializing or loading
  if (!initialized || loading) {
    return <LoadingSpinner fullScreen text="loading..." />;
  }

  // If not authenticated, render nothing while the redirect happens
  if (!user) {
    return null;
  }

  // Render child content
  return <>{children}</>;
};

export default PrivateRoute;