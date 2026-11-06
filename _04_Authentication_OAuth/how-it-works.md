# How OAuth 2.0 Works 🔐

OAuth 2.0 is the industry-standard protocol for authorization.

### 1. Key Terminology
- **Resource Owner:** The User.
- **Client:** Your Application.
- **Authorization Server:** The Provider (e.g., Google).
- **Resource Server:** Where the data lives (e.g., Google Drive API).

### 2. The Authorization Code Flow (Most Secure)
1. **Redirect:** App redirects user to the Provider's login page with requested **Scopes** (permissions).
2. **Consent:** User logs in and grants permission.
3. **Code:** Provider redirects back to your app with a temporary **Authorization Code**.
4. **Exchange:** Your server sends the Code + Client Secret to the Provider.
5. **Tokens:** Provider returns an **Access Token** and a **Refresh Token**.

### 3. Tokens Explained
- **Access Token:** Short-lived (e.g., 1 hour). Used to call APIs.
- **Refresh Token:** Long-lived. Used to get a new Access Token when it expires.
- **ID Token (OIDC):** Contains user profile information (email, name).

### 4. Scopes
The specific permissions your app is asking for.
- `openid profile email` -> Basic user info.
- `https://www.googleapis.com/auth/calendar.readonly` -> Access to calendar.
### 5. Common OAuth Providers
- **Google:** Best for general consumer apps. Provides access to Calendar, Drive, Contacts.
- **GitHub:** Standard for developer tools. Provides access to Repos, Organizations, Gists.
- **Facebook:** Great for social apps and reaching a broad demographic.
- **Apple:** Mandatory for iOS apps that offer other social logins. High privacy focus.
- **LinkedIn:** Ideal for B2B and professional networking apps.
- **Discord/Twitch:** Best for gaming and community-focused platforms.
- **Slack:** Essential for workspace integrations and enterprise productivity tools.
