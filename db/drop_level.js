const pool = require('./db');

async function dropLevel() {
  try {
    await pool.query('ALTER TABLE skills DROP COLUMN IF EXISTS level;');
    console.log('Dropped level column from skills table.');
  } catch (error) {
    console.error('Error dropping level column:', error);
  } finally {
    pool.end();
  }
}

dropLevel();
