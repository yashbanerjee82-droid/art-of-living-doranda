"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { CONTACT_DETAILS } from "@/config/contact";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Events", href: "/events" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.3s ease",
        background: isScrolled ? "var(--color-glass-bg)" : "transparent",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        borderBottom: isScrolled ? "1px solid var(--color-glass-border)" : "none",
        boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
      }}
    >
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "5rem" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontWeight: 700, fontSize: "1.25rem", color: "var(--color-sunrise-orange)" }}>
          <div style={{ width: "40px", height: "40px", background: "var(--color-sunrise-yellow)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            AOL
          </div>
          <span style={{ display: "none" }}>{CONTACT_DETAILS.name}</span>
          <span className="desktop-only" style={{ fontFamily: "var(--font-heading)" }}>{CONTACT_DETAILS.shortName}</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "none" }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} style={{ fontWeight: 500, fontSize: "1rem", padding: "0.5rem 1rem", transition: "color 0.2s" }} className="nav-link">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-foreground)" }}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div style={{ position: "absolute", top: "5rem", left: 0, right: 0, background: "var(--color-background)", borderBottom: "1px solid var(--color-glass-border)", padding: "1rem 0" }} className="glass">
          <div className="container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontWeight: 500, fontSize: "1.125rem", padding: "0.5rem 0", color: "var(--color-foreground)" }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <style jsx>{`
        @media (min-width: 768px) {
          .desktop-only { display: block !important; }
          .desktop-nav { display: flex !important; gap: 1.5rem; align-items: center; }
          .mobile-only { display: none !important; }
        }
        .desktop-only { display: none; }
        .nav-link:hover { color: var(--color-sunrise-orange) !important; }
      `}</style>
    </nav>
  );
}
