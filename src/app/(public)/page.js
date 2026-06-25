import HomePageClient from './HomePageClient'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: courses } = await supabase.from('courses').select('*').is('archived_at', null).order('created_at', { ascending: false }).limit(3)
  const { data: events } = await supabase.from('events').select('*').is('archived_at', null).order('created_at', { ascending: false }).limit(3)
  const { data: wisdomArr } = await supabase.from('wisdom_quotes').select('*').is('archived_at', null).eq('active', true).limit(1)
  const { data: gallery } = await supabase.from('gallery_items').select('*').is('archived_at', null).order('created_at', { ascending: false }).limit(4)
  const { data: announcements } = await supabase.from('announcements').select('*').is('archived_at', null).eq('active', true).order('created_at', { ascending: false })

  const wisdom = wisdomArr && wisdomArr.length > 0 ? wisdomArr[0] : { quote: "Don't fall in love, rise in love.", author: "Gurudev Sri Sri Ravi Shankar" }
  
  return <HomePageClient 
    courses={courses || []} 
    events={events || []} 
    wisdom={wisdom} 
    gallery={gallery || []} 
    announcements={announcements || []} 
  />
}
