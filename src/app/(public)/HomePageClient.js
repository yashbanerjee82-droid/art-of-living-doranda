"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import EventCard from "@/components/EventCard";
import { differenceInDays } from "date-fns";
import { CONTACT_DETAILS } from "@/config/contact";

export default function HomePageClient({ courses, events, wisdom, gallery, announcements }) {
  const [showPopup, setShowPopup] = useState(false);
  const [newAnnouncements, setNewAnnouncements] = useState([]);

  useEffect(() => {
    const safeDate = (dateStr) => {
      if (!dateStr) return new Date(0);
      const safeStr = typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr;
      const d = new Date(safeStr);
      return isNaN(d.getTime()) ? new Date(0) : d;
    };

    // Determine new announcements for the popup
    const now = new Date();
    const newCourses = courses.filter(c => differenceInDays(now, safeDate(c.created_at)) <= 7);
    const newEvents = events.filter(e => differenceInDays(now, safeDate(e.created_at)) <= 7);
    
    // Also include explicitly active announcements from db
    const combinedNew = [...announcements, ...newCourses, ...newEvents];
    if (combinedNew.length > 0) {
      setNewAnnouncements(combinedNew);
      // Only show popup if it hasn't been dismissed in this session
      const hasSeenPopup = sessionStorage.getItem("hasSeenAnnouncementPopup");
      if (!hasSeenPopup) {
        setShowPopup(true);
      }
    }
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem("hasSeenAnnouncementPopup", "true");
  };

  return (
    <>
      {/* 1. Hero Section */}
      <section style={{ 
        position: "relative", 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        paddingTop: "5rem",
        backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255, 252, 247, 0.4)" }}></div>
        <div className="container" style={{ position: "relative", zIndex: 10 }}>
          <div className="glass-card" style={{ maxWidth: "600px", padding: "3rem", margin: "0 auto", textAlign: "center" }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "1rem", color: "var(--color-foreground)" }}>Find Peace Within</h1>
            <p style={{ fontSize: "1.25rem", opacity: 0.9, marginBottom: "2rem" }}>
              Welcome to the Art of Living Centre, Doranda. Join us on a journey of self-discovery, wellness, and spiritual growth.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/courses" className="btn btn-primary">
                Explore Courses <ArrowRight size={20} />
              </Link>
              <Link href="/events" className="btn btn-outline" style={{ background: "rgba(255,255,255,0.5)" }}>
                View Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Announcement Center (Permanent Section) */}
      <section className="section-padding" style={{ background: "var(--color-white)" }}>
        <div className="container">
          <h2 className="section-title">Announcement Center</h2>
          {newAnnouncements.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {newAnnouncements.map(item => (
                <div key={item.id} className="glass-card" style={{ padding: "1.5rem", borderLeft: "4px solid var(--color-sunrise-yellow)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.25rem" }}>{item.title}</h3>
                    <span className="badge badge-new">NEW</span>
                  </div>
                  <p style={{ opacity: 0.8, fontSize: "0.875rem", marginBottom: "1rem" }}>{item.description}</p>
                  <Link href={item.venue ? `/courses/${item.slug}` : `/events/${item.slug}`} style={{ color: "var(--color-sunrise-orange)", fontWeight: 500, fontSize: "0.875rem" }}>
                    Learn More &rarr;
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", opacity: 0.7 }}>No new announcements at the moment.</p>
          )}
        </div>
      </section>

      {/* 3. Upcoming Courses */}
      <section className="section-padding" style={{ background: "var(--color-background)" }}>
        <div className="container">
          <h2 className="section-title">Upcoming Courses</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/courses" className="btn btn-outline">View All Courses</Link>
          </div>
        </div>
      </section>

      {/* 4. Upcoming Events */}
      <section className="section-padding" style={{ background: "var(--color-white)" }}>
        <div className="container">
          <h2 className="section-title">Upcoming Events</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/events" className="btn btn-outline">View All Events</Link>
          </div>
        </div>
      </section>

      {/* 5. Words of Wisdom */}
      <section className="section-padding" style={{ 
        background: "linear-gradient(135deg, rgba(255, 177, 66, 0.1), rgba(242, 138, 48, 0.1))",
        textAlign: "center"
      }}>
        <div className="container">
          <div className="glass-card" style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 2rem" }}>
            <h2 style={{ fontSize: "1.5rem", color: "var(--color-sunrise-orange)", marginBottom: "2rem", fontFamily: "var(--font-heading)", letterSpacing: "2px", textTransform: "uppercase" }}>Words of Wisdom</h2>
            <blockquote style={{ fontSize: "2rem", fontStyle: "italic", marginBottom: "1.5rem", lineHeight: 1.4 }}>
              "{wisdom.quote}"
            </blockquote>
            <p style={{ fontWeight: 600, color: "var(--color-muted)", fontSize: "1.125rem" }}>— {wisdom.author}</p>
          </div>
        </div>
      </section>

      {/* 6. About Centre */}
      <section className="section-padding" style={{ background: "var(--color-background)" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: "4rem", alignItems: "center" }}>
          <div style={{ flex: "1 1 400px" }}>
            <h2 className="section-title" style={{ textAlign: "left" }}>About Our Centre</h2>
            <p style={{ fontSize: "1.125rem", lineHeight: 1.8, opacity: 0.8, marginBottom: "1.5rem" }}>
              The Art of Living Centre in Doranda is an oasis of peace amidst the bustling city of Ranchi. We offer a variety of programs designed to eliminate stress, create a sense of belonging, restore human values, and encourage people from all backgrounds to come together in celebration and service.
            </p>
            <p style={{ fontSize: "1.125rem", lineHeight: 1.8, opacity: 0.8 }}>
              Whether you are looking to learn meditation, practice yoga, or simply find a community of like-minded individuals, our centre provides a welcoming and nurturing environment for your spiritual growth.
            </p>
          </div>
          <div style={{ flex: "1 1 400px" }}>
            <img 
              src={gallery.length > 0 ? gallery[0].image_url : "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80"} 
              alt="Art of Living Centre Doranda" 
              style={{ width: "100%", borderRadius: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            />
          </div>
        </div>
      </section>

      {/* 7. Gallery Preview */}
      <section className="section-padding" style={{ background: "var(--color-white)" }}>
        <div className="container">
          <h2 className="section-title">Glimpses of Joy</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
            {gallery.slice(0, 4).map((item, i) => (
              <div key={i} style={{ borderRadius: "1rem", overflow: "hidden", height: "250px" }}>
                <img src={item.image_url} alt="Gallery item" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} className="hover-scale" />
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/gallery" className="btn btn-outline">View Full Gallery</Link>
          </div>
        </div>
      </section>

      {/* 8. Visit Us */}
      <section className="section-padding" style={{ background: "var(--color-background)" }}>
        <div className="container">
          <h2 className="section-title">Visit Us</h2>
          <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", overflow: "hidden" }}>
            <div style={{ flex: "1 1 400px", padding: "3rem" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "var(--color-sunrise-orange)" }}>{CONTACT_DETAILS.name}</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <MapPin size={24} style={{ color: "var(--color-soft-gold)", flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem" }}>Address</strong>
                    <span style={{ opacity: 0.8, lineHeight: 1.6 }}>{CONTACT_DETAILS.address.line1}<br/>{CONTACT_DETAILS.address.line2}<br/>{CONTACT_DETAILS.address.state}</span>
                  </div>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <Phone size={24} style={{ color: "var(--color-soft-gold)", flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem" }}>Phone</strong>
                    <span style={{ opacity: 0.8 }}>{CONTACT_DETAILS.phones[0]}</span>
                  </div>
                </li>
                <li style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <Mail size={24} style={{ color: "var(--color-soft-gold)", flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: "0.25rem" }}>Email</strong>
                    <span style={{ opacity: 0.8 }}>{CONTACT_DETAILS.email}</span>
                  </div>
                </li>
              </ul>
            </div>
            <div style={{ flex: "2 1 400px", minHeight: "400px" }}>
              {/* Using a placeholder iframe for Google Maps */}
              <iframe 
                src={CONTACT_DETAILS.mapUrl} 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Popup Notification */}
      {showPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.5)", zIndex: 100, 
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="glass-card" style={{ maxWidth: "500px", width: "100%", padding: "2rem", position: "relative", animation: "slideUp 0.3s ease-out" }}>
            <button 
              onClick={closePopup}
              style={{ position: "absolute", top: "1rem", right: "1rem", background: "transparent", border: "none", cursor: "pointer", fontSize: "1.5rem", color: "var(--color-muted)" }}
            >&times;</button>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--color-sunrise-orange)", textAlign: "center" }}>🌟 New Announcements!</h3>
            <p style={{ textAlign: "center", marginBottom: "1.5rem", opacity: 0.8 }}>We have newly added courses or events you might be interested in.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "300px", overflowY: "auto", paddingRight: "0.5rem" }}>
              {newAnnouncements.map(item => (
                <div key={item.id} style={{ padding: "1rem", background: "rgba(0,0,0,0.03)", borderRadius: "0.75rem" }}>
                  <h4 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{item.title}</h4>
                  <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>{item.description}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button onClick={closePopup} className="btn btn-primary" style={{ width: "100%" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .hover-scale:hover { transform: scale(1.05); }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
