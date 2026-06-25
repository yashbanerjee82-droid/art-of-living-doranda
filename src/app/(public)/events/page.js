import EventCard from "@/components/EventCard";
import { createClient } from "@/lib/supabase/server";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .is('archived_at', null)
    .order('date');

  return (
    <div style={{ paddingTop: "6rem", paddingBottom: "4rem", minHeight: "100vh", background: "var(--color-background)" }}>
      <div className="container">
        <h1 className="section-title">All Events</h1>
        <p style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 3rem", fontSize: "1.125rem", opacity: 0.8, lineHeight: 1.6 }}>
          Join us for special events, satsangs, and community gatherings at the centre.
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
          {events?.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
          {(!events || events.length === 0) && (
            <p style={{ textAlign: 'center', gridColumn: '1 / -1', opacity: 0.7 }}>No upcoming events currently scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
