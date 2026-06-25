import { getUserSession } from '@/app/actions/auth'
import { createEvent } from '@/app/actions/content'
import { moveToArchive } from '@/app/actions/archive'
import { removeEventManager } from '@/app/actions/managers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ManagerSelector from '../ManagerSelector'
import UserSelector from '../UserSelector'

export default async function EventsPage() {
  const { user, profile } = await getUserSession()
  if (!user) redirect('/staff')

  const r = profile.responsibilities || []
  const canManageEvents = r.includes('Administrator') || r.includes('Teacher') || r.includes('Volunteer')
  
  if (!canManageEvents) redirect('/staff/dashboard')

  const supabase = await createClient()
  
  // RLS handles the filtering automatically now based on event_managers
  let query = supabase
    .from('events')
    .select('*, event_managers(user_id, profiles(name, email, responsibilities))')
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  const { data: events } = await query

  async function handleCreate(formData) {
    'use server'
    await createEvent(formData)
  }

  async function handleArchive(formData) {
    'use server'
    await moveToArchive('events', formData.get('id'))
  }

  async function handleRemoveManager(formData) {
    'use server'
    await removeEventManager(formData.get('eventId'), formData.get('userId'))
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Events Management</h1>

      <section style={{ marginBottom: '3rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create New Event</h2>
        <form action={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><label>Title</label><input name="title" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Slug</label><input name="slug" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Image URL</label><input name="image_url" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Date</label><input type="datetime-local" name="date" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label>Description</label><textarea name="description" rows="3" required style={{ width: '100%', padding: '0.5rem' }}></textarea></div>
          <div style={{ gridColumn: '1 / -1' }}><UserSelector roles={['Teacher', 'Volunteer']} /></div>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Create Event</button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Events</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events?.map(event => (
            <div key={event.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{event.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Date: {new Date(event.date).toLocaleDateString()}</p>
                </div>
                <form action={handleArchive}>
                  <input type="hidden" name="id" value={event.id} />
                  <button type="submit" style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Archive</button>
                </form>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Event Managers</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {event.event_managers?.map(em => (
                    <li key={em.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem' }}>
                      <span>{em.profiles?.name} ({em.profiles?.email})</span>
                      <form action={handleRemoveManager}>
                        <input type="hidden" name="eventId" value={event.id} />
                        <input type="hidden" name="userId" value={em.user_id} />
                        <button type="submit" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem' }}>Remove</button>
                      </form>
                    </li>
                  ))}
                </ul>
                <ManagerSelector 
                  roles={['Teacher', 'Volunteer']} 
                  onAddManager={async (userId) => {
                    'use server'
                    const { addEventManager } = await import('@/app/actions/managers')
                    return await addEventManager(event.id, userId)
                  }} 
                />
              </div>
            </div>
          ))}
          {events?.length === 0 && <p>No active events found.</p>}
        </div>
      </section>
    </div>
  )
}
