# Map Configuration

This project uses Mapbox for interactive mapping functionality.

## Environment Variables

The application requires a Mapbox access token to be set in your environment variables:

```bash
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

## Getting a Mapbox Token

1. Sign up for a free account at [mapbox.com](https://mapbox.com/)
2. Go to your Account page
3. Copy your default public token (starts with `pk.`)
4. Add it to your `.env` file

## Map Constants

Map configuration is centralized in `/src/constants/mapConfig.ts`:

- **MAP_CONFIG**: Contains token, style, center coordinates, zoom level, and projection settings
- **MAP_FOG_CONFIG**: Atmosphere and globe effect settings
- **MARKER_STYLES**: Styling for different incident types (critical, warning, info, success)

## Usage

The Map component automatically loads the token from environment variables and displays incidents on an interactive globe. No manual token input is required.

```tsx
import Map from '@/components/Map';

function MyComponent() {
  return <Map />;
}
```

## Security

- The `.env` file is included in `.gitignore` to prevent accidentally committing sensitive tokens
- Use `.env.example` as a template for setting up environment variables
- Never commit actual tokens to version control
