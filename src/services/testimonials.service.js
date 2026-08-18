import api from './axiosClient';

// Get all testimonials
export const getTestimonials = async () => {
  try {
    const response = await api.get('/testimonials', {
      validateStatus: (status) => status === 200 || status === 401
    });
    return response.status === 401 ? { success: true, data: [] } : response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return { success: true, data: [] };
  }
};

// Submit a new testimonial (requires authentication)
export const createTestimonial = async (data) => {
try {
// Session identity lives in HttpOnly cookies
const isLoggedIn = typeof window !== 'undefined' && !!sessionStorage.getItem('user');
if (!isLoggedIn) {
throw new Error('Please log in to submit your testimonial.');
}

const response = await api.post('/testimonials', data);
return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Please log in to submit your testimonial.');
    } else if (error.response?.status === 409) {
      throw new Error('You have already submitted a testimonial.');
    }
    throw error;
  }
};

// Check whether the current user has already submitted a testimonial
export const checkUserTestimonial = async () => {
try {
const isLoggedIn = typeof window !== 'undefined' && !!sessionStorage.getItem('user');
if (!isLoggedIn) {
return { success: true, exists: false };
}

const response = await api.get('/testimonials/check', {
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
};