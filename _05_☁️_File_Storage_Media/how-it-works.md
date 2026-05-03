# How File Storage Works ☁️

Modern file storage is "Object Storage," different from traditional file systems.

### 1. Object Storage (S3)
Files are stored as "Objects" in "Buckets." Each object has a unique key (path) and metadata.
- **Scalability:** Virtually unlimited storage.
- **Durability:** Data is replicated across multiple physical locations.

### 2. CDN (Content Delivery Network)
A network of servers distributed globally.
- **Goal:** Reduce latency by serving files from the server closest to the user.
- **Caching:** CDNs cache files from your S3 bucket at "Edge Locations."

### 3. Presigned URLs
A secure way to give temporary access to a private file.
- **Workflow:** App generates a URL with a signature and expiry (e.g., 15 mins) -> App gives URL to user -> User downloads directly from S3.
- **Why:** Your server doesn't have to handle the heavy bandwidth of file downloads.

### 4. Image Transformation (Cloudinary)
Uploading a high-res image once and requesting different versions via URL parameters.
- **Example:** `.../image/upload/w_300,h_300,c_fill/avatar.jpg`
