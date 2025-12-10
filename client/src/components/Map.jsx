import { useEffect, useRef } from 'react';

function Map({ venues, events, center = { lat: 39.7285, lng: -121.8375 } }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Check if Google Maps is loaded
    if (!window.google) {
      console.error('Google Maps not loaded. Add the script to index.html');
      return;
    }

    // Initialize map once
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: false,
      });
    }

    if (!mapInstanceRef.current) return;

    // Clear existing markers from map
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    // Add venue markers
    venues?.forEach((venue) => {
        if (venue.latitude && venue.longitude) {
          const position = { lat: Number(venue.latitude), lng: Number(venue.longitude) };

          const marker = new window.google.maps.Marker({
            position: { lat: venue.latitude, lng: venue.longitude },
            map: mapInstanceRef.current,
            title: venue.name,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0;">${venue.name}</h3>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${venue.type}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${venue.address || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Food:</strong> ${venue.food_options || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Parking:</strong> ${venue.parking_notes || 'N/A'}</p>
                <p style="margin: 5px 0;"><strong>Rating:</strong> ${'⭐'.repeat(venue.atmosphere_rating || 0)}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
          markersRef.current.push(marker);
          bounds.extend(position);
        }
      });

    // Add event markers
    events?.forEach((event) => {
        if (event.venue?.latitude && event.venue?.longitude) {
          const position = { lat: Number(event.venue.latitude), lng: Number(event.venue.longitude) };

          const marker = new window.google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            title: event.game_name,
            icon: {
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 10px 0;">${event.game_name}</h3>
                <p style="margin: 5px 0;"><strong>Sport:</strong> ${event.sport}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(event.start_time).toLocaleString()}</p>
                <p style="margin: 5px 0;"><strong>Venue:</strong> ${event.venue.name}</p>
                <p style="margin: 5px 0;"><strong>Host:</strong> ${event.host?.display_name || 'Unknown'}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
          markersRef.current.push(marker);
          bounds.extend(position);
        }
      });

    // Fit map to bounds of all markers, or fall back to default center
    if (!bounds.isEmpty()) {
      mapInstanceRef.current.fitBounds(bounds);
    } else {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(14);
    }
  }, [venues, events, center]);

  return (
    <div>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '500px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        <p>
          🔵 Blue markers = Venues | 🔴 Red markers = Events
        </p>
        <p>Click on markers to see details</p>
      </div>
    </div>
  );
}

export default Map;
