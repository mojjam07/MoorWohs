const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

let supabase;
// Create admin client with service role key for operations that need elevated permissions
let supabaseAdmin;
// Track if we're using RLS-bypassing admin client
let isUsingServiceRole = false;

try {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
  }
  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  
  // Create admin client with service role key (bypasses RLS) if available
  if (config.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
    isUsingServiceRole = true;
    console.log('✓ Supabase admin client initialized with service role key (RLS bypass enabled)');
  } else {
    supabaseAdmin = supabase;
    isUsingServiceRole = false;
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set - using anon key for admin operations');
    console.warn('   RLS policies may block read/write operations on projects, skills, and other protected tables');
    console.warn('   To fix: Set SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
} catch (error) {
  console.warn('Supabase not configured, using fallback mode:', error.message);
  // Create a mock client that will fail gracefully
  const mockClient = {
    from: () => ({
      select: () => ({ 
        eq: () => ({ 
          order: () => ({ data: [], error: new Error('Supabase not configured') }) 
        }) 
      }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }) }),
      delete: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }) })
    })
  };
  supabase = mockClient;
  supabaseAdmin = mockClient;
}

/**
 * Diagnostic function to check Supabase configuration and table access
 * This helps identify RLS-related issues
 */
const diagnoseSupabase = async () => {
  const diagnostics = {
    supabaseUrlConfigured: !!config.SUPABASE_URL,
    supabaseAnonKeyConfigured: !!config.SUPABASE_ANON_KEY,
    serviceRoleKeyConfigured: !!config.SUPABASE_SERVICE_ROLE_KEY,
    usingServiceRole: isUsingServiceRole,
    tables: {}
  };

  const tables = ['projects', 'skills', 'contacts'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      diagnostics.tables[table] = {
        accessible: !error,
        error: error ? error.message : null,
        count: data?.count || 0
      };
    } catch (err) {
      diagnostics.tables[table] = {
        accessible: false,
        error: err.message,
        count: 0
      };
    }
  }

  return diagnostics;
};

module.exports = { supabase, supabaseAdmin, diagnoseSupabase, isUsingServiceRole };
