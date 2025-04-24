# Secure JWT Authentication System

This is a secure authentication system built with Node.js and Express, implementing a 3-step JWT authentication process.

## Security Features

1. **Three-token authentication system**:
   - Short-lived login token (JWT1) - expires in 1 minute
   - Medium-lived access token (JWT2) - expires in 15 minutes
   - Long-lived refresh token (JWT3) - expires in 7 days

2. **HttpOnly cookies** to prevent JavaScript access to tokens
3. **Secure cookie flag** for HTTPS environments
4. **Strict Same-Site policy** to prevent CSRF attacks
5. **Helmet.js** for secure HTTP headers
6. **CORS protection** to prevent cross-origin requests
7. **Automatic token refresh** for better UX and security

## Project Structure

- `secure-auth-server.js` - Main Express server
- `secure-auth.js` - JWT authentication functions
- `secure-auth.env` - Environment variables (rename to .env in production)
- `secure-auth-public/` - Static files directory
  - `login.html` - Login page
  - `dashboard.html` - Protected dashboard page

## Installation and Setup

1. Install dependencies:
   ```
   npm install express jsonwebtoken cookie-parser dotenv helmet cors
   ```

2. Rename `secure-auth.env` to `.env` and update the JWT secrets with strong random strings

3. Start the server:
   ```
   node secure-auth-server.js
   ```

4. Access the application at `http://localhost:3000`

## Authentication Flow

1. User enters credentials on the login page
2. If valid, server issues a short-lived login token (JWT1) stored as an HttpOnly cookie
3. Browser is redirected to token exchange endpoint
4. Server verifies login token and issues:
   - Access token (JWT2) - used for accessing protected resources
   - Refresh token (JWT3) - used to get a new access token when needed
5. User is redirected to the protected dashboard
6. When the access token expires, the refresh token is automatically used to get a new access token

## Security Best Practices Implemented

- **HttpOnly cookies** prevent JavaScript from accessing tokens, mitigating XSS attacks
- **Short-lived tokens** minimize the damage of token theft
- **Refresh token rotation** (can be implemented for additional security)
- **Secure headers** with Helmet.js protect against various attacks
- **CORS configuration** prevents unauthorized cross-origin requests
- **Environment variables** for sensitive information
- **SameSite cookie attribute** helps prevent CSRF attacks

## Default Credentials

- Username: `admin`
- Password: `1234`

⚠️ **Note:** For production use, implement proper user authentication against a secure database with password hashing.