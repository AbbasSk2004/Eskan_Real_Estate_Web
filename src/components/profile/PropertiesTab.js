import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { propertyService } from '../../services/propertyService';
import { toast } from 'react-toastify';
import PropertyCard from './PropertyCard';
import LoadingSpinner from '../common/LoadingSpinner';


const PropertiesTab = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadProperties();
  }, [user]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
      if (!accessToken) {
        setProperties([]);
        setError('Please log in to view your properties');
        setLoading(false);
        return;
      }

      const response = await propertyService.getUserProperties();
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to load properties');
      }
      
      // Set properties directly from the response data
      setProperties(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load properties');
      toast.error('Failed to load your properties');
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      const response = await propertyService.deleteProperty(propertyId);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Failed to delete property');
      }

      toast.success('Property deleted successfully');
      setProperties(properties.filter(prop => prop.id !== propertyId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete property');
      console.error('Error deleting property:', err);
    }
  };

  if (!user) {
    return (
      <div className="alert alert-warning" role="alert">
        <div className="d-flex flex-column align-items-center text-center py-3">
          <i className="fas fa-user-lock fa-3x mb-3"></i>
          <h5>Authentication Required</h5>
          <p className="mb-3">Please log in to view your properties.</p>
          <Link to="/login" className="btn btn-primary">
            <i className="fas fa-sign-in-alt me-2"></i>
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <LoadingSpinner />
        <p className="mt-2 text-muted">Loading your properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <div className="d-flex flex-column align-items-center text-center py-3">
          <i className="fas fa-exclamation-circle fa-3x mb-3"></i>
          <h5>Error Loading Properties</h5>
          <p className="mb-3">{error}</p>
          <button 
            className="btn btn-danger"
            onClick={loadProperties}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-4">
        <i className="fas fa-home fa-4x text-muted mb-3"></i>
        <h5>No Verified Properties Found</h5>
        <p className="text-muted mb-3">
          You haven't listed any verified properties yet, or your properties are still pending verification.
        </p>
        <Link to="/add-property" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>
          Add Property
        </Link>
      </div>
    );
  }

  return (
    <div className="properties-tab">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">My Properties</h4>
        <Link to="/add-property" className="btn btn-primary">
          Add New Property
        </Link>
      </div>

      <div className="row g-4">
        {properties.map(property => (
          <div key={property.id} className="col-12 col-md-6 col-lg-4">
            <PropertyCard 
              property={property}
              showActions={true}
              onDelete={handleDeleteProperty}
              showFavorite={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertiesTab;