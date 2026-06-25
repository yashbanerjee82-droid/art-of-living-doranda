'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserSession } from './auth'
import { revalidatePath } from 'next/cache'

export async function searchEligibleManagers(searchQuery, roles) {
  const { user, profile } = await getUserSession()
  if (!user) return []

  // Ensure only staff can search
  if (!profile.responsibilities.some(r => ['Administrator', 'Teacher', 'Volunteer'].includes(r))) {
    return []
  }

  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, name, email, responsibilities')
    .is('archived_at', null)
    .or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
    .limit(10)

  // Postgres array overlap operator isn't directly exposed in all Supabase versions via a simple `.contains` or `.overlaps` that works with any element of array easily in this context if we want "roles" array to match.
  // We can just fetch them and filter in JS if it's small, or use .cs (contains) if roles is single.
  // Actually, Supabase supports `contains` for array. But we want ANY of the roles.
  // Since we only ever pass ['Teacher'] or ['Teacher', 'Volunteer'], we can filter in JS for safety and simplicity given limit 10, or just use .or() for each role.
  
  const { data, error } = await query
  
  if (error || !data) return []

  // Filter in JS to be safe and ensure they have at least one of the required roles
  return data.filter(p => p.responsibilities.some(r => roles.includes(r)))
}

export async function addCourseManager(courseId, userId) {
  const { user, profile } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()

  // Verify the target user is a Teacher
  const { data: targetProfile } = await supabase.from('profiles').select('responsibilities').eq('id', userId).single()
  if (!targetProfile || !targetProfile.responsibilities.includes('Teacher')) {
    return { error: "Only Teachers can be Course Managers." }
  }
  
  const { error } = await supabase.from('course_managers').insert({
    course_id: courseId,
    user_id: userId
  })

  if (error) {
    if (error.code === '23505') return { error: "User is already a manager." }
    return { error: error.message }
  }

  revalidatePath('/staff/dashboard')
  revalidatePath('/staff/dashboard/courses')
  return { success: true }
}

export async function removeCourseManager(courseId, userId) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()

  const { error } = await supabase.from('course_managers').delete()
    .eq('course_id', courseId)
    .eq('user_id', userId)

  if (error) {
    if (error.message && error.message.includes('A course must have at least one Course Manager.')) {
      return { error: 'A course must have at least one Course Manager.' }
    }
    return { error: error.message }
  }

  revalidatePath('/staff/dashboard')
  revalidatePath('/staff/dashboard/courses')
  return { success: true }
}

export async function addEventManager(eventId, userId) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()

  // Verify the target user is a Teacher or Volunteer
  const { data: targetProfile } = await supabase.from('profiles').select('responsibilities').eq('id', userId).single()
  if (!targetProfile || (!targetProfile.responsibilities.includes('Teacher') && !targetProfile.responsibilities.includes('Volunteer'))) {
    return { error: "Only Teachers or Volunteers can be Event Managers." }
  }
  
  const { error } = await supabase.from('event_managers').insert({
    event_id: eventId,
    user_id: userId
  })

  if (error) {
    if (error.code === '23505') return { error: "User is already a manager." }
    return { error: error.message }
  }

  revalidatePath('/staff/dashboard')
  revalidatePath('/staff/dashboard/events')
  return { success: true }
}

export async function removeEventManager(eventId, userId) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()

  const { error } = await supabase.from('event_managers').delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) {
    if (error.message && error.message.includes('An event must have at least one Event Manager.')) {
      return { error: 'An event must have at least one Event Manager.' }
    }
    return { error: error.message }
  }

  revalidatePath('/staff/dashboard')
  revalidatePath('/staff/dashboard/events')
  return { success: true }
}
