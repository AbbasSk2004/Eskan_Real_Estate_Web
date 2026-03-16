import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { formatPrice } from '../../utils/formatters';
import { getImageUrl } from '../../utils/imageUtils';
import FavoriteButton from '../common/FavoriteButton';
import { endpoints } from '../../services/api';
import './PropertyComponents.css';
const PropertyCard = ({
  property,
  viewMode = 'grid',
  onCompare,
  isComparing = false,
  showFavorite = true
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [viewCount, setViewCount] = useState(property.views_count || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const viewCountRef = useRef(null);
  const abortController = useRef(null);
  const isMounted = useRef(true);

  const {
    id: rawId,
    title,
    price,
    main_image,
    status,
    bedrooms,
    bathrooms,
    area,
    governate,
    city,
    village,
    property_type,
    profiles_id,
    views_count
  } = property;

  const id = rawId || property._id;

  // Check if the property belongs to the current user, handling both nested and flat user object structures
  const isOwnProperty = user?.id === profiles_id || user?.profile?.id === profiles_id;

  useEffect(() => {
    const fetchViewCount = async () => {
      // Skip if we already have the view count or if it's already being fetched
      if (typeof views_count === 'number' || viewCountRef.current === id) {
        setViewCount(views_count || 0);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        viewCountRef.current = id;

        // Create new abort controller
        abortController.current = new AbortController();
        
        // Get the view count without authentication
        const count = await endpoints.propertyViews.getViewCount(id);
        
        if (isMounted.current) {
          setViewCount(count);
          // Update the property's view count for future reference
          property.views_count = count;
        }
      } catch (error) {
        // Only set error if not aborted
        if (!error.name === 'AbortError' && isMounted.current) {
          console.error('View count error:', error);
          setViewCount(0); // Set to 0 on error instead of showing error state
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchViewCount();

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [id, views_count]);

  const location = [village, city, governate].filter(Boolean).join(', ');

  // Function to get property type specific details
  const getPropertyTypeDetails = () => {
    const details = [];
    
    switch (property_type) {
      case 'Apartment':
      case 'House':
      case 'Villa':
      case 'Chalet':
        details.push(
          { icon: 'bed', value: bedrooms || 0, label: 'Beds' },
          { icon: 'bath', value: bathrooms || 0, label: 'Baths' },
          { icon: 'ruler-combined', value: `${area || 0} m²`, label: 'Area' }
        );
        break;
      
      case 'Office':
        details.push(
          { icon: 'ruler-combined', value: `${area || 0} m²`, label: 'Area' },
          { icon: 'door-open', value: property.meeting_rooms || 0, label: 'Meetings' },
          { icon: 'car', value: property.parking_spaces || 0, label: 'Parking' }
        );
        break;
      
      case 'Shop':
      case 'Retail':
        details.push(
          { icon: 'ruler-combined', value: `${area || 0} m²`, label: 'Area' },
          { icon: 'store', value: `${property.shop_front_width || 0}m`, label: 'Front' },
          { icon: 'warehouse', value: `${property.storage_area || 0} m²`, label: 'Storage' }
        );
        break;
      
      case 'Land':
        details.push(
          { icon: 'ruler-combined', value: `${area || 0} m²`, label: 'Area' },
          { icon: 'map', value: property.land_type || 'N/A', label: 'Type' },
          { icon: 'building', value: property.zoning || 'N/A', label: 'Zoning' }
        );
        break;
      
      case 'Building':
        details.push(
          { icon: 'ruler-combined', value: `${area || 0} m²`, label: 'Area' },
          { icon: 'building', value: property.units || 0, label: 'Units' },
          { icon: 'elevator', value: property.elevators || 0, label: 'Elevators' }
        );
        break;
      
      case 'Warehouse':
        details.push(
          { icon: 'ruler-combined', value: `${area || 0} m²`, label: 'Area' },
          { icon: 'arrows-up-down', value: `${property.ceiling_height || 0}m`, label: 'Height' },
          { icon: 'truck-loading', value: property.loading_docks || 0, label: 'Docks' }
        );
        break;
      
      case 'Farm':
        details.push(
          { icon: 'ruler-combined', value: `${area || 0} m²`, label: 'Area' },
          { icon: 'water', value: property.water_source || 'N/A', label: 'Water' },
          { icon: 'seedling', value: property.crop_types || 'N/A', label: 'Crops' }
        );
        break;
      
      default:
        details.push(
          { icon: 'ruler-combined', value: `${area || 0} m²`, label: 'Area' },
          { icon: 'info-circle', value: property_type || 'N/A', label: 'Type' },
          { icon: 'map-marker-alt', value: city || 'N/A', label: 'City' }
        );
    }
    
    return details;
  };

  return viewMode === 'list' ? (
    <div className="card border-0 shadow rounded-4 overflow-hidden h-100">
      <div className="row g-0">
        {/* Left side - Image */}
        <div className="col-md-4 position-relative">
          <Link to={`/properties/${id}`}>
            <img
              src={getImageUrl(main_image)}
              alt={title}
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '300px' }}
              loading="eager"
            />
          </Link>
          {/* Status Badge */}
          <span className={`badge ${status === 'For Rent' ? 'bg-primary' : 'bg-success'} position-absolute top-0 start-0 m-2 text-uppercase px-3 py-2 fs-6`}>
            {status}
          </span>
          {/* Views Badge */}
          <span className="badge bg-white text-dark position-absolute top-0 end-0 m-2">
            <i className="fa fa-eye text-danger me-1"></i>
            {loading ? (
              '--'
            ) : error ? (
              <span title={error}>--</span>
            ) : (
              viewCount
            )}
          </span>
        </div>

        {/* Right side - Details */}
        <div className="col-md-8">
          <div className="card-body p-4 position-relative">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <Link
                to={`/properties/${id}`}
                className="text-dark text-decoration-none"
              >
                <h5 className="mb-0 fw-bold">{title}</h5>
              </Link>
              <div className="text-danger fw-bold fs-4">
                {formatPrice(price)}
              </div>
            </div>

            <div className="d-flex gap-3 text-muted small mb-2">
              <span>
                <i className="far fa-calendar text-primary me-1"></i>
                {new Date(property.created_at).toLocaleDateString()}
              </span>
              <span>
                <i className="fa fa-home text-primary me-1"></i>
                {property_type}
              </span>
            </div>

            <p className="text-muted mb-4">
              <i className="fa fa-location-dot me-2"></i>
              {location}
            </p>

            {showFavorite && !isOwnProperty && (
              <div className="position-absolute" style={{ right: '1.5rem', top: '50%', transform: 'translateY(-50%)' }}>
                <FavoriteButton propertyId={id} ownerId={profiles_id} />
              </div>
            )}

            <div className="row g-3" style={{ marginTop: '2.5rem' }}>
              {getPropertyTypeDetails().map((detail, index) => (
                <div key={index} className="col-auto">
                  <span className="d-inline-flex align-items-center text-muted fs-5">
                    <i className={`fa fa-${detail.icon} text-primary me-2`}></i>
                    {detail.value} {detail.label !== 'Area' && detail.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    // Original grid view layout
    <div className="card border-0 shadow rounded-4 overflow-hidden h-100">
      <div className="position-relative">
        <Link to={`/properties/${id}`}>
          <img
            src={getImageUrl(main_image)}
            alt={title}
            className="w-100"
            style={{ height: '250px', objectFit: 'cover' }}
            loading="eager"
          />
        </Link>

        {/* Status Badge */}
        <span className={`badge ${status === 'For Rent' ? 'bg-primary' : 'bg-success'} position-absolute top-0 start-0 m-2 text-uppercase px-3 py-2 fs-6`}>
          {status}
        </span>

        {/* Views with loading and error states */}
        <span className="badge bg-white text-dark position-absolute top-0 end-0 m-2">
          <i className="fa fa-eye text-danger me-1"></i>
          {loading ? (
            '--'
          ) : error ? (
            <span title={error}>--</span>
          ) : (
            viewCount
          )}
        </span>
      </div>

      <div className="card-body px-3 pt-3 pb-0 position-relative">
        {/* Title and Favorite */}
        <div className="d-flex justify-content-between align-items-start mb-1">
          <Link
            to={`/properties/${id}`}
            className="text-dark text-decoration-none fw-semibold fs-5"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            {title}
          </Link>

          {showFavorite && !isOwnProperty && (
            <FavoriteButton propertyId={id} ownerId={profiles_id} />
          )}
        </div>

        <p className="text-muted mb-2 small d-flex align-items-center">
          <i className="fa fa-location-dot me-2"></i>
          {location}
        </p>

        <div className="text-danger fw-bold fs-4 mb-3">
          {formatPrice(price)}
        </div>
      </div>

      {/* Property Type Specific Details */}
      <div className="card-footer bg-white border-0">
        <div className="row text-center text-muted small g-0">
          {getPropertyTypeDetails().map((detail, index) => (
            <div key={index} className={`col ${index < 2 ? 'border-end' : ''} px-3 py-2`}>
              <i className={`fa fa-${detail.icon} me-1`}></i>
              {detail.value} <br />
              <small>{detail.label}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
