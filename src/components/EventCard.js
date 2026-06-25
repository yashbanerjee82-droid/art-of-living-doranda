"use client";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useState, useEffect } from "react";

export default function EventCard({ event }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const safeDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    const safeStr = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
    const d = new Date(safeStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const now = new Date();
  
  // Logic for NEW badge
  const createdDate = safeDate(event.created_at);
  const isNew = mounted ? differenceInDays(now, createdDate) <= 7 : false;

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
      {/* Image Container */}
      <div style={{ position: "relative", height: "200px", width: "100%", overflow: "hidden" }}>
        <img 
          src={event.image_url} 
          alt={event.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
          className="card-img"
        />
        <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", gap: "0.5rem" }}>
          {isNew && <span className="badge badge-new">NEW</span>}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1, gap: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", color: "var(--color-sunrise-orange)" }}>{event.title}</h3>
        
        <p style={{ opacity: 0.8, fontSize: "0.875rem", flexGrow: 1 }}>
          {event.description}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", opacity: 0.8, fontSize: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={16} style={{ color: "var(--color-soft-gold)" }} />
            <span suppressHydrationWarning>{format(safeDate(event.date), "MMM d, yyyy h:mm a")}</span>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <Link href={`/events/${event.slug}`} className="btn btn-outline" style={{ width: "100%" }}>
            View Details
          </Link>
        </div>
      </div>
      <style jsx>{`
        .glass-card:hover .card-img { transform: scale(1.05); }
      `}</style>
    </div>
  );
}
