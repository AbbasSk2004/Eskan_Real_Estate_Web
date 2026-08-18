/**
 * Web recommendation service.
 *
 * Ranking happens on the server (`GET /api/properties/recommended`), which
 * scores content similarity, popularity and freshness, then applies an MMR
 * diversity pass. This module deliberately does NOT re-implement any of that:
 *
 *   - the browser only holds one page of properties, so it cannot rank a
 *     catalogue it does not have;
 *   - the server sees favorites, inquiries and cross-device view history that
 *     this tab does not;
 *   - two scoring implementations drift, and the site would quietly disagree
 *     with the mobile app about what "recommended" means.
 *
 * Personalization works for logged-OUT visitors too: the API issues an HttpOnly
 * `visitor_id` cookie, and `axiosClient` sends credentials on every request, so
 * view telemetry and the recommendation read resolve to the same visitor.
 *
 * localStorage is kept only as an offline convenience, never a ranking input.
 */

import api from './axiosClient';

const USER_PREFERENCES_KEY = 'user_property_preferences';
const VIEWED_PROPERTIES_KEY = 'user_viewed_properties';
const MAX_STORED_VIEWS = 20;

// ---------------------------------------------------------------------------
// Signal capture
// ---------------------------------------------------------------------------

/**
 * Persist the filters a visitor applied.
 *
 * Local-only for now: the backend builds its profile from views, favorites and
 * inquiries. Kept so the search form can prefill, and so the signal is already
 * being captured if a `/events` endpoint is added later.
 */
export const storeUserPreferences = (filters) => {
  try {
    const cleanFilters = Object.entries(filters || {})
      .filter(([, value]) => value !== '' && value !== null && value !== undefined)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    if (Object.keys(cleanFilters).length === 0) return;

    const existing = JSON.parse(localStorage.getItem(USER_PREFERENCES_KEY) || '[]');
    const updated = [{ ...cleanFilters, timestamp: Date.now() }, ...existing].slice(0, 10);
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error storing user preferences:', error);
  }
};

// Property ids already reported this page session. The backend also dedups per
// visitor per UTC day; this avoids redundant requests when PropertyDetail
// re-renders or serves from its in-memory cache.
const reportedViews = new Set();

/**
 * Record that the visitor opened a listing.
 *
 * This is the signal the server-side taste profile is built from — the
 * localStorage copy alone cannot personalize anything, because ranking runs on
 * the server. Best-effort: a failure never surfaces to the user or blocks
 * rendering, and the id is released so a later render retries.
 */
export const storeViewedProperty = async (property) => {
  const propertyId = property?.id || property?._id;
  if (!property || !propertyId) return;

  try {
    const viewedProperties = JSON.parse(localStorage.getItem(VIEWED_PROPERTIES_KEY) || '[]');

    const existingIndex = viewedProperties.findIndex((p) => p.id === propertyId);
    if (existingIndex !== -1) viewedProperties.splice(existingIndex, 1);

    const entry = {
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

    const updated = [entry, ...viewedProperties].slice(0, MAX_STORED_VIEWS);
    localStorage.setItem(VIEWED_PROPERTIES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error storing viewed property:', error);
  }

  if (reportedViews.has(propertyId)) return;
  reportedViews.add(propertyId);

  try {
    await api.post(`/properties/${encodeURIComponent(propertyId)}/views`);
    // The view changed this visitor's profile, so any cached ranking is stale.
    // The server invalidates its own cache on the same event.
    clearRecommendationCache();
  } catch (error) {
    reportedViews.delete(propertyId);
  }
};

/** Recently-viewed list for offline display. Not a ranking input. */
export const getViewedProperties = () => {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_PROPERTIES_KEY) || '[]');
  } catch (_e) {
    return [];
  }
};

// ---------------------------------------------------------------------------
// Recommendation read
// ---------------------------------------------------------------------------

// Short client cache on top of the server's own 45s cache: avoids a network
// round trip when the carousel remounts during client-side navigation.
const REC_CACHE_DURATION = 60 * 1000;
const recCache = new Map();
const pendingRecPromises = new Map();

const cacheKey = (userId, limit) => `${userId || 'guest'}_${limit}`;

export const clearRecommendationCache = () => {
  recCache.clear();
  pendingRecPromises.clear();
};

/**
 * Fetch server-ranked recommendations.
 *
 * @param {?string} userId used only to drop the visitor's own listings and to
 *                         key the cache. Identity is resolved server-side from
 *                         the session and visitor cookies — a client-supplied
 *                         id is ignored by the API on purpose, so it cannot be
 *                         used to read someone else's feed.
 * @param {number}  limit
 * @returns {Promise<Array>} properties, with `source`
 *                           (`personalized` | `trending` | `curated`) and
 *                           `personalized` attached for the UI label.
 */
export const getRecommendedProperties = async (userId = null, limit = 10) => {
  const key = cacheKey(userId, limit);

  const cached = recCache.get(key);
  if (cached && Date.now() - cached.timestamp < REC_CACHE_DURATION) {
    return cached.data;
  }

  if (pendingRecPromises.has(key)) {
    return pendingRecPromises.get(key);
  }

  const fetchPromise = (async () => {
    try {
      const response = await api.get('/properties/recommended', {
        params: { limit },
        validateStatus: (status) => status === 200 || status === 401
      });

      const payload = response?.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];

      // Never recommend a visitor their own listing. The server already
      // excludes them; this is belt-and-braces for a cached response.
      const filtered = userId ? list.filter((p) => p?.profiles_id !== userId) : list;

      // Guard against duplicate React keys.
      const deduped = [...new Map(filtered.map((p) => [p.id, p])).values()];

      deduped.source = payload?.source || 'trending';
      deduped.personalized = Boolean(payload?.personalized);

      recCache.set(key, { data: deduped, timestamp: Date.now() });
      return deduped;
    } catch (error) {
      console.error('Error getting recommended properties:', error);
      const empty = [];
      empty.source = 'unavailable';
      empty.personalized = false;
      return empty;
    }
  })();

  pendingRecPromises.set(key, fetchPromise);

  try {
    return await fetchPromise;
  } finally {
    pendingRecPromises.delete(key);
  }
};
