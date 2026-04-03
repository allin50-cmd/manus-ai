import React, { useState } from "react";
import { Link } from "wouter";

const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

function NavBar() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(10,15,30,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
      }}
    >
      <span style={{ color: C.text, fontWeight: 700, fontSize: "18px", letterSpacing: "-0.3px" }}>
        Fine<span style={{ color: C.accent }}>Guard</span> Pro
      </span>
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <Link href="/check" style={{ color: C.textDim, textDecoration: "none", fontSize: "14px" }}>Check Company</Link>
        <Link href="/pricing-services" style={{ color: C.textDim, textDecoration: "none", fontSize: "14px" }}>Pricing</Link>
        <Link href="/about" style={{ color: C.textDim, textDecoration: "none", fontSize: "14px" }}>About</Link>
        <Link
          href="/check"
          style={{
            backgroundColor: C.accent,
            color: "#fff",
            padding: "8px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "96px 24px 80px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "inline-block",
          backgroundColor: C.accentGlow,
          border: `1px solid rgba(59,130,246,0.3)`,
          color: C.accent,
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "6px 16px",
          borderRadius: "999px",
          marginBottom: "32px",
        }}
      >
        Companies House Compliance Monitoring
      </div>
      <h1
        style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: "24px",
          letterSpacing: "-1px",
        }}
      >
        <span
          style={{
            background: "linear-gradient(135deg, #f1f5f9 30%, #3b82f6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Never Miss a Companies House
        </span>
        <br />
        <span
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #22c55e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Deadline Again
        </span>
      </h1>
      <p
        style={{
          color: C.textDim,
          fontSize: "18px",
          lineHeight: 1.7,
          marginBottom: "40px",
          maxWidth: "600px",
          margin: "0 auto 40px",
        }}
      >
        Automated compliance monitoring for UK businesses and accountancy firms.
        Get real-time alerts before deadlines, prevent costly penalties, and
        keep every client company compliant — effortlessly.
      </p>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/check"
          style={{
            backgroundColor: C.accent,
            color: "#fff",
            padding: "14px 32px",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: 700,
            boxShadow: `0 0 32px ${C.accentGlow}`,
            display: "inline-block",
          }}
        >
          Start Free Trial
        </Link>
        <Link
          href="/pricing-services"
          style={{
            backgroundColor: "transparent",
            color: C.text,
            padding: "14px 32px",
            borderRadius: "10px",
            textDecoration: "none",
            fontSize: "16px",
            fontWeight: 600,
            border: `1px solid ${C.border}`,
            display: "inline-block",
          }}
        >
          View Pricing
        </Link>
      </div>
    </section>
  );
}

function StatsRow() {
  const stats = [
    { value: "10,000+", label: "companies monitored" },
    { value: "£2.3M", label: "penalties prevented" },
    { value: "99.9%", label: "uptime" },
  ];
  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "0",
        flexWrap: "wrap",
        padding: "0 24px 80px",
      }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            textAlign: "center",
            padding: "32px 48px",
            borderRight: i < stats.length - 1 ? `1px solid ${C.border}` : "none",
            flex: "1 1 200px",
            maxWidth: "280px",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: C.accent,
              letterSpacing: "-1px",
              marginBottom: "8px",
            }}
          >
            {s.value}
          </div>
          <div style={{ color: C.textDim, fontSize: "14px" }}>{s.label}</div>
        </div>
      ))}
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "🔍",
      title: "Real-time Monitoring",
      description:
        "Continuously checks Companies House for changes to filing deadlines, confirmation statements, and officer appointments across your entire portfolio.",
    },
    {
      icon: "🔔",
      title: "Smart Alerts",
      description:
        "Intelligent notifications sent 90, 30, and 7 days before deadlines. Customise alert thresholds and delivery channels — email, SMS, or in-app.",
    },
    {
      icon: "📊",
      title: "Compliance Reports",
      description:
        "Generate detailed compliance reports for clients and internal audits. Export to PDF or share via secure link with a single click.",
    },
  ];
  return (
    <section style={{ padding: "0 24px 96px", maxWidth: "1100px", margin: "0 auto" }}>
      <h2
        style={{
          textAlign: "center",
          fontSize: "32px",
          fontWeight: 700,
          color: C.text,
          marginBottom: "48px",
          letterSpacing: "-0.5px",
        }}
      >
        Everything you need for compliance
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "16px",
              padding: "32px",
              transition: "border-color 0.2s, background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = C.surfaceHover;
              (e.currentTarget as HTMLDivElement).style.borderColor = C.accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.backgroundColor = C.surface;
              (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>{f.icon}</div>
            <h3 style={{ color: C.text, fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
              {f.title}
            </h3>
            <p style={{ color: C.textDim, fontSize: "15px", lineHeight: 1.65 }}>{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "64px 24px",
        backgroundColor: C.surface,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <p style={{ color: C.textMuted, fontSize: "13px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
        Trusted by
      </p>
      <p
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: C.text,
          marginBottom: "8px",
        }}
      >
        500+ UK Accountancy Firms
      </p>
      <p style={{ color: C.textDim, fontSize: "15px" }}>
        From sole practitioners to Top 100 firms — FineGuard Pro keeps every deadline on track.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: C.surface,
        borderTop: `1px solid ${C.border}`,
        padding: "40px 32px",
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ color: C.textMuted, fontSize: "13px" }}>
        © {new Date().getFullYear()} FineGuard Pro. All rights reserved.
      </span>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {[
          { label: "Terms", href: "/terms" },
          { label: "Privacy", href: "/privacy" },
          { label: "Cookies", href: "/cookies" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{ color: C.textDim, textDecoration: "none", fontSize: "13px" }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div style={{ backgroundColor: C.bg, color: C.text, minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <NavBar />
      <HeroSection />
      <StatsRow />
      <FeaturesSection />
      <SocialProof />
      <Footer />
    </div>
  );
}
