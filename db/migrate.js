require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const dns = require('dns').promises;
const { projects: projectData, skills: skillData } = require('../data/data.backup');
const { createProject, createSkill } = require('./queries');

// Check for SUPABASE_DATABASE_URL first, then fall back to DATABASE_URL
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

// Validate that we have a database URL
if (!databaseUrl) {
  console.error('Error: No database URL provided.');
  console.error('Please set either SUPABASE_DATABASE_URL or DATABASE_URL environment variable.');
  console.error('Example:');
  console.error('  SUPABASE_DATABASE_URL=postgres://user:pass@host:5432/db');
  console.error('  or');
  console.error('  DATABASE_URL=postgres://user:pass@host:5432/db');
  process.exit(1);
}

const config = parse(databaseUrl);
config.ssl = { rejectUnauthorized: false };

// Remove IPv6 brackets if present and ensure we're using hostname correctly
if (config.host) {
  config.host = config.host.replace(/^\[|\]$/g, '');
}

let pool;

// Function to resolve hostname to IPv4 address
async function resolveToIPv4(hostname) {
  // If it's already an IP address, return as-is
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return hostname;
  }

  try {
    console.log(`Resolving hostname to IPv4: ${hostname}`);
    const addresses = await dns.resolve4(hostname);
    if (addresses && addresses.length > 0) {
      console.log(`Resolved ${hostname} to IPv4: ${addresses[0]}`);
      return addresses[0];
    }
  } catch (err) {
    console.warn(`Failed to resolve ${hostname} to IPv4: ${err.message}`);
  }
  
  // Fallback to original hostname if DNS resolution fails
  return hostname;
}

// Create pool with IPv4 resolution
async function createPool() {
  // Resolve hostname to IPv4 first to avoid IPv6 issues
  const resolvedHost = await resolveToIPv4(config.host);
  
  pool = new Pool({
    user: config.user,
    password: config.password,
    host: resolvedHost,
    port: config.port,
    database: config.database,
    ssl: config.ssl,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    options: '-c search_path=public'
  });
  
  return pool;
}

async function migrate() {
  try {
    console.log('Starting database migration...');
    console.log('Database host:', config.host);

    // Create pool with IPv4 resolution
    console.log('Creating database connection...');
    await createPool();

    // Test connection
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