const supabase = require('./db');
const { projects, skills, contacts } = require('../data/data');

// Projects queries
const getAllProjects = async (featured = null) => {
  // Fallback to in-memory data if Supabase fails
  try {
    let query = supabase.from('projects').select('*');

    if (featured !== null) {
      query = query.eq('featured', featured);
    }

    const { data, error } = await query.order('featured', { ascending: false }).order('id');
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Supabase not available, using in-memory data for projects');
    if (featured === null) return projects;
    return projects.filter(p => p.featured === featured);
  }
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
  // Fallback to in-memory data if Supabase fails
  try {
    let query = supabase.from('skills').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('id');
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Supabase not available, using in-memory data for skills');
    if (!category) return skills;
    return skills.filter(s => s.category === category);
  }
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
  // Fallback to in-memory data if Supabase fails
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, message }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Supabase not available, using in-memory data for contacts');
    const newContact = {
      id: contacts.length + 1,
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    contacts.push(newContact);
    return newContact;
  }
};

const getAllContacts = async () => {
  // Fallback to in-memory data if Supabase fails
  try {
    const { data, error } = await supabase.from('contacts').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Supabase not available, using in-memory data for contacts');
    return contacts.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
};

const markContactAsRead = async (id) => {
  // Fallback to in-memory data if Supabase fails
  try {
    const { data, error } = await supabase
      .from('contacts')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Supabase not available, using in-memory data for contacts');
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      contact.read = true;
      return contact;
    }
    throw new Error('Contact not found');
  }
};

// Stats queries
const getStats = async () => {
  // Fallback to in-memory data if Supabase fails
  try {
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
  } catch (error) {
    console.warn('Supabase not available, using in-memory data for stats');
    const skillsByCategory = {};
    skills.forEach(skill => {
      skillsByCategory[skill.category] = (skillsByCategory[skill.category] || 0) + 1;
    });

    return {
      totalProjects: projects.length,
      featuredProjects: projects.filter(p => p.featured).length,
      totalSkills: skills.length,
      skillsByCategory,
      totalContacts: contacts.length,
      unreadContacts: contacts.filter(c => !c.read).length
    };
  }
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
