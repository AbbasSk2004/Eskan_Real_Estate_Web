'use client';

import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';
import PropertyCard from './PropertyCard';

const PropertyList = ({ properties, pagination, onPageChange, loading, viewMode }) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  const renderGridView = () => (
    <div className="row g-4">
      {properties.map(property => (
        <div key={property.id} className="col-12 col-sm-6 col-md-6 col-lg-4">
          <PropertyCard property={property} viewMode="grid" />
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="property-list-view">
      {properties.map(property => (
        <div key={property.id} className="mb-4">
          <PropertyCard property={property} viewMode="list" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="property-list">
      {viewMode === 'grid' ? renderGridView() : renderListView()}
      
      {pagination.totalPages > 1 && (
        <div className="row mt-5">
          <div className="col-12">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyList;