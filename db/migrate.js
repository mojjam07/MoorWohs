require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
const { projects: projectData, skills: skillData } = require('../data/data.backup');
const { createProject, createSkill } = require('./queries');

const config = parse(process.env.DATABASE_URL);
config.ssl = { rejectUnauthorized: false };

// Force IPv4 to avoid ENETUNREACH errors with IPv6 addresses on some environments
const pool = new Pool({
  ...config,
  family: 4 // Explicitly use IPv4
});

async function migrate() {
  try {
    console.log('Starting database migration...');

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
