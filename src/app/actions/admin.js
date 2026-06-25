'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getUserSession } from './auth'
import { createNotification } from './notifications'

export async function createAccount(formData) {
  const { user, profile } = await getUserSession()
  if (!user || !profile) return { error: "Unauthorized" }

  const email = formData.get('email')
  const password = formData.get('password')
  const name = formData.get('name')
  const phoneNumber = formData.get('phoneNumber')
  const responsibilities = formData.getAll('responsibilities')

  const isAdmin = profile.responsibilities.includes('Administrator')

  // Permission checks
  if (!isAdmin) return { error: "Permission denied. Only Administrators can create accounts." }

  let adminClient;
  try {
    adminClient = await createAdminClient();
  } catch(err) {
    return { error: err.message };
  }

  // Create auth.user
  const { data: newAuthUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, responsibilities }
  })

  if (authError) return { error: authError.message }

  // The database trigger will create the profile, but let's update it with exact info just in case
  const { error: profileError } = await adminClient.from('profiles').update({
    phone_number: phoneNumber,
    responsibilities: responsibilities
  }).eq('id', newAuthUser.user.id)

  if (profileError) return { error: profileError.message }

  // Notify creator
  await createNotification(user.id, `Successfully created account for ${name} (${email})`)

  revalidatePath('/staff/dashboard')
  return { success: true }
}

export async function grantAdmin(targetUserId) {
  const { user, profile } = await getUserSession()
  if (!user || !profile?.responsibilities.includes('Administrator')) return { error: "Unauthorized" }

  let adminClient;
  try {
    adminClient = await createAdminClient();
  } catch(err) {
    return { error: err.message };
  }
  
  // Get target user
  const { data: targetProfile, error: getErr } = await adminClient.from('profiles').select('*').eq('id', targetUserId).single()
  if (getErr || !targetProfile) return { error: "User not found" }

  if (targetProfile.responsibilities.includes('Administrator')) {
    return { error: "User is already an Administrator" }
  }

  const newResponsibilities = [...targetProfile.responsibilities, 'Administrator']

  const { error: updateErr } = await adminClient.from('profiles')
    .update({ responsibilities: newResponsibilities })
    .eq('id', targetUserId)

  if (updateErr) return { error: updateErr.message }

  // Record assignment
  await adminClient.from('admin_assignments').insert({
    user_id: targetUserId,
    granted_by: user.id
  })

  // Notifications
  await createNotification(user.id, `You granted Administrator access to ${targetProfile.name}. You have 3 days to reverse this.`)
  await createNotification(targetUserId, `You have been granted Administrator access by ${profile.name}.`)

  revalidatePath('/staff/dashboard')
  return { success: true }
}

export async function revokeAdmin(targetUserId) {
  const { user, profile } = await getUserSession()
  if (!user || !profile?.responsibilities.includes('Administrator')) return { error: "Unauthorized" }

  let adminClient;
  try {
    adminClient = await createAdminClient();
  } catch(err) {
    return { error: err.message };
  }

  // Find assignment
  const { data: assignment } = await adminClient.from('admin_assignments')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('granted_by', user.id)
    .order('granted_at', { ascending: false })
    .limit(1)
    .single()

  if (!assignment) {
    return { error: "You cannot revoke Administrator from this user." }
  }

  const grantedAt = new Date(assignment.granted_at)
  const now = new Date()
  const diffDays = (now - grantedAt) / (1000 * 60 * 60 * 24)

  if (diffDays > 3) {
    return { error: "The 3-day window to revoke Administrator access has passed." }
  }

  const { data: targetProfile } = await adminClient.from('profiles').select('responsibilities, name').eq('id', targetUserId).single()
  const newResponsibilities = targetProfile.responsibilities.filter(r => r !== 'Administrator')

  if (newResponsibilities.length === 0) {
    return { error: "A user must have at least one responsibility." }
  }

  await adminClient.from('profiles').update({ responsibilities: newResponsibilities }).eq('id', targetUserId)
  await adminClient.from('admin_assignments').delete().eq('id', assignment.id)

  await createNotification(user.id, `You removed Administrator access from ${targetProfile.name}.`)
  await createNotification(targetUserId, `Your Administrator access was returned by ${profile.name}.`)

  revalidatePath('/staff/dashboard')
  return { success: true }
}

export async function returnAdminAccess() {
  const { user, profile } = await getUserSession()
  if (!user || !profile?.responsibilities.includes('Administrator')) return { error: "Unauthorized" }

  let adminClient;
  try {
    adminClient = await createAdminClient();
  } catch(err) {
    return { error: err.message };
  }
  const newResponsibilities = profile.responsibilities.filter(r => r !== 'Administrator')

  if (newResponsibilities.length === 0) {
    return { error: "You must have another responsibility to return Administrator access." }
  }

  await adminClient.from('profiles').update({ responsibilities: newResponsibilities }).eq('id', user.id)

  // Remove any assignment record to clean up
  await adminClient.from('admin_assignments').delete().eq('user_id', user.id)

  revalidatePath('/staff/dashboard')
  return { success: true }
}

export async function levelUp(targetUserId) {
  const { user, profile } = await getUserSession()
  if (!user || !profile?.responsibilities.includes('Administrator')) return { error: "Unauthorized" }

  let adminClient;
  try {
    adminClient = await createAdminClient();
  } catch(err) {
    return { error: err.message };
  }
  const { data: targetProfile } = await adminClient.from('profiles').select('*').eq('id', targetUserId).single()

  if (!targetProfile) return { error: "User not found" }

  // Level Up only does Volunteer -> Teacher
  if (targetProfile.responsibilities.includes('Teacher')) {
    return { error: "User is already a Teacher" }
  }
  if (!targetProfile.responsibilities.includes('Volunteer')) {
    return { error: "User is not a Volunteer" }
  }

  // Remove Volunteer responsibility and add Teacher responsibility
  const newResponsibilities = targetProfile.responsibilities.filter(r => r !== 'Volunteer')
  if (!newResponsibilities.includes('Teacher')) {
    newResponsibilities.push('Teacher')
  }

  await adminClient.from('profiles').update({ responsibilities: newResponsibilities }).eq('id', targetUserId)

  await createNotification(user.id, `You Leveled Up ${targetProfile.name} to Teacher.`)
  await createNotification(targetUserId, `You have been Leveled Up to Teacher by ${profile.name}!`)

  revalidatePath('/staff/dashboard')
  return { success: true }
}

// Admins can add Teacher or Volunteer to their own account
export async function updateOwnResponsibilities(newResponsibilities) {
  const { user, profile } = await getUserSession()
  if (!user || !profile?.responsibilities.includes('Administrator')) return { error: "Unauthorized" }

  if (!newResponsibilities.includes('Administrator')) {
    return { error: "Cannot remove Administrator access this way. Use 'Return Administrative Access'." }
  }

  if (newResponsibilities.length === 0) {
    return { error: "Must have at least one responsibility." }
  }

  const client = await createClient()
  const { error } = await client.from('profiles').update({ responsibilities: newResponsibilities }).eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  return { success: true }
}

export async function updateProfile(formData) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const name = formData.get('name')
  const phoneNumber = formData.get('phoneNumber')

  const supabase = await createClient()
  const { error } = await supabase.from('profiles').update({
    name,
    phone_number: phoneNumber
  }).eq('id', user.id)

  if (error) return { error: error.message }
  
  revalidatePath('/staff/dashboard')
  return { success: true }
}

// For Admins resetting other users passwords
export async function adminResetUserPassword(targetUserId, newPassword) {
  const { user, profile } = await getUserSession()
  if (!user || !profile?.responsibilities.includes('Administrator')) return { error: "Unauthorized" }

  let adminClient;
  try {
    adminClient = await createAdminClient();
  } catch(err) {
    return { error: err.message };
  }
  const { error } = await adminClient.auth.admin.updateUserById(targetUserId, { password: newPassword })
  
  if (error) return { error: error.message }

  // Notify the user if we had a way, but usually admin tells them.
  await createNotification(targetUserId, "Your password was reset by an Administrator.")

  return { success: true }
}
