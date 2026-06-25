'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getUserSession } from './auth'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

const validTables = ['courses', 'events', 'gallery_items', 'announcements', 'wisdom_quotes', 'profiles']

export async function moveToArchive(table, id) {
  if (!validTables.includes(table)) return { error: "Invalid table" }
  
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()

  // First fetch the item to see if it exists and to get its name for notification
  const { data: item } = await supabase.from(table).select('*').eq('id', id).single()
  if (!item) return { error: "Item not found" }

  // Update it using user's RLS - if they don't have permission, it will fail
  const { error } = await supabase.from(table).update({ archived_at: new Date().toISOString() }).eq('id', id)
  
  if (error) return { error: error.message }

  let itemName = item.title || item.name || item.quote || item.message || "Item"
  if (table === 'gallery_items') itemName = "Gallery Image"

  await createNotification(user.id, `Moved ${itemName} to Archive Vault. It will be permanently removed in 14 days.`)

  revalidatePath('/staff/dashboard')
  revalidatePath('/')
  revalidatePath('/courses')
  revalidatePath('/events')
  revalidatePath('/gallery')
  return { success: true }
}

export async function restoreFromArchive(table, id) {
  if (!validTables.includes(table)) return { error: "Invalid table" }

  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  // Restoring might require seeing archived items, which RLS normally hides for public,
  // but staff can see them based on responsibilities. We can just use the normal client
  // since RLS allows staff to manage them. Actually, RLS for staff on courses/events is ALL,
  // but we might need to bypass the `archived_at IS NULL` if we had such policy, but
  // our ALL policy for staff doesn't have `USING (archived_at IS NULL)`. So it works.
  
  let adminClient;
  try {
    adminClient = await createAdminClient();
  } catch(err) {
    return { error: err.message };
  }

  const { data: item } = await adminClient.from(table).select('*').eq('id', id).single()
  if (!item) return { error: "Item not found" }

  const { error } = await adminClient.from(table).update({ archived_at: null }).eq('id', id)
  
  if (error) return { error: error.message }

  let itemName = item.title || item.name || item.quote || item.message || "Item"
  if (table === 'gallery_items') itemName = "Gallery Image"

  await createNotification(user.id, `Restored ${itemName} from Archive Vault.`)

  revalidatePath('/staff/dashboard')
  revalidatePath('/')
  revalidatePath('/courses')
  revalidatePath('/events')
  revalidatePath('/gallery')
  return { success: true }
}

export async function deletePermanently(table, id) {
  if (!validTables.includes(table)) return { error: "Invalid table" }

  const { user, profile } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  // To prevent unauthorized permanent deletion, require Admin or ownership
  // We use adminClient to do the delete, but we must check permissions first.
  let adminClient;
  try {
    adminClient = await createAdminClient();
  } catch(err) {
    return { error: err.message };
  }
  
  const { data: item } = await adminClient.from(table).select('*').eq('id', id).single()
  if (!item) return { error: "Item not found" }

  const isAdmin = profile.responsibilities.includes('Administrator')
  const isTeacher = profile.responsibilities.includes('Teacher')
  const isVolunteer = profile.responsibilities.includes('Volunteer')

  let canDelete = false
  if (isAdmin) canDelete = true
  else if (table === 'courses') {
    const { data: cm } = await adminClient.from('course_managers').select('*').eq('course_id', id).eq('user_id', user.id).maybeSingle()
    if (cm) canDelete = true
  }
  else if (table === 'events') {
    const { data: em } = await adminClient.from('event_managers').select('*').eq('event_id', id).eq('user_id', user.id).maybeSingle()
    if (em) canDelete = true
  }
  else if (table === 'gallery_items' && (isTeacher || isVolunteer)) canDelete = true
  else if (item.created_by === user.id) canDelete = true

  if (!canDelete) return { error: "Permission denied for permanent deletion" }

  const { error } = await adminClient.from(table).delete().eq('id', id)
  
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  return { success: true }
}
