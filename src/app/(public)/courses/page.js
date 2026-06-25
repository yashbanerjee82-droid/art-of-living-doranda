import CourseCard from "@/components/CourseCard";
import { createClient } from "@/lib/supabase/server";

// This is now a Server Component
export default async function CoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .is('archived_at', null)
    .order('start_date');

  return (
    <div style={{ paddingTop: "6rem", paddingBottom: "4rem", minHeight: "100vh", background: "var(--color-background)" }}>
      <div className="container">
        <h1 className="section-title">All Courses</h1>
        <p style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 3rem", fontSize: "1.125rem", opacity: 0.8, lineHeight: 1.6 }}>
          Discover our range of courses designed to bring peace, joy, and profound wisdom into your life. Filter through our offerings and register for the ones that resonate with you.
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
          {courses?.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
          {(!courses || courses.length === 0) && (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', opacity: 0.7 }}>No courses currently scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
