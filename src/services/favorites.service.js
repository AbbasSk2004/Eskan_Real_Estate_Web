import api from './axiosClient';

// Add favorites cache configuration
const FAVORITES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const favoritesCache = new Map();

// Get the current user's favorite properties
export const getUserFavorites = async () => {
try {
// Check if user is authenticated
const isLoggedIn = typeof window !== 'undefined' && !!sessionStorage.getItem('user');
if (!isLoggedIn) {
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
};

// Remove a property from the user's favorites
export const removeFavorite = async (propertyId) => {
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
};