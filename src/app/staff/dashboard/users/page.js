import { getUserSession } from '@/app/actions/auth'
import { createAccount, grantAdmin, revokeAdmin, levelUp, adminResetUserPassword } from '@/app/actions/admin'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function UsersPage() {
  const { user, profile } = await getUserSession()
  if (!user) redirect('/staff')

  const r = profile.responsibilities || []
  const isAdmin = r.includes('Administrator')

  if (!isAdmin) {
    redirect('/staff/dashboard')
  }

  let adminClient;
  let profiles = [];
  let adminClientError = null;
  try {
    adminClient = await createAdminClient();
    const { data } = await adminClient.from('profiles').select('*').order('created_at', { ascending: false });
    profiles = data || [];
  } catch (err) {
    adminClientError = err.message;
  }

  async function handleCreateAccount(formData) {
    'use server'
    await createAccount(formData)
  }

  async function handleGrantAdmin(formData) {
    'use server'
    await grantAdmin(formData.get('user_id'))
  }

  async function handleRevokeAdmin(formData) {
    'use server'
    await revokeAdmin(formData.get('user_id'))
  }

  async function handleLevelUp(formData) {
    'use server'
    await levelUp(formData.get('user_id'))
  }

  async function handleResetPassword(formData) {
    'use server'
    await adminResetUserPassword(formData.get('user_id'), formData.get('password'))
    revalidatePath('/staff/dashboard/users')
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>User Management</h1>
      {adminClientError && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <strong>Error:</strong> {adminClientError}
        </div>
      )}

      <section style={{ marginBottom: '3rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create Account</h2>
        <form action={handleCreateAccount} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '600px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem' }}>Name</label>
            <input name="name" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem' }}>Email</label>
            <input name="email" type="email" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem' }}>Initial Password</label>
            <input name="password" required minLength={6} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem' }}>Phone Number</label>
            <input name="phoneNumber" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Responsibilities</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label><input type="checkbox" name="responsibilities" value="Volunteer" defaultChecked /> Volunteer</label>
              <label><input type="checkbox" name="responsibilities" value="Teacher" /> Teacher</label>
              <label><input type="checkbox" name="responsibilities" value="Administrator" /> Administrator</label>
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn-primary">Create Account</button>
          </div>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>All Users</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Email</th>
                <th style={{ padding: '0.75rem' }}>Responsibilities</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles?.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem' }}>{p.name} {p.id === user.id ? '(You)' : ''}</td>
                  <td style={{ padding: '0.75rem' }}>{p.email}</td>
                  <td style={{ padding: '0.75rem' }}>{p.responsibilities?.join(' • ')}</td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {isAdmin && p.id !== user.id && (
                      <>
                        {p.responsibilities?.includes('Volunteer') && !p.responsibilities?.includes('Teacher') && (
                          <form action={handleLevelUp}>
                            <input type="hidden" name="user_id" value={p.id} />
                            <button type="submit" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Level Up</button>
                          </form>
                        )}
                        {!p.responsibilities?.includes('Administrator') ? (
                          <form action={handleGrantAdmin}>
                            <input type="hidden" name="user_id" value={p.id} />
                            <button type="submit" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Grant Admin</button>
                          </form>
                        ) : (
                          <form action={handleRevokeAdmin}>
                            <input type="hidden" name="user_id" value={p.id} />
                            <button type="submit" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Return Administrative Access</button>
                          </form>
                        )}
                        <form action={handleResetPassword} style={{ display: 'flex', gap: '0.25rem' }}>
                          <input type="hidden" name="user_id" value={p.id} />
                          <input type="password" name="password" placeholder="New pass" required minLength={6} style={{ fontSize: '0.75rem', padding: '0.25rem', width: '80px', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
                          <button type="submit" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#6b7280', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Reset</button>
                        </form>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
