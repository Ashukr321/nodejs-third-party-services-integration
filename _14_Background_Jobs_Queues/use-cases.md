# Use Cases - Background Jobs & Queues 📦

Offloading heavy or time-consuming tasks to keep your app fast and responsive.

### 1. Sending Emails & Notifications
Moving the network delay of talking to SendGrid or FCM out of the user's request-response cycle.

### 2. Image & Video Processing
Resizing images, generating thumbnails, or transcoding video files in the background.

### 3. Data Syncing & Web Scraping
Regularly fetching data from external APIs or scraping websites without blocking the main thread.

### 4. Generating Reports
Creating large CSV or PDF exports that might take several seconds or minutes to build.

### 5. Scheduled Tasks (Cron Jobs)
Running cleanup scripts, sending weekly digests, or calculating monthly statistics at specific times.
