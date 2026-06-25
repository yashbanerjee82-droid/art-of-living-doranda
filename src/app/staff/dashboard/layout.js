import { getUserSession, logout } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({ children }) {
  const session = await getUserSession()
  
  if (!session?.user) {
    redirect('/staff')
  }

  const { profile } = session
  const r = profile.responsibilities || []
  const isAdmin = r.includes('Administrator')
  const isTeacher = r.includes('Teacher')
  const isVolunteer = r.includes('Volunteer')

  const navItems = [
    { label: 'Profile & Overview', href: '/staff/dashboard' },
    isAdmin && { label: 'User Management', href: '/staff/dashboard/users' },
    (isAdmin || isTeacher) && { label: 'Courses', href: '/staff/dashboard/courses' },
    { label: 'Events', href: '/staff/dashboard/events' },
    { label: 'Gallery', href: '/staff/dashboard/gallery' },
    isAdmin && { label: 'Announcements & Wisdom', href: '/staff/dashboard/announcements' },
    { label: 'Archive Vault', href: '/staff/dashboard/archive' }
  ].filter(Boolean)

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 100px)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Menu</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map(item => (
            <Link 
              key={item.href} 
              href={item.href}
              style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: '#4b5563', background: '#f3f4f6' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <form action={logout}>
            <button type="submit" className="btn btn-outline" style={{ width: '100%' }}>Logout</button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
