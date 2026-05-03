# Integration Guide - File Storage (AWS S3 Example) ☁️

### 1. Uploading a File (Server-side)

```javascript
// npm install @aws-sdk/client-s3
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({ region: "us-east-1" });

async function uploadFile(fileBuffer, fileName, mimeType) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  try {
    await s3.send(command);
    return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${command.input.Key}`;
  } catch (err) {
    console.error("S3 Upload Error:", err);
    throw err;
  }
}
```

### 2. Generating a Presigned URL (Recommended for Downloads)

```javascript
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

async function getDownloadUrl(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });
  // URL expires in 3600 seconds (1 hour)
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}
```

### 3. Best Practices
- **Don't store files on the server's disk:** Local storage is wiped during deployments in many cloud environments (Heroku, Docker).
- **Use Presigned Post for Uploads:** Allow the frontend to upload directly to S3 to save server bandwidth.
- **Set Metadata:** Always set the correct `Content-Type` so browsers know how to handle the file.
- **Folder Structure:** Use logical prefixes (e.g., `users/123/avatars/`).
- **Lifecycle Policies:** Automatically move old logs to cheaper storage (Glacier) or delete temporary files.
- **Security:** Keep buckets private and use IAM roles for access.
