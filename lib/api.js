/**
 * Server-only API data layer.
 *
 * Every public read that must be cached goes through this module so that ISR
 * and tag-based cache invalidation stay consistent:
 *
 *   - `revalidate` (seconds) controls time-based ISR freshness.
 *   - `tags` are attached to each response so `/api/revalidate?tag=...`
 *     can purge the cache instantly when the admin panel edits content.
 *
 * NEVER import this module from a Client Component ('use client').
 * All functions here run on the server (RSC / route handlers / sitemap).
 */

const DEFAULT_TAGS = {
  properties: ['properties'],
  faqs: ['faqs'],
  testimonials: ['testimonials'],
  home: ['home', 'properties', 'testimonials']
};

const REVALIDATE_SECONDS = 3600;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

/**
 * Core promise-based GET with Next.js fetch caching.
 */
async function apiGet(path, { params = {}, tags = [], revalidate = REVALIDATE_SECONDS } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json'
    },
    next: { revalidate, tags }
  });

  if (!res.ok) {
    const error = new Error(`API ${path} failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  const json = await res.json();
  return json?.data ?? json;
}

/* ----------------------------- Properties ----------------------------- */

export const propertiesApi = {
  revalidate: REVALIDATE_SECONDS,
  tags: DEFAULT_TAGS.properties,

  list(params = {}) {
    return apiGet('/properties', { params, tags: DEFAULT_TAGS.properties });
  },

  featured(tags = []) {
    return apiGet('/properties/featured', {
      tags: [...DEFAULT_TAGS.properties, ...tags]
    });
  },

  recommended(tags = []) {
    return apiGet('/properties/recommended', {
      tags: [...DEFAULT_TAGS.properties, ...tags]
    });
  },

  byId(id) {
    return apiGet(`/properties/${encodeURIComponent(id)}`, {
      tags: [...DEFAULT_TAGS.properties, `property-${id}`]
    });
  }
};

/* --------------------------------- FAQs --------------------------------- */

export const faqsApi = {
  revalidate: REVALIDATE_SECONDS,
  tags: DEFAULT_TAGS.faqs,

  all(tags = []) {
    return apiGet('/faqs', { tags: [...DEFAULT_TAGS.faqs, ...tags] });
  }
};

/* ----------------------------- Testimonials ----------------------------- */

export const testimonialsApi = {
  revalidate: REVALIDATE_SECONDS,
  tags: DEFAULT_TAGS.testimonials,

  all(tags = []) {
    return apiGet('/testimonials', { tags: [...DEFAULT_TAGS.testimonials, ...tags] });
  }
};

/* ------------------------------ Type pages ------------------------------ */

export const typepageApi = {
  revalidate: REVALIDATE_SECONDS,
  tags: DEFAULT_TAGS.properties,

  byType(type, params = {}) {
    return apiGet(`/typepage/${encodeURIComponent(type)}`, {
      params,
      tags: [...DEFAULT_TAGS.properties, `type-${type}`]
    });
  }
};

/* ------------------------------- Home page ------------------------------ */

export const homeApi = {
  revalidate: REVALIDATE_SECONDS,

  // `recommended` is intentionally absent: that slot is personalized per
  // visitor and fetched client-side, so pre-rendering it here would only warm
  // a cache nobody reads (see the comment in app/page.js).
  async data({ tags = [] } = {}) {
    const aggregateTags = [...DEFAULT_TAGS.home, ...tags];
    const [featured, testimonials] = await Promise.all([
      apiGet('/properties/featured', { tags: aggregateTags }),
      apiGet('/testimonials', { tags: aggregateTags })
    ]);
    return { featured, testimonials };
  }
};