import { useState, useEffect, useRef, useCallback } from 'react';
import { endpoints } from '../services/api';

import { useAuth } from '../context/AuthContext';

export const useProfilePolling = (interval = 10000) => {
  const { isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem('profileData');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isManualUpdateRef = useRef(false);
  const initialFetchDone = useRef(false);

  const fetchProfile = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        setLoading(true);
      }
      setError(null);

      const response = await endpoints.profile.get();
      if (response?.data?.success && response?.data?.data) {
        const newProfileData = response.data.data;
        setProfileData(newProfileData);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('profileData', JSON.stringify(newProfileData));
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err);
      setProfileData(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('profileData');
      }
    } finally {
      if (isManual) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Don't poll if not authenticated
    if (!isAuthenticated) {
      setProfileData(null);
      setError(null);
      return;
    }

    // Fetch strictly once per mount sequence
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchProfile(false);
    }

    // Set up polling interval
    const pollInterval = setInterval(() => fetchProfile(false), interval);

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval);
    };
  }, [fetchProfile, interval, isAuthenticated]);

  // Function for manual profile refresh
  const refreshProfile = async () => {
    isManualUpdateRef.current = true;
    try {
      await fetchProfile(true);
    } finally {
      isManualUpdateRef.current = false;
    }
  };

  return {
    profileData,
    loading: loading && isManualUpdateRef.current, // Only show loading for manual updates
    error,
    refreshProfile
  };
}; 