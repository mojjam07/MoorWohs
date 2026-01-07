require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const { projects: projectData, skills: skillData } = require('../data/data.backup');

// Prefer Supabase URL
const databaseUrl =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

/**
 * HARD GUARD: Never crash build or runtime if DB URL is missing
 */
if (!databaseUrl) {
  console.warn('⚠️ DATABASE_URL not found. Skipping migrations.');
  process.exit(0);
}

const config = parse(databaseUrl);
config.ssl = { rejectUnauthorized: false };

const pool = new Pool({
  ...config,
  ssl: config.ssl,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

async function migrate() {
  try {
    console.log('🚀 Starting database migration...');

    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Database connected');

    // Create tables (schema MUST use IF NOT EXISTS)
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );
    await pool.query(schemaSQL);

    // Idempotent project inserts
    for (const project of projectData) {
      const { title, description, tech, link, github_link, image, featured } = project;
      await pool.query(
        `
        INSERT INTO projects (title, description, tech, link, github_link, image, featured)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (title) DO NOTHING
        `,
        [title, description, JSON.stringify(tech), link, github_link || null, image, featured]
      );
    }

    // Idempotent skill inserts
    for (const skill of skillData) {
      await pool.query(
        `
        INSERT INTO skills (name, category)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
        `,
        [skill.name, skill.category]
      );
    }

    console.log('✅ Migration completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
