import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendedProperties } from '../../services/recommendation';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';
import '../../assets/css/PropertyCarousel.css';

const PropertyCarousel = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendationSource, setRecommendationSource] = useState(null);
  const { user } = useAuth();

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Function to split title into words and wrap each in a span
  const formatTitle = (title) => {
    return title.split(' ').map((word, index) => (
      <span key={index}>{word}{' '}</span>
    ));
  };

  useEffect(() => {
    let mounted = true;

    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get recommendations based on user authentication status
        const response = await getRecommendedProperties(
          user?.id || null,
          10 // Match mobile app limit
        );
        
        if (!mounted) return;

        // Handle empty or invalid response
        if (!response || !Array.isArray(response)) {
          setProperties([]);
          setError('No properties available at this time');
          return;
        }

        // Filter out properties without required data
        const validProperties = response.filter(property => 
          property && property.id && (property.title || property.description)
        );

        // Exclude properties that belong to the current user (extra safety)
        const notOwn = user?.id 
          ? validProperties.filter(p => p.profiles_id !== user.id) 
          : validProperties;

        // Remove duplicate property IDs to avoid duplicate React keys
        const uniqueProps = [...new Map(notOwn.map(p => [p.id, p])).values()];

        if (uniqueProps.length === 0) {
          setProperties([]);
          setError('No properties available at this time');
          return;
        }

        setProperties(uniqueProps);
        // Set recommendation source if available
        setRecommendationSource(response.source || null);
        setError(null);
      } catch (err) {
        console.error('Error loading recommended properties:', err);
        if (mounted) {
          setProperties([]);
          // Don't show error for 401 unauthorized
          if (err.response?.status !== 401) {
            setError('Failed to load properties. Please try again later.');
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProperties();

    // Initialize Bootstrap carousel
    const initCarousel = () => {
      const carousel = document.getElementById('propertyCarousel');
      if (carousel && window.bootstrap) {
        try {
          new window.bootstrap.Carousel(carousel, {
            interval: 5000,
            ride: 'carousel',
            wrap: true
          });
        } catch (err) {
          console.error('Error initializing carousel:', err);
        }
      }
    };

    // Initialize carousel after properties are loaded
    if (!loading && properties.length > 0) {
      initCarousel();
    }

    return () => {
      mounted = false;
    };
  }, [user]); // Re-run when user auth state changes

  if (loading) {
    return (
      <div className="carousel-section">
        <div className="text-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carousel-section">
        <div className="alert alert-info text-center" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!properties.length) {
    return null;
  }

  return (
    <div className="carousel-section">
      <div className="carousel-title-wrapper mb-4 mb-md-5">
        <div className="carousel-title-container">
          <div className="carousel-line" />
          <h2 className="carousel-title">
            {user 
              ? formatTitle('Recommended For You')
              : formatTitle('Personalized Recommendations')
            }
            {recommendationSource && (
              <small className="ms-2 text-muted d-none d-md-inline">(
                {recommendationSource === 'ml'
                  ? 'AI-powered'
                  : recommendationSource.toUpperCase()}
              )</small>
            )}
          </h2>
          <div className="carousel-line" />
        </div>
        <p className="carousel-subtitle px-2">
          {user 
            ? 'Properties selected based on your preferences and browsing history'
            : 'Based on your recent searches and views'}
        </p>
      </div>

      <div className="carousel-container">
        <div id="propertyCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-indicators">
            {properties.map((_, index) => (
              <button
                key={index}
                type="button"
                data-bs-target="#propertyCarousel"
                data-bs-slide-to={index}
                className={index === 0 ? "active" : ""}
                aria-current={index === 0 ? "true" : "false"}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="carousel-inner">
            {properties.map((property, index) => (
              <div key={property.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                <div className="carousel-image-container">
                  <img 
                    src={getImageUrl(property.main_image)} 
                    className="d-block w-100" 
                    alt={property.title || 'Property Image'}
                    onError={(e) => {
                      e.target.src = '/img/property-placeholder.jpg';
                    }}
                  />
                </div>
                <div className="carousel-caption">
                  <div className="caption-content">
                    <span className={`badge ${property.status === 'For Sale' ? 'bg-success' : 'bg-primary'} mb-2`}>
                      {property.status || 'Available'}
                    </span>
                    <h3>{property.title || 'Untitled Property'}</h3>
                    <p className="mb-2">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      {property.city && property.governate 
                        ? `${property.city}, ${property.governate}`
                        : 'Location available on request'}
                    </p>
                    <p className="price mb-3">
                      <i className="fas fa-tag me-2"></i>
                      {formatPrice(property.price)}
                    </p>
                    <Link 
                      to={`/properties/${property.id}`} 
                      className="btn btn-outline-light"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="carousel-control-prev" type="button" data-bs-target="#propertyCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#propertyCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCarousel; 