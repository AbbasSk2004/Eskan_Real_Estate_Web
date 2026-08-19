'use client';

import React, { useState, useEffect, useRef } from 'react';
import PropertyCard from './PropertyCard';
import similarPropertiesService from '../../services/similar_properties';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './SimilarProperties.css';

// Set default limit to 12 properties
const SimilarProperties = ({ currentPropertyId, propertyType, city, price, limit = 12 }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!currentPropertyId) {
      setLoading(false);
      return;
    }

    const fetchSimilarProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the direct similar properties service
        const response = await similarPropertiesService.getSimilarProperties(currentPropertyId, limit);

        if (isMountedRef.current) {
          if (response?.success && Array.isArray(response?.data)) {
            // Keep full list (backend already respects limit param)
            setProperties(response.data);
            // Track recommendation source (ml or fallback)
            setSource(response.source || 'api');
          } else {
            console.error('Invalid response format:', response);
            setError('Failed to fetch similar properties');
            setProperties([]);
          }
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        console.error('Error fetching similar properties:', err);
        setError('Failed to fetch similar properties');
        setProperties([]);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchSimilarProperties();

    return () => {
      // No need for abort controller with our service
    };
  }, [currentPropertyId, limit]);

  // Strict conditional rendering: this section never exists in the DOM until
  // we actually have properties to show — no blank box, no layout shift.
  if (loading) return null;
  if (error) return null;
  if (!properties.length) return null;

  const sliderSettings = {
    dots: false,
    infinite: properties.length > 4,
    speed: 500,
    slidesToShow: Math.min(properties.length, 3), // show 3 items on large screens for wider cards
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(properties.length, 3)
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(properties.length, 2)
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  };

  return (
    <div className="similar-properties-section bg-white rounded-3 shadow-sm p-4 mb-4">
      <h3 className="h4 fw-bold mb-4">
        <i className="fas fa-home me-2 text-primary"></i>
        Similar Properties
      </h3>

      <Slider {...sliderSettings} className="similar-properties-slider">
        {properties.map(property => (
          <div key={property.id} className="px-2">
            <PropertyCard property={property} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SimilarProperties;
