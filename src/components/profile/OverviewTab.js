'use client';
import React, { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import { getUserFavorites } from '../../services/favorites.service';
import { propertyService } from '../../services/propertyService';
import { useToast } from '../../hooks/useToast';


const OverviewTab = () => {
  const [stats, setStats] = useState({
    propertiesCount: 0,
    favoritesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const toast = useToast();

  const fetchUserStats = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRetrying(true);
      }
      setLoading(true);
      setError(null);

// Check if user is authenticated
const isLoggedIn = typeof window !== 'undefined' && !!sessionStorage.getItem('user');
if (!isLoggedIn) {
setStats({
propertiesCount: 0,
favoritesCount: 0
        });
        setLoading(false);
        return;
      }

      // Fetch all stats in parallel
      const [propertiesResponse, favoritesResponse] = await Promise.all([
        propertyService.getUserProperties().catch(error => ({
          success: false,
          error: error.message || 'Failed to fetch property stats'
        })),
        getUserFavorites().catch(error => ({
          success: false,
          error: error.message || 'Failed to fetch favorite stats'
        }))
      ]);

      const newStats = {
        propertiesCount: 0,
        favoritesCount: 0
      };

      // Handle properties response
      if (!propertiesResponse.success && propertiesResponse.error) {
        console.error('Error fetching properties:', propertiesResponse.error);
      } else if (propertiesResponse?.success) {
        newStats.propertiesCount = propertiesResponse.data?.length || 0;
      }

      // Handle favorites response
      if (!favoritesResponse.success && favoritesResponse.error) {
        console.error('Error fetching favorites:', favoritesResponse.error);
      } else if (favoritesResponse?.success) {
        newStats.favoritesCount = favoritesResponse.data?.length || 0;
      }

      // Check if all requests failed
      if (!propertiesResponse.success && !favoritesResponse.success) {
        throw new Error('Failed to load statistics');
      }

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError(error.message || 'Failed to load statistics');
      if (!isRetry) {
        toast.error('Failed to load statistics');
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  const statsCards = [
    {
      icon: 'fa-home',
      iconColor: 'text-primary',
      count: stats.propertiesCount,
      label: 'Properties Listed',
      loading
    },
    {
      icon: 'fa-heart',
      iconColor: 'text-danger',
      count: stats.favoritesCount,
      label: 'Favorites',
      loading
    }
  ];

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <div className="d-flex flex-column align-items-center text-center py-3">
          <i className="fas fa-exclamation-circle fa-3x mb-3"></i>
          <p className="mb-3">{error}</p>
          <button 
            className="btn btn-danger"
            onClick={() => fetchUserStats(true)}
            disabled={retrying}
          >
            {retrying ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Retrying...
              </>
            ) : (
              <>
                <i className="fas fa-sync-alt me-2"></i>
                Retry
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overview-tab">
      <div className="row g-4">
        {/* Stats Cards */}
        <div className="col-12">
          <div className="row g-4">
            {statsCards.map((stat, index) => (
              <div key={index} className="col-6 col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3 ${stat.iconColor.replace('text-', 'bg-')}`}
                         style={{ width: '60px', height: '60px' }}>
                      <i className={`fas ${stat.icon} text-white fa-2x`}></i>
                    </div>
                    <h3 className={stat.iconColor}>{stat.count}</h3>
                    <p className="text-muted mb-0">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;