const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

let supabase;
try {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
  }
  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
} catch (error) {
  console.warn('Supabase not configured, using fallback mode:', error.message);
  // Create a mock client that will fail gracefully
  supabase = {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }) }),
      delete: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }) })
    })
  };
}

module.exports = supabase;
