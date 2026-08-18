import axios from 'axios';

// Default API URL (must come from env — no fallback)
const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance. Credentials (HttpOnly cookies) are sent with every
// request — tokens are never stored in JS-accessible storage. The
// X-Requested-With header is the CSRF defense: the backend rejects any
// state-changing request that does not carry it.
const api = axios.create({
  baseURL: DEFAULT_API_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Add these variables at the top of the file, after the imports
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

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
  '/faqs',
  '/faqs/featured',
  '/faqs/category/*',
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

const isPublicEndpoint = (url) => {
  const urlWithoutParams = url.split('?')[0];
  return publicEndpoints.some(endpoint => {
    if (endpoint.includes('*')) {
      const pattern = endpoint.replace(/\*/g, '[^/]+').replace(/\//g, '\\/');
      return new RegExp(`^${pattern}`).test(urlWithoutParams);
    }
    return urlWithoutParams === endpoint || urlWithoutParams.startsWith(endpoint + '/');
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

// Response interceptor: transparently refresh the session on 401 using the
// HttpOnly refresh cookie. No token handling is needed client-side.
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
        isPublicEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Handle 401 errors (Unauthorized)
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      // If we're already refreshing, add this request to the queue
      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          return api(originalRequest);
        } catch (err) {
          window.dispatchEvent(new CustomEvent('auth-state-change', {
            detail: { isAuthenticated: false }
          }));
          return Promise.reject(err);
        }
      }

      isRefreshing = true;

      try {
        const response = await api.post('/auth/refresh');
        if (response.data?.success) {
          processQueue(null);
          return api(originalRequest);
        }
        throw new Error('Failed to refresh token');
      } catch (refreshError) {
        processQueue(refreshError);
        // Notify about auth state change
        window.dispatchEvent(new CustomEvent('auth-state-change', {
          detail: { isAuthenticated: false }
        }));
        return Promise.reject(refreshError);
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

export { checkHealth };
export default api;