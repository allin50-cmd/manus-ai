import React from "react";
import { MarketingBreadcrumb } from "@/components/MarketingBreadcrumb";
import { Link } from "wouter";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  surfaceHover: "#1a2540",
  border: "#1e2d45",
  accent: "#3b82f6",
  accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

export default function About() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <MarketingBreadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About FineGuard Pro",
            description: "Learn about FINE GUARD LTD and the FineGuard Pro compliance monitoring platform for UK businesses.",
            publisher: {
              "@type": "Organization",
              name: "FINE GUARD LTD",
              url: "https://fineguardpro.com",
              foundingDate: "2025-12",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Devonshire Green",
                addressLocality: "Sheffield",
                addressRegion: "South Yorkshire",
                addressCountry: "GB",
              },
            },
          }),
        }}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-block",
              background: C.accentGlow,
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: C.accent,
              marginBottom: 16,
            }}
          >
            ABOUT US
          </div>
          <h1
            style={{
              color: C.text,
              fontSize: 36,
              fontWeight: 800,
              marginBottom: 12,
              letterSpacing: "-0.02em",
            }}
          >
            Compliance Monitoring, Simplified
          </h1>
          <p style={{ color: C.textDim, fontSize: 16, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            FineGuard Pro helps UK businesses and accountancy firms stay on top of Companies House
            obligations &mdash; automatically, accurately, and affordably.
          </p>
        </div>

        {/* Our Story */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "32px 28px",
            marginBottom: 32,
          }}
        >
          <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Our Story</h2>
          <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
            FINE GUARD LTD was incorporated in December 2025 in Sheffield, South Yorkshire, with a
            clear mission: eliminate the manual, error-prone process of tracking Companies House
            filing deadlines that costs UK businesses millions in avoidable penalties every year.
          </p>
          <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
            Our founding team combines deep experience in regulatory technology, cloud engineering,
            and accountancy practice management. We saw that even well-run firms relied on
            spreadsheets, calendar reminders, and memory to track deadlines across hundreds of
            client companies &mdash; and that approach doesn&apos;t scale.
          </p>
          <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.8 }}>
            FineGuard Pro was built from the ground up to solve that problem with real-time API
            integration, intelligent alerting, and a purpose-built dashboard designed for
            accountancy workflows.
          </p>
        </div>

        {/* Mission & Values */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 32 }}>
          {[
            {
              title: "Our Mission",
              desc: "To protect every UK company from avoidable compliance penalties through intelligent, automated monitoring that accountancy professionals can trust.",
            },
            {
              title: "Accuracy First",
              desc: "We pull data directly from Companies House APIs and cross-reference with HMRC public records. Every alert is backed by verified filing data, refreshed daily.",
            },
            {
              title: "Built for Scale",
              desc: "Whether you manage 10 or 10,000 companies, FineGuard Pro is engineered to perform. Bulk import, batch processing, and smart prioritisation come standard.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 24,
              }}
            >
              <h3 style={{ color: C.text, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Company Details */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "32px 28px",
            marginBottom: 32,
          }}
        >
          <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Company Details</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { label: "Registered Name", value: "FINE GUARD LTD" },
              { label: "Company Number", value: "16895564" },
              { label: "Incorporated", value: "December 2025" },
              { label: "Jurisdiction", value: "England & Wales" },
              { label: "Registered Office", value: "Devonshire Green, Sheffield, South Yorkshire" },
              { label: "Status", value: "Active" },
            ].map((d) => (
              <div key={d.label}>
                <p style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                  {d.label}
                </p>
                <p style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Infrastructure */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "32px 28px",
            marginBottom: 32,
          }}
        >
          <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Security &amp; Infrastructure</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { icon: "\u{1F512}", text: "AES-256 encryption at rest, TLS 1.3 in transit" },
              { icon: "\u{2601}\u{FE0F}", text: "Hosted on Microsoft Azure UK South region" },
              { icon: "\u{1F6E1}\u{FE0F}", text: "ISO 27001-certified infrastructure" },
              { icon: "\u{1F4B3}", text: "PCI-DSS compliant payments via Stripe" },
              { icon: "\u{1F50D}", text: "Regular security audits and vulnerability scanning" },
              { icon: "\u{1F1EC}\u{1F1E7}", text: "Fully UK GDPR compliant" },
            ].map((s) => (
              <div key={s.text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.6 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            textAlign: "center",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: "40px 24px",
          }}
        >
          <h2 style={{ color: C.text, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Get in Touch
          </h2>
          <p style={{ color: C.textDim, fontSize: 14, marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>
            Whether you&apos;re a sole practitioner or a multi-office firm, we&apos;d love to show you how
            FineGuard Pro can transform your compliance workflow.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/check"
              style={{
                padding: "12px 28px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "#fff",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Try Free
            </Link>
            <Link
              href="/contact"
              style={{
                padding: "12px 28px",
                background: "rgba(255,255,255,0.06)",
                color: C.textDim,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Footer links */}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 24,
            marginTop: 40,
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <Link href="/pricing-services" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Pricing</Link>
          <Link href="/terms" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/contact" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
