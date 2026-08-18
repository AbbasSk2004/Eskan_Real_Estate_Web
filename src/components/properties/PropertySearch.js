'use client';

import React, { useState } from 'react';
import { PROPERTY_TYPES, PROPERTY_STATUSES } from '../../constants/propertyConstants';
import { LEBANESE_GOVERNORATES, CITIES_BY_GOVERNORATE, VILLAGES_BY_CITY } from '../../constants/lebanonLocations';

const FEATURE_GROUPS = {
  essential: [
    { key: 'parking', label: 'Parking', icon: 'fa-car' },
    { key: 'elevator', label: 'Elevator', icon: 'fa-arrows-alt-v' },
    { key: 'airConditioning', label: 'Air Conditioning', icon: 'fa-snowflake' },
    { key: 'heating', label: 'Heating', icon: 'fa-fire' },
    { key: 'internet', label: 'Internet', icon: 'fa-wifi' },
    { key: 'security', label: 'Security', icon: 'fa-shield-alt' },
    { key: 'generator', label: 'Generator', icon: 'fa-bolt' },
    { key: 'waterTank', label: 'Water Tank', icon: 'fa-tint' },
  ],
  luxury: [
    { key: 'swimmingPool', label: 'Swimming Pool', icon: 'fa-swimmer' },
    { key: 'garden', label: 'Garden', icon: 'fa-leaf' },
    { key: 'balcony', label: 'Balcony', icon: 'fa-building' },
    { key: 'solarPanels', label: 'Solar Panels', icon: 'fa-solar-panel' },
    { key: 'fireplace', label: 'Fireplace', icon: 'fa-fire' },
    { key: 'bbqArea', label: 'BBQ Area', icon: 'fa-utensils' },
    { key: 'storage', label: 'Storage', icon: 'fa-box' },
    { key: 'irrigation', label: 'Irrigation', icon: 'fa-tint' },
  ],
  location: [
    { key: 'near_seafront', label: 'Near Seafront', icon: 'fa-water' },
    { key: 'near_mountains', label: 'Near Mountains', icon: 'fa-mountain' },
    { key: 'near_schools', label: 'Near Schools', icon: 'fa-school' },
    { key: 'near_hospitals', label: 'Near Hospitals', icon: 'fa-hospital' },
    { key: 'near_malls', label: 'Near Malls', icon: 'fa-shopping-bag' },
    { key: 'near_public_transport', label: 'Near Public Transport', icon: 'fa-bus' },
  ],
};

const PropertySearch = ({ filters, setFilters, onSearch, showAdvanced = true }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };

    if (key === 'governorate') {
      newFilters.city = '';
      newFilters.village = '';
    } else if (key === 'city') {
      newFilters.village = '';
    }

    setFilters(newFilters);
  };

  const handleFeatureToggle = (feature) => {
    handleFilterChange(feature, !filters[feature]);
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      keyword: '',
      propertyType: '',
      status: 'all',
      governorate: '',
      city: '',
      village: '',
      priceMin: '',
      priceMax: '',
      areaMin: '',
      areaMax: '',
      bedrooms: '',
      bathrooms: '',
      // Reset all features
      airConditioning: false,
      heating: false,
      internet: false,
      parking: false,
      swimmingPool: false,
      generator: false,
      waterTank: false,
      security: false,
      balcony: false,
      elevator: false,
      solarPanels: false,
      garden: false,
      fireplace: false,
      bbqArea: false,
      irrigation: false,
      storage: false,
      near_seafront: false,
      near_mountains: false,
      near_schools: false,
      near_hospitals: false,
      near_malls: false,
      near_public_transport: false,
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'status' && value === 'all') return false;
      return value && value !== '' && value !== false;
    }).length;
  };

  const villages = filters.city ? (VILLAGES_BY_CITY[filters.city] || []) : [];

  return (
    <div className="property-search bg-light py-4">
      <div className="container-fluid px-4 px-lg-5">
        {/* Main Search Form */}
        <div className="card">
          <div className="card-body">
            <div className="row g-3">
              {/* Keyword Search */}
              <div className="col-12 col-md-6 col-lg-2">
                <label className="form-label">Search</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fa fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Keyword, location, or ID"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* Property Type */}
              <div className="col-12 col-md-6 col-lg-2">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="col-12 col-md-6 col-lg-2">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All</option>
                  {PROPERTY_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Governorate */}
              <div className="col-12 col-md-6 col-lg-2">
                <label className="form-label">Governorate</label>
                <select
                  className="form-select"
                  value={filters.governorate}
                  onChange={(e) => handleFilterChange('governorate', e.target.value)}
                >
                  <option value="">All Governorates</option>
                  {Object.keys(LEBANESE_GOVERNORATES).map((governorate) => (
                    <option key={governorate} value={governorate}>{governorate}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="col-12 col-md-6 col-lg-2">
                <label className="form-label">City</label>
                <select
                  className="form-select"
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  disabled={!filters.governorate}
                >
                  <option value="">All Cities</option>
                  {filters.governorate && CITIES_BY_GOVERNORATE[filters.governorate]?.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Village */}
              <div className="col-12 col-md-6 col-lg-2">
                <label className="form-label">Village</label>
                <select
                  className="form-select"
                  value={filters.village}
                  onChange={(e) => handleFilterChange('village', e.target.value)}
                  disabled={!filters.city}
                >
                  <option value="">All Villages</option>
                  {villages.map(village => (
                    <option key={village} value={village}>{village}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <>
                <div className="row mt-3">
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none flex-wrap"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      <i className={`fa fa-chevron-${showAdvancedFilters ? 'up' : 'down'} me-2`}></i>
                      Advanced Filters
                      {getActiveFiltersCount() > 0 && (
                        <span className="badge bg-primary ms-2">{getActiveFiltersCount()}</span>
                      )}
                    </button>
                  </div>
                </div>

                {showAdvancedFilters && (
                  <div className="mt-3 pt-3 border-top">
                    <div className="row g-3">
                      {/* Min Price */}
                      <div className="col-12 col-md-6 col-lg-2">
                        <label className="form-label">Min Price ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Min"
                          value={filters.priceMin}
                          min="0"
                          onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        />
                      </div>

                      {/* Max Price */}
                      <div className="col-12 col-md-6 col-lg-2">
                        <label className="form-label">Max Price ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Max"
                          value={filters.priceMax}
                          min="0"
                          onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        />
                      </div>

                      {/* Min Area */}
                      <div className="col-12 col-md-6 col-lg-2">
                        <label className="form-label">Min Area (m²)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Min"
                          value={filters.areaMin}
                          min="0"
                          onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                        />
                      </div>

                      {/* Max Area */}
                      <div className="col-12 col-md-6 col-lg-2">
                        <label className="form-label">Max Area (m²)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Max"
                          value={filters.areaMax}
                          min="0"
                          onChange={(e) => handleFilterChange('areaMax', e.target.value)}
                        />
                      </div>

                      {/* Bedrooms */}
                      <div className="col-12 col-md-6 col-lg-2">
                        <label className="form-label">Min Bedrooms</label>
                        <select
                          className="form-select"
                          value={filters.bedrooms}
                          onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                        >
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                          <option value="5">5+</option>
                        </select>
                      </div>

                      {/* Bathrooms */}
                      <div className="col-12 col-md-6 col-lg-2">
                        <label className="form-label">Min Bathrooms</label>
                        <select
                          className="form-select"
                          value={filters.bathrooms}
                          onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                        >
                          <option value="">Any</option>
                          <option value="1">1+</option>
                          <option value="2">2+</option>
                          <option value="3">3+</option>
                          <option value="4">4+</option>
                        </select>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="row mt-4 g-3">
                      <div className="col-12">
                        <h6 className="mb-3">Features &amp; Amenities</h6>
                      </div>
                      {Object.entries(FEATURE_GROUPS).map(([groupName, features]) => (
                        <div key={groupName} className="col-12 col-md-4">
                          <h6 className="small text-muted mb-2 text-capitalize">{groupName}</h6>
                          <div className="row g-2">
                            {features.map(feature => (
                              <div key={feature.key} className="col-12 col-sm-6">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={feature.key}
                                    checked={filters[feature.key] || false}
                                    onChange={() => handleFeatureToggle(feature.key)}
                                  />
                                  <label className="form-check-label small" htmlFor={feature.key}>
                                    <i className={`fa ${feature.icon} me-1`}></i>
                                    {feature.label}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSearch}
                  >
                    <i className="fa fa-search me-2"></i>
                    Search Properties
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                  >
                    <i className="fa fa-refresh me-2"></i>
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;