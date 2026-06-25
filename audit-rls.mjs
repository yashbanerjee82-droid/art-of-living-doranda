import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminClient = createClient(supabaseUrl, supabaseServiceKey)
const publicClient = createClient(supabaseUrl, supabaseAnonKey)

async function runAudit() {
  console.log("Starting RLS Audit...")
  
  // 1. Create Test Users
  console.log("\n--- CREATING TEST USERS ---")
  const users = [
    { email: 'audit_vol@test.com', pass: 'Test1234!', role: 'Volunteer' },
    { email: 'audit_teach@test.com', pass: 'Test1234!', role: 'Teacher' },
    { email: 'audit_admin@test.com', pass: 'Test1234!', role: 'Administrator' }
  ]
  
  const createdUsers = {}
  
  for (const u of users) {
    let { data: { users: existing } } = await adminClient.auth.admin.listUsers()
    let user = existing.find(x => x.email === u.email)
    
    if (!user) {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: u.email,
        password: u.pass,
        email_confirm: true
      })
      if (error) {
        console.log(`FAIL: Create ${u.role}`, error.message)
        continue
      }
      user = data.user
      // Assign responsibility
      await adminClient.from('profiles').update({ responsibilities: [u.role], name: `Test ${u.role}` }).eq('id', user.id)
      console.log(`PASS: Created ${u.role}`)
    } else {
      console.log(`PASS: Found ${u.role}`)
    }
    createdUsers[u.role] = user
  }

  // Helper to test client
  async function testClient(email, pass, roleName) {
    const client = createClient(supabaseUrl, supabaseAnonKey)
    await client.auth.signInWithPassword({ email, password: pass })
    return client
  }

  const volClient = await testClient('audit_vol@test.com', 'Test1234!', 'Volunteer')
  const teachClient = await testClient('audit_teach@test.com', 'Test1234!', 'Teacher')
  const adminTestClient = await testClient('audit_admin@test.com', 'Test1234!', 'Administrator')

  console.log("\n--- TESTING VOLUNTEER PERMISSIONS ---")
  let res = await volClient.from('courses').insert({ title: 'Vol Course', slug: 'vol-course' })
  if (res.error) console.log("PASS: Volunteer cannot create course (RLS Enforced). Error:", res.error.message)
  else console.log("FAIL: Volunteer was able to create course!")

  console.log("\n--- TESTING TEACHER PERMISSIONS ---")
  let rpcRes = await teachClient.rpc('create_course_with_manager', {
    course_data: { title: 'Teach Course RPC', slug: 'teach-course-rpc' }
  })
  if (rpcRes.error) console.log("FAIL: Teacher RPC failed. Error:", rpcRes.error.message)
  else console.log("PASS: Teacher can create course via RPC (assigns manager).")

  console.log("\n--- TESTING ADMINISTRATOR PERMISSIONS ---")
  res = await adminTestClient.from('announcements').insert({ title: 'Admin Announce', message: 'Hello' })
  if (res.error) console.log("FAIL: Admin cannot create announcement. Error:", res.error.message)
  else console.log("PASS: Admin can create announcement.")

  console.log("\n--- FIXING STORAGE BUCKET ---")
  // Create bucket if it doesn't exist
  await adminClient.storage.createBucket('gallery', { public: true })

  console.log("\n--- TESTING STORAGE BUCKET ---")
  // Upload a tiny text file to gallery bucket
  const fileContent = new Blob(['test'], { type: 'text/plain' })
  res = await adminTestClient.storage.from('gallery').upload(`test_${Date.now()}.txt`, fileContent)
  if (res.error) console.log("FAIL: Admin cannot upload to gallery. Error:", res.error.message)
  else console.log("PASS: Admin can upload to gallery bucket.")

  res = await volClient.storage.from('gallery').upload(`test_vol_${Date.now()}.txt`, fileContent)
  if (res.error) console.log("PASS: Volunteer cannot upload to gallery (RLS enforced). Error:", res.error.message)
  else console.log("FAIL: Volunteer was able to upload to gallery!")

  // Cleanup
  console.log("\n--- CLEANUP ---")
  for (const u of Object.values(createdUsers)) {
    if (u) await adminClient.auth.admin.deleteUser(u.id)
  }
  console.log("Cleanup complete.")
}

runAudit()
