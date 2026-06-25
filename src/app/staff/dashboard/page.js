import { getUserSession } from '@/app/actions/auth'
import { updateProfile, updatePassword } from '@/app/actions/auth'
import { returnAdminAccess, updateOwnResponsibilities } from '@/app/actions/admin'
import { markNotificationRead } from '@/app/actions/notifications'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function DashboardPage() {
  const { user, profile } = await getUserSession()
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const unreadCount = notifications?.filter(n => !n.read).length || 0

  const isAdmin = profile.responsibilities.includes('Administrator')

  async function handleUpdateProfile(formData) {
    'use server'
    const name = formData.get('name')
    const phone = formData.get('phone_number')
    const sb = await createClient()
    await sb.from('profiles').update({ name, phone_number: phone }).eq('id', user.id)
    revalidatePath('/staff/dashboard')
  }

  async function handleUpdatePassword(formData) {
    'use server'
    const password = formData.get('password')
    const sb = await createClient()
    await sb.auth.updateUser({ password })
  }

  async function handleMarkRead(formData) {
    'use server'
    const id = formData.get('notification_id')
    const sb = await createClient()
    await sb.from('notifications').update({ read: true }).eq('id', id)
    revalidatePath('/staff/dashboard')
  }

  async function handleReturnAdmin() {
    'use server'
    await returnAdminAccess()
  }

  async function handleUpdateOwnResponsibilities(formData) {
    'use server'
    const resp = formData.getAll('responsibilities')
    if (!resp.includes('Administrator')) resp.push('Administrator') // safety
    await updateOwnResponsibilities(resp)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Welcome, {profile.name}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Your Profile</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Responsibilities:</strong> {profile.responsibilities.join(' • ')}</p>
            
            <form action={handleUpdateProfile} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem' }}>Name</label>
                <input name="name" defaultValue={profile.name} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem' }}>Phone Number</label>
                <input name="phone_number" defaultValue={profile.phone_number || ''} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Profile</button>
            </form>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Change Password</h2>
            <form action={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem' }}>New Password</label>
                <input name="password" type="password" required minLength={6} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Update Password</button>
            </form>
          </section>

          {isAdmin && (
            <section style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Administrator Options</h2>
              
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                <p style={{ marginBottom: '0.5rem', color: '#991b1b' }}>Return Administrative Access if you no longer need it.</p>
                <form action={handleReturnAdmin}>
                  <button type="submit" className="btn" style={{ background: '#dc2626', color: 'white' }}>Return Administrative Access</button>
                </form>
              </div>

              <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Self-Responsibility Management</h3>
                <form action={handleUpdateOwnResponsibilities} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label><input type="checkbox" name="responsibilities" value="Volunteer" defaultChecked={profile.responsibilities.includes('Volunteer')} /> Volunteer</label>
                  <label><input type="checkbox" name="responsibilities" value="Teacher" defaultChecked={profile.responsibilities.includes('Teacher')} /> Teacher</label>
                  <button type="submit" className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>Update My Responsibilities</button>
                </form>
              </div>
            </section>
          )}
        </div>

        <div>
          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Notifications ({unreadCount})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notifications?.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No notifications.</p>
              ) : (
                notifications?.map(n => (
                  <div key={n.id} style={{ padding: '0.75rem', background: n.read ? '#f9fafb' : '#eff6ff', border: '1px solid', borderColor: n.read ? '#e5e7eb' : '#bfdbfe', borderRadius: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{n.message}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleDateString()}</span>
                      {!n.read && (
                        <form action={handleMarkRead}>
                          <input type="hidden" name="notification_id" value={n.id} />
                          <button type="submit" style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>Mark Read</button>
                        </form>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
