import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserProperties } from '../hooks/useUserProperties';
import { useUserFavorites } from '../hooks/useUserFavorites';
import { useToast } from '../hooks/useToast';
import { endpoints } from '../services/api';

// Import all profile components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import OverviewTab from '../components/profile/OverviewTab';
import PropertiesTab from '../components/profile/PropertiesTab';
import FavoritesTab from '../components/profile/FavoritesTab';
import AgentStatusTab from '../components/profile/AgentStatusTab';
import ProfileSettings from '../components/profile/ProfileSettings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ChangePassword from '../components/profile/change_password';

const Profile = () => {
  const { user, setUser, updateUserState } = useAuth();
  const { properties, loading: propertiesLoading, refetchProperties } = useUserProperties();
  const { favorites, loading: favoritesLoading, refetchFavorites } = useUserFavorites();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [agentApplication, setAgentApplication] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const toast = useToast();

  // Fetch agent application status if exists
  useEffect(() => {
    const fetchAgentApplication = async () => {
      try {
        const response = await endpoints.agents.getApplicationDetails();
        if (response?.data) {
          setAgentApplication(response.data);
        }
      } catch (error) {
        console.debug('No agent application found:', error);
      }
    };

    if (user?.id) {
      fetchAgentApplication();
    }
  }, [user?.id]);

  // Handler for property deletion
  const handleDeleteProperty = async (propertyId) => {
    try {
      await endpoints.properties.deleteProperty(propertyId);
      await refetchProperties(); // Refresh properties list
      toast.success('Property deleted successfully');
    } catch (error) {
      console.error('Delete property error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete property');
    }
  };

  // Handler for removing favorites
  const handleRemoveFavorite = async (propertyId) => {
    try {
      await endpoints.favorites.removeFavorite(propertyId);
      await refetchFavorites(); // Refresh favorites list
      toast.success('Property removed from favorites');
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  // Handler for toggling change password component
  const handleToggleChangePassword = () => {
    setShowChangePassword(!showChangePassword);
  };

  if (loading || propertiesLoading || favoritesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {/* Header */}
      <div className="container-fluid header bg-white p-0">
        <div className="row g-0 align-items-center flex-column-reverse flex-md-row">
          <div className="col-md-12 p-5" style={{ marginTop: '100px' }}>
            <h1 className="display-5 animated fadeIn mb-4">My Profile</h1>
            <nav aria-label="breadcrumb animated fadeIn">
              <ol className="breadcrumb text-uppercase">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item text-body active" aria-current="page">Profile</li>
              </ol>
            </nav>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="container-xxl py-5">
        <div className="container">
          {/* Profile Header or Change Password */}
          {showChangePassword ? (
            <div className="row mb-5">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3>Change Your Password</h3>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handleToggleChangePassword}
                  >
                    <i className="fa fa-arrow-left me-2"></i>
                    Back to Profile
                  </button>
                </div>
                <ChangePassword />
              </div>
            </div>
          ) : (
            <ProfileHeader 
              currentUser={user} 
              updateUserState={updateUserState}
              onChangePassword={handleToggleChangePassword}
            />
          )}

          {/* Only show tabs when not changing password */}
          {!showChangePassword && (
            <>
              {/* Profile Navigation Tabs */}
              <ProfileTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userProperties={properties}
                favorites={favorites}
                agentApplication={agentApplication}
              />

              {/* Tab Content */}
              <div className="tab-content bg-light rounded p-4">
                {activeTab === 'overview' && (
                  <OverviewTab
                    userProperties={properties}
                    favorites={favorites}
                    agentApplication={agentApplication}
                  />
                )}

                {activeTab === 'properties' && (
                  <PropertiesTab
                    userProperties={properties}
                    onDeleteProperty={handleDeleteProperty}
                  />
                )}

                {activeTab === 'favorites' && (
                  <FavoritesTab
                    favorites={favorites}
                    onRemoveFromFavorites={handleRemoveFavorite}
                  />
                )}

                {activeTab === 'agent' && agentApplication && (
                  <AgentStatusTab agentApplication={agentApplication} />
                )}

                {activeTab === 'settings' && (
                  <ProfileSettings />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;