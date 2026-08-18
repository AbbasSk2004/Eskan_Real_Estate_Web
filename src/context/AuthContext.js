'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import authService from '../services/auth';
import { toast } from 'react-toastify';
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  // NOTE: starts `null` on BOTH server and client. Reading sessionStorage in a
  // useState initializer makes the first client render differ from the server
  // HTML (hydration mismatch). The mount effect below restores the stored user
  // right after hydration via updateUserState().
  const [user, setUser] = useState(null);
  const initializationRef = useRef(false);

  // Function to handle user state update
  const updateUserState = useCallback((userData) => {
    if (userData) {
      setUser(userData);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('user', JSON.stringify(userData));
        // Mirrors storeUser(): marks that a session exists so other tabs (and
        // later visits) know to verify the cookie instead of skipping it.
        localStorage.setItem('has_session', '1');
      }
    } else {
      setUser(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('provider');
        // Without this, an expired session would keep re-probing /auth/verify
        // on every page load forever.
        localStorage.removeItem('has_session');
      }
    }
  }, []);

  // Regular login function
  const login = async (email, password, remember = true) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password, remember);
      if (response.success) {
        updateUserState(response.user);

        // Explicitly update status to active after successful login
        try {
          await authService.updateStatus('active');
        } catch (statusError) {
          console.error('Failed to update status to active:', statusError);
          // Non-blocking - continue with login process
        }
        
        return response;
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      console.error('Login error:', err);
      const message = err?.response?.data?.message || err.message;
      setError(message);
      toast.error(message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google login function
  const socialLogin = async (provider = 'google') => {
    setError('Google sign-in is not available');
    toast.error('Google sign-in is not available');
    throw new Error('Google sign-in is not available');
  };

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call the logout endpoint first
      await authService.logout();
      
      // authService.logout() already attempted to mark the user inactive.
      // We skip an additional request here to avoid duplicate /auth/update-status
      // calls that can trigger warnings once the token is invalidated.
      
      // Clear any cached data
      if (window.localStorage) {
        // Clear profile data
        window.localStorage.removeItem('profile_data');
        // Clear any other cached data
        window.localStorage.removeItem('user_properties');
        window.localStorage.removeItem('user_favorites');
      }
      
      // Update user state
      updateUserState(null);
      
      // Clear any error state
      setError(null);
      
      // Dispatch an event to notify other components
      window.dispatchEvent(new CustomEvent('auth-state-change', {
        detail: { isAuthenticated: false }
      }));
      
      // Navigate to login page
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if the logout request fails, clear local data
      updateUserState(null);
      setError(err.message);
      toast.error('Failed to logout');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router, updateUserState]);

  // Initialize auth state
  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    const initAuth = async () => {
      try {
        // Session identity lives in HttpOnly cookies; the stored user object
        // is just non-sensitive UI data (name/avatar/role).
        const storedUserData = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;
        const storedUser = storedUserData ? JSON.parse(storedUserData) : null;

        // Restore the stored session synchronously BEFORE any await so the very
        // first post-hydration paint shows the logged-in UI — no guest flash
        // while the session is being verified in the background.
        if (storedUser) {
          updateUserState(storedUser);
        }

        // Verify the HttpOnly cookie server-side (rotates via /auth/refresh
        // when the access cookie has expired). Skipped for visitors who have
        // never logged in — they have no cookie to verify, so the request could
        // only ever 401 and spam the console.
        if (authService.hasSessionHint()) {
          const sessionUser = await authService.restoreSession();
          if (sessionUser) {
            updateUserState(sessionUser);
          } else {
            // No valid session, clear any stale data
            updateUserState(null);
          }
        } else {
          updateUserState(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
        updateUserState(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [updateUserState]);

  // Whenever authentication state becomes active, mark profile status as active
  useEffect(() => {
    // Only after session verification completes (initialized) — the optimistic
    // sessionStorage restore fires this effect with possibly-expired cookies,
    // which caused 401s from /auth/update-status on every page load.
    if (user && initialized && typeof window !== 'undefined') {
      // Update active status silently (no need to await)
      import('../services/auth').then(({ default: authService }) => {
        authService.updateStatus?.('active');
      }).catch(() => {
        // ignore import errors
      });
    }
  }, [user, initialized]);

  const value = {
    user,
    loading,
    error,
    initialized,
    isInitializing: !initialized,
    isAuthenticated: !!user,
    login,
    logout,
    socialLogin,
    updateUserState
  };

  // Only show loading spinner if we're not initialized and don't have a valid user
  if (!initialized && loading && !user) {
    return <LoadingSpinner fullScreen text="Initializing authentication..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;