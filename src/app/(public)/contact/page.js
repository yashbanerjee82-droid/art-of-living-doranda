import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { CONTACT_DETAILS } from "@/config/contact";

export default function ContactPage() {
  return (
    <div style={{ paddingTop: "6rem", paddingBottom: "4rem", minHeight: "100vh", background: "var(--color-background)" }}>
      <div className="container">
        <h1 className="section-title">Contact Us</h1>
        <p style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto 3rem", fontSize: "1.125rem", opacity: 0.8, lineHeight: 1.6 }}>
          We would love to hear from you. Whether you have questions about our courses, want to volunteer, or just want to say hello, feel free to reach out.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "3rem" }}>
          
          {/* Contact Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="glass-card" style={{ padding: "2rem", display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(255,177,66,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin size={24} style={{ color: "var(--color-sunrise-orange)" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Our Location</h3>
                <p style={{ opacity: 0.8, lineHeight: 1.6 }}>{CONTACT_DETAILS.address.line1}<br/>{CONTACT_DETAILS.address.line2}<br/>{CONTACT_DETAILS.address.state}</p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: "2rem", display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(255,177,66,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Phone size={24} style={{ color: "var(--color-sunrise-orange)" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Phone Number</h3>
                <p style={{ opacity: 0.8 }}>{CONTACT_DETAILS.phones[0]}</p>
                {CONTACT_DETAILS.phones[1] && <p style={{ opacity: 0.8 }}>{CONTACT_DETAILS.phones[1]}</p>}
              </div>
            </div>

            <div className="glass-card" style={{ padding: "2rem", display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(255,177,66,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Mail size={24} style={{ color: "var(--color-sunrise-orange)" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Email Address</h3>
                <p style={{ opacity: 0.8 }}>{CONTACT_DETAILS.email}</p>
              </div>
            </div>
          </div>

          {/* Contact Form / Map */}
          <div className="glass-card" style={{ padding: "2.5rem", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "1.5rem", color: "var(--color-sunrise-orange)" }}>Send us a message</h2>
            <form style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flexGrow: 1 }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, opacity: 0.9 }}>Your Name</label>
                <input type="text" placeholder="John Doe" style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-glass-border)", background: "rgba(255,255,255,0.5)", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, opacity: 0.9 }}>Email Address</label>
                <input type="email" placeholder="john@example.com" style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-glass-border)", background: "rgba(255,255,255,0.5)", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, opacity: 0.9 }}>Message</label>
                <textarea placeholder="How can we help you?" rows="5" style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--color-glass-border)", background: "rgba(255,255,255,0.5)", fontFamily: "inherit", resize: "vertical" }}></textarea>
              </div>
              <button type="button" className="btn btn-primary" style={{ marginTop: "auto" }}>Send Message</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
