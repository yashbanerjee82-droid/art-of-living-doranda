"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { CONTACT_DETAILS } from "@/config/contact";

export default function Footer() {
  return (
    <footer style={{ background: "var(--color-foreground)", color: "var(--color-white)", paddingTop: "4rem", paddingBottom: "2rem", marginTop: "auto" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "3rem", marginBottom: "3rem" }}>
        
        {/* Quick Links */}
        <div>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", color: "var(--color-sunrise-yellow)" }}>Quick Links</h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <li><Link href="/" style={{ opacity: 0.8, transition: "opacity 0.2s" }} className="hover-op">Home</Link></li>
            <li><Link href="/courses" style={{ opacity: 0.8, transition: "opacity 0.2s" }} className="hover-op">Courses</Link></li>
            <li><Link href="/events" style={{ opacity: 0.8, transition: "opacity 0.2s" }} className="hover-op">Events</Link></li>
            <li><Link href="/gallery" style={{ opacity: 0.8, transition: "opacity 0.2s" }} className="hover-op">Gallery</Link></li>
            <li><Link href="/contact" style={{ opacity: 0.8, transition: "opacity 0.2s" }} className="hover-op">Contact</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", color: "var(--color-sunrise-yellow)" }}>Contact Us</h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <li style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", opacity: 0.8 }}>
              <MapPin size={20} style={{ flexShrink: 0, marginTop: "0.25rem", color: "var(--color-soft-gold)" }} />
              <span>{CONTACT_DETAILS.name}<br/>{CONTACT_DETAILS.address.city}, {CONTACT_DETAILS.address.region}</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", opacity: 0.8 }}>
              <Phone size={20} style={{ color: "var(--color-soft-gold)" }} />
              <span>{CONTACT_DETAILS.phones[0]}</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "0.75rem", opacity: 0.8 }}>
              <Mail size={20} style={{ color: "var(--color-soft-gold)" }} />
              <span>{CONTACT_DETAILS.email}</span>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", color: "var(--color-sunrise-yellow)" }}>Connect With Us</h3>
          <p style={{ opacity: 0.8, marginBottom: "1.5rem", lineHeight: 1.6 }}>Follow us on social media to stay updated on our latest courses and events.</p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href={CONTACT_DETAILS.socials.facebook} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", transition: "all 0.2s" }} className="social-icon">
              <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>f</span>
            </a>
            <a href={CONTACT_DETAILS.socials.instagram} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", transition: "all 0.2s" }} className="social-icon">
              <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>ig</span>
            </a>
            <a href={CONTACT_DETAILS.socials.twitter} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", transition: "all 0.2s" }} className="social-icon">
              <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>x</span>
            </a>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem", textAlign: "center", opacity: 0.6, fontSize: "0.875rem" }}>
        <p>&copy; {new Date().getFullYear()} {CONTACT_DETAILS.name}. All rights reserved.</p>
      </div>

      <style jsx>{`
        .hover-op:hover { opacity: 1 !important; color: var(--color-sunrise-yellow); }
        .social-icon:hover { background: var(--color-sunrise-orange) !important; transform: translateY(-2px); }
      `}</style>
    </footer>
  );
}
