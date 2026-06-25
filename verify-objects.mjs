import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf8')
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=')
  if (k && v.length) process.env[k.trim()] = v.join('=').trim()
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const adminClient = createClient(supabaseUrl, supabaseServiceKey)

async function verify() {
  const results = []

  // 1. public.create_course_with_manager
  let res = await adminClient.rpc('create_course_with_manager', {})
  results.push({ name: 'create_course_with_manager', exists: !res.error || !res.error.message.includes('Could not find the function') })

  // 2. public.create_event_with_manager
  res = await adminClient.rpc('create_event_with_manager', {})
  results.push({ name: 'create_event_with_manager', exists: !res.error || !res.error.message.includes('Could not find the function') })

  // 3. public.bootstrap_first_administrator
  res = await adminClient.rpc('bootstrap_first_administrator', {})
  results.push({ name: 'bootstrap_first_administrator', exists: !res.error || !res.error.message.includes('Could not find the function') })

  // 4. public.course_managers
  res = await adminClient.from('course_managers').select('*').limit(1)
  results.push({ name: 'course_managers', exists: !res.error || !res.error.message.includes('relation "public.course_managers" does not exist') })

  // 5. public.event_managers
  res = await adminClient.from('event_managers').select('*').limit(1)
  results.push({ name: 'event_managers', exists: !res.error || !res.error.message.includes('relation "public.event_managers" does not exist') })

  // 6. public.archive_items
  res = await adminClient.from('archive_items').select('*').limit(1)
  results.push({ name: 'archive_items', exists: !res.error || !res.error.message.includes('relation "public.archive_items" does not exist') })

  // 7. public.has_responsibility
  res = await adminClient.rpc('has_responsibility', { req: 'Administrator' })
  results.push({ name: 'has_responsibility', exists: !res.error || !res.error.message.includes('Could not find the function') })

  // 8. gallery storage bucket
  res = await adminClient.storage.getBucket('gallery')
  results.push({ name: 'gallery bucket', exists: !res.error || res.error.message !== 'Bucket not found' })

  console.log(JSON.stringify(results, null, 2))
}

verify()
