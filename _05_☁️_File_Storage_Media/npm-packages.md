# NPM Packages - File Storage & Media ☁️

### 1. Recommended Package: `@aws-sdk/client-s3` & `multer`
Standard for uploading and managing files on AWS S3.

- **NPM Links:** [@aws-sdk/client-s3](https://www.npmjs.com/package/@aws-sdk/client-s3), [multer](https://www.npmjs.com/package/multer)
- **Install Command:** `npm install @aws-sdk/client-s3 multer`

#### Code Example (Express + MongoDB)
```javascript
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const User = require('../models/User');
const s3 = new S3Client({ region: "us-east-1" });

async function uploadAvatar(req, res) {
  const file = req.file; // From multer
  const key = `avatars/${req.user.id}-${Date.now()}.jpg`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  }));

  const imageUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;

  // Update User in MongoDB
  await User.findByIdAndUpdate(req.user.id, { avatarUrl: imageUrl });

  res.json({ imageUrl });
}
```

### 2. Alternative Packages
| Package | Link | Description |
|---------|------|-------------|
| `cloudinary` | [Link](https://www.npmjs.com/package/cloudinary) | Best for image/video transformations. |
| `google-cloud-storage` | [Link](https://www.npmjs.com/package/@google-cloud/storage) | GCP's alternative to S3. |
| `multer-s3` | [Link](https://www.npmjs.com/package/multer-s3) | Directly upload from Multer to S3. |
