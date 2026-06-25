"use client";
import Link from "next/link";
import { Calendar, MapPin, Clock, User } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useState, useEffect } from "react";

export default function CourseCard({ course }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const safeDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    // Replace space with T to ensure Safari parses it correctly if Supabase drops the T
    const safeStr = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
    const d = new Date(safeStr);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  const now = new Date();
  
  // Logic for NEW badge
  const createdDate = safeDate(course.created_at);
  const isNew = mounted ? differenceInDays(now, createdDate) <= 7 : false;

  // Logic for OPEN/CLOSED badge
  const closeDate = safeDate(course.registration_close_date);
  const isOpen = mounted ? now <= closeDate : true;

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden", height: "100%" }}>
      {/* Image Container */}
      <div style={{ position: "relative", height: "200px", width: "100%", overflow: "hidden" }}>
        <img 
          src={course.image_url} 
          alt={course.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
          className="card-img"
        />
        <div style={{ position: "absolute", top: "1rem", left: "1rem", display: "flex", gap: "0.5rem" }}>
          <span className={`badge ${isOpen ? "badge-open" : "badge-closed"}`}>
            {isOpen ? "Registration Open" : "Registration Closed"}
          </span>
          {isNew && <span className="badge badge-new">NEW</span>}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1, gap: "1rem" }}>
        <h3 style={{ fontSize: "1.25rem", color: "var(--color-sunrise-orange)" }}>{course.title}</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", opacity: 0.8, fontSize: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User size={16} style={{ color: "var(--color-soft-gold)" }} />
            <span>{course.teacher_name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Calendar size={16} style={{ color: "var(--color-soft-gold)" }} />
            <span suppressHydrationWarning>{format(safeDate(course.start_date), "MMM d, yyyy")} - {format(safeDate(course.end_date), "MMM d, yyyy")}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={16} style={{ color: "var(--color-soft-gold)" }} />
            <span>{course.timings}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={16} style={{ color: "var(--color-soft-gold)" }} />
            <span>{course.venue}</span>
          </div>
        </div>

        <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
          <Link href={`/courses/${course.slug}`} className="btn btn-outline" style={{ width: "100%" }}>
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
