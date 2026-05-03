# How Maps & Location Services Work 🗺️

Geography is converted into data through several key processes.

### 1. Geocoding & Reverse Geocoding
- **Geocoding:** Converting a text address ("1600 Amphitheatre Pkwy, Mountain View, CA") into coordinates (`37.422, -122.084`).
- **Reverse Geocoding:** Converting coordinates back into a human-readable address.

### 2. Tiling Systems
Maps are not one giant image. They are divided into small squares called **Tiles** (Vector or Raster).
- **Vector Tiles:** Deliver data (lines, points) and the client renders them. Allows for rotation and smooth zooming.

### 3. Routing Engines
Complex algorithms (like Dijkstra's) calculate the shortest or fastest path between points, accounting for traffic, road types, and one-way streets.

### 4. IP Geolocation
Estimating a user's location based on their IP address. Less accurate than GPS but doesn't require user permission.

### 5. Places API
A massive database of businesses and locations with metadata like ratings, opening hours, and photos.
