const { supabase, supabaseAdmin } = require('./db');
// Note: In-memory data fallback removed - admin pages should show actual database state
// The in-memory data from '../data/data' is no longer used for admin pages

// Projects queries
const getAllProjects = async (featured = null) => {
  try {
    let query = supabase.from('projects').select('*');

    if (featured !== null) {
      query = query.eq('featured', featured);
    }

    const { data, error } = await query.order('featured', { ascending: false }).order('id');
    if (error) throw error;
    
    // Return database results - even if empty, that's the actual state
    return data || [];
  } catch (error) {
    console.error('Error fetching projects from database:', error);
    console.log('Returning empty projects array due to DB error');
    return [];
  }
};

const getProjectById = async (id) => {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
};

const createProject = async (projectData) => {
  const { title, description, tech, link, github_link, image, featured } = projectData;
  
  console.log('createProject - Inserting with supabaseAdmin');
  console.log('createProject - Project data:', { title, description, tech, link, github_link, image, featured });
  
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert([{ title, description, tech, link, github_link, image, featured }])
      .select()
      .single();
    
    if (error) {
      console.error('createProject - Supabase error:', error);
      console.error('createProject - Error code:', error.code);
      console.error('createProject - Error message:', error.message);
      console.error('createProject - Error details:', error.details);
      throw error;
    }
    
    console.log('createProject - Success, created project ID:', data?.id);
    return data;
  } catch (err) {
    console.error('createProject - Exception:', err.message);
    console.error('createProject - Full error:', err);
    throw err;
  }
};

const updateProject = async (id, projectData) => {
  const { title, description, tech, link, github_link, image, featured } = projectData;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (tech !== undefined) updateData.tech = tech;
  if (link !== undefined) updateData.link = link;
  if (github_link !== undefined) updateData.github_link = github_link;
  if (image !== undefined) updateData.image = image;
  if (featured !== undefined) updateData.featured = featured;

  if (Object.keys(updateData).length === 0) {
    // No fields to update, just return the current project
    return await getProjectById(id);
  }

  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteProject = async (id) => {
  const { data, error } = await supabaseAdmin.from('projects').delete().eq('id', id).select().single();
  if (error) throw error;
  return data;
};

// Skills queries
const getAllSkills = async (category = null) => {
  try {
    let query = supabase.from('skills').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('id');
    if (error) throw error;
    
    // Return database results - even if empty, that's the actual state
    return data || [];
  } catch (error) {
    console.error('Error fetching skills from database:', error);
    console.log('Returning empty skills array due to DB error');
    return [];
  }
};

const createSkill = async (skillData) => {
  const { name, category } = skillData;
  const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin.from('skills').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabaseAdmin
    .from('skills')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteSkill = async (id) => {
  const { data, error } = await supabaseAdmin.from('skills').delete().eq('id', id).select().single();
  if (error) throw error;
  return data;
};

// Contacts queries
const createContact = async (contactData) => {
  const { name, email, message } = contactData;
  const { data, error } = await supabaseAdmin
    .from('contacts')
    .insert([{ name, email, message }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const getAllContacts = async () => {
  const { data, error } = await supabaseAdmin.from('contacts').select('*').order('timestamp', { ascending: false });
  if (error) throw error;
  return data || [];
};

const markContactAsRead = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('contacts')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteContact = async (id) => {
  const { data, error } = await supabaseAdmin.from('contacts').delete().eq('id', id).select().single();
  if (error) throw error;
  return data;
};

// Reviews queries
const getAllReviews = async () => {
  try {
    const { data, error } = await supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching reviews from database:', error);
    console.log('Returning empty reviews array due to DB error');
    return [];
  }
};

const getVerifiedReviews = async () => {
  try {
    const { data, error } = await supabase.from('reviews').select('*').eq('status', 'verified').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching verified reviews from database:', error);
    return [];
  }
};

const createReview = async (reviewData) => {
  const { name, email, role, rating, message } = reviewData;
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert([{ name, email, role, rating, message }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

const updateReview = async (id, reviewData) => {
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update(reviewData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteReview = async (id) => {
  const { data, error } = await supabaseAdmin.from('reviews').delete().eq('id', id).select().single();
  if (error) throw error;
  return data;
};

// Stats queries
const getStats = async () => {
  try {
const [totalProjectsResult, featuredProjectsResult, totalSkillsResult, totalContactsResult, unreadContactsResult, totalReviewsResult, pendingReviewsResult] = await Promise.all([
      supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('projects').select('*', { count: 'exact', head: true }).eq('featured', true),
      supabaseAdmin.from('skills').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('contacts').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('contacts').select('*', { count: 'exact', head: true }).eq('read', false),
      supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ]);

    return {
      totalProjects: totalProjectsResult.count || 0,
      featuredProjects: featuredProjectsResult.count || 0,
      totalSkills: totalSkillsResult.count || 0,
      skillsByCategory: {}, // Stats page doesn't need this breakdown
      totalContacts: totalContactsResult.count || 0,
      unreadContacts: unreadContactsResult.count || 0,
      totalReviews: totalReviewsResult.count || 0,
      pendingReviews: pendingReviewsResult.count || 0
    };
  } catch (error) {
    console.error('Error fetching stats from database:', error);
    console.log('Returning default stats due to DB error');
    return {
      totalProjects: 0,
      featuredProjects: 0,
      totalSkills: 0,
      totalContacts: 0,
      unreadContacts: 0
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
  deleteContact,
  getAllReviews,
  getVerifiedReviews,
  createReview,
  updateReview,
  deleteReview,
  getStats
};
