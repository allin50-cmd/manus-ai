import React, { useState } from 'react';
import { MarketingBreadcrumb } from "@/components/MarketingBreadcrumb";
import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  border: "#1e2d45",
  accent: "#3b82f6",
  accentLight: "#60a5fa",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
  error: "#ef4444",
  success: "#22c55e",
};

const CONTACT_METHODS = [
  {
    icon: "\u2709\uFE0F",
    label: "General Enquiries",
    value: "hello@fineguardpro.com",
    href: "mailto:hello@fineguardpro.com",
  },
  {
    icon: "\u2696\uFE0F",
    label: "Legal & Compliance",
    value: "legal@fineguardpro.com",
    href: "mailto:legal@fineguardpro.com",
  },
  {
    icon: "\uD83D\uDD12",
    label: "Privacy & Data",
    value: "privacy@fineguardpro.com",
    href: "mailto:privacy@fineguardpro.com",
  },
  {
    icon: "\uD83D\uDEDF",
    label: "Technical Support",
    value: "support@fineguardpro.com",
    href: "mailto:support@fineguardpro.com",
  },
];

export default function Contact() {
  usePageMeta({
    title: "Contact FineGuard | Get in Touch with FINE GUARD LTD",
    description:
      "Contact FINE GUARD LTD — the team behind FineGuard Pro. Reach us for general enquiries, technical support, legal matters, or privacy requests.",
    url: "https://fineguardpro.com/contact",
  });

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    else if (form.message.trim().length < 20) e.message = "Message must be at least 20 characters";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");
    // Simulate submission — in production wire to a tRPC procedure or email service
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("sent");
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${errors[field] ? C.error : C.border}`,
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 15,
    color: C.text,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  });

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(10,15,30,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "0 24px",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        role="navigation"
        aria-label="Site navigation"
      >
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>
            Fine<span style={{ color: C.accent }}>Guard</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/about" style={{ color: C.textDim, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            About
          </Link>
          <Link href="/check" style={{ color: C.textDim, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            Check Deadlines
          </Link>
          <Link
            href="/check"
            style={{
              background: C.accent,
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      <MarketingBreadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]} />

      {/* Hero */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 40px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 12,
            color: C.accentLight,
            fontWeight: 600,
            letterSpacing: "0.04em",
            marginBottom: 20,
          }}
        >
          GET IN TOUCH
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 900,
            lineHeight: 1.15,
            margin: "0 0 16px",
            letterSpacing: "-0.03em",
          }}
        >
          We're here to help
        </h1>
        <p style={{ fontSize: 17, color: C.textDim, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          Whether you have a question about our service, need technical support, or want to discuss a
          partnership, our team will respond within one business day.
        </p>
      </section>

      {/* Contact methods */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {CONTACT_METHODS.map((m) => (
            <a
              key={m.label}
              href={m.href}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "20px 18px",
                textDecoration: "none",
                display: "block",
                transition: "border-color 0.15s",
              }}
              aria-label={`${m.label}: ${m.value}`}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }} role="img" aria-hidden="true">{m.icon}</div>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 13, color: C.accentLight, fontWeight: 500 }}>{m.value}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Form + Address */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Contact form */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px" }}>Send us a message</h2>
            {status === "sent" ? (
              <div
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: 12,
                  padding: "32px 24px",
                  textAlign: "center",
                }}
                role="alert"
                aria-live="polite"
              >
                <div style={{ fontSize: 32, marginBottom: 12 }}>&#x2705;</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px", color: C.success }}>
                  Message received
                </h3>
                <p style={{ fontSize: 14, color: C.textDim, margin: 0 }}>
                  We'll respond to <strong style={{ color: C.text }}>{form.email}</strong> within one business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="contact-name" style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textDim, marginBottom: 6 }}>
                    Full name <span aria-hidden="true" style={{ color: C.error }}>*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    autoComplete="name"
                    required
                    aria-required="true"
                    aria-describedby={errors.name ? "name-error" : undefined}
                    aria-invalid={!!errors.name}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    style={inputStyle("name")}
                    placeholder="Jane Smith"
                  />
                  {errors.name && (
                    <p id="name-error" role="alert" style={{ fontSize: 12, color: C.error, margin: "4px 0 0" }}>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="contact-email" style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textDim, marginBottom: 6 }}>
                    Email address <span aria-hidden="true" style={{ color: C.error }}>*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    style={inputStyle("email")}
                    placeholder="jane@example.com"
                  />
                  {errors.email && (
                    <p id="email-error" role="alert" style={{ fontSize: 12, color: C.error, margin: "4px 0 0" }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="contact-subject" style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textDim, marginBottom: 6 }}>
                    Subject <span aria-hidden="true" style={{ color: C.error }}>*</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    aria-required="true"
                    aria-describedby={errors.subject ? "subject-error" : undefined}
                    aria-invalid={!!errors.subject}
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    style={inputStyle("subject")}
                    placeholder="How can we help?"
                  />
                  {errors.subject && (
                    <p id="subject-error" role="alert" style={{ fontSize: 12, color: C.error, margin: "4px 0 0" }}>
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label htmlFor="contact-message" style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.textDim, marginBottom: 6 }}>
                    Message <span aria-hidden="true" style={{ color: C.error }}>*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    aria-required="true"
                    aria-describedby={errors.message ? "message-error" : undefined}
                    aria-invalid={!!errors.message}
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    style={{ ...inputStyle("message"), resize: "vertical", minHeight: 120 }}
                    placeholder="Tell us what you need..."
                  />
                  {errors.message && (
                    <p id="message-error" role="alert" style={{ fontSize: 12, color: C.error, margin: "4px 0 0" }}>
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  style={{
                    width: "100%",
                    background: status === "sending" ? "#1d4ed8" : C.accent,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "13px 24px",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: status === "sending" ? "not-allowed" : "pointer",
                    opacity: status === "sending" ? 0.8 : 1,
                    fontFamily: "inherit",
                  }}
                  aria-busy={status === "sending"}
                >
                  {status === "sending" ? "Sending\u2026" : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Address + info */}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 24px" }}>Our details</h2>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "28px 24px",
                marginBottom: 20,
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>
                Registered Office
              </h3>
              <address style={{ fontStyle: "normal", fontSize: 15, color: C.text, lineHeight: 1.8 }}>
                FINE GUARD LTD<br />
                Lodges Wood Oast<br />
                Goodley Stock Road<br />
                Westerham<br />
                TN16 1TW<br />
                England
              </address>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Company No.</div>
                <a
                  href="https://find-and-update.company-information.service.gov.uk/company/16895564"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 14, color: C.accentLight, textDecoration: "none", fontWeight: 600 }}
                >
                  16895564 &#x2197;
                </a>
              </div>
            </div>

            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "28px 24px",
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 16px" }}>
                Response Times
              </h3>
              {[
                { type: "General enquiries", time: "Within 1 business day" },
                { type: "Technical support", time: "Within 4 hours (Mon\u2013Fri)" },
                { type: "Legal / GDPR requests", time: "Within 30 days (statutory)" },
                { type: "Data breach reports", time: "Within 72 hours (ICO obligation)" },
              ].map((r) => (
                <div key={r.type} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, color: C.textDim, marginBottom: 2 }}>{r.type}</div>
                  <div style={{ fontSize: 14, color: C.text, fontWeight: 600 }}>{r.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{ borderTop: `1px solid ${C.border}`, padding: "32px 24px", textAlign: "center" }}
        role="contentinfo"
      >
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 8px" }}>
          &copy; {new Date().getFullYear()} FINE GUARD LTD &middot; Company No. 16895564 &middot; Registered in England and Wales
        </p>
        <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 12px" }}>
          Lodges Wood Oast, Goodley Stock Road, Westerham, TN16 1TW, England
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Terms", href: "/terms" },
            { label: "Privacy", href: "/privacy" },
            { label: "Cookies", href: "/cookies" },
            { label: "Modern Slavery", href: "/modern-slavery" },
            { label: "Regulatory", href: "/regulatory" },
            { label: "Sitemap", href: "/sitemap" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ fontSize: 12, color: C.textMuted, textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
