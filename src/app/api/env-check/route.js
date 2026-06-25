import { NextResponse } from 'next/server';

export async function GET() {
  console.log("SERVICE_ROLE_KEY_PRESENT:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  return NextResponse.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}
