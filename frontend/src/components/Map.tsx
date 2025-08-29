import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MAP_CONFIG, MAP_FOG_CONFIG, MARKER_STYLES, type IncidentType } from '@/constants/mapConfig';

// Mock incidents data
const mockIncidents: Array<{
  id: number;
  lat: number;
  lng: number;
  type: IncidentType;
  title: string;
  location: string;
}> = [
  { id: 1, lat: 40.7128, lng: -74.0060, type: 'critical', title: 'Fire Emergency', location: 'Manhattan, NY' },
  { id: 2, lat: 34.0522, lng: -118.2437, type: 'warning', title: 'Traffic Accident', location: 'Los Angeles, CA' },
  { id: 3, lat: 41.8781, lng: -87.6298, type: 'info', title: 'Power Outage', location: 'Chicago, IL' },
  { id: 4, lat: 29.7604, lng: -95.3698, type: 'success', title: 'Incident Resolved', location: 'Houston, TX' },
  { id: 5, lat: 25.7617, lng: -80.1918, type: 'critical', title: 'Flood Warning', location: 'Miami, FL' },
];

const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use the token from map config constants
    const token = MAP_CONFIG.TOKEN;
    
    if (!token) {
      console.warn('Mapbox token not found in environment variables');
      return;
    }
    
    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_CONFIG.STYLE,
        center: MAP_CONFIG.CENTER,
        zoom: MAP_CONFIG.ZOOM,
        projection: MAP_CONFIG.PROJECTION,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add atmosphere and globe effects
      map.current.on('style.load', () => {
        if (!map.current) return;
        
        map.current.setFog(MAP_FOG_CONFIG);
      });

      // Add incident markers
      mockIncidents.forEach((incident) => {
        const markerElement = document.createElement('div');
        markerElement.className = 'marker';
        const styles = MARKER_STYLES[incident.type];
        
        markerElement.innerHTML = `
          <div class="w-8 h-8 rounded-full flex items-center justify-center animate-pulse-glow border-2 ${styles.bg} ${styles.border}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${incident.type === 'critical' ? '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/>' : 
                incident.type === 'info' ? '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>' :
                '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/>'}
            </svg>
          </div>
        `;

        const popup = new mapboxgl.Popup({
          offset: 25,
          className: 'incident-popup'
        }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${incident.title}</h3>
            <p class="text-xs text-muted-foreground">${incident.location}</p>
            <span class="inline-block px-2 py-1 text-xs rounded mt-1 ${styles.popup}">${incident.type.toUpperCase()}</span>
          </div>
        `);

        new mapboxgl.Marker(markerElement)
          .setLngLat([incident.lng, incident.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });

    } catch (error) {
      console.warn('Mapbox initialization failed. Please add a valid Mapbox token.');
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  if (!MAP_CONFIG.TOKEN) {
    return (
      <Card className="p-8 text-center card-glow">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">Mapbox Token Missing</h3>
        <p className="text-muted-foreground mb-6">
          Please set VITE_MAPBOX_TOKEN in your environment variables.
        </p>
        <p className="text-xs text-muted-foreground">
          Get your token at{' '}
          <a 
            href="https://mapbox.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            mapbox.com
          </a>
        </p>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-elevated" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/5 rounded-lg" />
    </div>
  );
};

export default Map;