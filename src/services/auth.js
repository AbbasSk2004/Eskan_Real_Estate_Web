import api from './api';


const getApiBaseUrl = () => process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.refreshTokenTimeout = null;
    this.isRefreshing = false;
    this.refreshSubscribers = [];

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
   * This helper is reused by the different lifecycle handlers.
   */
  async updateStatus(status = 'active') {
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
      if (!token) return;

      // Use sendBeacon for inactive status (often called during unload)
      const endpoint = `${getApiBaseUrl()}/auth/update-status`;
      if (status === 'inactive' && navigator.sendBeacon) {
        const payload = { status, token }; // backend can read the token from the body
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(endpoint, blob);
        return;
      }

      // Fallback to fetch for active status or if sendBeacon is not available
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  onRefreshed(token) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  subscribeTokenRefresh(callback) {
    this.refreshSubscribers.push(callback);
  }

  async initializeTokenRefresh() {
    const hasToken = typeof window !== 'undefined' ? !!sessionStorage.getItem('access_token') : false;
    if (!hasToken) {
      const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('refresh_token') : null;
      if (refreshToken) {
        try {
          await this.refreshToken();
        } catch (error) {
          return false;
        }
      } else {
        return false;
      }
    }

    const response = await this.verifyToken();
    if (response?.success) {
      if (response.user && typeof window !== 'undefined') {
        sessionStorage.setItem('user', JSON.stringify(response.user));
      }
      return true;
    }
    return false;
  }

  isAuthenticated() {
    const hasToken = typeof window !== 'undefined' ? !!sessionStorage.getItem('access_token') : false;
    return hasToken && !!this.getCurrentUser();
  }

  startRefreshTokenTimer(expiresIn) {
    this.stopRefreshTokenTimer();
    const timeout = (expiresIn - 60) * 1000;
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken(), timeout);
  }

  stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  async refreshToken() {
    const refreshToken = typeof window !== 'undefined' ? sessionStorage.getItem('refresh_token') : null;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const userData = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;
    const user = userData ? JSON.parse(userData) : null;
    const userId = user?.id || user?._id;

    const response = await api.post('/auth/refresh', { refresh_token: refreshToken, userId });
    if (response.data?.success) {
      const { access_token, refresh_token } = response.data;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('access_token', access_token);
        if (refresh_token) {
          sessionStorage.setItem('refresh_token', refresh_token);
        }
      }
      return response.data;
    }
    throw new Error('Failed to refresh token');
  }

  async login(email, password, remember = true) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.success) {
      const { user, session } = response.data;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('provider', 'backend');
        sessionStorage.setItem('access_token', session.access_token);
        if (session.refresh_token) {
          sessionStorage.setItem('refresh_token', session.refresh_token);
        }
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      // Mark user as active right after storing the session so that the
      // status is updated even before React context effects run.
      try {
        await this.updateStatus('active');
      } catch (_) {
        // Non-blocking – avoid failing the login flow due to a status hiccup.
      }

      return { success: true, user, token: session.access_token };
    }
    throw new Error(response.data?.message || 'Login failed');
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.success) {
      const { user, session } = response.data;
      if (typeof window !== 'undefined') {
        // Always set the auth provider so we know the origin of authentication
        sessionStorage.setItem('provider', 'backend');

        // Only attempt to save tokens if a session object with tokens is provided
        if (session && session.access_token) {
          sessionStorage.setItem('access_token', session.access_token);
          if (session.refresh_token) {
            sessionStorage.setItem('refresh_token', session.refresh_token);
          }
        }

        // Store the user data (this is useful even before verification)
        if (user) {
          sessionStorage.setItem('user', JSON.stringify(user));
        }
      }

      // Return success payload – token may be undefined when email verification is required
      return { success: true, user, token: session?.access_token };
    }
    throw new Error(response.data?.message || 'Registration failed');
  }

  async logout() {
    try {
      // Only attempt to call the logout endpoint if we have a valid token
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
      if (token) {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          // Silently handle logout API errors
          console.log('Logout API call failed, continuing with local logout');
        }
      }
    } finally {
      // Always clear local storage regardless of API call success
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('provider');
      }
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
      // If verification is successful and we get back user and session data, store it
      if (response.data.user && response.data.session && typeof window !== 'undefined') {
        sessionStorage.setItem('provider', 'backend');
        sessionStorage.setItem('access_token', response.data.session.access_token);
        if (response.data.session.refresh_token) {
          sessionStorage.setItem('refresh_token', response.data.session.refresh_token);
        }
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
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
    let token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
    if (!token) {
      throw new Error('No token available');
    }

    const response = await api.get('/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data?.success) {
      if (response.data.user && typeof window !== 'undefined') {
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
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