import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse("Not allowed in production", { status: 403 })
  }

  try {
    const adminClient = await createAdminClient()
    
    const { data: profiles, error } = await adminClient.from('profiles').select('*')
    if (error) throw error

    const admin = profiles.find(p => p.responsibilities?.includes('Administrator'))
    if (!admin) return new NextResponse("No administrator found in the database.", { status: 404 })

    // Reset password to a known value for dev bypass
    const tempPassword = 'DevPassword123!'
    await adminClient.auth.admin.updateUserById(admin.id, { password: tempPassword })

    // Sign in using regular client to set cookies in the browser session
    const supabase = await createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: admin.email,
      password: tempPassword
    })

    if (signInError) throw signInError

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/staff/dashboard', request.url))
  } catch (err) {
    return new NextResponse(`Error: ${err.message}.`, { status: 500 })
  }
}
