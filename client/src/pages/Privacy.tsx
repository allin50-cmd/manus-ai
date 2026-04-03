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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 32 }}>
    <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{title}</h2>
    <div style={{ color: C.textDim, fontSize: 14, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <MarketingBreadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Privacy Policy",
            description: "How FINE GUARD LTD collects, uses, and protects your personal data.",
            publisher: { "@type": "Organization", name: "FINE GUARD LTD", url: "https://fineguardpro.com" },
          }),
        }}
      />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Privacy Policy
        </h1>
        <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 40 }}>
          Last updated: 1 April 2026 &middot; Data Controller: FINE GUARD LTD (Company No. 16895564)
        </p>

        <Section title="1. Who We Are">
          <p>
            FINE GUARD LTD (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is the data controller responsible for your
            personal data. We are registered in England and Wales (Company No. 16895564), with our registered
            office at Devonshire Green, Sheffield, South Yorkshire.
          </p>
          <p style={{ marginTop: 8 }}>
            Our Data Protection Officer can be contacted at{" "}
            <a href="mailto:privacy@fineguardpro.com" style={{ color: C.accent }}>privacy@fineguardpro.com</a>.
          </p>
        </Section>

        <Section title="2. Data We Collect">
          <p><strong style={{ color: C.text }}>Account data:</strong> Name, email address, phone number, company name, and billing information when you create an account or subscribe.</p>
          <p style={{ marginTop: 8 }}><strong style={{ color: C.text }}>Usage data:</strong> Pages visited, features used, search queries, alert interactions, and login timestamps.</p>
          <p style={{ marginTop: 8 }}><strong style={{ color: C.text }}>Companies House data:</strong> Company numbers, filing dates, officer details, and registered addresses sourced from public registers on your behalf.</p>
          <p style={{ marginTop: 8 }}><strong style={{ color: C.text }}>Technical data:</strong> IP address, browser type, device information, and cookies (see our <Link href="/cookies" style={{ color: C.accent }}>Cookie Policy</Link>).</p>
          <p style={{ marginTop: 8 }}><strong style={{ color: C.text }}>Communications:</strong> Support tickets, feedback, and correspondence with our team.</p>
        </Section>

        <Section title="3. How We Use Your Data">
          <p>We process your data for the following purposes:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong style={{ color: C.text }}>Service delivery</strong> — monitoring deadlines, generating alerts, and providing compliance reports (Legal basis: Contract)</li>
            <li><strong style={{ color: C.text }}>Account management</strong> — authentication, billing, and subscription management (Legal basis: Contract)</li>
            <li><strong style={{ color: C.text }}>Communication</strong> — sending alerts, digests, and service updates (Legal basis: Legitimate interest / Consent)</li>
            <li><strong style={{ color: C.text }}>Improvement</strong> — analysing usage patterns to improve features (Legal basis: Legitimate interest)</li>
            <li><strong style={{ color: C.text }}>Legal compliance</strong> — meeting regulatory obligations (Legal basis: Legal obligation)</li>
          </ul>
        </Section>

        <Section title="4. Data Sharing">
          <p>We share personal data only with:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong style={{ color: C.text }}>Stripe</strong> — for payment processing (PCI-DSS compliant)</li>
            <li><strong style={{ color: C.text }}>ClickSend</strong> — for transactional email and SMS delivery</li>
            <li><strong style={{ color: C.text }}>Microsoft Azure</strong> — cloud hosting infrastructure (UK South region)</li>
            <li><strong style={{ color: C.text }}>Companies House</strong> — API queries to retrieve public company data</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            We do not sell your personal data. All sub-processors are bound by data processing agreements that
            comply with UK GDPR requirements.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your data for as long as your account is active. Upon account deletion:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Personal data is deleted within 30 days</li>
            <li>Billing records are retained for 7 years (HMRC requirement)</li>
            <li>Anonymised analytics data may be retained indefinitely</li>
            <li>Backup copies are purged within 90 days</li>
          </ul>
        </Section>

        <Section title="6. Your Rights (UK GDPR)">
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong style={{ color: C.text }}>Access</strong> — request a copy of your personal data</li>
            <li><strong style={{ color: C.text }}>Rectification</strong> — correct inaccurate data</li>
            <li><strong style={{ color: C.text }}>Erasure</strong> — request deletion of your data</li>
            <li><strong style={{ color: C.text }}>Portability</strong> — receive your data in a structured, machine-readable format</li>
            <li><strong style={{ color: C.text }}>Restriction</strong> — limit processing in certain circumstances</li>
            <li><strong style={{ color: C.text }}>Objection</strong> — object to processing based on legitimate interest</li>
            <li><strong style={{ color: C.text }}>Withdraw consent</strong> — where processing is based on consent</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            To exercise any of these rights, email{" "}
            <a href="mailto:privacy@fineguardpro.com" style={{ color: C.accent }}>privacy@fineguardpro.com</a>.
            We will respond within 30 days. You also have the right to lodge a complaint with the
            Information Commissioner&apos;s Office (ICO) at{" "}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>ico.org.uk</a>.
          </p>
        </Section>

        <Section title="7. International Transfers">
          <p>
            Your data is primarily stored in the UK (Azure UK South). Where data is transferred outside the UK,
            we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) or
            adequacy decisions.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            We implement industry-standard security measures including TLS encryption in transit, AES-256
            encryption at rest, role-based access controls, regular security audits, and automated vulnerability
            scanning. All payment data is processed by Stripe and never stored on our servers.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Material changes will be communicated via
            email at least 14 days before they take effect. The &quot;Last updated&quot; date at the top of this
            page indicates when the policy was last revised.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            FINE GUARD LTD &middot; Devonshire Green, Sheffield, South Yorkshire
            <br />
            Company No. 16895564 &middot; Email:{" "}
            <a href="mailto:privacy@fineguardpro.com" style={{ color: C.accent }}>privacy@fineguardpro.com</a>
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
          <Link href="/cookies" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Cookie Policy</Link>
          <Link href="/contact" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
