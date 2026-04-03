import React from "react";
import { MarketingBreadcrumb } from "@/components/MarketingBreadcrumb";
import { Link } from "wouter";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  border: "#1e2d45",
  accent: "#3b82f6",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

const SitemapSection = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; desc?: string }[];
}) => (
  <div
    style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: 24,
    }}
  >
    <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{title}</h2>
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {links.map((link) => (
        <li key={link.href} style={{ marginBottom: 10 }}>
          <Link
            href={link.href}
            style={{
              color: C.accent,
              fontSize: 14,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {link.label}
          </Link>
          {link.desc && (
            <p style={{ color: C.textMuted, fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>
              {link.desc}
            </p>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default function Sitemap() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <MarketingBreadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Sitemap" }]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Sitemap",
            description: "Complete directory of all pages on FineGuard Pro.",
            publisher: { "@type": "Organization", name: "FINE GUARD LTD", url: "https://fineguardpro.com" },
          }),
        }}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1
          style={{
            color: C.text,
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Sitemap
        </h1>
        <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 40 }}>
          A complete directory of all pages on FineGuard Pro.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          <SitemapSection
            title="Main Pages"
            links={[
              { label: "Home", href: "/", desc: "FineGuard Pro landing page" },
              { label: "About Us", href: "/about", desc: "Our story, mission, and company details" },
              { label: "Contact", href: "/contact", desc: "Get in touch with the FineGuard team" },
              { label: "Pricing for Accountants", href: "/pricing-services", desc: "Plans and pricing for accountancy firms" },
            ]}
          />

          <SitemapSection
            title="Product"
            links={[
              { label: "Company Check", href: "/check", desc: "Search and monitor any UK limited company" },
              { label: "Dashboard", href: "/dashboard", desc: "Your compliance monitoring dashboard" },
              { label: "Client Management", href: "/clients", desc: "Manage your client company portfolio" },
              { label: "Alerts", href: "/alerts", desc: "View and manage compliance alerts" },
              { label: "Reports", href: "/reports", desc: "Generate compliance reports" },
            ]}
          />

          <SitemapSection
            title="Resources"
            links={[
              { label: "Blog", href: "/blog", desc: "Compliance insights and product updates" },
              { label: "Help Centre", href: "/help", desc: "Guides and frequently asked questions" },
              { label: "API Documentation", href: "/docs/api", desc: "API reference for enterprise integrations" },
              { label: "Status Page", href: "/status", desc: "Real-time system status and uptime" },
            ]}
          />

          <SitemapSection
            title="Account"
            links={[
              { label: "Sign In", href: "/auth", desc: "Log in to your FineGuard Pro account" },
              { label: "Register", href: "/auth", desc: "Create a new account" },
              { label: "Settings", href: "/settings", desc: "Account and notification settings" },
              { label: "Billing", href: "/billing", desc: "Manage subscription and invoices" },
            ]}
          />

          <SitemapSection
            title="Legal &amp; Compliance"
            links={[
              { label: "Terms of Service", href: "/terms", desc: "Terms and conditions for using FineGuard Pro" },
              { label: "Privacy Policy", href: "/privacy", desc: "How we collect, use, and protect your data" },
              { label: "Cookie Policy", href: "/cookies", desc: "Our use of cookies and similar technologies" },
              { label: "Modern Slavery Statement", href: "/modern-slavery", desc: "Our commitment to preventing modern slavery" },
              { label: "Regulatory Information", href: "/regulatory", desc: "Company registration and regulatory details" },
            ]}
          />
        </div>

        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: 24,
            marginTop: 40,
            textAlign: "center",
          }}
        >
          <p style={{ color: C.textMuted, fontSize: 13 }}>
            &copy; {new Date().getFullYear()} FINE GUARD LTD (Company No. 16895564). All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
