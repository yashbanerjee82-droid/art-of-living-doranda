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

async function run() {
  console.log("--- SELECT * FROM courses LIMIT 5 ---")
  const { data: courses, error: cErr } = await adminClient.from('courses').select('*').limit(5)
  if (cErr) console.log("ERROR:", cErr.message)
  else console.log(JSON.stringify(courses, null, 2))

  console.log("\n--- SELECT * FROM events LIMIT 5 ---")
  const { data: events, error: eErr } = await adminClient.from('events').select('*').limit(5)
  if (eErr) console.log("ERROR:", eErr.message)
  else console.log(JSON.stringify(events, null, 2))
}

run()
