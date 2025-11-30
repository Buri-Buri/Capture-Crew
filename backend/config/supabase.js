const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in environment variables');
    // Don't exit, just warn, so server can start even if misconfigured (for debugging)
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
