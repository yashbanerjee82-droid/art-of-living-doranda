import { getUserSession } from '@/app/actions/auth'
import { createGalleryItem } from '@/app/actions/content'
import { moveToArchive } from '@/app/actions/archive'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GalleryPage() {
  const { user } = await getUserSession()
  if (!user) redirect('/staff')

  // All staff (Admins, Teachers, Volunteers) can manage gallery according to requirements.
  const supabase = await createClient()
  const { data: galleryItems } = await supabase.from('gallery_items').select('*').is('archived_at', null).order('created_at', { ascending: false })

  async function handleCreate(formData) {
    'use server'
    await createGalleryItem(formData)
  }

  async function handleArchive(formData) {
    'use server'
    await moveToArchive('gallery_items', formData.get('id'))
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Gallery Management</h1>

      <section style={{ marginBottom: '3rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add Gallery Image</h2>
        <form action={handleCreate} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Image URL</label>
            <input name="image_url" required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
          </div>
          <button type="submit" className="btn btn-primary">Add Image</button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Gallery Images</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {galleryItems?.map(item => (
            <div key={item.id} style={{ position: 'relative', border: '1px solid #e5e7eb', borderRadius: '0.5rem', overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt="Gallery item" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <div style={{ padding: '0.5rem', background: 'white', display: 'flex', justifyContent: 'flex-end' }}>
                <form action={handleArchive}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>Archive</button>
                </form>
              </div>
            </div>
          ))}
          {galleryItems?.length === 0 && <p>No gallery images found.</p>}
        </div>
      </section>
    </div>
  )
}
