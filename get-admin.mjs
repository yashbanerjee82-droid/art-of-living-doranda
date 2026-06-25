import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oilvfwtzhklsufqcrnjz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbHZmd3R6aGtsc3VmcWNybmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzkzOTgsImV4cCI6MjA5NjMxNTM5OH0.-i-A7ZT58ekU-eEekJn1IyLf6loRtrX3DpF8-NyJ2-Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
    
  if (error) {
    console.error("Profile Error:", error);
  } else {
    console.log("Admin Profiles:", data);
  }
}

run();
