import { createClient } from "@/lib/supabase/server";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: galleryItems } = await supabase
    .from('gallery_items')
    .select('*')
    .is('archived_at', null)
    .order('created_at', { ascending: false });

  // Distribute into 3 columns for simple masonry
  const columns = [[], [], []];
  if (galleryItems) {
    galleryItems.forEach((item, i) => {
      columns[i % 3].push(item);
    });
  }

  return (
    <div style={{ paddingTop: "6rem", paddingBottom: "4rem", minHeight: "100vh", background: "var(--color-background)" }}>
      <div className="container">
        <h1 className="section-title">Photo Gallery</h1>
        <p style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 3rem", fontSize: "1.125rem", opacity: 0.8, lineHeight: 1.6 }}>
          Glimpses of courses, events, and beautiful moments at the Art of Living Centre, Doranda.
        </p>

        <div style={{ display: "flex", gap: "1.5rem" }}>
          {columns.map((col, colIndex) => (
            <div key={colIndex} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {col.map((item) => (
                <div key={item.id} className="glass-card" style={{ borderRadius: "1rem", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image_url} 
                    alt="Gallery image" 
                    style={{ width: "100%", display: "block", transition: "transform 0.3s" }} 
                    className="gallery-hover-scale"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        {(!galleryItems || galleryItems.length === 0) && (
          <p style={{ textAlign: 'center', opacity: 0.7 }}>No gallery images available yet.</p>
        )}
      </div>

    </div>
  );
}
