import api from './axiosClient';

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const clearStoredSession = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('provider');
};

const storeUser = (user) => {
  if (!user || typeof window === 'undefined') return;
  const normalizedUser = {
    ...user,
    id: user?.id || user?._id
  };
  sessionStorage.setItem('provider', 'backend');
  sessionStorage.setItem('user', JSON.stringify(normalizedUser));
  return normalizedUser;
};

class AuthService {
  constructor() {
    this.refreshTokenTimeout = null;

    // Bind event handlers to ensure `this` refers to the class instance
    this.handleUserLeaving = this.handleUserLeaving.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleWindowFocus = this.handleWindowFocus.bind(this);

    // Add event listeners for tab/browser close to update status
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.handleUserLeaving);
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      // When the window gains focus again (e.g., user returns), mark user active
      window.addEventListener('focus', this.handleWindowFocus);
    }
  }

  /**
   * Update the user's online status on the backend.
   * Authentication is carried by the HttpOnly cookie automatically.
   */
  async updateStatus(status = 'active') {
    try {
      if (!this.isAuthenticated()) return;

      // Use sendBeacon for inactive status (often called during unload);
      // the HttpOnly cookie is sent along with the beacon request.
      const endpoint = `${getApiBaseUrl()}/auth/update-status`;
      if (status === 'inactive' && navigator.sendBeacon) {
        const payload = { status };
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
        return;
      }

      // Fallback to fetch for active status or if sendBeacon is not available
      await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ status }),
        keepalive: true
      });
    } catch (err) {
      // Silent failure – don't block UX because of status update issues
      console.error('Error updating user status:', err);
    }
  }

  // Handle tab/browser close
  async handleUserLeaving() {
    if (this.isAuthenticated()) {
      // Use sendBeacon-friendly approach inside updateStatus
      this.updateStatus('inactive');
    }
  }

  // Handle tab visibility change (user switching tabs)
  handleVisibilityChange() {
    if (!this.isAuthenticated()) return;

    if (document.visibilityState === 'hidden') {
      // User moved away from the tab
      this.updateStatus('inactive');
    } else if (document.visibilityState === 'visible') {
      // User switched back to the tab
      this.updateStatus('active');
    }
  }

  // Additional handler for window focus (covers some browsers)
  handleWindowFocus() {
    if (this.isAuthenticated()) {
      this.updateStatus('active');
    }
  }

  /**
   * Restore the session on app load: verify the HttpOnly access cookie and,
   * if it has expired, rotate it through /auth/refresh. Returns the user or
   * null when there is no valid session.
   */
  async restoreSession() {
    try {
      const response = await api.get('/auth/verify');
      if (response.data?.success) {
        storeUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch (verifyError) {
      try {
        const refreshResponse = await api.post('/auth/refresh');
        if (refreshResponse.data?.success) {
          storeUser(refreshResponse.data.user);
          return refreshResponse.data.user;
        }
        return null;
      } catch (refreshError) {
        return null;
      }
    }
  }

  async initializeTokenRefresh() {
    const user = await this.restoreSession();
    return !!user;
  }

  isAuthenticated() {
    return typeof window !== 'undefined' && !!sessionStorage.getItem('user');
  }

  startRefreshTokenTimer() {
    // Refresh is handled transparently by the axios response interceptor.
  }

  stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }

  async refreshToken() {
    const response = await api.post('/auth/refresh');
    if (response.data?.success) {
      storeUser(response.data.user);
      return response.data;
    }
    throw new Error('Failed to refresh token');
  }

  async login(email, password, remember = true) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.success) {
      const user = storeUser(response.data.user);

      // Mark user as active right after storing the session so that the
      // status is updated even before React context effects run.
      try {
        await this.updateStatus('active');
      } catch (_) {
        // Non-blocking – avoid failing the login flow due to a status hiccup.
      }

      return { success: true, user };
    }
    throw new Error(response.data?.message || 'Login failed');
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.success) {
      // Store the user data (this is useful even before verification);
      // tokens live in HttpOnly cookies set by the backend.
      if (response.data.user) {
        storeUser(response.data.user);
      }
      return { success: true, user: response.data.user, verificationRequired: response.data.verificationRequired };
    }
    throw new Error(response.data?.message || 'Registration failed');
  }

  async logout() {
    try {
      // The backend clears the HttpOnly cookies server-side.
      await api.post('/auth/logout');
    } catch (error) {
      // Silently handle logout API errors
      console.log('Logout API call failed, continuing with local logout');
    } finally {
      // Always clear local data regardless of API call success
      clearStoredSession();
    }
  }

  async verifyEmail(token) {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  }

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(email, otp, newPassword) {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  }

  async verifyOTP(email, token) {
    const response = await api.post('/auth/verify-otp', { email, token });
    if (response.data?.success) {
      if (response.data.user) {
        storeUser(response.data.user);
      }
      return response.data;
    }
    throw new Error(response.data?.message || 'OTP verification failed');
  }

  async resendOTP(email) {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  }

  async verifyToken() {
    const response = await api.get('/auth/verify');
    if (response.data?.success) {
      if (response.data.user) {
        storeUser(response.data.user);
      }
      return response.data;
    }
    throw new Error(response.data?.message || 'Token verification failed');
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}

export default new AuthService();