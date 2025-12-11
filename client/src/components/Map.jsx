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

    // Add event markers (grouped by location so multiple events at the same
    // venue show together instead of overlapping markers)
    const eventGroups = {};

    events?.forEach((event) => {
      if (event.venue?.latitude && event.venue?.longitude) {
        const latNum = Number(event.venue.latitude);
        const lngNum = Number(event.venue.longitude);

        // Use a rounded key so identical coordinates group reliably
        const key = `${latNum.toFixed(5)},${lngNum.toFixed(5)}`;
        if (!eventGroups[key]) {
          eventGroups[key] = {
            position: { lat: latNum, lng: lngNum },
            venueName: event.venue.name,
            events: [],
          };
        }
        eventGroups[key].events.push(event);
      }
    });

    Object.values(eventGroups).forEach((group) => {
      const position = group.position;
      const groupEvents = group.events;

      if (!groupEvents.length) return;

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: group.venueName || groupEvents[0].game_name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
      });

      const eventListHtml = groupEvents
        .map((e) => `
          <li style="margin: 4px 0;">
            <strong>${e.game_name}</strong><br/>
            <span>Sport: ${e.sport}</span><br/>
            <span>Time: ${new Date(e.start_time).toLocaleString()}</span><br/>
            <a href="/events/${e.event_id}" style="color: #1976d2; text-decoration: underline; font-weight: 500;">
              View details
            </a>
          </li>
        `)
        .join('');

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 280px;">
            <h3 style="margin: 0 0 8px 0;">${group.venueName || 'Events at this location'}</h3>
            <ul style="padding-left: 18px; margin: 0; max-height: 200px; overflow-y: auto;">
              ${eventListHtml}
            </ul>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });
      markersRef.current.push(marker);
      bounds.extend(position);
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
