export interface PropertyFeatures {
  airConditioning?: boolean;
  heating?: boolean;
  internet?: boolean;
  parking?: boolean;
  swimmingPool?: boolean;
  generator?: boolean;
  waterTank?: boolean;
  security?: boolean;
  balcony?: boolean;
  elevator?: boolean;
  solarPanels?: boolean;
  [key: string]: boolean | undefined;
}

export type PropertyStatus = 'available' | 'sold' | 'rented' | 'pending';
export type PropertyType = 'Apartment' | 'House' | 'Villa' | 'Land' | 'Office' | 'Commercial' | 'Farm';

export interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  status: PropertyStatus;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  address: string | null;
  city: string | null;
  governate: string | null;
  village: string | null;
  features: PropertyFeatures;
  images: string[];
  profiles_id: string;
  created_at: string;
  updated_at: string;
  livingrooms: number | null;
  main_image: string | null;
  location_url: string | null;
}

export interface PropertyOwner {
  firstname: string;
  lastname: string;
  email: string;
  phone: string | null;
  profile_photo: string | null;
  full_name?: string;
  avatar_url?: string;
}

export interface PropertyWithOwner extends Property {
  owner: PropertyOwner | null;
}

export interface PropertyFormData {
  propertyTitle: string;
  description: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  price: string;
  bedrooms: string;
  bathrooms: string;
  livingrooms: string;
  area: string;
  address: string;
  city: string;
  governorate: string;
  village: string;
  features: PropertyFeatures;
  location_url: string;
  [key: string]: any;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  status?: PropertyStatus;
}

export interface PropertyResponse {
  properties: PropertyWithOwner[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ImageUploadResponse {
  url: string;
  path: string;
}

export interface PropertyValidationError {
  field: string;
  message: string;
} 