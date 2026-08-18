'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import api from '../../services/axiosClient';

const FavoriteButton = ({ propertyId, className = '', ownerId }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated && propertyId) {
      checkFavoriteStatus();
    }
  }, [propertyId, isAuthenticated]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get(`/favorites/${propertyId}/status`);
      setIsFavorited(response.data.isFavorited);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      // Don't show error to user, just set to false
      setIsFavorited(false);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please login to add properties to favorites');
      window.location.href = '/login';
      return;
    }

    // Check if user is trying to favorite their own property
    const isOwnProperty = user?.id === ownerId || user?.profile?.id === ownerId;
    if (isOwnProperty) {
      toast.info("You can't add your own property to favorites");
      return;
    }

    if (loading) return; // Prevent multiple clicks while processing

    setLoading(true);
    try {
      if (isFavorited) {
        // Remove from favorites
        await api.delete(`/favorites/${propertyId}`);
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        // Add to favorites
        await api.post(`/favorites/${propertyId}`);
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to add properties to favorites');
        window.location.href = '/login';
      } else {
        toast.error(error.response?.data?.message || 'Failed to update favorite status. Please try again.');
        await checkFavoriteStatus(); // Refresh the current state
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render the button if it's the user's own property
  const isOwnProperty = user?.id === ownerId || user?.profile?.id === ownerId;
  if (!isAuthenticated || isOwnProperty) {
    return null;
  }

  return (
    <button
      className={`favorite-btn ${className}`}
      onClick={handleToggleFavorite}
      style={{
        border: 'none',
        background: 'transparent',
        padding: 0,
        cursor: loading ? 'wait' : 'pointer',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
      }}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      type="button"
    >
      <i
        className={`${isFavorited ? 'fas' : 'far'} fa-heart`}
        style={{
          fontSize: '24px',
          color: isFavorited ? '#ed4956' : '#8e8e8e',
          transition: 'all 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
          transform: `scale(${isFavorited ? 1 : 0.95})`,
          opacity: loading ? 0.6 : 1,
          filter: isFavorited 
            ? 'drop-shadow(0 0 2px rgba(237, 73, 86, 0.3))'
            : 'none',
        }}
      />
    </button>
  );
};

export default FavoriteButton;
