import React from "react";
import { MarketingBreadcrumb } from "@/components/MarketingBreadcrumb";
import { Link } from "wouter";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  border: "#1e2d45",
  accent: "#3b82f6",
  accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</h2>
    <div style={{ color: C.textDim, fontSize: 14, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function Regulatory() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <MarketingBreadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Regulatory Information" }]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Regulatory Information",
            description: "Regulatory compliance information for FINE GUARD LTD and FineGuard Pro.",
            publisher: { "@type": "Organization", name: "FINE GUARD LTD", url: "https://fineguardpro.com" },
          }),
        }}
      />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Regulatory Information
        </h1>
        <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 40 }}>
          FINE GUARD LTD (Company No. 16895564) &middot; Last updated: 1 April 2026
        </p>

        <Section title="1. Company Registration">
          <p>
            FINE GUARD LTD is a private limited company registered in England and Wales under Company
            Number <strong style={{ color: C.text }}>16895564</strong>. Our registered office is at
            Devonshire Green, Sheffield, South Yorkshire.
          </p>
          <p style={{ marginTop: 12 }}>
            You can verify our company details on the{" "}
            <a
              href="https://find-and-update.company-information.service.gov.uk/company/16895564"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.accent }}
            >
              Companies House public register
            </a>.
          </p>
        </Section>

        <Section title="2. Nature of Service">
          <p>
            FineGuard Pro is a compliance monitoring and information service. We provide automated
            tracking of Companies House filing deadlines, alerts, and risk scoring based on publicly
            available data.
          </p>
          <div
            style={{
              background: C.accentGlow,
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 10,
              padding: 16,
              marginTop: 16,
            }}
          >
            <p style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              Important Disclaimer
            </p>
            <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.7 }}>
              FineGuard Pro does <strong style={{ color: C.text }}>not</strong> provide legal, tax,
              accounting, or financial advice. Our service is informational only and should not be
              relied upon as a substitute for professional advice from a qualified accountant,
              solicitor, or tax adviser.
            </p>
          </div>
        </Section>

        <Section title="3. Data Protection &amp; UK GDPR">
          <p>
            We are committed to protecting personal data in accordance with the UK General Data
            Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <strong style={{ color: C.text }}>Data Controller:</strong> FINE GUARD LTD
            </li>
            <li>
              <strong style={{ color: C.text }}>DPO Contact:</strong>{" "}
              <a href="mailto:privacy@fineguardpro.com" style={{ color: C.accent }}>privacy@fineguardpro.com</a>
            </li>
            <li>
              <strong style={{ color: C.text }}>Supervisory Authority:</strong>{" "}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
                Information Commissioner&apos;s Office (ICO)
              </a>
            </li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Full details of how we collect, use, and protect your data are set out in our{" "}
            <Link href="/privacy" style={{ color: C.accent }}>Privacy Policy</Link>.
          </p>
        </Section>

        <Section title="4. Companies House API Usage">
          <p>
            FineGuard Pro accesses data through the official{" "}
            <a
              href="https://developer.company-information.service.gov.uk/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.accent }}
            >
              Companies House API
            </a>{" "}
            under the terms of the Companies House API Terms of Use. Company data displayed within
            FineGuard Pro is sourced from public registers and is Crown Copyright.
          </p>
          <p style={{ marginTop: 12 }}>
            We refresh data daily and make reasonable efforts to ensure accuracy, but we cannot
            guarantee that all information is complete or current. Users should verify critical data
            directly with Companies House.
          </p>
        </Section>

        <Section title="5. Payment Processing">
          <p>
            All payments are processed securely by{" "}
            <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
              Stripe
            </a>{" "}
            (Stripe Payments Europe, Ltd.), which is PCI-DSS Level 1 certified. We do not store
            credit card numbers or bank account details on our servers. All billing data is handled
            entirely by Stripe&apos;s secure infrastructure.
          </p>
        </Section>

        <Section title="6. Hosting &amp; Security">
          <p>
            FineGuard Pro is hosted on Microsoft Azure&apos;s UK South data centre (London), which
            holds ISO 27001, ISO 27017, ISO 27018, SOC 1, SOC 2, and SOC 3 certifications.
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Data encrypted at rest with AES-256</li>
            <li>Data encrypted in transit with TLS 1.3</li>
            <li>Role-based access controls with audit logging</li>
            <li>Automated vulnerability scanning and regular penetration testing</li>
            <li>Daily encrypted backups with 90-day retention</li>
          </ul>
        </Section>

        <Section title="7. Consumer Rights">
          <p>
            UK consumers have rights under the Consumer Rights Act 2015 and the Consumer Contracts
            (Information, Cancellation and Additional Charges) Regulations 2013, including:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>A 14-day cooling-off period for new subscriptions</li>
            <li>The right to cancel at any time from your account dashboard</li>
            <li>Clear, transparent pricing with no hidden fees</li>
            <li>The right to a refund if the service is not as described</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            For cancellation or refund enquiries, contact{" "}
            <a href="mailto:support@fineguardpro.com" style={{ color: C.accent }}>support@fineguardpro.com</a>.
          </p>
        </Section>

        <Section title="8. Complaints">
          <p>
            We aim to resolve complaints promptly. If you have a concern about our service, please
            contact us at{" "}
            <a href="mailto:complaints@fineguardpro.com" style={{ color: C.accent }}>complaints@fineguardpro.com</a>.
            We will acknowledge your complaint within 2 business days and aim to resolve it within
            14 days.
          </p>
          <p style={{ marginTop: 12 }}>
            If you are not satisfied with our response, you may contact the relevant ombudsman or
            dispute resolution body. For data protection complaints, you may lodge a complaint with
            the{" "}
            <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
              ICO
            </a>.
          </p>
        </Section>

        <Section title="9. Anti-Money Laundering">
          <p>
            While FineGuard Pro is an information service and not a regulated financial institution,
            we take anti-money laundering (AML) obligations seriously. We support accountancy firms
            in their compliance duties and will cooperate fully with law enforcement agencies when
            required by law.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            FINE GUARD LTD
            <br />
            Devonshire Green, Sheffield, South Yorkshire
            <br />
            Company No. 16895564
            <br />
            Email:{" "}
            <a href="mailto:legal@fineguardpro.com" style={{ color: C.accent }}>legal@fineguardpro.com</a>
          </p>
        </Section>

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
          <Link href="/terms" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/privacy" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/cookies" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Cookie Policy</Link>
          <Link href="/modern-slavery" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Modern Slavery</Link>
          <Link href="/contact" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
