require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const { projects: projectData, skills: skillData } = require('../data/data.backup');
const { createProject, createSkill } = require('./queries');

const config = parse(process.env.DATABASE_URL);
config.ssl = { rejectUnauthorized: false };

// Force IPv4 by using dns.resolve4 or by modifying the host
// Remove IPv6 brackets if present and ensure we're using hostname correctly
if (config.host) {
  config.host = config.host.replace(/^\[|\]$/g, '');
}

// Force IPv4 to avoid ENETUNREACH errors with IPv6 addresses on some environments
const pool = new Pool({
  user: config.user,
  password: config.password,
  host: config.host,
  port: config.port,
  database: config.database,
  ssl: config.ssl,
  // These options help force IPv4 resolution
  connectionTimeoutMillis: 10000,
  // Try to disable IPv6 by using Node's net module family option
  options: '-c search_path=public'
});

// Override the Pool's connect method to force IPv4 DNS resolution
const originalConnect = pool.connect.bind(pool);
pool.connect = async function() {
  const dns = require('dns').promises;
  
  // Try to resolve to IPv4 only
  if (config.host && !config.host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    try {
      const addresses = await dns.resolve4(config.host);
      if (addresses && addresses.length > 0) {
        // Temporarily override the host with the IPv4 address
        const tempPool = new Pool({
          user: config.user,
          password: config.password,
          host: addresses[0], // Use the first IPv4 address
          port: config.port,
          database: config.database,
          ssl: config.ssl,
          connectionTimeoutMillis: 10000
        });
        return tempPool.connect();
      }
    } catch (err) {
      console.warn('Failed to resolve IPv4 address, falling back to original host:', err.message);
    }
  }
  
  return originalConnect();
};

async function migrate() {
  try {
    console.log('Starting database migration...');
    console.log('Database host:', config.host);

    // Test connection first
    console.log('Testing database connection...');
    await pool.query('SELECT 1');
    console.log('Database connection successful.');

    // Create tables using schema.sql
    console.log('Creating database tables...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('Tables created successfully.');

    // Migrate projects
    console.log('Migrating projects...');
    for (const project of projectData) {
      const { id, ...projectWithoutId } = project; // Omit id to let DB assign
      const { title, description, tech, link, image, featured } = projectWithoutId;
      await pool.query(
        'INSERT INTO projects (title, description, tech, link, image, featured) VALUES ($1, $2, $3, $4, $5, $6)',
        [title, description, JSON.stringify(tech), link, image, featured]
      );
      console.log(`Migrated project: ${project.title}`);
    }

    // Migrate skills
    console.log('Migrating skills...');
    for (const skill of skillData) {
      const { id, ...skillWithoutId } = skill; // Omit id
      const { name, category } = skillWithoutId;
      await pool.query(
        'INSERT INTO skills (name, category) VALUES ($1, $2)',
        [name, category]
      );
      console.log(`Migrated skill: ${skill.name}`);
    }

    // Contacts is empty, so no migration needed

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;