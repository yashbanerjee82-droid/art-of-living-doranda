import { getUserSession } from '@/app/actions/auth'
import { createCourse, updateCourse } from '@/app/actions/content'
import { moveToArchive } from '@/app/actions/archive'
import { removeCourseManager } from '@/app/actions/managers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ManagerSelector from '../ManagerSelector'
import UserSelector from '../UserSelector'

export default async function CoursesPage() {
  const { user, profile } = await getUserSession()
  if (!user) redirect('/staff')

  const isAdmin = profile.responsibilities.includes('Administrator')
  const isTeacher = profile.responsibilities.includes('Teacher')

  if (!isAdmin && !isTeacher) redirect('/staff/dashboard')

  const supabase = await createClient()
  
  // RLS handles the filtering automatically now based on course_managers
  let query = supabase
    .from('courses')
    .select('*, course_managers(user_id, profiles(name, email, responsibilities))')
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  const { data: courses } = await query

  async function handleCreate(formData) {
    'use server'
    await createCourse(formData)
  }

  async function handleArchive(formData) {
    'use server'
    await moveToArchive('courses', formData.get('id'))
  }

  async function handleRemoveManager(formData) {
    'use server'
    await removeCourseManager(formData.get('courseId'), formData.get('userId'))
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Courses Management</h1>

      <section style={{ marginBottom: '3rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Create New Course</h2>
        <form action={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><label>Title</label><input name="title" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Slug</label><input name="slug" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Teacher Name</label><input name="teacher_name" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Image URL</label><input name="image_url" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Start Date</label><input type="datetime-local" name="start_date" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>End Date</label><input type="datetime-local" name="end_date" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Registration Close Date</label><input type="datetime-local" name="registration_close_date" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Venue</label><input name="venue" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Timings</label><input name="timings" required style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div><label>Registration Link</label><input name="registration_link" style={{ width: '100%', padding: '0.5rem' }} /></div>
          <div style={{ gridColumn: '1 / -1' }}><label>Description</label><textarea name="description" rows="3" required style={{ width: '100%', padding: '0.5rem' }}></textarea></div>
          <div style={{ gridColumn: '1 / -1' }}><UserSelector roles={['Teacher']} /></div>
          <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Create Course</button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Courses</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {courses?.map(course => (
            <div key={course.id} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{course.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Starts: {new Date(course.start_date).toLocaleDateString()}</p>
                </div>
                <form action={handleArchive}>
                  <input type="hidden" name="id" value={course.id} />
                  <button type="submit" style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Archive</button>
                </form>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Course Managers</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {course.course_managers?.map(cm => (
                    <li key={cm.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem' }}>
                      <span>{cm.profiles?.name} ({cm.profiles?.email})</span>
                      <form action={handleRemoveManager}>
                        <input type="hidden" name="courseId" value={course.id} />
                        <input type="hidden" name="userId" value={cm.user_id} />
                        <button type="submit" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem' }}>Remove</button>
                      </form>
                    </li>
                  ))}
                </ul>
                <ManagerSelector 
                  roles={['Teacher']} 
                  onAddManager={async (userId) => {
                    'use server'
                    const { addCourseManager } = await import('@/app/actions/managers')
                    return await addCourseManager(course.id, userId)
                  }} 
                />
              </div>
            </div>
          ))}
          {courses?.length === 0 && <p>No active courses found.</p>}
        </div>
      </section>
    </div>
  )
}
