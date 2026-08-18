const normalize = (value) => {
  if (!value) return '';
  return String(value).trim();
};

// Alias for backwards compatibility with existing code
const normalizeUrl = normalize;

const isAbsoluteUrl = (url) => /^(https?:)?\/\//i.test(url);
const isDataOrBlobUrl = (url) => /^(data:|blob:)/i.test(url);

const getBaseUrl = () => {
  // Storage is served from the origin root (e.g. .../storage/...), so prefer an
  // explicit NEXT_PUBLIC_STORAGE_URL and otherwise derive the origin from the
  // API base URL by stripping the /api suffix.
  const base =
    process.env.NEXT_PUBLIC_STORAGE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001';
  return base.replace(/\/api\/?$/, '').replace(/\/+$/, '');
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
  if (!path) return '/default-profile.png';

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

    return '/default-profile.png';
  }

  // Otherwise, construct URL using the storage endpoint
  return buildStorageUrl(normalized) || '/default-profile.png';
};