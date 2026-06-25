import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function runAudit() {
  console.log("=== STARTING DATABASE VERIFICATION WORKFLOW ===\n")

  // Authenticate as Administrator to pass RLS and RPC checks
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'yashbanerjee@zohomail.in',
    password: 'SecurePassword123!'
  })
  
  if (authErr) {
    console.log("Failed to authenticate:", authErr)
    return
  }
  console.log(`[Authenticated as Administrator: ${authData.user.email}]\n`)

  let courseId = null
  let eventId = null
  let announcementId = null
  const adminId = authData.user.id
  const teacherId = 'c0e5503b-5af8-4380-8b40-5e681ec5699b' // Audit Teacher

  // 1. Create Course
  console.log("1. Create Course")
  console.log("Server Action: createCourse")
  console.log("RPC: create_course_with_manager")
  const { data: cData, error: cErr } = await supabase.rpc('create_course_with_manager', {
    p_title: "Audit Test Course",
    p_slug: "audit-test-course-" + Date.now(),
    p_description: "Testing",
    p_teacher_name: "Audit Teacher",
    p_start_date: new Date().toISOString(),
    p_end_date: new Date().toISOString(),
    p_reg_close_date: new Date().toISOString(),
    p_image_url: "https://example.com/image.jpg",
    p_venue: "Audit Venue",
    p_timings: "10am - 12pm",
    p_registration_link: "https://example.com",
    p_manager_id: teacherId
  })
  console.log("Supabase Response:", JSON.stringify({ data: cData, error: cErr }, null, 2))
  courseId = cData
  console.log(`Database Row ID Created/Modified: ${courseId}\n`)

  // 2. Edit Course
  console.log("2. Edit Course")
  console.log("Server Action: updateCourse")
  console.log("RPC: None (supabase.from('courses').update(...))")
  const { data: uCData, error: uCErr } = await supabase.from('courses').update({ title: "Audit Test Course - Edited" }).eq('id', courseId).select()
  console.log("Supabase Response:", JSON.stringify({ data: uCData, error: uCErr }, null, 2))
  console.log(`Database Row ID Created/Modified: ${courseId}\n`)

  // 3. Archive Course
  console.log("3. Archive Course")
  console.log("Server Action: moveToArchive (courses)")
  console.log("RPC: None (supabase.from('courses').update({ archived_at }))")
  const { data: acData, error: acErr } = await supabase.from('courses').update({ archived_at: new Date().toISOString() }).eq('id', courseId).select()
  console.log("Supabase Response:", JSON.stringify({ data: acData, error: acErr }, null, 2))
  console.log(`Database Row ID Created/Modified: ${courseId}\n`)

  // 4. Restore Course
  console.log("4. Restore Course")
  console.log("Server Action: restoreFromArchive (courses)")
  console.log("RPC: None (supabase.from('courses').update({ archived_at: null }))")
  // Note: RLS might hide archived courses from non-service-role clients depending on the policy.
  // The server action uses adminClient (service role) to restore! 
  // Let's use service role here for restore, just like the real server action.
  const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: rcData, error: rcErr } = await adminClient.from('courses').update({ archived_at: null }).eq('id', courseId).select()
  console.log("Supabase Response:", JSON.stringify({ data: rcData, error: rcErr }, null, 2))
  console.log(`Database Row ID Created/Modified: ${courseId}\n`)

  // 5. Create Event
  console.log("5. Create Event")
  console.log("Server Action: createEvent")
  console.log("RPC: create_event_with_manager")
  const { data: eData, error: eErr } = await supabase.rpc('create_event_with_manager', {
    p_title: "Audit Test Event",
    p_slug: "audit-test-event-" + Date.now(),
    p_description: "Testing",
    p_date: new Date().toISOString(),
    p_image_url: "https://example.com/image.jpg",
    p_manager_id: teacherId
  })
  console.log("Supabase Response:", JSON.stringify({ data: eData, error: eErr }, null, 2))
  eventId = eData
  console.log(`Database Row ID Created/Modified: ${eventId}\n`)

  // 6. Edit Event
  console.log("6. Edit Event")
  console.log("Server Action: updateEvent")
  console.log("RPC: None (supabase.from('events').update(...))")
  const { data: ueData, error: ueErr } = await supabase.from('events').update({ title: "Audit Test Event - Edited" }).eq('id', eventId).select()
  console.log("Supabase Response:", JSON.stringify({ data: ueData, error: ueErr }, null, 2))
  console.log(`Database Row ID Created/Modified: ${eventId}\n`)

  // 7. Archive Event
  console.log("7. Archive Event")
  console.log("Server Action: moveToArchive (events)")
  console.log("RPC: None (supabase.from('events').update({ archived_at }))")
  const { data: aeData, error: aeErr } = await supabase.from('events').update({ archived_at: new Date().toISOString() }).eq('id', eventId).select()
  console.log("Supabase Response:", JSON.stringify({ data: aeData, error: aeErr }, null, 2))
  console.log(`Database Row ID Created/Modified: ${eventId}\n`)

  // 8. Restore Event
  console.log("8. Restore Event")
  console.log("Server Action: restoreFromArchive (events)")
  console.log("RPC: None (supabase.from('events').update({ archived_at: null }))")
  const { data: reData, error: reErr } = await adminClient.from('events').update({ archived_at: null }).eq('id', eventId).select()
  console.log("Supabase Response:", JSON.stringify({ data: reData, error: reErr }, null, 2))
  console.log(`Database Row ID Created/Modified: ${eventId}\n`)

  // 9. Create Announcement
  console.log("9. Create Announcement")
  console.log("Server Action: setAnnouncement")
  console.log("RPC: None (supabase.from('announcements').insert(...))")
  const { data: aData, error: aErr } = await supabase.from('announcements').insert({ message: "Audit Announcement", active: true, created_by: adminId }).select()
  console.log("Supabase Response:", JSON.stringify({ data: aData, error: aErr }, null, 2))
  if (aData && aData.length > 0) announcementId = aData[0].id
  console.log(`Database Row ID Created/Modified: ${announcementId}\n`)

  // 10. Edit Announcement
  console.log("10. Edit Announcement")
  console.log("Server Action: updateAnnouncement")
  console.log("RPC: None (supabase.from('announcements').update(...))")
  const { data: uaData, error: uaErr } = await supabase.from('announcements').update({ message: "Audit Announcement - Edited" }).eq('id', announcementId).select()
  console.log("Supabase Response:", JSON.stringify({ data: uaData, error: uaErr }, null, 2))
  console.log(`Database Row ID Created/Modified: ${announcementId}\n`)

  // 11. Delete Announcement
  console.log("11. Delete Announcement")
  console.log("Server Action: deletePermanently (announcements)")
  console.log("RPC: None (supabase.from('announcements').delete())")
  const { data: daData, error: daErr } = await adminClient.from('announcements').delete().eq('id', announcementId).select()
  console.log("Supabase Response:", JSON.stringify({ data: daData, error: daErr }, null, 2))
  console.log(`Database Row ID Created/Modified: ${announcementId}\n`)

  console.log("\n=== AUDIT COMPLETE ===")
}

runAudit()
