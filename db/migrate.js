const fs = require('fs');
const path = require('path');
const pool = require('./db');
const { projects: projectData, skills: skillData } = require('../data/data.backup');
const { createProject, createSkill } = require('./queries');

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Create tables from schema.sql
    console.log('Creating tables from schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSQL);
    console.log('Tables created successfully!');

    // Migrate projects
    console.log('Migrating projects...');
    for (const project of projectData) {
      const { id, ...projectWithoutId } = project; // Omit id to let DB assign
      await createProject(projectWithoutId);
      console.log(`Migrated project: ${project.title}`);
    }

    // Migrate skills
    console.log('Migrating skills...');
    for (const skill of skillData) {
      const { id, ...skillWithoutId } = skill; // Omit id
      await createSkill(skillWithoutId);
      console.log(`Migrated skill: ${skill.name}`);
    }

    // Contacts is empty, so no migration needed

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;
