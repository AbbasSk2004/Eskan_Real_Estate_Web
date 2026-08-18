// Single Source of Truth for property types and statuses.
// Values exactly match the data stored in the MongoDB `properties` collection
// (the backend Property model stores plain strings, no enums).

export const PROPERTY_TYPES = [
  { value: 'Apartment', label: 'Apartment', icon: 'apartment' },
  { value: 'Villa', label: 'Villa', icon: 'villa' },
  { value: 'Chalet', label: 'Chalet', icon: 'holiday_village' },
  { value: 'Office', label: 'Office Space', icon: 'business_center' },
  { value: 'Retail', label: 'Retail Space', icon: 'storefront' },
  { value: 'Building', label: 'Building', icon: 'location_city' },
  { value: 'Land', label: 'Land', icon: 'terrain' },
  { value: 'Warehouse', label: 'Warehouse', icon: 'warehouse' },
  { value: 'Farm', label: 'Farm', icon: 'agriculture' }
];

export const PROPERTY_STATUSES = [
  { value: 'For Sale', label: 'For Sale' },
  { value: 'For Rent', label: 'For Rent' }
];

export const PROPERTY_TYPE_VALUES = PROPERTY_TYPES.map((type) => type.value);

export const PROPERTY_STATUS_VALUES = PROPERTY_STATUSES.map((status) => status.value);