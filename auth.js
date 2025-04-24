const jwt = require('jsonwebtoken');

// Function to generate a login token (JWT1) - short-lived
const generateLoginToken = (username) => {
  return jwt.sign(
    { username },
    process.env.JWT_LOGIN_SECRET,
    { expiresIn: '1m' } // Expires in 1 minute
  );
};

// Function to generate an access token (JWT2) - medium-lived
const generateAccessToken = (username) => {
  return jwt.sign(
    { username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' } // Expires in 15 minutes
  );
};

// Function to generate a refresh token (JWT3) - long-lived
const generateRefreshToken = (username) => {
  return jwt.sign(
    { username },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Expires in 7 days
  );
};

// Middleware to verify access token
const verifyAccessToken = (req, res, next) => {
  // Get the token from cookie
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // If access token is expired, check if we can use refresh token
    return res.status(401).redirect('/refresh-token');
  }
};

// Function to verify login token
const verifyLoginToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_LOGIN_SECRET);
  } catch (err) {
    return null;
  }
};

// Function to verify refresh token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateLoginToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyLoginToken,
  verifyRefreshToken
};