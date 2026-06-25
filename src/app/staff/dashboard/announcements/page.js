import { getUserSession } from '@/app/actions/auth'
import { setAnnouncement, updateAnnouncement, setWisdom, updateWisdom } from '@/app/actions/content'
import { moveToArchive } from '@/app/actions/archive'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnnouncementsPage() {
  const { user, profile } = await getUserSession()
  if (!user || !profile?.responsibilities.includes('Administrator')) redirect('/staff/dashboard')

  const supabase = await createClient()
  const { data: announcements } = await supabase.from('announcements').select('*').is('archived_at', null).order('created_at', { ascending: false })
  const { data: wisdom } = await supabase.from('wisdom_quotes').select('*').is('archived_at', null).order('created_at', { ascending: false })

  async function handleCreateAnnouncement(formData) {
    'use server'
    await setAnnouncement(formData)
  }

  async function handleArchiveAnnouncement(formData) {
    'use server'
    await moveToArchive('announcements', formData.get('id'))
  }

  async function handleCreateWisdom(formData) {
    'use server'
    await setWisdom(formData)
  }

  async function handleArchiveWisdom(formData) {
    'use server'
    await moveToArchive('wisdom_quotes', formData.get('id'))
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Announcements & Words of Wisdom</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Announcements */}
        <section>
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>New Announcement</h2>
            <form action={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block' }}>Message</label><textarea name="message" required rows="3" style={{ width: '100%', padding: '0.5rem' }}></textarea></div>
              <label><input type="checkbox" name="active" value="true" defaultChecked /> Active immediately</label>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Add Announcement</button>
            </form>
          </div>

          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Announcements</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements?.map(a => (
              <div key={a.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>{a.message}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: a.active ? '#10b981' : '#6b7280' }}>{a.active ? 'Active' : 'Inactive'}</span>
                  <form action={handleArchiveAnnouncement}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Archive</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Wisdom */}
        <section>
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>New Words of Wisdom</h2>
            <form action={handleCreateWisdom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block' }}>Quote</label><textarea name="quote" required rows="2" style={{ width: '100%', padding: '0.5rem' }}></textarea></div>
              <div><label style={{ display: 'block' }}>Author</label><input name="author" required style={{ width: '100%', padding: '0.5rem' }} /></div>
              <label><input type="checkbox" name="active" value="true" defaultChecked /> Active immediately</label>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Add Quote</button>
            </form>
          </div>

          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Quotes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {wisdom?.map(w => (
              <div key={w.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                <blockquote style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>"{w.quote}"</blockquote>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>- {w.author}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: w.active ? '#10b981' : '#6b7280' }}>{w.active ? 'Active' : 'Inactive'}</span>
                  <form action={handleArchiveWisdom}>
                    <input type="hidden" name="id" value={w.id} />
                    <button type="submit" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Archive</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
