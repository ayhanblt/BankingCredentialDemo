import dotenv from 'dotenv';
// Load environment variables from secure-auth.env file
dotenv.config({ path: './secure-auth.env' });
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {
  generateLoginToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyLoginToken,
  verifyRefreshToken
} from './secure-auth.js';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Debug the environment variables
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Force the port to 3500 to avoid conflicts with the existing app
const PORT = 3500;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"]
    }
  }
})); // Security headers
app.use(cookieParser()); // Parse cookies
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure CORS to allow from multiple origins
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      `http://localhost:${PORT}`,
      `https://${process.env.REPLIT_SLUG}.${process.env.REPLIT_DOMAIN}`,
      'https://0.0.0.0',
      undefined // Allow requests with no origin (like mobile apps or curl requests)
    ];
    
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Serve static files from 'secure-auth-public' directory
app.use(express.static(path.join(__dirname, 'secure-auth-public')));

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'secure-auth-public', 'login.html'));
});

// Login form submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check credentials - in a real app, this would be checked against a database
  if (username === 'admin' && password === '1234') {
    // Step 1: Generate login token (JWT1)
    const loginToken = generateLoginToken(username);

    // Send login token in secure HttpOnly cookie
    res.cookie('loginToken', loginToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 1000 // 1 minute
    });

    // Redirect to token exchange endpoint
    res.redirect('/exchange-token');
  } else {
    res.status(401).send('Invalid username or password');
  }
});

// Token exchange endpoint - this exchanges the login token for access and refresh tokens
app.get('/exchange-token', (req, res) => {
  const loginToken = req.cookies.loginToken;

  if (!loginToken) {
    return res.status(401).redirect('/login');
  }

  // Verify login token
  const decoded = verifyLoginToken(loginToken);
  if (!decoded) {
    return res.status(401).redirect('/login');
  }

  // Step 2: Generate access token (JWT2)
  const accessToken = generateAccessToken(decoded.username);
  
  // Step 3: Generate refresh token (JWT3)
  const refreshToken = generateRefreshToken(decoded.username);

  // Clear login token
  res.clearCookie('loginToken');

  // Set cookies for access and refresh tokens
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Redirect to dashboard
  res.redirect('/dashboard');
});

// Refresh token endpoint - this uses the refresh token to get a new access token
app.get('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).redirect('/login');
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(401).redirect('/login');
  }

  // Generate a new access token
  const newAccessToken = generateAccessToken(decoded.username);

  // Set cookie for the new access token
  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // Redirect to dashboard
  res.redirect('/dashboard');
});

// Protected dashboard route
app.get('/dashboard', verifyAccessToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'secure-auth-public', 'dashboard.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  // Clear all cookies
  res.clearCookie('loginToken');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  // Redirect to login page
  res.redirect('/login');
});

// Additional diagnostic route for debugging
app.get('/status', (req, res) => {
  res.json({ 
    status: 'operational', 
    message: 'JWT Authentication server is running',
    cookies: {
      hasLoginToken: !!req.cookies.loginToken,
      hasAccessToken: !!req.cookies.accessToken,
      hasRefreshToken: !!req.cookies.refreshToken
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Secure Auth Server running on port ${PORT}`);
});