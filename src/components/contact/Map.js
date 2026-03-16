import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import GoogleMapsLoader, { useGoogleMaps, useMapState, MapContainer, MapLoadingUI, MapErrorUI } from '../shared/GoogleMapsLoader';

const MapUnavailable = ({ center }) => {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${center.lat},${center.lng}`
  )}`;

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      padding: '20px',
      color: '#444'
    }}>
      <h4>Map unavailable</h4>
      <p style={{ margin: '8px 0' }}>
        Google Maps cannot be displayed in this environment. Please try again later or open the location in Google Maps.
      </p>
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd' }}>
        Open in Google Maps
      </a>
    </div>
  );
};

const MapContent = React.memo(({ 
  className = '',
  height = '400px',
  showControls = true,
  markers = [],
  center = { lat: 33.8938, lng: 35.5018 }, // Beirut coordinates
  zoom = 12
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [error, setError] = useState(null);
  const { status, isLoaded, mapId, canUseAdvancedMarkers, error: mapsError } = useGoogleMaps();
  const [mapReady, setMapReady] = useState(false);
  
  // Use only the numeric center coordinates for a stable map state key (not to be confused with mapId)
  const mapStateId = useMemo(() => `contact-map-${center.lat}-${center.lng}`, [center.lat, center.lng]);

  const { isInitialized, setInitialized, mapInstance, setMapInstance } = useMapState(mapStateId);
  const markersRef = useRef([]);

  // Helper for creating markers compatible with both legacy Marker and AdvancedMarkerElement.
  const createMarker = useCallback((options) => {
    const AdvancedMarker = canUseAdvancedMarkers ? window.google?.maps?.marker?.AdvancedMarkerElement : null;
    if (AdvancedMarker) {
      return new AdvancedMarker(options);
    }
    return new window.google.maps.Marker(options);
  }, [canUseAdvancedMarkers]);

  // Create a stable key that only changes when the logical set of markers changes
  // (lat/lng pairs). This prevents the marker-update effect from running solely
  // because a new [] reference was created by the calling component on each
  // render.
  const markersKey = useMemo(() => {
    if (!markers || markers.length === 0) return '';
    // Order does not matter for a single default marker scenario but for safety
    // we keep original order; join lat/lng pairs into a string.
    return markers.map(m => `${m.lat}-${m.lng}`).join('|');
  }, [markers]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (markersRef.current) {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }
    if (mapInstance) {
      setMapInstance(null);
    }
    setInitialized(false);
  }, [mapInstance, setMapInstance, setInitialized]);

  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.google?.maps || mapInstanceRef.current) return;
    if (mapsError || status === 'degraded' || status === 'failed') {
      setError(mapsError || new Error('Google Maps is not available'));
      return;
    }

    try {
      console.log('Initializing map with:', {
        center,
        zoom,
        ref: mapRef.current
      });

      const mapOptions = {
        center,
        zoom,
        zoomControl: showControls,
        mapTypeControl: showControls,
        scaleControl: showControls,
        streetViewControl: showControls,
        rotateControl: showControls,
        fullscreenControl: showControls
      };

      if (mapId) {
        mapOptions.mapId = mapId;
      }

      const map = new window.google.maps.Map(mapRef.current, mapOptions);

      mapInstanceRef.current = map;
      setMapInstance(map);

      const newMarkers = markers.map(marker => {
        try {
          return createMarker({
            map,
            position: { lat: marker.lat, lng: marker.lng },
            title: marker.title
          });
        } catch (markerError) {
          console.error('Error creating marker:', markerError);
          return null;
        }
      }).filter(Boolean);

      // Add default office marker if no markers provided
      if (markers.length === 0) {
        try {
          newMarkers.push(createMarker({
            map,
            position: center,
            title: 'Our Office'
          }));
        } catch (markerError) {
          console.error('Error creating default marker:', markerError);
        }
      }

      markersRef.current = newMarkers;
      setInitialized(true);
      setMapReady(true);

    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err);
      cleanup();
    }

    return cleanup;
  }, [isLoaded, mapsError, status, mapId, showControls, center, center.lat, center.lng, zoom, markers, markersKey, createMarker, cleanup, setInitialized, setMapInstance, setError]);

  // Keep map center/zoom and controls in sync without reinitializing
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setCenter(center);
    map.setZoom(zoom);
    map.setOptions({
      zoomControl: showControls,
      mapTypeControl: showControls,
      scaleControl: showControls,
      streetViewControl: showControls,
      rotateControl: showControls,
      fullscreenControl: showControls
    });
  }, [center, zoom, showControls]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstance || !isInitialized) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    const newMarkers = markers.map(marker => {
      try {
        return createMarker({
          map: mapInstance,
          position: { lat: marker.lat, lng: marker.lng },
          title: marker.title
        });
      } catch (markerError) {
        console.error('Error updating marker:', markerError);
        return null;
      }
    }).filter(Boolean);

    // Add default marker if needed
    if (markers.length === 0) {
      try {
        newMarkers.push(createMarker({
          map: mapInstance,
          position: center,
          title: 'Our Office'
        }));
      } catch (markerError) {
        console.error('Error updating default marker:', markerError);
      }
    }

    markersRef.current = newMarkers;
  }, [markersKey, markers, mapInstance, isInitialized, center, center.lat, center.lng, createMarker]);

  // Always render MapContainer and the inner div so the ref is available
  const mapUnavailable = mapsError || status === 'degraded' || status === 'failed';

  return (
    <MapContainer className={className}>
      <div
        ref={mapRef}
        style={{ width: '100%', height, position: 'relative', overflow: 'hidden' }}
      />
      {mapUnavailable && <MapUnavailable center={center} />}
      {(!isLoaded || !mapReady) && !mapUnavailable && <MapLoadingUI />}
      {error && <MapErrorUI error={error} />}
    </MapContainer>
  );
});

const Map = React.memo((props) => (
  <GoogleMapsLoader>
    <MapContent {...props} />
  </GoogleMapsLoader>
));

export default Map;
