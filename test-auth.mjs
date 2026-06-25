import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oilvfwtzhklsufqcrnjz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbHZmd3R6aGtsc3VmcWNybmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MzkzOTgsImV4cCI6MjA5NjMxNTM5OH0.-i-A7ZT58ekU-eEekJn1IyLf6loRtrX3DpF8-NyJ2-Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("1. Signing up test user...");
  const email = `testadmin@artoflivingdoranda.org`;
  const password = 'Password123!';
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Test Admin',
      }
    }
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }
  
  const user = authData.user;
  console.log("User created:", user.id);

  console.log("2. Checking if profile exists...");
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) {
    console.error("Profile Error:", profileError);
  } else {
    console.log("Profile created:", profileData);
  }

  console.log("3. Calling bootstrap_first_administrator RPC...");
  const { data: rpcData, error: rpcError } = await supabase.rpc('bootstrap_first_administrator', { 
    user_id: user.id 
  });
  
  if (rpcError) {
    console.error("RPC Error:", rpcError);
  } else {
    console.log("RPC Success:", rpcData);
  }
  
  console.log("Credentials to use:");
  console.log("Email:", email);
  console.log("Password:", password);
}

run();
