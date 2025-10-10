// Parse DATABASE_URL if provided (e.g., from Render)
let dbConfig = {};
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  dbConfig = {
    DB_HOST: url.hostname,
    DB_PORT: url.port,
    DB_NAME: url.pathname.slice(1), // Remove leading '/'
    DB_USER: url.username,
    DB_PASSWORD: url.password,
  };
} else {
  dbConfig = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 5432,
    DB_NAME: process.env.DB_NAME || 'portfolio_db',
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  };
}

const config = {
  PORT: process.env.PORT || 5000,
  CORS_ORIGINS: ['http://localhost:3000', 'http://localhost:5173', 'https://https://mojeed-rho.vercel.app'],
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
  CONTACT_RATE_LIMIT_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  CONTACT_RATE_LIMIT_MAX_REQUESTS: 5, // limit each IP to 5 contact submissions per hour
  ...dbConfig,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  // Email configuration
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

module.exports = config;
