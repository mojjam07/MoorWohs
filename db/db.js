const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables');
}

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

module.exports = supabase;
