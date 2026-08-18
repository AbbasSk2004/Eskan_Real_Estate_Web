import type { MetadataRoute } from 'next';

const REVALIDATE = 3600;
const FETCH_TIMEOUT_MS = 15000;

// Both values come exclusively from environment variables. Without them the
// sitemap degrades gracefully (static routes only) instead of failing the build.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

if (!process.env.NEXT_PUBLIC_API_URL) {
  console.warn('[sitemap] NEXT_PUBLIC_API_URL is not set — property slugs will be omitted from the sitemap.');
}
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn('[sitemap] NEXT_PUBLIC_SITE_URL is not set — sitemap URLs will fall back to http://localhost:3000.');
}

async function fetchAsJson(path: string) {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: REVALIDATE, tags: ['properties'] },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json;
  } catch (error) {
    console.warn(
      `[sitemap] Failed to fetch ${API_BASE_URL}${path}:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

async function getPublishedPropertySlugs(): Promise<string[]> {
  const slugs = new Set<string>();
  // Walk available pages of published listings (capped for sitemap size).
  for (let page = 1; page <= 10; page += 1) {
    const data = await fetchAsJson(`/properties?page=${page}&pageSize=100&verified=true`);
    const items: any[] = data?.properties || data?.data || data?.items || [];
    if (!Array.isArray(items) || items.length === 0) break;
    items.forEach((p) => p?.slug && slugs.add(p.slug));
    if (items.length < 100) break;
  }
  return [...slugs];
}

const staticRoutes: Array<{ path: string; priority: number }> = [
  { path: '', priority: 1 },
  { path: '/about', priority: 0.8 },
  { path: '/contact', priority: 0.8 },
  { path: '/help', priority: 0.6 },
  { path: '/cookies', priority: 0.4 },
  { path: '/privacy', priority: 0.4 },
  { path: '/terms', priority: 0.4 },
  { path: '/properties', priority: 0.9 },
  { path: '/properties/type/apartment', priority: 0.8 },
  { path: '/properties/type/villa', priority: 0.8 },
  { path: '/properties/type/house', priority: 0.8 },
  { path: '/properties/type/land', priority: 0.8 },
  { path: '/properties/type/office', priority: 0.8 },
  { path: '/properties/type/shop', priority: 0.8 }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let propertySlugs: string[] = [];
  try {
    propertySlugs = await getPublishedPropertySlugs();
  } catch (error) {
    console.warn('[sitemap] Failed to collect property slugs:', error);
  }

  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority
    })),
    ...propertySlugs.map((slug) => ({
      url: `${SITE_URL}/properties/${slug}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9
    }))
  ];

  return entries;
}