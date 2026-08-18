'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Carousel from 'react-bootstrap/Carousel';
import { getRecommendedProperties } from '../../services/recommendation';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../utils/imageUtils';
import '../../assets/css/PropertyCarousel.css';

const PropertyCarousel = ({ initialProperties }) => {
  const hasInitialData = initialProperties !== undefined;
  const [properties, setProperties] = useState(initialProperties ?? []);
  const [loading, setLoading] = useState(!hasInitialData);
  const [isPersonalized, setIsPersonalized] = useState(false);
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
    if (hasInitialData) return;

    let mounted = true;

    const fetchProperties = async () => {
      try {
        setLoading(true);

        // Ranked server-side. Works for logged-out visitors too: the request
        // carries the HttpOnly visitor_id cookie the backend personalizes on.
        const response = await getRecommendedProperties(user?.id || null, 10);

        if (!mounted) return;

        // Invalid response: render nothing (the empty-list check returns null).
        if (!response || !Array.isArray(response)) {
          setProperties([]);
          return;
        }

        // Read ranking metadata before any array copy drops it — `personalized`
        // is attached to the array object, not its elements.
        const personalized = Boolean(response.personalized);

        // Filter out properties without required data
        const validProperties = response.filter(property =>
          property && property.id && (property.title || property.description)
        );

        setProperties(validProperties);
        setIsPersonalized(personalized);
      } catch (err) {
        console.error('Error loading recommended properties:', err);
        if (mounted) {
          setProperties([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProperties();

    return () => {
      mounted = false;
    };
  }, [user, hasInitialData]); // Re-run when user auth state changes

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

  if (!properties.length) {
    return null;
  }

  // Heading reflects what the ranker actually did, rather than assuming that
  // "signed in" means "personalized" — a brand-new account has no history, and
  // a returning guest has plenty.
  const heading = isPersonalized ? 'Recommended For You' : 'Trending Properties';

  return (
    <div className="carousel-section">
      <div className="carousel-title-wrapper mb-4 mb-md-5">
        <div className="carousel-title-container">
          <div className="carousel-line" />
          <h2 className="carousel-title">
            {formatTitle(heading)}
          </h2>
          <div className="carousel-line" />
        </div>
      </div>

      <div className="carousel-container">
        <Carousel interval={5000} wrap>
          {properties.map((property) => (
            <Carousel.Item key={property.id}>
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
              <Carousel.Caption>
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
                  <div className="caption-actions">
                    <p className="price mb-3">
                      <i className="fas fa-tag me-2"></i>
                      {formatPrice(property.price)}
                    </p>
                    <Link
                      href={`/properties/${property.slug || property.id}`}
                      className="btn btn-outline-light"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default PropertyCarousel;