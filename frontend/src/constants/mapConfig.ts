// Map configuration constants
export const MAP_CONFIG = {
  TOKEN: import.meta.env.VITE_MAPBOX_TOKEN,
  STYLE: 'mapbox://styles/mapbox/dark-v11',
  CENTER: [-98.5795, 39.8283] as [number, number], // Center of USA
  ZOOM: 3.5,
  PROJECTION: 'globe' as const,
} as const;

export const MAP_FOG_CONFIG = {
  color: 'rgb(0, 0, 0)',
  'high-color': 'rgb(20, 20, 30)',
  'horizon-blend': 0.2,
  'space-color': 'rgb(0, 0, 0)',
  'star-intensity': 0.6,
} as const;

export const MARKER_STYLES = {
  critical: {
    bg: 'bg-emergency-critical',
    border: 'border-emergency-critical',
    popup: 'bg-emergency-critical/20 text-emergency-critical',
  },
  warning: {
    bg: 'bg-emergency-warning',
    border: 'border-emergency-warning',
    popup: 'bg-emergency-warning/20 text-emergency-warning',
  },
  info: {
    bg: 'bg-emergency-info',
    border: 'border-emergency-info', 
    popup: 'bg-emergency-info/20 text-emergency-info',
  },
  success: {
    bg: 'bg-emergency-success',
    border: 'border-emergency-success',
    popup: 'bg-emergency-success/20 text-emergency-success',
  },
} as const;

export type IncidentType = keyof typeof MARKER_STYLES;
