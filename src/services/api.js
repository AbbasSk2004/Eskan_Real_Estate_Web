import axios from 'axios';
import similarPropertiesService from './similar_properties';

const getSessionItem = (key) => {
  if (typeof window === 'undefined' || !window?.sessionStorage) return null;
  return window.sessionStorage.getItem(key);
};

const setSessionItem = (key, value) => {
  if (typeof window === 'undefined' || !window?.sessionStorage || value == null) return;
  window.sessionStorage.setItem(key, value);
};

const removeSessionItem = (key) => {
  if (typeof window === 'undefined' || !window?.sessionStorage) return;
  window.sessionStorage.removeItem(key);
};

const getAccessToken = () => getSessionItem('access_token');
const getRefreshToken = () => getSessionItem('refresh_token');
const setTokens = (accessToken, refreshToken) => {
  if (accessToken) setSessionItem('access_token', accessToken);
  if (refreshToken) setSessionItem('refresh_token', refreshToken);
};

const clearAuthSession = () => {
  removeSessionItem('access_token');
  removeSessionItem('refresh_token');
  removeSessionItem('user');
};

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();
const pendingRequests = new Map();

// Debounce configuration
const DEBOUNCE_DELAY = 300; // 300ms
const debounceTimers = new Map();

// Add view count cache
const viewCountCache = new Map();
const VIEW_COUNT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add favorites cache configuration
const FAVORITES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const favoritesCache = new Map();

// Add these variables at the top of the file, after the imports
let isRefreshing = false;
let failedQueue = [];
let lastRefreshTime = 0;
const MIN_REFRESH_INTERVAL = 30000; // Minimum 30 seconds between refreshes

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Default API URL (env var or local dev fallback)
const DEFAULT_API_URL =
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Special configuration for map-related requests (uses same backend URL)
const mapApi = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 30000, // 30 seconds timeout for map operations
  headers: {
    'Content-Type': 'application/json'
  }
});

// List of public endpoints that don't require authentication
const publicEndpoints = [
  '/properties',
  '/properties/',
  '/properties/recommended',
  '/properties/featured',
  '/properties/*/views/count',
  '/properties/*/views',
  '/properties/*',  // Individual property endpoints (but not user-specific ones)
  '/health',
  '/health/check',
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/contact',
  '/property-views',
  '/property-views/',
  '/property-views/*',
  '/property-views/count',
  '/property-views/*/count',
  '/property-views/user',
  '/recommendations',
  '/recommendations/*',
  '/agents',
  '/agents/',
  '/agents/featured',
  '/agents/*',
  '/faqs',
  '/faqs/featured',
  '/faqs/category/*',
  '/blogs',
  '/blogs/featured',
  '/blogs/*',
  '/similar-properties/*',
  '/api/health',
  '/api/health/check',
  '/auth/check-connection',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/testimonials',
  '/testimonials/',
  '/testimonials/featured',
  '/testimonials/*',
  '/testimonials/check',  // Add testimonial check endpoint
  '/maps/extract-coordinates',
  '/maps/geocode',
  '/maps/health',
  '/typepage/*',  // Add type page endpoints
  '/typepage'
];

// Endpoints that should be cached
const CACHEABLE_ENDPOINTS = [
  '/properties',
  '/properties/featured',
  '/properties/recommended',
  '/properties/*/views/count',
  '/similar-properties/*',
  '/agents',  // Add agents endpoint to cache
  '/typepage/*', // Add typepage to cacheable endpoints
  '/agents/featured'  // Add featured agents endpoint to cache
];

// Helper function to check if URL should be cached
const shouldCacheRequest = (url) => {
  return CACHEABLE_ENDPOINTS.some(pattern => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]+') + '$');
    return regex.test(url);
  });
};

// Helper function to get cached response
const getCachedResponse = (cacheKey) => {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Helper function to set cached response
const setCachedResponse = (cacheKey, data) => {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
};

// Add error handling utility
const handleError = (error, customMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  // Check if error is an axios error with response
  if (error.response) {
    const { status, data } = error.response;
    
    // Handle specific status codes
    switch (status) {
      case 400:
        return {
          error: 'bad_request',
          message: data.message || 'Invalid request',
          status
        };
      case 401:
        return {
          error: 'unauthorized',
          message: 'Please login to continue',
          status
        };
      case 403:
        return {
          error: 'forbidden',
          message: 'You do not have permission to perform this action',
          status
        };
      case 404:
        return {
          error: 'not_found',
          message: data.message || 'Resource not found',
          status
        };
      case 429:
        return {
          error: 'rate_limit',
          message: 'Too many requests, please try again later',
          status
        };
      case 500:
        return {
          error: 'server_error',
          message: 'Internal server error',
          status
        };
      default:
        return {
          error: 'unknown',
          message: customMessage,
          status: status || 500
        };
    }
  }

  // Handle network errors
  if (error.request) {
    return {
      error: 'network_error',
      message: 'Network error, please check your connection',
      status: 0
    };
  }

  // Handle other errors
  return {
    error: 'unknown',
    message: customMessage,
    status: 500
  };
};

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    // Don't intercept refresh token requests
    if (config.url === '/auth/refresh') {
      return config;
    }

    // Remove query parameters for endpoint matching
    const urlWithoutParams = config.url.split('?')[0];

    // Check if the endpoint is public by matching against patterns
    const isPublicEndpoint = publicEndpoints.some(endpoint => {
      // Convert endpoint pattern to regex if it contains *
      if (endpoint.includes('*')) {
        const pattern = endpoint.replace(/\*/g, '[^/]+').replace(/\//g, '\\/');
        return new RegExp(`^${pattern}`).test(urlWithoutParams);
      }
      // Check if the URL starts with the endpoint pattern (to handle query params)
      return urlWithoutParams === endpoint || urlWithoutParams.startsWith(endpoint + '/');
    });

    // Special handling for user-specific endpoints that should require authentication
    const userSpecificEndpoints = [
      '/properties/user/properties',
      '/favorites/user',
      '/favorites/*/status',
      '/favorites/*',
      '/profile',
      '/notifications',
      '/chat/conversations',
      '/chat/messages',
      '/agents/applications',
      '/agents/applications/details',
      '/property-views/user/total',
      '/property-views/user'
    ];

    const isUserSpecificEndpoint = userSpecificEndpoints.some(endpoint => {
      if (endpoint.includes('*')) {
        const pattern = endpoint.replace(/\*/g, '[^/]+').replace(/\//g, '\\/');
        return new RegExp(`^${pattern}`).test(urlWithoutParams);
      }
      return urlWithoutParams === endpoint || urlWithoutParams.startsWith(endpoint + '/');
    });

    // If it's a user-specific endpoint, always require authentication
    if (isUserSpecificEndpoint) {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error('Authentication required');
      }
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    }

    // If it's a public endpoint, return config without token
    if (isPublicEndpoint) {
      return config;
    }

    // Get the access token
    let accessToken = getAccessToken();

    // If no access token and not a public endpoint, throw authentication error
    if (!accessToken) {
      throw new Error('Authentication required');
    }

    // Add the token to the request header
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if:
    // 1. There's no config (i.e., the request wasn't made)
    // 2. We've already retried this request
    // 3. This is a refresh token request
    // 4. This is a public endpoint
    if (!originalRequest || 
        originalRequest._retry || 
        originalRequest.url === '/auth/refresh' ||
        publicEndpoints.some(endpoint => originalRequest.url.includes(endpoint))) {
      return Promise.reject(error);
    }

    // Handle 401 errors (Unauthorized)
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      // If we're already refreshing, add this request to the queue
      if (isRefreshing) {
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (err) {
          // Clear auth state on refresh failure
          clearAuthSession();
          // Notify about auth state change
          window.dispatchEvent(new CustomEvent('auth-state-change', {
            detail: { isAuthenticated: false }
          }));
          return Promise.reject(err);
        }
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
        if (response.data?.success) {
          const { access_token, refresh_token } = response.data;
          setTokens(access_token, refresh_token);

          // Update the failed requests with new token
          processQueue(null, access_token);

          // Update the current request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
        throw new Error('Failed to refresh token');
      } catch (error) {
        processQueue(error, null);
        // Clear auth state
        clearAuthSession();
        // Notify about auth state change
        window.dispatchEvent(new CustomEvent('auth-state-change', {
          detail: { isAuthenticated: false }
        }));
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Health check function
const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return {
      success: true,
      data: response.data,
      message: 'API server is healthy'
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      success: false,
      error: handleError(error, 'API server health check failed'),
      message: 'API server is not responding'
    };
  }
};

// Update the health object in the endpoints export
const health = {
  check: checkHealth
};

// Health check endpoint
const healthCheck = {
  check: () => api.get('/health', { timeout: 5000 })
};

// Auth endpoints
const auth = {
  verifyToken: () => api.get('/auth/verify'),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refresh_token) => api.post('/auth/refresh', { refresh_token }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: ({ email, otp, newPassword }) => api.post('/auth/reset-password', { 
    email, 
    otp, 
    newPassword 
  })
};

// Profile endpoints
const profile = {
  get: () => api.get('/profile', {
    validateStatus: (status) => status === 200,
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    }
  }),
  update: (formData) => {
    // Ensure proper handling of FormData
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      validateStatus: (status) => status === 200
    };
    return api.put('/profile', formData, config);
  }
};

// Property endpoints
const properties = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  getPropertyById: (id) => api.get(`/properties/${id}`),
  getFeatured: () => api.get('/properties/featured'),
  getRecommended: () => api.get('/properties/recommended'),
  create: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'features' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });
    return api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'features' && typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });
    return api.put(`/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/properties/${id}`),
  getUserProperties: async () => {
    try {
      // Check if user is authenticated
      const accessToken = getAccessToken();
      if (!accessToken) {
        return { success: true, data: [] };
      }

      const response = await api.get('/properties/user/properties', {
        validateStatus: (status) => status === 200 || status === 401
      });

      // If unauthorized, return empty array
      if (response.status === 401) {
        return { success: true, data: [] };
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user properties:', error);
      if (error.response?.status === 401) {
        return { success: true, data: [] };
      }
      throw error;
    }
  },
  addToFavorites: async (propertyId) => {
    const response = await api.post(`/favorites/${propertyId}`, null, {
      timeout: 10000
    });

    // Update cache
    if (response?.data?.success) {
      const cacheKey = `favorite_status_${propertyId}`;
      favoritesCache.set(cacheKey, {
        data: { success: true, isFavorited: true },
        timestamp: Date.now()
      });
    }

    return response.data;
  },
  removeFromFavorites: async (propertyId) => {
    const response = await api.delete(`/favorites/${propertyId}`, {
      timeout: 10000
    });

    // Update cache
    if (response?.data?.success) {
      const cacheKey = `favorite_status_${propertyId}`;
      favoritesCache.set(cacheKey, {
        data: { success: true, isFavorited: false },
        timestamp: Date.now()
      });
    }

    return response.data;
  },
  getFavorites: async () => {
    try {
      // Check if user is authenticated
      const accessToken = getAccessToken();
      if (!accessToken) {
        return { success: true, data: [] };
      }

      const response = await api.get('/favorites/user', {
        validateStatus: (status) => status === 200 || status === 401
      });

      // If unauthorized, return empty array
      if (response.status === 401) {
        return { success: true, data: [] };
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      if (error.response?.status === 401) {
        return { success: true, data: [] };
      }
      throw error;
    }
  },
  checkFavoriteStatus: async (propertyId) => {
    try {
      // Check cache first
      const cacheKey = `favorite_status_${propertyId}`;
      const cached = favoritesCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < FAVORITES_CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get(`/favorites/${propertyId}/status`, {
        timeout: 5000 // Reduce timeout to 5 seconds for status checks
      });

      // Cache the result
      if (response?.data?.success) {
        favoritesCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }

      return response.data;
    } catch (error) {
      // Return cached data on error if available
      const cacheKey = `favorite_status_${propertyId}`;
      const cached = favoritesCache.get(cacheKey);
      if (cached) {
        return cached.data;
      }

      // Default response if no cache available
      return {
        success: true,
        isFavorited: false
      };
    }
  },
  getPropertyReviews: (propertyId, params) => api.get(`/properties/${propertyId}/reviews`, { params }),
  addPropertyReview: (propertyId, data) => api.post(`/properties/${propertyId}/reviews`, data),
  updatePropertyReview: (propertyId, reviewId, data) => api.put(`/properties/${propertyId}/reviews/${reviewId}`, data),
  deletePropertyReview: (propertyId, reviewId) => api.delete(`/properties/${propertyId}/reviews/${reviewId}`),
  getSimilarProperties: async (propertyId, limit = 4) => {
    // Use the dedicated similar properties service
    return similarPropertiesService.getSimilarProperties(propertyId, limit);
  }
};

// Property views endpoints
const propertyViews = {
  recordView: async (propertyId) => {
    // Defensive guard: avoid calling backend with undefined or invalid IDs
    if (!propertyId) {
      return { success: true, data: { count: 0 } };
    }

    try {
      const response = await api.post(`/property-views/${propertyId}`, {}, {
        // Don't require authentication for view recording
        validateStatus: (status) => status === 200 || status === 201 || status === 401
      });

      // If unauthorized, still consider it a success but don't show error
      if (response.status === 401) {
        return { success: true, data: { count: 0 } };
      }

      return response.data;
    } catch (error) {
      console.error('Error recording view:', error);
      // Return a non-error response to prevent UI disruption
      return { success: true, data: { count: 0 } };
    }
  },

  getViewCount: async (propertyId) => {
    // Defensive guard: avoid calling backend with undefined IDs
    if (!propertyId) {
      return 0;
    }

    try {
      const response = await api.get(`/property-views/${propertyId}/count`, {
        validateStatus: (status) => status === 200 || status === 404 || status === 401
      });
      
      // If property not found, unauthorized, or no views yet, return 0
      if (response.status === 404 || response.status === 401 || !response.data?.data?.count) {
        return 0;
      }
      
      return response.data.data.count;
    } catch (error) {
      console.error('Error getting view count:', error);
      return 0; // Return 0 on error instead of throwing
    }
  },

  getUserTotalViews: async () => {
    try {
      // Check if user is authenticated
      const accessToken = getAccessToken();
      if (!accessToken) {
        return {
          success: true,
          data: { total: 0 }
        };
      }

      const response = await api.get('/property-views/user/total', {
        validateStatus: (status) => status === 200 || status === 401
      });
      
      // If unauthorized, return 0 views
      if (response.status === 401) {
        return {
          success: true,
          data: { total: 0 }
        };
      }
      
      // Ensure we return the correct structure
      if (response.data && typeof response.data === 'object') {
        return {
          success: true,
          data: {
            total: response.data.data?.total || response.data.total || 0
          }
        };
      }
      
      return {
        success: true,
        data: { total: 0 }
      };
    } catch (error) {
      console.error('Error getting total views:', error);
      // Return 0 views on error
      return {
        success: true,
        data: { total: 0 }
      };
    }
  },

  clearCache: (propertyId) => {
    if (propertyId) {
      viewCountCache.delete(propertyId);
    } else {
      viewCountCache.clear();
    }
  }
};

// Testimonials endpoints
const testimonials = {
  getAll: async () => {
    try {
      const response = await api.get('/testimonials', {
        validateStatus: (status) => status === 200 || status === 401
      });
      return response.status === 401 ? { success: true, data: [] } : response.data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return { success: true, data: [] };
    }
  },
  create: async (data) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Please log in to submit your testimonial.');
      }

      const response = await api.post('/testimonials', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Please log in to submit your testimonial.');
      } else if (error.response?.status === 409) {
        throw new Error('You have already submitted a testimonial.');
      }
      throw error;
    }
  },
  getApproved: async () => {
    try {
      const response = await api.get('/testimonials/approved', {
        validateStatus: (status) => status === 200 || status === 401
      });
      return response.status === 401 ? { success: true, data: [] } : response.data;
    } catch (error) {
      console.error('Error fetching approved testimonials:', error);
      return { success: true, data: [] };
    }
  },
  getFeatured: async () => {
    try {
      const response = await api.get('/testimonials/featured', {
        validateStatus: (status) => status === 200 || status === 401
      });
      return response.status === 401 ? { success: true, data: [] } : response.data;
    } catch (error) {
      console.error('Error fetching featured testimonials:', error);
      return { success: true, data: [] };
    }
  },
  checkUserTestimonial: async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        return { success: true, exists: false };
      }

      const response = await api.get('/testimonials/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        validateStatus: (status) => status === 200 || status === 401
      });
      
      if (response.status === 401) {
        return { success: true, exists: false };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error checking user testimonial:', error);
      return { success: true, exists: false };
    }
  }
};

// Chat endpoints
const chat = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),
  sendMessage: (data) => api.post('/chat/messages', data),
  createConversation: (data) => api.post('/chat/conversations', data),
  markAsRead: (conversationId) => api.put(`/chat/messages/read/${conversationId}`)
};

// Notification endpoints
const notifications = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  getSettings: () => api.get('/notifications/settings'),
  updateSettings: (settings) => api.put('/notifications/settings', settings),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};

// Agent endpoints
const agents = {
  getAll: async () => {
    const cacheKey = '/agents';
    const cachedResponse = getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await api.get('/agents');
    
    if (response.data?.success) {
      setCachedResponse(cacheKey, response);
    }
    
    return response;
  },
  getFeatured: async () => {
    const cacheKey = '/agents/featured';
    const cachedResponse = getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await api.get('/agents/featured');
    
    if (response.data?.success) {
      setCachedResponse(cacheKey, response);
    }
    
    return response;
  },
  getById: (id) => api.get(`/agents/${id}`),
  apply: async (formData) => {
    try {
      const token = getAccessToken();
      const response = await api.post('/agents/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        timeout: 30000,
        validateStatus: (status) => status >= 200 && status < 300
      });

      return response;
    } catch (error) {
      console.error('Agent application error:', error);
      throw error;
    }
  },
  getApplicationDetails: async () => {
    try {
      const token = getAccessToken();
      const response = await api.get('/agents/applications/details', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      return response.data;
    } catch (error) {
      console.error('Get application details error:', error);
      if (error.response?.status === 404) {
        return { success: true, data: null };
      }
      throw error;
    }
  }
};

// Contact endpoints
const contact = {
  submit: (formData) => api.post('/contact', formData)
};

// Maps API functions
const maps = {
  extractCoordinates: (url) => mapApi.get(`/maps/extract-coordinates?url=${encodeURIComponent(url)}`),
  geocode: (address) => mapApi.get(`/maps/geocode?address=${encodeURIComponent(address)}`),
  health: () => api.get('/maps/health')
};

// FAQ endpoints
const faqs = {
  getAll: () => api.get('/faqs'),
  getFeatured: () => api.get('/faqs/featured'),
  getByCategory: (category) => api.get(`/faqs/category/${category}`),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`)
};

// Blog endpoints
const blogs = {
  getAll: (params) => api.get('/blogs', { params }),
  getRecent: () => api.get('/blogs/recent'),
  getBySlug: (slug) => api.get(`/blogs/${slug}`),
  create: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });
    return api.post('/blogs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });
    return api.put(`/blogs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/blogs/${id}`)
};

// Favorites endpoints with caching
const favorites = {
  getUserFavorites: async () => {
    try {
      const cacheKey = 'user_favorites';
      const cached = favoritesCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < FAVORITES_CACHE_DURATION) {
        return cached.data;
      }

      const response = await api.get('/favorites/user', {
        timeout: 10000
      });

      // Cache the result
      if (response?.data?.success) {
        favoritesCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
      }

      return response.data;
    } catch (error) {
      // Return cached data on error if available
      const cached = favoritesCache.get('user_favorites');
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  },

  clearCache: (propertyId = null) => {
    if (propertyId) {
      favoritesCache.delete(`favorite_status_${propertyId}`);
    } else {
      favoritesCache.clear();
    }
  }
};

// Add checkHealth method to the api object
api.checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return true;
  } catch (error) {
    console.error('Health check error:', error);
    return false;
  }
};

// Helper function to build full URL
const buildUrl = (path) => {
  if (typeof path === 'function') {
    return (...args) => `${api.defaults.baseURL}${path(...args)}`;
  }
  return `${api.defaults.baseURL}${path}`;
};

// Update the endpoints export to use buildUrl
export const endpoints = {
  health: { check: checkHealth },
  auth: {
    login: buildUrl('/auth/login'),
    register: buildUrl('/auth/register'),
    logout: buildUrl('/auth/logout'),
    refresh: buildUrl('/auth/refresh'),
    verify: buildUrl('/auth/verify'),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data)
  },
  profile,
  properties,
  propertyViews,
  testimonials,
  chat,
  notifications,
  agents,
  contact,
  maps: {
    extractCoordinates: maps.extractCoordinates,
    geocode: maps.geocode,
    health: maps.health
  },
  faqs,
  blogs,
  favorites,
  similarProperties: {
    getSimilarProperties: similarPropertiesService.getSimilarProperties,
    clearCache: similarPropertiesService.clearCache
  }
};

export { checkHealth };
export default api;