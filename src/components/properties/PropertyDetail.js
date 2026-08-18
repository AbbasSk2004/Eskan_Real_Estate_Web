'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useGlobalChat } from '../../context/ChatContext';
import { formatPrice } from '../../utils/formatters';
import { storeViewedProperty } from '../../services/recommendation';
import FavoriteButton from '../common/FavoriteButton';
import ShareProperty from '../properties/ShareProperty';
import PropertyImageGallery from '../properties/PropertyImageGallery';
import './PropertyDetail.css';
import { propertyService } from '../../services/propertyService';
import { chatService } from '../../services/chat.service';
import { getImageUrl } from '../../utils/imageUtils';

// Lazy load components that are not immediately needed
const SimilarProperties = React.lazy(() => import('../properties/SimilarProperties'));

import ContactOwnerModal from '../properties/ContactOwnerModal';

// Cache key generator for property data
const getPropertyCacheKey = (id) => `property_${id}`;

const PropertyDetail = ({ initialProperty }) => {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const { 
    startNewConversation, 
    setActiveConversation,
    setActiveConversationId,
    setShowChat
  } = useGlobalChat();
  
  const [property, setProperty] = useState(initialProperty ?? null);
  const [loading, setLoading] = useState(!initialProperty);
  const [error, setError] = useState(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const abortController = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const isMounted = useRef(true);
  const propertyCache = useRef(new Map());

  // Memoize property data for child components
  const memoizedPropertyData = useMemo(() => {
    if (!property) return null;
    return {
      id: property.id,
      propertyType: property.property_type,
      city: property.city,
      price: property.price,
      profiles: property.profiles
    };
  }, [property]);

  // Fetch property data with caching
  const fetchPropertyData = useCallback(async () => {
    if (!id || !isMounted.current) return;

    const cacheKey = getPropertyCacheKey(id);
    const cachedData = propertyCache.current.get(cacheKey);
    
    if (cachedData) {
      setProperty(cachedData);
      setError(null);
      setLoading(false);
      // Store in local storage for recommendations
      storeViewedProperty(cachedData);
      return;
    }

    try {
      abortController.current = new AbortController();
      
      const data = await propertyService.getPropertyById(id, {
        signal: abortController.current.signal
      });
      
      if (!isMounted.current) return;
      
      // Cache the property data
      propertyCache.current.set(cacheKey, data);
      
      setProperty(data);
      setError(null);
      
      // Store in local storage for recommendations
      storeViewedProperty(data);
    } catch (err) {
      if (!isMounted.current) return;
      if (err.name === 'AbortError') return;
      
      console.error('Error fetching property:', err);
      setError(err.message || 'Failed to load property details');
      toast.error('Failed to load property details');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, toast]);

  useEffect(() => {
    isMounted.current = true;

    if (initialProperty) {
      // Pre-rendered data: no refetch needed
      setProperty(initialProperty);
      setError(null);
      setLoading(false);

      // Store in local storage for recommendations
      storeViewedProperty(initialProperty);
    } else {
      fetchPropertyData();
    }

    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [id, initialProperty, fetchPropertyData]);

  // Memoize the chat handler
  const handleStartChat = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to send messages');
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!property?.profiles?.profiles_id) {
      toast.error('Cannot start chat: Owner information is missing');
      return;
    }

    // Prevent starting chat with yourself
    if (property.profiles.profiles_id === user.id) {
      toast.error('You cannot start a chat with yourself');
      return;
    }

    try {
      // First check if conversation exists
      const existingConversations = await chatService.fetchConversations();
      const existingConversation = existingConversations?.find(conv => 
        (conv.participant1_id === user.id && conv.participant2_id === property.profiles.profiles_id) ||
        (conv.participant1_id === property.profiles.profiles_id && conv.participant2_id === user.id)
      );

      if (existingConversation) {
        setActiveConversation(existingConversation);
        setActiveConversationId(existingConversation.id);
        setShowChat(true);
        return;
      }

      // If no existing conversation, create new one
      const conversation = await startNewConversation(
        property.profiles,
        property.id
      );

      if (conversation) {
        setActiveConversation(conversation);
        setActiveConversationId(conversation.id);
        setShowChat(true);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to start conversation. Please try again.';
      toast.error(errorMessage);
    }
  }, [user, property, router, pathname, startNewConversation, setActiveConversation, setActiveConversationId, setShowChat, toast]);

  // Function to handle redirect to login for inquiry button
  const handleInquiryClick = () => {
    if (!user) {
      toast.info('Please sign in to send an inquiry');
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
    }
  };

  // Open the contact modal + inquiry form automatically if user was redirected from login
  useEffect(() => {
    const from = searchParams.get('from');
    if (user && from && from === pathname) {
      setIsContactModalOpen(true);
      setInquiryOpen(true);
    }
  }, [user, pathname, searchParams]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="error-state py-5">
              <i className="fa fa-exclamation-triangle fa-4x text-warning mb-4"></i>
              <h3 className="fw-bold mb-3">Property Not Found</h3>
              <p className="text-muted mb-4 lead">
                {error || 'The property you are looking for does not exist or has been removed.'}
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Link href="/properties" className="btn btn-primary">
                  <i className="fa fa-search me-2"></i>
                  Browse Properties
                </Link>
                <button onClick={() => router.back()} className="btn btn-outline-secondary">
                  <i className="fa fa-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="property-detail-page bg-light">
      {property && (
        <>
          <PropertyImageGallery 
            mainImage={getImageUrl(property.main_image)}
            images={property.images ? property.images.map(img => getImageUrl(img)) : []} 
          />
          
          <div className="container py-4">
                {/* Unified content surface — full width, sections divided by hairlines */}
                <div className="property-card-main bg-white rounded-3 shadow-sm mb-4">
                {/* Property Header */}
                <section className="property-header property-section">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
                    <div className="flex-grow-1">
                      <div className="badge-container">
                        <div className="property-badge">
                          <span className={`badge ${property.status === 'For Sale' ? 'bg-success' : 'bg-primary'} px-3 py-2`}>
                            {property.status}
                          </span>
                        </div>
                        <div className="property-badge">
                          <span className="badge bg-light text-dark px-3 py-2">
                            <i className="fas fa-clock me-1"></i>
                            {new Date(property.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <h1 className="h2 fw-bold mb-2 text-dark">{property.title}</h1>
                      
                      <div className="location-info d-flex align-items-center text-muted mb-3">
                        <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                        <span>
                          {property.address && `${property.address}, `}
                          {property.village && `${property.village}, `}
                          {property.city && `${property.city}, `}
                          {property.governate}
                        </span>
                      </div>

                      <div className="price-section">
                        <h2 className="h3 text-primary fw-bold mb-0">
                          {formatPrice(property.price)}
                          {property.status === 'For Rent' && <span className="fs-6 text-muted">/month</span>}
                        </h2>
                      </div>
                    </div>
                    
                    <div className="action-buttons d-flex flex-wrap gap-2">
                      {memoizedPropertyData && (
                        <>
                          <FavoriteButton propertyId={memoizedPropertyData.id} />
                          <ShareProperty property={memoizedPropertyData} className="btn-outline-primary" />
                          {(!user || (property.profiles?.profiles_id !== user.id && property.profiles_id !== user.id)) && (
                            <button
                              onClick={() => setIsContactModalOpen(true)}
                              className="btn btn-primary"
                            >
                              <i className="fas fa-comments me-2"></i>
                              Connect with Owner
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="key-details-grid mb-3">
                    <div className="row g-2">
                      {/* Property Type Badge */}
                      {property.property_type && (
                        <div className="col-12 d-flex justify-content-center mb-2">
                          <div className="detail-item d-inline-flex align-items-center px-3 py-2 bg-light text-dark rounded-2" style={{ maxWidth: 'fit-content' }}>
                            <i className={`fas ${
                              property.property_type === 'Office' ? 'fa-briefcase' :
                              property.property_type === 'Retail' ? 'fa-shopping-cart' :
                              property.property_type === 'Land' ? 'fa-mountain' :
                              property.property_type === 'Farm' ? 'fa-tractor' :
                              'fa-home'
                            } fa-lg text-primary me-2`}></i>
                            <div>
                              <span className="fw-bold">{property.property_type}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Areas */}
                      {property.area && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-ruler-combined fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.area} m²</div>
                              <small className="text-muted">Built Area</small>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {property.garden_area && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-tree fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.garden_area} m²</div>
                              <small className="text-muted">Garden Area</small>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rooms */}
                      {property.bedrooms && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-bed fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.bedrooms}</div>
                              <small className="text-muted">Bedrooms</small>
                            </div>
                          </div>
                        </div>
                      )}

                      {property.bathrooms && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-bath fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.bathrooms}</div>
                              <small className="text-muted">Bathrooms</small>
                            </div>
                          </div>
                        </div>
                      )}

                      {property.livingrooms && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-couch fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.livingrooms}</div>
                              <small className="text-muted">Living Rooms</small>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Building Details */}
                      {property.floor && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-building fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.floor}</div>
                              <small className="text-muted">Floor</small>
                            </div>
                          </div>
                        </div>
                      )}

                      {property.year_built && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-calendar-alt fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.year_built}</div>
                              <small className="text-muted">Year Built</small>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Parking */}
                      {property.parking_spaces && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-car fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.parking_spaces}</div>
                              <small className="text-muted">Parking Spaces</small>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Property Status */}
                      {property.furnishing_status && (
                        <div className="col-6 col-md-3">
                          <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                            <i className="fas fa-chair fa-lg text-primary me-2"></i>
                            <div>
                              <div className="fw-bold">{property.furnishing_status}</div>
                              <small className="text-muted">Furnishing</small>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Office-specific details */}
                      {property.property_type === 'Office' && (
                        <>
                          {property.meeting_rooms && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-users fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.meeting_rooms}</div>
                                  <small className="text-muted">Meeting Rooms</small>
                                </div>
                              </div>
                            </div>
                          )}
                          {property.parking_spaces && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-parking fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.parking_spaces}</div>
                                  <small className="text-muted">Parking Spaces</small>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Retail-specific details */}
                      {property.property_type === 'Retail' && (
                        <>
                          {property.shop_front_width && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-store-alt fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.shop_front_width} m</div>
                                  <small className="text-muted">Shop Front</small>
                                </div>
                              </div>
                            </div>
                          )}
                          {property.storage_area && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-warehouse fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.storage_area} m²</div>
                                  <small className="text-muted">Storage Area</small>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Land-specific details */}
                      {property.property_type === 'Land' && (
                        <>
                          {property.plot_size && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-crop fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.plot_size} m²</div>
                                  <small className="text-muted">Plot Size</small>
                                </div>
                              </div>
                            </div>
                          )}
                          {property.land_type && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-map fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.land_type}</div>
                                  <small className="text-muted">Land Type</small>
                                </div>
                              </div>
                            </div>
                          )}
                          {property.zoning && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-clipboard-list fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.zoning}</div>
                                  <small className="text-muted">Zoning</small>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Farm-specific details */}
                      {property.property_type === 'Farm' && (
                        <>
                          {property.water_source && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-water fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.water_source}</div>
                                  <small className="text-muted">Water Source</small>
                                </div>
                              </div>
                            </div>
                          )}
                          {property.crop_types && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-seedling fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.crop_types}</div>
                                  <small className="text-muted">Crop Types</small>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Building-specific details */}
                      {property.property_type === 'Building' && (
                        <>
                          {property.units && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-building fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.units}</div>
                                  <small className="text-muted">Units</small>
                                </div>
                              </div>
                            </div>
                          )}
                          {property.elevators && (
                            <div className="col-6 col-md-3">
                              <div className="detail-item d-flex align-items-center p-2 bg-light rounded-2">
                                <i className="fas fa-arrow-up fa-lg text-primary me-2"></i>
                                <div>
                                  <div className="fw-bold">{property.elevators}</div>
                                  <small className="text-muted">Elevators</small>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </section>

                {/* Property Description */}
                <section className="property-description property-section">
                  <h3 className="h4 fw-bold mb-3">
                    <i className="fas fa-align-left me-2 text-primary"></i>
                    Description
                  </h3>
                  <div className="description-content">
                    <p className="text-muted lh-lg">{property.description}</p>
                  </div>
                </section>

                    {/* Property Features */}
                {property.features && Object.keys(property.features).length > 0 && (
                  <section className="property-features property-section">
                    <h3 className="h4 fw-bold mb-3">
                      <i className="fas fa-star me-2 text-primary"></i>
                      Features & Amenities
                    </h3>
                    <div className="features-grid">
                      <div className="row g-3">
                        {Object.entries(property.features).map(([key, value]) => (
                          value && (
                            <div key={key} className="col-6 col-md-6 col-lg-4">
                              <div className="feature-item d-flex align-items-center p-2 rounded-2 bg-light">
                                <div className="feature-icon me-3">
                                  <i className="fas fa-check-circle text-success"></i>
                                </div>
                                <span className="feature-text">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                </div>

                {/* Similar Properties — the component itself returns null
                    unless there are items */}
                {memoizedPropertyData && (
                  <Suspense fallback={null}>
                    <SimilarProperties
                      currentPropertyId={memoizedPropertyData.id}
                      propertyType={memoizedPropertyData.propertyType}
                      city={memoizedPropertyData.city}
                      price={memoizedPropertyData.price}
                    />
                  </Suspense>
                )}

                {/* Contact Owner Modal — on-demand, replaces the old sidebar */}
                {(!user || (property.profiles?.profiles_id !== user.id && property.profiles_id !== user.id)) && (
                  <ContactOwnerModal
                    show={isContactModalOpen}
                    onHide={() => setIsContactModalOpen(false)}
                    owner={property.profiles}
                    user={user}
                    propertyId={property.id}
                    inquiryOpen={inquiryOpen}
                    onToggleInquiry={() => setInquiryOpen(!inquiryOpen)}
                    onSendMessage={handleStartChat}
                    onInquiryClick={handleInquiryClick}
                  />
                )}
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(PropertyDetail);
