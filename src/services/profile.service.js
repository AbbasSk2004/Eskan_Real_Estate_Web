import api from './axiosClient';

// Get the current user's profile
export const getProfile = () => api.get('/profile', {
  validateStatus: (status) => status === 200,
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache'
  }
});

// Update the current user's profile (FormData: fields + profile image)
export const updateProfile = (formData) => {
  // Ensure proper handling of FormData
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    validateStatus: (status) => status === 200
  };
  return api.put('/profile', formData, config);
};