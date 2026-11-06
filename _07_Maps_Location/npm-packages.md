# NPM Packages - Maps & Location 🗺️

### 1. Recommended Package: `@googlemaps/google-maps-services-js`
Official Google Maps SDK for server-side logic.

- **NPM Link:** [https://www.npmjs.com/package/@googlemaps/google-maps-services-js](https://www.npmjs.com/package/@googlemaps/google-maps-services-js)
- **Install Command:** `npm install @googlemaps/google-maps-services-js`

#### Code Example (Express + MongoDB)
```javascript
const { Client } = require("@googlemaps/google-maps-services-js");
const Place = require('../models/Place');
const client = new Client({});

async function saveLocation(req, res) {
  const { address } = req.body;

  const response = await client.geocode({
    params: { address, key: process.env.MAPS_API_KEY }
  });

  const location = response.data.results[0].geometry.location;

  // Store in MongoDB as GeoJSON
  const newPlace = await Place.create({
    name: address,
    location: {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    }
  });

  res.json(newPlace);
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `@mapbox/mapbox-sdk` | [Link](https://www.npmjs.com/package/@mapbox/mapbox-sdk) | High-performance alternative to Google. |
| `node-geocoder` | [Link](https://www.npmjs.com/package/node-geocoder) | Supports multiple providers (OSM, Google, Bing). |
| `geolib` | [Link](https://www.npmjs.com/package/geolib) | Great for calculating distances locally. |
