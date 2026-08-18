import api from './axiosClient';

// Submit the public contact form
export const submitContactForm = (formData) => api.post('/contact', formData);