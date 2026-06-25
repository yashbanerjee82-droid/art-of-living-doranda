'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNotification(userId, message) {
  try {
    const adminClient = await createAdminClient()
    await adminClient.from('notifications').insert({
      user_id: userId,
      message
    })
  } catch (err) {
    console.error("Could not create notification:", err.message)
  }
}

export async function markNotificationRead(notificationId) {
  const supabase = await createClient()
  await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
  revalidatePath('/staff/dashboard')
}
