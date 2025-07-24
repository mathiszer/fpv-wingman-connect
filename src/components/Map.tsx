import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  events?: Array<{
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    location_name: string;
    pilot_name?: string;
    flight_date: string;
    start_time: string;
  }>;
  selectedEvent?: string | null;
  onEventSelect?: (eventId: string) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

const LocationSelector: React.FC<{ onLocationSelect: (lat: number, lng: number, address: string) => void }> = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Reverse geocoding using Nominatim (free)
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        onLocationSelect(lat, lng, address);
      } catch (error) {
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);

  return null;
};

const Map: React.FC<MapProps> = ({ 
  events = [], 
  selectedEvent, 
  onEventSelect, 
  center = [46.603354, 1.888334], // Center of France
  zoom = 6,
  height = "400px",
  onLocationSelect
}) => {
  const mapRef = useRef<L.Map>(null);

  // Create custom icons for different event types
  const createEventIcon = (isSelected: boolean) => {
    return L.divIcon({
      className: `custom-marker ${isSelected ? 'selected' : ''}`,
      html: `<div class="bg-primary rounded-full w-6 h-6 flex items-center justify-center border-2 border-white shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}">
               <div class="w-2 h-2 bg-white rounded-full"></div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {onLocationSelect && (
          <LocationSelector onLocationSelect={onLocationSelect} />
        )}
        
        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            icon={createEventIcon(selectedEvent === event.id)}
            eventHandlers={onEventSelect ? {
              click: () => onEventSelect(event.id),
            } : undefined}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
                <p className="text-xs text-muted-foreground mb-1">{event.location_name}</p>
                {event.pilot_name && (
                  <p className="text-xs text-muted-foreground mb-1">Pilote: {event.pilot_name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(event.flight_date).toLocaleDateString('fr-FR')} à {event.start_time}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {onLocationSelect && (
        <div className="absolute top-2 left-2 bg-card/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground border border-border/50">
          Cliquez sur la carte pour sélectionner une position
        </div>
      )}
    </div>
  );
};

export default Map;