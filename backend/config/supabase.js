const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Cek apakah key terbaca di terminal
console.log('URL:', supabaseUrl);
console.log('KEY:', supabaseKey ? 'Ditemukan (Aman)' : 'TIDAK DITEMUKAN!');

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;