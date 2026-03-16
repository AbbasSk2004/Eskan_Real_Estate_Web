import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { propertyService } from '../../services/propertyService';
import PropertyCard from '../properties/PropertyCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import '../../assets/css/Featured.css';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const PROPERTIES_PER_ROW = 3;
const MAX_ROWS = 3;

// Function to split title into words and wrap each in a span
const formatTitle = (title) => {
  return title.split(' ').map((word, index) => (
    <span key={index}>{word}{' '}</span>
  ));
};

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionRef = useRef(null);
  const toast = useToast();
  const hasAttemptedFetch = useRef(false);

  const fetchFeaturedProperties = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      
      const response = await propertyService.getFeaturedProperties();
      
      if (!response?.success) {
        throw new Error('Invalid response format from server');
      }
      
      const featuredProperties = response.data || [];
      setProperties(featuredProperties);
      setError(null);
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      
      if (retryCount < MAX_RETRIES && 
          (error.code === 'ERR_NETWORK' || 
           (error.response?.status >= 500 && error.response?.status < 600))) {
        setTimeout(() => {
          fetchFeaturedProperties(retryCount + 1);
        }, RETRY_DELAY * Math.pow(2, retryCount));
        return;
      }

      const errorMessage = error.response?.data?.message || error.message || 'Failed to load featured properties';
      setError(errorMessage);
      toast.error(`Failed to load featured properties: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!hasAttemptedFetch.current) {
      hasAttemptedFetch.current = true;
      fetchFeaturedProperties();
    }
  }, [fetchFeaturedProperties]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!properties.length) {
    return null;
  }

  const limitedProperties = properties.slice(0, PROPERTIES_PER_ROW * MAX_ROWS);

  const rows = Array.from({ length: Math.ceil(limitedProperties.length / PROPERTIES_PER_ROW) }, (_, i) =>
    limitedProperties.slice(i * PROPERTIES_PER_ROW, (i + 1) * PROPERTIES_PER_ROW)
  );

  return (
    <section ref={sectionRef} className="container-xxl py-5">
      <div className="container">
        <div className="featured-title-wrapper mb-4 mb-md-5 wow fadeInUp" data-wow-delay="0.1s">
          <div className="featured-title-container">
            <div className="featured-line" />
            <h2 className="featured-title">{formatTitle('Featured Properties')}</h2>
            <div className="featured-line" />
          </div>
          <div className="featured-subtitle-wrapper">
            <p className="featured-subtitle">Discover our handpicked selection of premium properties</p>
            <Link to="/properties/type/featured" className="view-all-link">View All <i className="fa fa-arrow-right"></i></Link>
          </div>
        </div>

        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="row g-3 g-md-4 mb-3 mb-md-4">
            {row.map(property => (
              <div key={property.id || property._id} className="col-12 col-sm-6 col-lg-4 wow fadeInUp" data-wow-delay="0.1s">
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(FeaturedProperties);