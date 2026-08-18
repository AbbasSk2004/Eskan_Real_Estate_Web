'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';

const PropertyCard = ({ 
  property, 
  onDelete,
  showActions = false
}) => {
  const { user } = useAuth();

  const {
    id,
    title,
    status,
    price,
    main_image
  } = property;

  const statusConfig = {
    available: { label: 'Available', className: 'success' },
    pending: { label: 'Pending', className: 'warning' },
    sold: { label: 'Sold', className: 'danger' },
    rented: { label: 'Rented', className: 'info' }
  };

  const currentStatus = statusConfig[status] || { label: status, className: 'secondary' };

  return (
    <div className="card h-100 property-card">
      <div className="position-relative">
        <img
          src={getImageUrl(main_image) || '/img/property-placeholder.jpg'}
          className="card-img-top"
          alt={title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
        
        {/* Status Badge - Top Left */}
        <span className={`badge bg-${currentStatus.className} position-absolute top-0 start-0 m-2`}>
          {currentStatus.label}
        </span>
      </div>

      <div className="card-body">
        <h5 className="card-title text-truncate mb-2">{title}</h5>
        <p className="text-primary h5 mb-4">{formatPrice(price)}</p>

        {/* Action Buttons */}
        <div className="d-flex justify-content-between align-items-center">
          <Link 
            href={`/properties/${id || property.slug}`} 
            className="btn btn-outline-primary"
          >
            Show Details
          </Link>
          {showActions && onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="btn btn-outline-danger"
              title="Delete Property"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;