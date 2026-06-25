import { createClient } from '@supabase/supabase-js';

// These would normally come from process.env.NEXT_PUBLIC_SUPABASE_URL etc.
// For now, we set up the client shell, but our UI mostly uses mock data 
// until keys are provided by the user.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
