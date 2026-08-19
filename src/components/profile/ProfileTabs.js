'use client';
import React from 'react';

const ProfileTabs = ({ 
  activeTab, 
  setActiveTab, 
  userProperties, 
  favorites 
}) => {
  return (
    <div className="row mb-4">
      <div className="col-12">
        <ul className="nav nav-pills nav-fill flex-nowrap">
          <li className="nav-item">
            <button 
              className={`nav-link custom-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fa fa-chart-line me-2"></i>
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link custom-nav-link ${activeTab === 'properties' ? 'active' : ''}`}
              onClick={() => setActiveTab('properties')}
            >
              <i className="fa fa-home me-2"></i>
              My Properties
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link custom-nav-link ${activeTab === 'favorites' ? 'active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <i className="fa fa-heart me-2"></i>
              Favorites
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileTabs;