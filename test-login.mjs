import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oilvfwtzhklsufqcrnjz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbHZmd3R6aGtsc3VmcWNybmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzkzOTgsImV4cCI6MjA5NjMxNTM5OH0.-i-A7ZT58ekU-eEekJn1IyLf6loRtrX3DpF8-NyJ2-Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.log(`Failed to login as ${email}: ${error.message}`);
  } else {
    console.log(`Successfully logged in as ${email}. User ID: ${data.user.id}`);
    
    // Check if they are admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    console.log('Profile:', profile);
  }
}

async function run() {
  await testLogin('admin@artoflivingdoranda.org', 'Password123!');
  await testLogin('testadmin@artoflivingdoranda.org', 'Password123!');
  await testLogin('admin@example.com', 'Password123!');
}

run();
