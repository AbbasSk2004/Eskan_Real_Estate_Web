import { revalidateTag, revalidatePath } from 'next/cache';
import { createHash, timingSafeEqual } from 'crypto';

/**
 * On-demand ISR revalidation endpoint.
 *
 * Invalidates static/ISR cache entries instantly when content changes
 * (property created/updated/deleted, FAQ or testimonial
 * edited, etc.) so the public site never serves stale HTML.
 *
 * Usage (GET or POST):
 *   /api/revalidate?secret=<REVALIDATION_SECRET>&tag=properties
 *   /api/revalidate?secret=<REVALIDATION_SECRET>&tag=property-<id>
 *   /api/revalidate?secret=<REVALIDATION_SECRET>&path=/properties/123
 *
 * Multiple tags or paths can be passed by repeating the parameter:
 *   /api/revalidate?secret=...&tag=properties&tag=faqs
 */
const KNOWN_TAG_PREFIXES = [
  'properties',
  'property-',
  'faqs',
  'testimonials',
  'type-',
  'home'
];

function matchesKnownTag(tag) {
  return KNOWN_TAG_PREFIXES.some((prefix) =>
    tag === prefix || tag.startsWith(prefix)
  );
}

function safeEqual(a, b) {
  const ha = createHash('sha256').update(String(a)).digest();
  const hb = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

function isAuthed(requestUrl) {
  const expected = process.env.REVALIDATION_SECRET;
  if (!expected) {
    console.warn(
      '[revalidate] REVALIDATION_SECRET is not set — revalidation is disabled. ' +
        'Set REVALIDATION_SECRET in the environment to enable on-demand revalidation.'
    );
    return false;
  }
  const provided = new URL(requestUrl.url).searchParams.get('secret') || '';
  return safeEqual(expected, provided);
}

async function revalidateHandler(request) {
  const { searchParams } = new URL(request.url);

  if (!isAuthed(request)) {
    return Response.json(
      { revalidated: false, error: 'Invalid or missing revalidation secret' },
      { status: 401 }
    );
  }

  const tags = searchParams.getAll('tag');
  const paths = searchParams.getAll('path');

  if (tags.length === 0 && paths.length === 0) {
    return Response.json(
      {
        revalidated: false,
        error: 'Provide at least one "tag" or "path" parameter'
      },
      { status: 400 }
    );
  }

  const invalid = tags.filter((tag) => !matchesKnownTag(tag));
  if (invalid.length > 0) {
    return Response.json(
      { revalidated: false, error: `Unknown cache tag(s): ${invalid.join(', ')}` },
      { status: 400 }
    );
  }

  tags.forEach((tag) => revalidateTag(tag));
  paths.forEach((path) => revalidatePath(path));

  return Response.json({
    revalidated: true,
    tags,
    paths,
    now: Date.now()
  });
}

export async function GET(request) {
  return revalidateHandler(request);
}

export async function POST(request) {
  return revalidateHandler(request);
}