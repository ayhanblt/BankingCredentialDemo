require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const {
  generateLoginToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyLoginToken,
  verifyRefreshToken
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cookieParser()); // Parse cookies
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Configure CORS to only allow from our origin
app.use(cors({
  origin: `http://localhost:${PORT}`,
  credentials: true
}));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
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
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});