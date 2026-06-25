"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import { mockEvents } from "@/lib/mockData";

export default function EventDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { slug } = unwrappedParams;
  
  const event = mockEvents.find(e => e.slug === slug);

  if (!event) {
    return (
      <div style={{ paddingTop: "8rem", textAlign: "center", minHeight: "60vh" }}>
        <h2>Event not found</h2>
        <Link href="/events" className="btn btn-outline" style={{ marginTop: "1rem" }}>Back to Events</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", paddingBottom: "4rem" }}>
      {/* Event Hero */}
      <div style={{ 
        position: "relative", 
        height: "50vh", 
        minHeight: "400px",
        backgroundImage: `url(${event.image_url})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--color-background), rgba(0,0,0,0.3))" }}></div>
        <div className="container" style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: "3rem" }}>
          <Link href="/events" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-foreground)", marginBottom: "1rem", fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Events
          </Link>
          <h1 style={{ fontSize: "3.5rem", color: "var(--color-foreground)", textShadow: "0 2px 10px rgba(255,255,255,0.5)" }}>{event.title}</h1>
        </div>
      </div>

      <div className="container" style={{ marginTop: "3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3rem" }}>
          <div style={{ display: "grid", gap: "3rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {/* Main Content */}
            <div className="glass-card" style={{ padding: "2.5rem" }}>
              <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem", color: "var(--color-sunrise-orange)" }}>About the Event</h2>
              <p style={{ fontSize: "1.125rem", lineHeight: 1.8, opacity: 0.9, whiteSpace: "pre-line" }}>
                {event.description}
              </p>
            </div>

            {/* Details Sidebar */}
            <div className="glass-card" style={{ padding: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", color: "var(--color-sunrise-orange)" }}>Event Details</h2>
              
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.25rem", opacity: 0.9 }}>
                <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <Calendar style={{ color: "var(--color-soft-gold)", flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem" }}>Date & Time</strong>
                    <span suppressHydrationWarning>{format(new Date(event.date), "MMMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
