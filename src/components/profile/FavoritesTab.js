import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from './PropertyCard';
import EmptyState from './EmptyState';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { endpoints } from '../../services/api';


const FavoritesTab = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    
    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null;
        if (!accessToken) {
          setFavorites([]);
          setError('Please log in to view your favorites');
          setLoading(false);
          return;
        }
        
        const response = await endpoints.properties.getFavorites();
        
        if (!mounted) return;
        
        if (!response?.success) {
          throw new Error(response?.message || 'Failed to load favorites');
        }

        const favoriteData = response.data || [];
        setFavorites(favoriteData);
      } catch (err) {
        if (!mounted) return;
        
        const errorMessage = err.message || 'Failed to load favorites';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error loading favorites:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleRemoveFavorite = async (propertyId) => {
    try {
      if (!window.confirm('Are you sure you want to remove this property from favorites?')) {
        return;
      }

      setRemovingId(propertyId);
      await endpoints.properties.removeFromFavorites(propertyId);
      setFavorites(favorites.filter(f => f.id !== propertyId));
      toast.success('Property removed from favorites');
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove property from favorites';
      toast.error(errorMessage);
      console.error('Error removing favorite:', err);
    } finally {
      setRemovingId(null);
    }
  };

  if (!user) {
    return (
      <div className="alert alert-warning" role="alert">
        <div className="d-flex flex-column align-items-center text-center py-3">
          <i className="fas fa-user-lock fa-3x mb-3"></i>
          <h5>Authentication Required</h5>
          <p className="mb-3">Please log in to view your favorite properties.</p>
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
        <LoadingSpinner text="Loading your favorites..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <div className="d-flex flex-column align-items-center text-center py-3">
          <i className="fas fa-exclamation-circle fa-3x mb-3"></i>
          <h5>Error Loading Favorites</h5>
          <p className="mb-3">{error}</p>
          <button 
            className="btn btn-danger"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-sync-alt me-2"></i>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!favorites?.length) {
    return (
      <EmptyState
        icon="fa-heart"
        title="No Favorite Properties"
        message="You haven't added any properties to your favorites yet."
        actionText="Browse Properties"
        actionLink="/properties"
      />
    );
  }

  return (
    <div>
      <h4 className="mb-4">Favorite Properties</h4>
      <div className="row g-4">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="col-12 col-md-6 col-lg-4">
            <div className="position-relative">
              <PropertyCard 
                property={favorite} 
                showActions={true}
                onDelete={handleRemoveFavorite}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesTab;