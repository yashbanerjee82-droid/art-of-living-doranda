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

async function clean() {
  await adminClient.from('profiles').delete().like('email', 'audit_%')
  const { data: users, error } = await adminClient.auth.admin.listUsers()
  for (const u of users.users) {
    if (u.email.includes('audit_')) {
      await adminClient.auth.admin.deleteUser(u.id)
    }
  }
  console.log("Clean complete.")
}

clean()
