import React, { useState, useEffect } from 'react';
import { PROPERTY_TYPES } from '../../utils/propertyTypeFields';
import { PROPERTY_TYPE_FIELDS, COMMON_FEATURES, lebanonCities, lebanonVillages } from '../../utils/propertyTypeFields';
import { PROPERTY_STATUS, BEDROOM_OPTIONS, BATHROOM_OPTIONS } from '../../utils/constants';
import '../../assets/css/PropertyFilters.css';
import { storeUserPreferences } from '../../services/recommendation';

const PropertyFilters = ({ onFilterChange, onReset, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    propertyType: '',
    status: '',
    governorate: '',
    city: '',
    village: '',
    priceMin: '',
    priceMax: '',
    areaMin: '',
    areaMax: '',
    bedrooms: '',
    bathrooms: '',
    ...initialFilters
  });

  const [cities, setCities] = useState([]);
  const [villages, setVillages] = useState([]);
  const [cityDisabled, setCityDisabled] = useState(true);
  const [villageDisabled, setVillageDisabled] = useState(true);

  const [filtersOpen, setFiltersOpen] = useState(true);

  // Get current property type configuration
  const typeConfig = PROPERTY_TYPE_FIELDS[filters.propertyType] || {
    details: [],
    features: [],
    showStandard: {
      bedrooms: true,
      bathrooms: true,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: true
    }
  };

  // Update cities when governorate changes
  useEffect(() => {
    if (filters.governorate) {
      setCities(lebanonCities[filters.governorate] || []);
      setCityDisabled(false);
      // Reset city and village when governorate changes
      if (filters.city) {
        handleInputChange({ target: { name: 'city', value: '' } });
      }
      if (filters.village) {
        handleInputChange({ target: { name: 'village', value: '' } });
      }
      setVillages([]);
      setVillageDisabled(true);
    } else {
      setCities([]);
      setCityDisabled(true);
    }
  }, [filters.governorate]);

  // Update villages when city changes
  useEffect(() => {
    if (filters.city) {
      const cityVillages = lebanonVillages[filters.city] || [];
      setVillages(cityVillages);
      setVillageDisabled(false);
      // Reset village when city changes
      if (filters.village && !cityVillages.includes(filters.village)) {
        handleInputChange({ target: { name: 'village', value: '' } });
      }
    } else {
      setVillages([]);
      setVillageDisabled(true);
    }
  }, [filters.city]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Convert numeric values
    if (['priceMin', 'priceMax', 'areaMin', 'areaMax', 'bedrooms', 'bathrooms'].includes(name)) {
      processedValue = value === '' ? '' : Number(value);
    }

    setFilters(prev => ({ ...prev, [name]: processedValue }));
    onFilterChange(name, processedValue);
    
    // Store updated filters in local storage
    const updatedFilters = { ...filters, [name]: processedValue };
    storeUserPreferences(updatedFilters);
  };

  const handleFeatureToggle = (featureName) => {
    const newValue = !filters[featureName];
    setFilters(prev => ({ ...prev, [featureName]: newValue }));
    onFilterChange(featureName, newValue);
    
    // Store updated filters in local storage
    const updatedFilters = { ...filters, [featureName]: newValue };
    storeUserPreferences(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      propertyType: '',
      status: '',
      governorate: '',
      city: '',
      village: '',
      priceMin: '',
      priceMax: '',
      areaMin: '',
      areaMax: '',
      bedrooms: '',
      bathrooms: ''
    };
    setFilters(resetFilters);
    onReset();
    
    // Clear stored preferences
    storeUserPreferences({});
  };

  return (
    <aside className="filter-sidebar h-100">
      <div className="accordion" id="filterAccordion">
        <div className="accordion-item border-0">
          <div className="accordion-header">
            <button
              className={`accordion-button shadow-none ps-0 ${filtersOpen ? '' : 'collapsed'}`}
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(prev => !prev)}
            >
              <h5 className="mb-0">Filter Properties</h5>
            </button>
          </div>
          
          <div id="filtersCollapse" className={`accordion-collapse collapse ${filtersOpen ? 'show' : ''}`}>
            <div className="accordion-body px-0">
              {/* Property Type */}
              <div className="mb-4">
                <label className="form-label text-dark fw-semibold">Property Type</label>
                <select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">All Types</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="form-label text-dark fw-semibold">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">All Status</option>
                  {PROPERTY_STATUS.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="form-label text-dark fw-semibold">Governorate</label>
                <select
                  name="governorate"
                  value={filters.governorate}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">All Governorates</option>
                  {Object.keys(lebanonCities).map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div className="mb-4">
                <label className="form-label text-dark fw-semibold">City</label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={cityDisabled}
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Village */}
              <div className="mb-4">
                <label className="form-label text-dark fw-semibold">Village</label>
                <select
                  name="village"
                  value={filters.village}
                  onChange={handleInputChange}
                  className="form-select"
                  disabled={villageDisabled}
                >
                  <option value="">All Villages</option>
                  {villages.map(village => (
                    <option key={village} value={village}>{village}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="form-label text-dark fw-semibold">Price Range (USD)</label>
                <div className="row g-2">
                  <div className="col-12 col-sm-6">
                    <input
                      type="number"
                      name="priceMin"
                      value={filters.priceMin}
                      onChange={handleInputChange}
                      placeholder="Min Price"
                      className="form-control"
                      min="0"
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <input
                      type="number"
                      name="priceMax"
                      value={filters.priceMax}
                      onChange={handleInputChange}
                      placeholder="Max Price"
                      className="form-control"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Area Range */}
              <div className="mb-4">
                <label className="form-label text-dark fw-semibold">Area (m²)</label>
                <div className="row g-2">
                  <div className="col-12 col-sm-6">
                    <input
                      type="number"
                      name="areaMin"
                      value={filters.areaMin}
                      onChange={handleInputChange}
                      placeholder="Min Area"
                      className="form-control"
                      min="0"
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <input
                      type="number"
                      name="areaMax"
                      value={filters.areaMax}
                      onChange={handleInputChange}
                      placeholder="Max Area"
                      className="form-control"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              {typeConfig.showStandard.bedrooms && (
                <div className="mb-4">
                  <label className="form-label text-dark fw-semibold">Bedrooms</label>
                  <select
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Any</option>
                    {BEDROOM_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bathrooms */}
              {typeConfig.showStandard.bathrooms && (
                <div className="mb-4">
                  <label className="form-label text-dark fw-semibold">Bathrooms</label>
                  <select
                    name="bathrooms"
                    value={filters.bathrooms}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Any</option>
                    {BATHROOM_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Features */}
              {typeConfig.features.length > 0 && (
                <div className="mb-4">
                  <label className="form-label text-dark fw-semibold">Features</label>
                  <div className="row g-2">
                    {typeConfig.features.map(feature => (
                      <div key={feature} className="col-12 col-sm-6">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            id={feature}
                            name={feature}
                            checked={filters[feature] || false}
                            onChange={() => handleFeatureToggle(feature)}
                            className="form-check-input"
                          />
                          <label htmlFor={feature} className="form-check-label">
                            {COMMON_FEATURES[feature] || feature}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="btn btn-light w-100 text-dark-emphasis"
              >
                <i className="bi bi-arrow-counterclockwise me-2"></i>Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PropertyFilters;