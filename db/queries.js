const pool = require('./db');

// Projects queries
const getAllProjects = async (featured = null) => {
  let query = 'SELECT * FROM projects';
  const values = [];

  if (featured !== null) {
    query += ' WHERE featured = $1';
    values.push(featured);
  }

  query += ' ORDER BY featured DESC, id';

  const result = await pool.query(query, values);
  return result.rows;
};

const getProjectById = async (id) => {
  const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
  return result.rows[0];
};

const createProject = async (projectData) => {
  const { title, description, tech, link, image, featured } = projectData;
  const result = await pool.query(
    'INSERT INTO projects (title, description, tech, link, image, featured) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [title, description, JSON.stringify(tech), link, image, featured]
  );
  return result.rows[0];
};

const updateProject = async (id, projectData) => {
  const { title, description, tech, link, image, featured } = projectData;
  const setParts = [];
  const values = [];
  let index = 1;

  if (title !== undefined) {
    setParts.push(`title = $${index++}`);
    values.push(title);
  }
  if (description !== undefined) {
    setParts.push(`description = $${index++}`);
    values.push(description);
  }
  if (tech !== undefined) {
    setParts.push(`tech = $${index++}`);
    values.push(JSON.stringify(tech));
  }
  if (link !== undefined) {
    setParts.push(`link = $${index++}`);
    values.push(link);
  }
  if (image !== undefined) {
    setParts.push(`image = $${index++}`);
    values.push(image);
  }
  if (featured !== undefined) {
    setParts.push(`featured = $${index++}`);
    values.push(featured);
  }

  if (setParts.length === 0) {
    // No fields to update, just return the current project
    return await getProjectById(id);
  }

  const query = `UPDATE projects SET ${setParts.join(', ')} WHERE id = $${index} RETURNING *`;
  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteProject = async (id) => {
  const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

// Skills queries
const getAllSkills = async (category = null) => {
  let query = 'SELECT * FROM skills';
  const values = [];

  if (category) {
    query += ' WHERE category = $1';
    values.push(category);
  }

  query += ' ORDER BY id';

  const result = await pool.query(query, values);
  return result.rows;
};

const createSkill = async (skillData) => {
  const { name, level, category } = skillData;
  const result = await pool.query(
    'INSERT INTO skills (name, level, category) VALUES ($1, $2, $3) RETURNING *',
    [name, level, category]
  );
  return result.rows[0];
};

const updateSkill = async (id, skillData) => {
  const { name, level, category } = skillData;
  const setParts = [];
  const values = [];
  let index = 1;

  if (name !== undefined) {
    setParts.push(`name = $${index++}`);
    values.push(name);
  }
  if (level !== undefined) {
    setParts.push(`level = $${index++}`);
    values.push(level);
  }
  if (category !== undefined) {
    setParts.push(`category = $${index++}`);
    values.push(category);
  }

  if (setParts.length === 0) {
    // No fields to update, just return the current skill
    const result = await pool.query('SELECT * FROM skills WHERE id = $1', [id]);
    return result.rows[0];
  }

  const query = `UPDATE skills SET ${setParts.join(', ')} WHERE id = $${index} RETURNING *`;
  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteSkill = async (id) => {
  const result = await pool.query('DELETE FROM skills WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

// Contacts queries
const createContact = async (contactData) => {
  const { name, email, message } = contactData;
  const result = await pool.query(
    'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING *',
    [name, email, message]
  );
  return result.rows[0];
};

const getAllContacts = async () => {
  const result = await pool.query('SELECT * FROM contacts ORDER BY timestamp DESC');
  return result.rows;
};

const markContactAsRead = async (id) => {
  const result = await pool.query(
    'UPDATE contacts SET read = true WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0];
};

// Stats queries
const getStats = async () => {
  const [totalProjectsResult, featuredProjectsResult, totalSkillsResult, skillsByCategoryResult, totalContactsResult, unreadContactsResult] = await Promise.all([
    pool.query('SELECT COUNT(*) as count FROM projects'),
    pool.query('SELECT COUNT(*) as count FROM projects WHERE featured = true'),
    pool.query('SELECT COUNT(*) as count FROM skills'),
    pool.query("SELECT category, COUNT(*) as count FROM skills GROUP BY category"),
    pool.query('SELECT COUNT(*) as count FROM contacts'),
    pool.query('SELECT COUNT(*) as count FROM contacts WHERE read = false')
  ]);

  const skillsByCategory = {};
  skillsByCategoryResult.rows.forEach(row => {
    skillsByCategory[row.category] = parseInt(row.count);
  });

  return {
    totalProjects: parseInt(totalProjectsResult.rows[0].count),
    featuredProjects: parseInt(featuredProjectsResult.rows[0].count),
    totalSkills: parseInt(totalSkillsResult.rows[0].count),
    skillsByCategory,
    totalContacts: parseInt(totalContactsResult.rows[0].count),
    unreadContacts: parseInt(unreadContactsResult.rows[0].count)
  };
};

// User queries
const createUser = async (userData) => {
  const { email, passwordHash } = userData;
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
    [email, passwordHash]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  createContact,
  getAllContacts,
  markContactAsRead,
  getStats,
  createUser,
  getUserByEmail
};
