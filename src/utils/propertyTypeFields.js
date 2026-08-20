// Property type specific fields and features configuration
// Single Source of Truth for PROPERTY_TYPES: src/constants/propertyConstants.js
// Single Source of Truth for locations: src/constants/lebanonLocations.js
export const PROPERTY_TYPE_FIELDS = {
  Apartment: {
    details: [
      { name: 'floor', label: 'Floor', type: 'number', placeholder: 'e.g. 3', min: 0 }
    ],
    features: [
      'airConditioning', 'heating', 'internet', 'parking', 'balcony', 'elevator',
      'generator', 'waterTank', 'security'
    ],
    showStandard: {
      bedrooms: true,
      bathrooms: true,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: true,
      livingrooms: true
    },
    cardFields: ['bedrooms', 'bathrooms', 'area']
  },
  Villa: {
    details: [
      { name: 'gardenArea', label: 'Garden Area (m²)', type: 'number', placeholder: 'e.g. 150', min: 0 },
      { name: 'floors', label: 'Number of Floors', type: 'number', placeholder: 'e.g. 2', min: 1 }
    ],
    features: [
      'airConditioning', 'heating', 'internet', 'parking', 'swimmingPool', 'generator',
      'waterTank', 'security', 'balcony', 'solarPanels', 'garden', 'fireplace', 'bbqArea'
    ],
    showStandard: {
      bedrooms: true,
      bathrooms: true,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: true,
      livingrooms: true
    },
    cardFields: ['bedrooms', 'bathrooms', 'area']
  },
  Chalet: {
    details: [
      { name: 'floor', label: 'Floor', type: 'number', placeholder: 'e.g. 1', min: 0 },
      { name: 'view', label: 'View', type: 'select', options: ['Sea', 'Mountain', 'Garden', 'Pool', 'City', 'Other'] },
      { name: 'gardenArea', label: 'Garden Area (m²)', type: 'number', placeholder: 'e.g. 50', min: 0 }
    ],
    features: [
      'airConditioning', 'heating', 'balcony', 'fireplace', 'swimmingPool', 'generator',
      'waterTank', 'security', 'parking', 'garden', 'bbqArea'
    ],
    showStandard: {
      bedrooms: true,
      bathrooms: true,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: true,
      livingrooms: true
    },
    cardFields: ['bedrooms', 'bathrooms', 'area'
    ]
  },
  Office: {
    details: [
      { name: 'meetingRooms', label: 'Meeting Rooms', type: 'number', placeholder: 'e.g. 2', min: 0 },
      { name: 'officeLayout', label: 'Office Layout', type: 'text', placeholder: 'e.g. Open Plan, Cubicles' }
    ],
    features: [
      'airConditioning', 'internet', 'parking', 'generator', 'elevator', 'security'
    ],
    showStandard: {
      bedrooms: false,
      bathrooms: true,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: true
    },
    cardFields: ['meeting_rooms', 'parking_spaces', 'area']
  },
  Retail: {
    details: [
      { name: 'shopFrontWidth', label: 'Shop Front Width (m)', type: 'number', placeholder: 'e.g. 5', min: 0 },
      { name: 'storageArea', label: 'Storage Area (m²)', type: 'number', placeholder: 'e.g. 20', min: 0 }
    ],
    features: [
      'airConditioning', 'security', 'parking', 'generator', 'internet'
    ],
    showStandard: {
      bedrooms: false,
      bathrooms: true,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: true
    },
    cardFields: ['shop_front_width', 'storage_area', 'area']
  },
  Building: {
    details: [
      { name: 'floors', label: 'Number of Floors', type: 'number', placeholder: 'e.g. 5', min: 1 },
      { name: 'units', label: 'Number of Units', type: 'number', placeholder: 'e.g. 20', min: 1 },
      { name: 'elevators', label: 'Number of Elevators', type: 'number', placeholder: 'e.g. 2', min: 0 }
    ],
    features: [
      'parking', 'generator', 'waterTank', 'security', 'elevator', 'garden'
    ],
    showStandard: {
      bedrooms: false,
      bathrooms: false,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: false
    },
    cardFields: ['floor', 'units', 'area']
  },
  Land: {
    details: [
      { name: 'plotSize', label: 'Plot Size (m²)', type: 'number', placeholder: 'e.g. 500', min: 0 },
      { 
        name: 'landType', 
        label: 'Land Type', 
        type: 'select', 
        options: ['Residential', 'Agricultural', 'Commercial', 'Industrial', 'Mixed-Use', 'Other'],
        placeholder: 'Select Land Type'
      },
      { 
        name: 'zoning', 
        label: 'Zoning', 
        type: 'select', 
        options: ['Residential', 'Commercial', 'Mixed-Use', 'Industrial', 'Agricultural', 'Other'],
        placeholder: 'Select Zoning'
      }
    ],
    features: [
      'waterSource', 'electricity', 'roadAccess'
    ],
    showStandard: {
      bedrooms: false,
      bathrooms: false,
      parkingSpaces: false,
      yearBuilt: false,
      furnishingStatus: false
    },
    cardFields: ['plot_size', 'land_type', 'area']
  },
  Warehouse: {
    details: [
      { name: 'ceilingHeight', label: 'Ceiling Height (m)', type: 'number', placeholder: 'e.g. 6', min: 0 },
      { name: 'loadingDocks', label: 'Loading Docks', type: 'number', placeholder: 'e.g. 2', min: 0 }
    ],
    features: [
      'generator', 'security', 'parking', 'storage', 'electricity'
    ],
    showStandard: {
      bedrooms: false,
      bathrooms: true,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: false
    },
    cardFields: ['ceiling_height', 'loading_docks', 'area'] // always include ceiling_height
  },
  Farm: {
    details: [
      { 
        name: 'waterSource', 
        label: 'Water Source', 
        type: 'select', 
        options: ['Well', 'River', 'Municipal', 'None', 'Other'],
        placeholder: 'Select Water Source'
      },
      { 
        name: 'cropTypes', 
        label: 'Crop Types', 
        type: 'select', 
        options: ['Olives', 'Grapes', 'Wheat', 'Vegetables', 'Fruits', 'Other'],
        placeholder: 'Select Crop Type'
      }
    ],
    features: [
      'irrigation', 'storage', 'electricity', 'roadAccess', 'solarPanels'
    ],
    showStandard: {
      bedrooms: true,
      bathrooms: true,
      parkingSpaces: true,
      yearBuilt: true,
      furnishingStatus: false,
      area: true
    },
    cardFields: ['water_source', 'crop_types', 'area']
  }
};

// Additional features that can be selected for any property type
export const COMMON_FEATURES = {
  airConditioning: 'Air Conditioning',
  heating: 'Heating',
  internet: 'Internet',
  parking: 'Parking',
  swimmingPool: 'Swimming Pool',
  generator: 'Generator',
  waterTank: 'Water Tank',
  security: 'Security System',
  balcony: 'Balcony',
  elevator: 'Elevator',
  solarPanels: 'Solar Panels',
  waterSource: 'Water Source',
  electricity: 'Electricity',
  roadAccess: 'Road Access',
  irrigation: 'Irrigation System',
  storage: 'Storage Facilities',
  garden: 'Garden',
  bbqArea: 'BBQ Area',
  fireplace: 'Fireplace'
};

export const CARD_FIELD_ICONS = {
  bedrooms: { icon: 'king_bed', label: 'Bed' },
  bathrooms: { icon: 'bathtub', label: 'Bath' },
  area: { icon: 'square_foot', label: 'm²' },
  parkingSpaces: { icon: 'directions_car', label: 'Parking' },
  meetingRooms: { icon: 'meeting_room', label: 'Meeting' },
  shopFrontWidth: { icon: 'storefront', label: 'Shop Front' },
  storageArea: { icon: 'inventory_2', label: 'Storage' },
  floors: { icon: 'layers', label: 'Floors' },
  units: { icon: 'apartment', label: 'Units' },
  plotSize: { icon: 'crop_square', label: 'Plot Size' },
  landType: { icon: 'terrain', label: 'Land Type' },
  zoning: { icon: 'map', label: 'Zoning' },
  ceilingHeight: { icon: 'height', label: 'Ceiling' },
  loadingDocks: { icon: 'local_shipping', label: 'Docks' },
  farmArea: { icon: 'agriculture', label: 'Farm Area' },
  waterSource: { icon: 'water_drop', label: 'Water' },
  cropTypes: { icon: 'eco', label: 'Crops' }
};

export { lebanonCities, lebanonVillages } from '../constants/lebanonLocations';
export { PROPERTY_TYPES } from '../constants/propertyConstants';

