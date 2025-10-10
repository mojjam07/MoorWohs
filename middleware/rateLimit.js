const rateLimit = require('express-rate-limit');
const config = require('../config/config');

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS
});

// Contact form rate limiting (stricter)
const contactLimiter = rateLimit({
  windowMs: config.CONTACT_RATE_LIMIT_WINDOW_MS,
  max: config.CONTACT_RATE_LIMIT_MAX_REQUESTS
});

module.exports = {
  limiter,
  contactLimiter
};
