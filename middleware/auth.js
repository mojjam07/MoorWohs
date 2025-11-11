const supabase = require('../db/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware - Authorization header:', authHeader ? 'present' : 'missing');
  console.log('Auth middleware - Token:', token ? 'present' : 'missing');

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.log('Auth middleware - Token verification failed:', error?.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('Auth middleware - Token verified for user:', user.email);
    req.user = user;
    next();
  } catch (err) {
    console.log('Auth middleware - Token verification error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
