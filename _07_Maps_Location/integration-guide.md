# Integration Guide - Maps (Google Maps Example) 🗺️

### 1. Geocoding an Address (Backend)

```javascript
// npm install @googlemaps/google-maps-services-js
const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

async function getCoords(address) {
  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    return response.data.results[0].geometry.location;
  } catch (error) {
    console.error(error);
  }
}
```

### 2. Distance Matrix (Calculate Time/Distance)

```javascript
async function getTravelInfo(origin, destination) {
  const response = await client.distancematrix({
    params: {
      origins: [origin],
      destinations: [destination],
      mode: 'driving',
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });
  return response.data.rows[0].elements[0];
}
```

### 3. Best Practices
- **API Key Security:** Restrict your API keys by IP address or HTTP referrer in the Google Cloud Console.
- **Caching:** Cache geocoding results in your database to save money (Google Maps is expensive!). Note: Check provider terms on how long you can cache.
- **Client-side vs Server-side:** Use client-side JS for interactive maps and server-side APIs for data processing.
- **Fallback:** Consider OpenStreetMap (OSM) for simple use cases to avoid high costs.
- **Handling No Results:** Always handle cases where an address cannot be found or a route cannot be calculated.
