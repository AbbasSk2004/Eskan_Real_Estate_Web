import { Suspense } from 'react';
import PropertyBrowser from '../../src/components/properties/PropertyBrowser';
import { propertiesApi } from '../../lib/api';
import { filtersToApiParams, queryToFilters } from '../../src/utils/propertyFilterParams';

export const revalidate = 3600;

export const metadata = {
  title: 'Browse Properties',
  description: 'Explore apartments, houses, villas, offices and more across Lebanon. Filter by location, price, size and features to find your perfect property.'
};

async function fetchInitialListing(searchParams) {
  const page = Number(searchParams.page) || 1;
  const filterParams = queryToFilters(searchParams);
  try {
    const data = await propertiesApi.list({ ...filtersToApiParams(filterParams), page, pageSize: 12 });
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

export default async function PropertiesPage({ searchParams }) {
  const initialListing = await fetchInitialListing(searchParams || {});

  return (
    <div className="pt-5 mt-5">
      <Suspense fallback={<div className="container py-5 text-center">Loading properties...</div>}>
        <PropertyBrowser initialListing={initialListing} initialFilters={queryToFilters(searchParams || {})} />
      </Suspense>
    </div>
  );
}