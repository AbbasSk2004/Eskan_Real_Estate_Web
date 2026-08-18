/* Shared helpers mapping property filter state <-> clean URL query params.
   Pure functions, safe for both server (SSR pages) and client (PropertyBrowser). */

export const FEATURE_KEYS = [
  'parking', 'elevator', 'airConditioning', 'heating', 'internet', 'security',
  'generator', 'waterTank', 'swimmingPool', 'garden', 'balcony', 'solarPanels',
  'fireplace', 'bbqArea', 'storage', 'irrigation', 'near_seafront', 'near_mountains',
  'near_schools', 'near_hospitals', 'near_malls', 'near_public_transport'
];

export const SCALAR_KEYS = [
  'keyword', 'propertyType', 'status', 'governorate', 'city', 'village',
  'priceMin', 'priceMax', 'areaMin', 'areaMax', 'bedrooms', 'bathrooms'
];

export const DEFAULT_FILTERS = {
  keyword: '',
  propertyType: '',
  status: 'all',
  governorate: '',
  city: '',
  village: '',
  priceMin: '',
  priceMax: '',
  areaMin: '',
  areaMax: '',
  bedrooms: '',
  bathrooms: '',
  ...Object.fromEntries(FEATURE_KEYS.map((key) => [key, false]))
};

export const filtersToApiParams = (filters) => {
  const params = {};

  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.propertyType) params.propertyType = filters.propertyType;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.governorate) params.governorate = filters.governorate;
  if (filters.city) params.city = filters.city;
  if (filters.village) params.village = filters.village;

  if (filters.priceMin) params.priceMin = filters.priceMin;
  if (filters.priceMax) params.priceMax = filters.priceMax;

  if (filters.areaMin) params.areaMin = filters.areaMin;
  if (filters.areaMax) params.areaMax = filters.areaMax;

  if (filters.bedrooms) params.bedrooms = filters.bedrooms;
  if (filters.bathrooms) params.bathrooms = filters.bathrooms;

  const activeFeatures = FEATURE_KEYS.filter((key) => filters[key]);
  if (activeFeatures.length) params.features = activeFeatures;

  return params;
};

export const filtersToUrlQuery = (filters) => {
  const query = new URLSearchParams();

  SCALAR_KEYS.forEach((key) => {
    const value = filters[key];
    if (value && !(key === 'status' && value === 'all')) {
      query.set(key, value);
    }
  });

  FEATURE_KEYS.forEach((key) => {
    if (filters[key]) query.set(key, 'true');
  });

  return query;
};

/* Accepts a URLSearchParams (client) or plain object (server searchParams prop).
   Returns only the filter keys that are present and active in the URL,
   so callers can spread the result over their existing defaults. */
export const queryToFilters = (params) => {
  const get = (key) => (typeof params?.get === 'function' ? params.get(key) : params?.[key]);
  const out = {};

  SCALAR_KEYS.forEach((key) => {
    const value = get(key);
    if (value) out[key] = value;
  });

  FEATURE_KEYS.forEach((key) => {
    if (get(key) === 'true') out[key] = true;
  });

  return out;
};