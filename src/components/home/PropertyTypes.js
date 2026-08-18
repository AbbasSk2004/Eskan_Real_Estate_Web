'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  MdApartment,
  MdVilla,
  MdHolidayVillage,
  MdBusinessCenter,
  MdStorefront,
  MdLocationCity,
  MdTerrain,
  MdWarehouse,
  MdAgriculture,
  MdHomeWork,
} from 'react-icons/md';
import { PROPERTY_TYPES } from '../../utils/propertyTypeFields';
import './PropertyTypes.css';

// Dictionary mapping backend icon keys to SVG components. Keys that are not
// present here (or new keys added later) fall back to MdHomeWork instead of
// leaking raw string identifiers into the DOM.
const PROPERTY_TYPE_ICONS = {
  apartment: MdApartment,
  villa: MdVilla,
  holiday_village: MdHolidayVillage,
  business_center: MdBusinessCenter,
  storefront: MdStorefront,
  location_city: MdLocationCity,
  terrain: MdTerrain,
  warehouse: MdWarehouse,
  agriculture: MdAgriculture,
};

const TypeIcon = ({ iconKey }) => {
  const Icon = PROPERTY_TYPE_ICONS[iconKey] || MdHomeWork;
  return <Icon aria-hidden="true" focusable="false" />;
};

const PropertyTypes = () => {
  const router = useRouter();

  const handlePropertyTypeClick = (type) => {
    router.push(`/properties/type/${type.value}`);
  };

  return (
    <div className="container-xxl py-5">
      <div className="container">
        {/* Title with full-width lines */}
        <div className="property-types-title-wrapper mb-4 mb-md-5 wow fadeInUp" data-wow-delay="0.1s">
          <div className="property-types-title-container">
            <div className="property-line" />
            <h1 className="section-title">Property Types</h1>
            <div className="property-line" />
          </div>
          <p className="property-subtitle">Browse through our diverse range of property types to find what suits your needs best.</p>
        </div>

        {/* Property types grid */}
        <div className="row g-3 g-md-4">
          {PROPERTY_TYPES.map((type, index) => (
            <div
              key={type.value}
              className="col-6 col-md-4 col-lg-3 wow fadeInUp"
              data-wow-delay={`${0.1 + index * 0.1}s`}
              onClick={() => handlePropertyTypeClick(type)}
              style={{ cursor: 'pointer' }}
            >
              <div className="property-type-card">
                <div className="icon-container">
                  <span className="property-icon">
                    <TypeIcon iconKey={type.icon} />
                  </span>
                </div>
                <h6 className="property-label">{type.label}</h6>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyTypes;
