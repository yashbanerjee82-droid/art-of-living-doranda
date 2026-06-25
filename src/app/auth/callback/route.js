import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/staff/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error("Exchange Code Error:", error.message)
      return NextResponse.redirect(`${origin}/staff?error=${encodeURIComponent(error.message)}`)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/staff?error=Invalid_Token`)
}
