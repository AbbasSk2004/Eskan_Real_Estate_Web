import { Suspense } from 'react';
import PropertyBrowser from '../../../../src/components/properties/PropertyBrowser';
import { typepageApi } from '../../../../lib/api';
import { PROPERTY_TYPES } from '../../../../src/utils/propertyTypeFields';
import { filtersToApiParams, queryToFilters } from '../../../../src/utils/propertyFilterParams';

export const revalidate = 3600;

export const dynamicParams = true;

const LABEL_OVERRIDES = {
  featured: 'Featured',
  retail: 'Retail'
};

function normalizeType(rawType) {
  const value = String(rawType || '').trim();
  const exact = PROPERTY_TYPES.find((t) => t.value === value);
  if (exact) return { value: exact.value, label: exact.label };

  const lower = value.toLowerCase();
  const byLower = PROPERTY_TYPES.find((t) => t.value.toLowerCase() === lower);
  if (byLower) return { value: byLower.value, label: byLower.label };

  return {
    value: LABEL_OVERRIDES[lower] ? lower : value,
    label: LABEL_OVERRIDES[lower] || value.charAt(0).toUpperCase() + value.slice(1)
  };
}

function typeTitle(label) {
  return `${label} Properties for Sale and Rent in Lebanon`;
}

async function fetchTypeListing(type, searchParams) {
  const page = Number(searchParams.page) || 1;
  const filters = queryToFilters(searchParams);
  delete filters.propertyType;
  try {
    const data = await typepageApi.byType(type, { ...filtersToApiParams(filters), page, pageSize: 12 });
    if (!data) return null;
    return {
      properties: data.properties || data.data || [],
      currentPage: data.currentPage || page,
      totalPages: data.totalPages || 1,
      totalCount: data.totalCount || 0,
      pageSize: data.pageSize || 12
    };
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { label } = normalizeType(params.type);
  return {
    title: typeTitle(label),
    description: `Browse ${label.toLowerCase()} properties for sale and rent across Lebanon. Verified listings, detailed information, and direct owner contact.`
  };
}

export default async function PropertyTypePage({ params, searchParams }) {
  const { value, label } = normalizeType(params.type);
  const filters = queryToFilters(searchParams || {});
  delete filters.propertyType;
  const initialListing = await fetchTypeListing(value, searchParams || {});

  return (
    <div className="pt-5 mt-5">
      <Suspense fallback={<div className="container py-5 text-center">Loading properties...</div>}>
        <PropertyBrowser
          initialListing={initialListing}
          initialType={value}
          initialFilters={filters}
        />
      </Suspense>
    </div>
  );
}