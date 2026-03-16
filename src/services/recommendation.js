import api from './api';

// Constants for local storage
const USER_PREFERENCES_KEY = 'user_property_preferences';
const VIEWED_PROPERTIES_KEY = 'user_viewed_properties';
const MAX_STORED_VIEWS = 20;

// ------------------------------------------------------------
// Simple in-memory cache to avoid hammering the API every time
// ------------------------------------------------------------
const REC_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const recCache = new Map();

const getRecCacheKey = (userId, limit) => `${userId || 'guest'}_${limit}`;

const getCachedRecs = (userId, limit) => {
  const key = getRecCacheKey(userId, limit);
  const entry = recCache.get(key);
  if (entry && (Date.now() - entry.timestamp) < REC_CACHE_DURATION) {
    return entry.data;
  }
  return null;
};

const setCachedRecs = (userId, limit, data) => {
  recCache.set(getRecCacheKey(userId, limit), {
    data,
    timestamp: Date.now()
  });
};

// ------------------------------------------------------------
// Deduplicate concurrent requests for the same user/limit combo
// ------------------------------------------------------------
const pendingRecPromises = new Map();

// Store user filter preferences in local storage
export const storeUserPreferences = (filters) => {
  try {
    // Only store non-empty filters
    const cleanFilters = Object.entries(filters)
      .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
      
    if (Object.keys(cleanFilters).length > 0) {
      const existingPrefs = JSON.parse(localStorage.getItem(USER_PREFERENCES_KEY) || '[]');
      
      // Add timestamp to preferences
      const prefWithTimestamp = {
        ...cleanFilters,
        timestamp: Date.now()
      };
      
      // Keep only the last 10 preference sets
      const updatedPrefs = [prefWithTimestamp, ...existingPrefs].slice(0, 10);
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updatedPrefs));
    }
  } catch (error) {
    console.error('Error storing user preferences:', error);
  }
};

// Store viewed property in local storage and send to server
export const storeViewedProperty = async (property) => {
  try {
    const propertyId = property?.id || property?._id;
    if (!property || !propertyId) return;
    
    // Store locally
    const viewedProperties = JSON.parse(localStorage.getItem(VIEWED_PROPERTIES_KEY) || '[]');
    
    // Check if property is already in the list
    const existingIndex = viewedProperties.findIndex(p => p.id === propertyId);
    
    // If exists, remove it to add it to the front (most recent)
    if (existingIndex !== -1) {
      viewedProperties.splice(existingIndex, 1);
    }
    
    // Add property to front with timestamp
    const propertyWithTimestamp = {
      id: propertyId,
      property_type: property.property_type,
      price: property.price,
      governate: property.governate,
      city: property.city,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      timestamp: Date.now()
    };
    
    // Keep only the most recent views
    const updatedViews = [propertyWithTimestamp, ...viewedProperties].slice(0, MAX_STORED_VIEWS);
    localStorage.setItem(VIEWED_PROPERTIES_KEY, JSON.stringify(updatedViews));

    // Send to server
    try {
      await api.post(`/property-views/${propertyId}`);
    } catch (error) {
      // Fail silently - local storage will serve as backup
      console.warn('Failed to store view on server:', error);
    }
  } catch (error) {
    console.error('Error storing viewed property:', error);
  }
};

// Get user's stored preferences and viewed properties
const getUserLocalData = () => {
  try {
    const preferences = JSON.parse(localStorage.getItem(USER_PREFERENCES_KEY) || '[]');
    const viewedProperties = JSON.parse(localStorage.getItem(VIEWED_PROPERTIES_KEY) || '[]');
    return { preferences, viewedProperties };
  } catch (error) {
    console.error('Error getting user local data:', error);
    return { preferences: [], viewedProperties: [] };
  }
};

// Get recommended properties from ML system for authenticated users
const getMlRecommendations = async (userId, limit = 5) => {
  try {
    const response = await api.get('/properties/recommended', {
      params: { user_id: userId, limit },
      validateStatus: (status) => status === 200 || status === 401
    });

    if (response.status === 401 || !response?.data?.data) {
      return { success: false, data: [] };
    }

    return {
      success: true,
      data: response.data.data,
      source: response.data.source || 'ml'
    };
  } catch (error) {
    console.error('Error getting ML recommendations:', error);
    return { success: false, data: [] };
  }
};

// Get recommended properties for non-authenticated users
const getDefaultRecommendations = async (limit = 5) => {
  try {
    const response = await api.get('/properties/recommended', {
      params: { limit },
      validateStatus: (status) => status === 200 || status === 401
    });

    if (response.status === 401 || !response?.data?.data) {
      return [];
    }

    return response.data.data;
  } catch (error) {
    console.error('Error getting recommended properties:', error);
    return [];
  }
};

// Get recommended properties based on user's local preferences and viewing history
const getLocalRecommendations = async (limit = 5) => {
  try {
    const { preferences, viewedProperties } = getUserLocalData();
    
    // If no local data, return default recommendations
    if (preferences.length === 0 && viewedProperties.length === 0) {
      return getDefaultRecommendations(limit);
    }

    // Try to get recommendations from ML system using local view history
    try {
      const response = await api.post('/recommendations/local', {
        viewed_properties: viewedProperties,
        preferences,
        limit
      });

      if (response?.data?.success) {
        return response.data.data;
      }
    } catch (error) {
      console.warn('Failed to get ML recommendations for local data:', error);
    }
    
    // Fallback to default recommendations
    return getDefaultRecommendations(limit);
  } catch (error) {
    console.error('Error in getLocalRecommendations:', error);
    return getDefaultRecommendations(limit);
  }
};

// Main recommendation function that handles both authenticated and non-authenticated users
export const getRecommendedProperties = async (userId = null, limit = 5) => {
  try {
    // 1. Return from cache if fresh
    const cached = getCachedRecs(userId, limit);
    if (cached) return cached;

    // 2. Deduplicate concurrent fetches
    const pendingKey = getRecCacheKey(userId, limit);
    if (pendingRecPromises.has(pendingKey)) {
      return pendingRecPromises.get(pendingKey);
    }

    const fetchPromise = (async () => {
      let result;

      if (userId) {
        // Try ML first
        const mlRecommendations = await getMlRecommendations(userId, limit);
        if (mlRecommendations.success && mlRecommendations.data.length > 0) {
          result = mlRecommendations.data;
          result.source = mlRecommendations.source || 'ml';
        } else {
          // Fall back to JS/local algorithm
          result = await getLocalRecommendations(limit);
          if (Array.isArray(result)) {
            result.source = result.source || 'js';
          }
        }
      } else {
        // Guest users → local algorithm
        result = await getLocalRecommendations(limit);
        if (Array.isArray(result)) {
          result.source = result.source || 'js';
        }
      }

      // Always have a fallback to default recommendations
      if (!Array.isArray(result) || result.length === 0) {
        result = await getDefaultRecommendations(limit);
        if (Array.isArray(result)) {
          result.source = 'default';
        }
      }

      // Remove own listings + deduplicate
      const finalResult = filterOwn(result, userId);

      // Cache for future calls
      if (Array.isArray(finalResult)) {
        setCachedRecs(userId, limit, finalResult);
      }

      return finalResult;
    })();

    pendingRecPromises.set(pendingKey, fetchPromise);

    try {
      return await fetchPromise;
    } finally {
      pendingRecPromises.delete(pendingKey);
    }
  } catch (error) {
    console.error('Error in getRecommendedProperties:', error);
    const defRec = await getDefaultRecommendations(limit);
    if (Array.isArray(defRec)) {
      defRec.source = 'default';
    }
    return defRec;
  }
};

// Helper to remove properties that belong to the current user
const filterOwn = (list, uid) => {
  if (!Array.isArray(list)) return list;

  // Remove properties that belong to the current user (when uid is available)
  const filtered = uid ? list.filter(p => p?.profiles_id !== uid) : list;

  // Deduplicate by property ID to avoid duplicate React keys
  const deduped = [...new Map(filtered.map(prop => [prop.id, prop])).values()];

  // Preserve the custom `source` metadata that may be attached to the array
  if (list.source) deduped.source = list.source;

  return deduped;
};