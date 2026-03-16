const normalize = (value) => {
  if (!value) return '';
  return String(value).trim();
};

// Alias for backwards compatibility with existing code
const normalizeUrl = normalize;

const isAbsoluteUrl = (url) => /^(https?:)?\/\//i.test(url);
const isDataOrBlobUrl = (url) => /^(data:|blob:)/i.test(url);

const getBaseUrl = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  return base.replace(/\/+$/, '');
};

const buildStorageUrl = (filePath) => {
  if (!filePath) return null;
  const cleanPath = filePath.toString().replace(/\\/g, '/').replace(/^\/+/, '');
  const base = getBaseUrl();
  return `${base}/${cleanPath}`;
};

export const getImageUrl = (path) => {
  if (!path) return '/img/property-placeholder.jpg';

  const normalized = normalizeUrl(path);

  // If already a full URL, return it
  if (normalized?.startsWith('http')) {
    return normalized;
  }

  // Handle object format (for backward compatibility)
  if (typeof path === 'object') {
    const url = normalizeUrl(
      path.secure_url ||
      path.url ||
      path.path ||
      path.src ||
      path.image_url ||
      path.main_image ||
      path.cover_image ||
      ''
    );

    if (url && (isAbsoluteUrl(url) || isDataOrBlobUrl(url))) {
      return url;
    }

    return '/img/property-placeholder.jpg';
  }

  // Otherwise, construct URL using the storage endpoint
  return buildStorageUrl(normalized) || '/img/property-placeholder.jpg';
};

export const getProfileImageUrl = (path) => {
  if (!path) return '/img/user-placeholder.jpg';

  const normalized = normalizeUrl(path);

  // If already a full URL, return it
  if (normalized?.startsWith('http')) {
    return normalized;
  }

  // Handle object format (for backward compatibility)
  if (typeof path === 'object') {
    const url = normalizeUrl(
      path.secure_url ||
      path.url ||
      path.path ||
      path.src ||
      path.image_url ||
      path.main_image ||
      path.cover_image ||
      ''
    );

    if (url && (isAbsoluteUrl(url) || isDataOrBlobUrl(url))) {
      return url;
    }

    return '/img/user-placeholder.jpg';
  }

  // Otherwise, construct URL using the storage endpoint
  return buildStorageUrl(normalized) || '/img/user-placeholder.jpg';
};