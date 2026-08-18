'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { propertyService } from '../../services/propertyService';
import PropertySearch from './PropertySearch';
import PropertyList from './PropertyList';
import { filtersToApiParams, filtersToUrlQuery, queryToFilters } from '../../utils/propertyFilterParams';
import '../../assets/css/properties.css';

const normalizeListing = (input, fallbackPage = 1) => {
  if (!input) {
    return { properties: [], currentPage: fallbackPage, totalPages: 1, totalCount: 0, pageSize: 12 };
  }
  return {
    properties: input.properties || input.data || input.items || [],
    currentPage: input.currentPage || fallbackPage,
    totalPages: input.totalPages || 1,
    totalCount: input.totalCount || 0,
    pageSize: input.pageSize || 12
  };
};

const PropertyBrowser = ({ initialListing, initialFilters = {}, initialType }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const appliedQueryRef = useRef('');
  const firstRunRef = useRef(true);

  const [filters, setFilters] = useState({
    keyword: '',
    propertyType: initialType || '',
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
    parking: false,
    elevator: false,
    airConditioning: false,
    heating: false,
    internet: false,
    security: false,
    generator: false,
    waterTank: false,
    swimmingPool: false,
    garden: false,
    balcony: false,
    solarPanels: false,
    fireplace: false,
    bbqArea: false,
    storage: false,
    irrigation: false,
    near_seafront: false,
    near_mountains: false,
    near_schools: false,
    near_hospitals: false,
    near_malls: false,
    near_public_transport: false,
    ...initialFilters
  });

  const [listing, setListing] = useState(() => normalizeListing(initialListing, initialType ? 1 : searchParams.get('page') || 1));
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const fetchProperties = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const result = await propertyService.getProperties({ ...params, pageSize: 12 });
      if (result && result.success) {
        setListing(result);
      } else {
        setListing(normalizeListing(null));
      }
    } catch (error) {
      setListing(normalizeListing(null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialListing) {
      fetchProperties({ page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildCleanUrl = useCallback((nextFilters, page) => {
    const query = filtersToUrlQuery(nextFilters);
    if (page && page > 1) query.set('page', page);
    const queryString = query.toString();
    return {
      queryString,
      url: queryString ? `${pathname}?${queryString}` : pathname
    };
  }, [pathname]);

  const handleSearch = useCallback((nextFilters = filters) => {
    const params = filtersToApiParams(nextFilters);
    params.page = 1;
    fetchProperties(params);
    const { queryString, url } = buildCleanUrl(nextFilters, 1);
    appliedQueryRef.current = queryString;
    router.replace(url, { scroll: false });
  }, [fetchProperties, filters, router, buildCleanUrl]);

  const handlePageChange = useCallback((page) => {
    const params = { ...filtersToApiParams(filters), page };
    fetchProperties(params);
    const { queryString, url } = buildCleanUrl(filters, page);
    appliedQueryRef.current = queryString;
    router.replace(url, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProperties, filters, router, buildCleanUrl]);

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    const current = filtersToUrlQuery(queryToFilters(searchParams)).toString();
    if (current === appliedQueryRef.current) return;
    const restored = queryToFilters(searchParams);
    setFilters((prev) => ({ ...prev, ...restored }));
    const params = filtersToApiParams(restored);
    params.page = Number(searchParams.get('page')) || 1;
    fetchProperties(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const pagination = useMemo(() => ({
    currentPage: listing.currentPage,
    totalPages: listing.totalPages,
    totalCount: listing.totalCount,
    pageSize: listing.pageSize
  }), [listing]);

  return (
    <>
      <PropertySearch
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
      />
      <div className="container-fluid py-5">
        <div className="px-4 px-lg-5">
          <div className="d-flex justify-content-between align-items-center my-4">
            <div>
              <span className="text-muted">{listing.totalCount > 0 ? `${listing.totalCount} properties found` : 'No properties found'}</span>
            </div>
            <div className="btn-group btn-group-sm" role="group" aria-label="View mode">
              <button
                type="button"
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fa fa-th-large me-1"></i>Grid
              </button>
              <button
                type="button"
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fa fa-list me-1"></i>List
              </button>
            </div>
          </div>
          <PropertyList
            properties={listing.properties}
            pagination={pagination}
            onPageChange={handlePageChange}
            loading={loading}
            viewMode={viewMode}
          />
        </div>
      </div>
    </>
  );
};

export default PropertyBrowser;