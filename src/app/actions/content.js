'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserSession } from './auth'
import { revalidatePath } from 'next/cache'

export async function createCourse(formData) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()

  const data = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    teacher_name: formData.get('teacher_name'),
    start_date: new Date(formData.get('start_date')).toISOString(),
    end_date: new Date(formData.get('end_date')).toISOString(),
    registration_close_date: new Date(formData.get('registration_close_date')).toISOString(),
    image_url: formData.get('image_url'),
    venue: formData.get('venue'),
    timings: formData.get('timings'),
    registration_link: formData.get('registration_link'),
  }

  const initial_manager_id = formData.get('initial_manager_id')
  if (!initial_manager_id) return { error: "Initial Course Manager is required." }

  const { error } = await supabase.rpc('create_course_with_manager', {
    p_title: data.title,
    p_slug: data.slug,
    p_description: data.description,
    p_teacher_name: data.teacher_name,
    p_start_date: data.start_date,
    p_end_date: data.end_date,
    p_reg_close_date: data.registration_close_date,
    p_image_url: data.image_url,
    p_venue: data.venue,
    p_timings: data.timings,
    p_registration_link: data.registration_link,
    p_manager_id: initial_manager_id
  })
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  revalidatePath('/courses')
  revalidatePath('/')
  return { success: true }
}

export async function updateCourse(id, formData) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()

  const data = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    teacher_name: formData.get('teacher_name'),
    start_date: new Date(formData.get('start_date')).toISOString(),
    end_date: new Date(formData.get('end_date')).toISOString(),
    registration_close_date: new Date(formData.get('registration_close_date')).toISOString(),
    image_url: formData.get('image_url'),
    venue: formData.get('venue'),
    timings: formData.get('timings'),
    registration_link: formData.get('registration_link'),
  }

  const { error } = await supabase.from('courses').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  revalidatePath('/courses')
  revalidatePath('/')
  return { success: true }
}

export async function createEvent(formData) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()

  const data = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    date: new Date(formData.get('date')).toISOString(),
    image_url: formData.get('image_url'),
  }

  const initial_manager_id = formData.get('initial_manager_id')
  if (!initial_manager_id) return { error: "Initial Event Manager is required." }

  const { error } = await supabase.rpc('create_event_with_manager', {
    p_title: data.title,
    p_slug: data.slug,
    p_description: data.description,
    p_date: data.date,
    p_image_url: data.image_url,
    p_manager_id: initial_manager_id
  })
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  revalidatePath('/events')
  revalidatePath('/')
  return { success: true }
}

export async function updateEvent(id, formData) {
  const supabase = await createClient()

  const data = {
    title: formData.get('title'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    date: new Date(formData.get('date')).toISOString(),
    image_url: formData.get('image_url'),
  }

  const { error } = await supabase.from('events').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  revalidatePath('/events')
  revalidatePath('/')
  return { success: true }
}

export async function createGalleryItem(formData) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()
  const data = {
    image_url: formData.get('image_url'),
    created_by: user.id
  }

  const { error } = await supabase.from('gallery_items').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  revalidatePath('/gallery')
  return { success: true }
}

export async function setAnnouncement(formData) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()
  const data = {
    message: formData.get('message'),
    active: formData.get('active') === 'true',
    created_by: user.id
  }

  const { error } = await supabase.from('announcements').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function updateAnnouncement(id, formData) {
  const supabase = await createClient()
  const data = {
    message: formData.get('message'),
    active: formData.get('active') === 'true',
  }

  const { error } = await supabase.from('announcements').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function setWisdom(formData) {
  const { user } = await getUserSession()
  if (!user) return { error: "Unauthorized" }

  const supabase = await createClient()
  const data = {
    quote: formData.get('quote'),
    author: formData.get('author'),
    active: formData.get('active') === 'true',
    created_by: user.id
  }

  const { error } = await supabase.from('wisdom_quotes').insert(data)
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function updateWisdom(id, formData) {
  const supabase = await createClient()
  const data = {
    quote: formData.get('quote'),
    author: formData.get('author'),
    active: formData.get('active') === 'true',
  }

  const { error } = await supabase.from('wisdom_quotes').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/staff/dashboard')
  revalidatePath('/')
  return { success: true }
}
