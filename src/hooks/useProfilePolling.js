'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getProfile } from '../services/profile.service';

import { useAuth } from '../context/AuthContext';

export const useProfilePolling = () => {
  const { isAuthenticated } = useAuth();
  // NOTE: starts `null` on BOTH server and client. Reading sessionStorage in a
  // useState initializer makes the first client render differ from the server
  // HTML (hydration mismatch). Restore the cached profile post-hydration below.
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isManualUpdateRef = useRef(false);
  const initialFetchDone = useRef(false);

  // Restore the cached profile only after hydration so the first client
  // render always matches the server HTML.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('profileData');
    if (stored) {
      try {
        setProfileData(JSON.parse(stored));
      } catch (_) {
        sessionStorage.removeItem('profileData');
      }
    }
  }, []);

  const fetchProfile = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        setLoading(true);
      }
      setError(null);

      const response = await getProfile();
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

  // Baseline profile fetch — once per mount. All subsequent updates are
  // explicit (manual refresh after edits/uploads); no polling.
  useEffect(() => {
    if (!isAuthenticated) {
      setProfileData(null);
      setError(null);
      // Reset the one-shot guard so the baseline fetch re-runs after the
      // next login. The guard is per auth session, not per component mount
      // (this hook survives SPA login/logout transitions).
      initialFetchDone.current = false;
      return;
    }

    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchProfile(false);
    }
  }, [fetchProfile, isAuthenticated]);

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