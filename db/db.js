const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

let supabase;
// Create admin client with service role key for operations that need elevated permissions
let supabaseAdmin;

try {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
  }
  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  
  // Create admin client with service role key (bypasses RLS) if available
  if (config.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Supabase admin client initialized with service role key');
  } else {
    supabaseAdmin = supabase;
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set, using anon key for admin operations (RLS policies may block requests)');
  }
} catch (error) {
  console.warn('Supabase not configured, using fallback mode:', error.message);
  // Create a mock client that will fail gracefully
  const mockClient = {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }) }),
      delete: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }) })
    })
  };
  supabase = mockClient;
  supabaseAdmin = mockClient;
}

module.exports = { supabase, supabaseAdmin };
