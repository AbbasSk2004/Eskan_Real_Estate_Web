import api from './api';

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for client-side cache
const cache = new Map();

/**
 * Get similar properties for a specific property
 * @param {string} propertyId - The ID of the property to find similar properties for
 * @param {number} limit - Maximum number of similar properties to return (default: 4)
 * @returns {Promise<Array>} - Array of similar properties
 */
const getSimilarProperties = async (propertyId, limit = 4) => {
  if (!propertyId) {
    return { success: true, data: [] };
  }

  // Check cache first
  const cacheKey = `similar_properties_${propertyId}_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Make request to the backend "similar-properties" endpoint which uses basic filtering (no ML involved)
    const response = await api.get(`/similar-properties/${propertyId}`, {
      params: { limit },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 12000, // 12-second timeout for quicker failover
      validateStatus: status => (status >= 200 && status < 300) || status === 304
    });

    let result;
    if (response.status === 304) {
      // Use cached data if available when server responds 304 (Not Modified)
      if (cached) {
        return cached.data;
      }
      // Fallback to empty array if no cache yet
      result = { success: true, data: [], source: 'cache' };
    } else {
      result = {
        success: true,
        data: response.data?.data || [],
        source: response.data?.source || 'api'
      };
    }

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Error fetching similar properties:', error);

    // If we have a cached version, serve it instead of emptying the UI
    if (cached) {
      return cached.data;
    }

    return {
      success: false,
      error: 'Failed to fetch similar properties',
      data: []
    };
  }
};

/**
 * Clear the similar properties cache
 * @param {string} propertyId - Optional property ID to clear specific cache entry
 */
const clearCache = (propertyId = null) => {
  if (propertyId) {
    const cacheKey = `similar_properties_${propertyId}`;
    // Clear all cache entries for this property (with any limit)
    for (const key of cache.keys()) {
      if (key.startsWith(cacheKey)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Export as both named exports and default export
export { getSimilarProperties, clearCache };

export default {
  getSimilarProperties,
  clearCache
};
