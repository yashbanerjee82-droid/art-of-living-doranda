import { getUserSession } from '@/app/actions/auth'
import { restoreFromArchive, deletePermanently } from '@/app/actions/archive'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ArchiveVaultPage() {
  const { user, profile } = await getUserSession()
  if (!user) redirect('/staff')

  const r = profile.responsibilities || []
  const isAdmin = r.includes('Administrator')
  const isTeacher = r.includes('Teacher')
  const isVolunteer = r.includes('Volunteer')

  let adminClient;
  let courses = [];
  let events = [];
  let gallery = [];
  let adminClientError = null;

  try {
    adminClient = await createAdminClient();
    const [coursesRes, eventsRes, galleryRes] = await Promise.all([
      adminClient.from('courses').select('*, course_managers(user_id)').not('archived_at', 'is', null),
      adminClient.from('events').select('*, event_managers(user_id)').not('archived_at', 'is', null),
      adminClient.from('gallery_items').select('*').not('archived_at', 'is', null)
    ]);
    courses = coursesRes.data;
    events = eventsRes.data;
    gallery = galleryRes.data;
  } catch (err) {
    adminClientError = err.message;
  }
  
  // Filter based on responsibilities
  if (!isAdmin) {
    if (isTeacher) {
      courses = courses?.filter(c => c.course_managers.some(m => m.user_id === user.id)) || []
    } else {
      courses = []
    }

    if (isTeacher || isVolunteer) {
      events = events?.filter(e => e.event_managers.some(m => m.user_id === user.id)) || []
    } else {
      events = []
    }
    // gallery visible to all staff
  }

  const allArchived = [
    ...(courses || []).map(c => ({ ...c, type: 'Course', name: c.title, table: 'courses' })),
    ...(events || []).map(e => ({ ...e, type: 'Event', name: e.title, table: 'events' })),
    ...(gallery || []).map(g => ({ ...g, type: 'Gallery Image', name: 'Image', table: 'gallery_items' }))
  ].sort((a, b) => new Date(b.archived_at) - new Date(a.archived_at))

  async function handleRestore(formData) {
    'use server'
    await restoreFromArchive(formData.get('table'), formData.get('id'))
  }

  async function handleDelete(formData) {
    'use server'
    await deletePermanently(formData.get('table'), formData.get('id'))
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Archive Vault</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Items here will be permanently deleted 14 days after being archived.</p>
      
      {adminClientError && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <strong>Error:</strong> {adminClientError}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem' }}>Type</th>
              <th style={{ padding: '0.75rem' }}>Name</th>
              <th style={{ padding: '0.75rem' }}>Archived At</th>
              <th style={{ padding: '0.75rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allArchived.map(item => {
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', background: '#f3f4f6', borderRadius: '0.25rem', fontSize: '0.75rem' }}>{item.type}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{item.name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {new Date(item.archived_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <form action={handleRestore}>
                      <input type="hidden" name="table" value={item.table} />
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Retrieve</button>
                    </form>
                    <form action={handleDelete}>
                      <input type="hidden" name="table" value={item.table} />
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Delete Permanently</button>
                    </form>
                  </td>
                </tr>
              )
            })}
            {allArchived.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Vault is empty.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
