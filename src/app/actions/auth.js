'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/staff/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/staff')
}

export async function resetPassword(formData) {
  const supabase = await createClient()
  const email = formData.get('email')
  
  // Assuming we use standard reset password flow and send them an email
  // with a redirect URL back to the staff portal
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/staff/update-password`,
  })
  
  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

export async function updatePassword(formData) {
  const supabase = await createClient()
  const password = formData.get('password')
  
  const { error } = await supabase.auth.updateUser({ password })
  
  if (error) {
    return { error: error.message }
  }
  
  redirect('/staff/dashboard')
}

export async function getUserSession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return { user, profile }
}
