import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PropertyList from '../components/properties/PropertyList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { typePageService } from '../services/typepage';
import { propertyService } from '../services/propertyService';
import { PROPERTY_TYPES } from '../utils/propertyTypeFields';
import { useToast } from '../hooks/useToast';

const PropertyTypePage = () => {
  const { type } = useParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Check if we're looking for featured properties
  const isFeatured = type.toLowerCase() === 'featured';

  // Find the property type details from our constants
  const propertyTypeDetails = PROPERTY_TYPES.find(t => t.value.toLowerCase() === type.toLowerCase()) || {
    label: isFeatured ? 'Featured' : type,
    value: isFeatured ? 'Featured' : type,
    icon: isFeatured ? 'star_rate' : 'home'
  };

  useEffect(() => {
    fetchProperties(1);
  }, [type]);

  const fetchProperties = async (page) => {
    try {
      setLoading(true);
      
      // Use different service method for featured properties
      let response;
      if (isFeatured) {
        // For featured properties, use the propertyService
        const featuredResponse = await propertyService.getProperties({
          page,
          pageSize: 12,
          is_featured: true,
          verified: true,
          sortBy: 'newest'
        });
        response = featuredResponse;
      } else {
        // For regular property types, use typePageService
        response = await typePageService.getPropertiesByType(propertyTypeDetails.value, {
          page,
          pageSize: 12,
          sortBy: 'newest'
        });
      }

      if (response && response.success) {
        setProperties(response.properties || []);
        setPagination({
          currentPage: response.currentPage || page,
          totalPages: response.totalPages || 1,
          totalItems: response.totalCount || 0
        });
      } else {
        setProperties([]);
        toast.error('No properties found or invalid response format');
        console.error('Invalid response format:', response);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
      toast.error('Failed to fetch properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchProperties(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="property-type-page">
      {/* Hero Section */}
      <div className="hero-section py-5">
        <div className="container">
          <div className="hero-title-wrapper wow fadeInUp" data-wow-delay="0.1s">
            <div className="hero-title-container">
              <div className="hero-line" />
              <h1 className="hero-title">
                {isFeatured ? (
                  <>
                    <i className="material-icons hero-icon">stars</i> 
                    Featured Properties
                  </>
                ) : (
                  `${propertyTypeDetails.label} Properties`
                )}
              </h1>
              <div className="hero-line" />
            </div>
            <p className="hero-subtitle">
              {isFeatured 
                ? "Discover our handpicked selection of premium properties chosen for their exceptional quality and value."
                : `Explore our collection of ${propertyTypeDetails.label.toLowerCase()} properties. Find your perfect ${propertyTypeDetails.label.toLowerCase()} with our comprehensive listings.`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {properties.length === 0 && !loading ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="material-icons empty-icon">{propertyTypeDetails.icon}</i>
            </div>
            <h3 className="text-muted">No {propertyTypeDetails.label} Properties Available</h3>
            <p className="text-muted">Check back later for new listings or try a different property type.</p>
          </div>
        ) : (
          <div className="row">
            <div className="col-12">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="mb-4">
                    <div className="results-info">
                      <h2 className="results-title">
                        {isFeatured 
                          ? "All Featured Properties" 
                          : `Available ${propertyTypeDetails.label} Properties`
                        }
                      </h2>
                      <p className="results-count">
                        Found {pagination.totalItems} {isFeatured ? "featured" : `verified ${propertyTypeDetails.label.toLowerCase()}`} properties
                      </p>
                    </div>
                  </div>
                  <PropertyList
                    properties={properties}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    loading={loading}
                    viewMode="grid"
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hero-section {
          /* Updated to a blue gradient to match the main UI color scheme */
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          padding: 80px 0;
          color: white;
        }
        
        .hero-title-wrapper {
          text-align: center;
        }

        .hero-title-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 15px;
        }

        .hero-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 2.5rem;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 0;
          white-space: nowrap;
        }

        .hero-line {
          flex: 1;
          height: 2px;
          background-color: rgba(255, 255, 255, 0.7);
          max-width: 200px;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          max-width: 700px;
          margin: 0 auto;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .results-info {
          position: relative;
          padding-bottom: 20px;
          margin-bottom: 30px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .results-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 2rem;
          color: #2c3e50;
          position: relative;
        }
        
        .results-count {
          font-size: 1.1rem;
          color: #666;
        }

        .material-icons.empty-icon {
          font-size: 5rem;
          color: #ddd;
          margin-bottom: 1rem;
        }

        .hero-icon {
          vertical-align: text-bottom;
          margin-right: 10px;
          font-size: 2.2rem;
          color: #FFD700;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
          }
          
          .results-title {
            font-size: 1.7rem;
          }
        }

        /* Extra adjustments for small mobile screens */
        @media (max-width: 576px) {
          .hero-section {
            padding: 60px 0 40px 0;
          }

          .hero-title-container {
            flex-direction: column;
            gap: 10px;
          }

          .hero-line {
            max-width: 100px;
          }

          .hero-title {
            font-size: 1.6rem;
            white-space: normal;
          }

          .hero-subtitle {
            font-size: 0.95rem;
          }

          .hero-icon {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyTypePage; 