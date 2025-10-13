const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { createUser, getUserByEmail, createRefreshToken, getRefreshToken, deleteRefreshToken, deleteRefreshTokensByUserId } = require('../db/queries');
const config = require('../config/config');

const saltRounds = 10;

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser({ email, passwordHash });

    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, { expiresIn: '24h' });
    const refreshToken = jwt.sign({ id: user.id }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await createRefreshToken(user.id, refreshToken, expiresAt);

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const tokenRecord = await getRefreshToken(refreshToken);
    if (!tokenRecord) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const token = tokenRecord;
    if (new Date() > new Date(token.expires_at)) {
      await deleteRefreshToken(refreshToken);
      return res.status(403).json({ error: 'Refresh token expired' });
    }

    jwt.verify(refreshToken, config.JWT_REFRESH_SECRET, async (err, user) => {
      if (err) {
        await deleteRefreshToken(refreshToken);
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      // Generate new access token
      const newAccessToken = jwt.sign({ id: user.id, email: user.email }, config.JWT_SECRET, { expiresIn: '24h' });

      // Optionally rotate refresh token (generate new one and delete old)
      const newRefreshToken = jwt.sign({ id: user.id }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await createRefreshToken(user.id, newRefreshToken, newExpiresAt);
      await deleteRefreshToken(refreshToken);

      res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

// Logout endpoint (optional, to invalidate refresh tokens)
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
