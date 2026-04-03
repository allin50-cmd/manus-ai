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

const plans = [
  {
    name: "Starter",
    audience: "Sole practitioners & small firms",
    price: "29",
    period: "month",
    companies: "Up to 25",
    highlight: false,
    features: [
      "Automated Companies House deadline monitoring",
      "Email & in-app compliance alerts",
      "Client portfolio dashboard",
      "Filing history tracking",
      "Standard email support",
      "1 user seat",
    ],
  },
  {
    name: "Professional",
    audience: "Growing accountancy practices",
    price: "79",
    period: "month",
    companies: "Up to 150",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Starter, plus:",
      "Multi-channel alerts (email, SMS, WhatsApp)",
      "Director change monitoring",
      "Compliance risk scoring",
      "White-label client reports (PDF export)",
      "Bulk CSV import & enrichment",
      "Priority support & onboarding",
      "Up to 5 user seats",
    ],
  },
  {
    name: "Enterprise",
    audience: "Large firms, ACSPs & networks",
    price: "Custom",
    period: "",
    companies: "Unlimited",
    highlight: false,
    features: [
      "Everything in Professional, plus:",
      "Unlimited companies & users",
      "API access for practice management integration",
      "HMRC MTD bridge (VAT, SA)",
      "Custom compliance rule engine",
      "White-label branding (your logo, your domain)",
      "Dedicated account manager",
      "SLA-backed uptime guarantee",
      "GDPR data processing agreement",
    ],
  },
];

const testimonials = [
  {
    quote: "Cut our deadline chasing time by 80%. We now catch issues before they become penalties.",
    author: "Sarah M.",
    role: "Practice Manager, 120-company portfolio",
  },
  {
    quote: "The white-label reports look like we built them ourselves. Clients love the professionalism.",
    author: "James R.",
    role: "Senior Partner, Chartered Accountants",
  },
  {
    quote: "Bulk import was a game-changer. 400 companies onboarded in under 5 minutes.",
    author: "Priya K.",
    role: "Operations Director, Multi-office firm",
  },
];

export default function PricingServices() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <MarketingBreadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Pricing for Accountants" },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Pricing for Accountants | FineGuard Pro",
            description: "Compliance monitoring plans designed for UK accountancy firms. From sole practitioners to large networks.",
            publisher: { "@type": "Organization", name: "FINE GUARD LTD", url: "https://fineguardpro.com" },
          }),
        }}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-block",
              background: C.accentGlow,
              border: `1px solid rgba(59,130,246,0.25)`,
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: C.accent,
              marginBottom: 16,
            }}
          >
            BUILT FOR UK ACCOUNTANCY FIRMS
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
            Compliance Monitoring That Scales With Your Practice
          </h1>
          <p style={{ color: C.textDim, fontSize: 16, maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            Stop chasing Companies House deadlines manually. FineGuard Pro monitors your entire
            client portfolio and alerts you before penalties hit &mdash; so you can focus on advisory work.
          </p>
        </div>

        {/* Pricing cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300, 1fr))",
            gap: 24,
            marginBottom: 64,
          }}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              style={{
                background: plan.highlight ? C.surfaceHover : C.surface,
                border: `1px solid ${plan.highlight ? C.accent : C.border}`,
                borderRadius: 16,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: plan.highlight ? `0 0 40px ${C.accentGlow}` : "none",
                minWidth: 280,
                flex: 1,
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: C.accent,
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 16px",
                    borderRadius: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <h3 style={{ color: C.text, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                {plan.name}
              </h3>
              <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>{plan.audience}</p>

              <div style={{ marginBottom: 8 }}>
                {plan.price === "Custom" ? (
                  <span style={{ color: C.text, fontSize: 32, fontWeight: 800 }}>Custom</span>
                ) : (
                  <>
                    <span style={{ color: C.text, fontSize: 32, fontWeight: 800 }}>
                      &pound;{plan.price}
                    </span>
                    <span style={{ color: C.textMuted, fontSize: 14 }}> /{plan.period}</span>
                  </>
                )}
              </div>
              <p style={{ color: C.textDim, fontSize: 13, marginBottom: 24 }}>
                {plan.companies} companies
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1 }}>
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 10,
                      fontSize: 13,
                      color: C.textDim,
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: C.green, flexShrink: 0, marginTop: 2 }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.price === "Custom" ? "/contact" : "/check"}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "12px 0",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  marginTop: 24,
                  background: plan.highlight
                    ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                    : "rgba(255,255,255,0.06)",
                  color: plan.highlight ? "#fff" : C.textDim,
                  border: plan.highlight ? "none" : `1px solid ${C.border}`,
                  transition: "opacity 0.15s",
                }}
              >
                {plan.price === "Custom" ? "Request a Quote" : "Start Free Trial"}
              </Link>
            </div>
          ))}
        </div>

        {/* Why accountants choose FineGuard */}
        <div style={{ marginBottom: 64 }}>
          <h2
            style={{
              color: C.text,
              fontSize: 24,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 32,
            }}
          >
            Why Accountancy Firms Choose FineGuard Pro
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            {[
              { title: "Prevent Late Filing Penalties", desc: "Automated monitoring catches deadlines 90, 30, and 7 days before they hit. Your clients avoid fines from \u00a3150 to \u00a31,500." },
              { title: "Scale Without Hiring", desc: "Monitor 500+ companies with the same team. Bulk import, automated alerts, and smart prioritisation do the heavy lifting." },
              { title: "Impress Clients", desc: "White-label compliance reports and proactive alerts position your firm as a premium, technology-forward practice." },
              { title: "Reduce Professional Risk", desc: "Full audit trail of every alert sent and acknowledged. Demonstrate due diligence to professional indemnity insurers." },
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
        </div>

        {/* Testimonials */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ color: C.text, fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 32 }}>
            Trusted by UK Accountancy Professionals
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div
                key={i}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.7, fontStyle: "italic", marginBottom: 16 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{t.author}</p>
                <p style={{ color: C.textMuted, fontSize: 12 }}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 64 }}>
          <h2 style={{ color: C.text, fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 32 }}>
            Frequently Asked Questions
          </h2>
          {[
            { q: "Can I try FineGuard Pro before committing?", a: "Yes. Start with a free account to monitor your first company. Upgrade when you're ready to scale." },
            { q: "How does billing work for accountancy firms?", a: "Plans are billed monthly or annually (save 20% with annual). You can add more company slots at any time without changing plan." },
            { q: "Can I white-label reports for my clients?", a: "Yes, Professional and Enterprise plans include white-label compliance reports with your firm's branding, logo, and contact details." },
            { q: "What data sources do you use?", a: "We pull directly from the Companies House API and cross-reference with HMRC public data. All data is refreshed daily." },
            { q: "Is my client data secure?", a: "Absolutely. Data is encrypted at rest (AES-256) and in transit (TLS 1.3). We're hosted on Microsoft Azure UK South with ISO 27001-certified infrastructure." },
            { q: "Can I cancel at any time?", a: "Yes. Cancel from your dashboard at any time. Your subscription continues until the end of the billing period." },
          ].map((faq, i) => (
            <div
              key={i}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "16px 20px",
                marginBottom: 8,
              }}
            >
              <h3 style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{faq.q}</h3>
              <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
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
            Ready to Protect Your Client Portfolio?
          </h2>
          <p style={{ color: C.textDim, fontSize: 14, marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>
            Join hundreds of UK accountancy firms using FineGuard Pro to eliminate missed deadlines and reduce compliance risk.
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
              Start Free Trial
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
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
