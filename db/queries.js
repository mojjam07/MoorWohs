const supabase = require('./db');

// Projects queries
const getAllProjects = async (featured = null) => {
  let query = supabase.from('projects').select('*');

  if (featured !== null) {
    query = query.eq('featured', featured);
  }

  const { data, error } = await query.order('featured', { ascending: false }).order('id');
  if (error) throw error;
  return data;
};

const getProjectById = async (id) => {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

const createProject = async (projectData) => {
  const { title, description, tech, link, image, featured } = projectData;
  const { data, error } = await supabase
    .from('projects')
    .insert([{ title, description, tech, link, image, featured }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateProject = async (id, projectData) => {
  const { title, description, tech, link, image, featured } = projectData;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (tech !== undefined) updateData.tech = tech;
  if (link !== undefined) updateData.link = link;
  if (image !== undefined) updateData.image = image;
  if (featured !== undefined) updateData.featured = featured;

  if (Object.keys(updateData).length === 0) {
    // No fields to update, just return the current project
    return await getProjectById(id);
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteProject = async (id) => {
  const { data, error } = await supabase.from('projects').delete().eq('id', id).select().single();
  if (error) throw error;
  return data;
};

// Skills queries
const getAllSkills = async (category = null) => {
  let query = supabase.from('skills').select('*');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('id');
  if (error) throw error;
  return data;
};

const createSkill = async (skillData) => {
  const { name, category } = skillData;
  const { data, error } = await supabase
    .from('skills')
    .insert([{ name, category }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateSkill = async (id, skillData) => {
  const { name, category } = skillData;
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (category !== undefined) updateData.category = category;

  if (Object.keys(updateData).length === 0) {
    // No fields to update, just return the current skill
    const { data, error } = await supabase.from('skills').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('skills')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteSkill = async (id) => {
  const { data, error } = await supabase.from('skills').delete().eq('id', id).select().single();
  if (error) throw error;
  return data;
};

// Contacts queries
const createContact = async (contactData) => {
  const { name, email, message } = contactData;
  const { data, error } = await supabase
    .from('contacts')
    .insert([{ name, email, message }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const getAllContacts = async () => {
  const { data, error } = await supabase.from('contacts').select('*').order('timestamp', { ascending: false });
  if (error) throw error;
  return data;
};

const markContactAsRead = async (id) => {
  const { data, error } = await supabase
    .from('contacts')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Stats queries
const getStats = async () => {
  const [totalProjectsResult, featuredProjectsResult, totalSkillsResult, skillsByCategoryResult, totalContactsResult, unreadContactsResult] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('featured', true),
    supabase.from('skills').select('*', { count: 'exact', head: true }),
    supabase.rpc('get_skills_by_category'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('read', false)
  ]);

  const skillsByCategory = {};
  if (skillsByCategoryResult.data) {
    skillsByCategoryResult.data.forEach(row => {
      skillsByCategory[row.category] = parseInt(row.count);
    });
  }

  return {
    totalProjects: totalProjectsResult.count || 0,
    featuredProjects: featuredProjectsResult.count || 0,
    totalSkills: totalSkillsResult.count || 0,
    skillsByCategory,
    totalContacts: totalContactsResult.count || 0,
    unreadContacts: unreadContactsResult.count || 0
  };
};

// Note: User and refresh token queries are removed as Supabase handles auth internally
// These functions are kept for compatibility but will not be used with Supabase auth

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
  getStats
};
