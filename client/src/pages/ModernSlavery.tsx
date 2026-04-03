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

export default function ModernSlavery() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <MarketingBreadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Modern Slavery Statement" }]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Modern Slavery Statement",
            description: "FINE GUARD LTD's commitment to preventing modern slavery and human trafficking.",
            publisher: { "@type": "Organization", name: "FINE GUARD LTD", url: "https://fineguardpro.com" },
          }),
        }}
      />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Modern Slavery Statement
        </h1>
        <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 40 }}>
          Financial year ending March 2026 &middot; FINE GUARD LTD (Company No. 16895564)
        </p>

        <Section title="1. Introduction">
          <p>
            This statement is made pursuant to Section 54 of the Modern Slavery Act 2015. It sets out
            the steps FINE GUARD LTD (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) has taken and
            continues to take to ensure that modern slavery and human trafficking are not taking place
            within our business or supply chain.
          </p>
          <p style={{ marginTop: 12 }}>
            FINE GUARD LTD is a technology company registered in England and Wales (Company No. 16895564),
            operating from Sheffield, South Yorkshire. We provide the FineGuard Pro compliance monitoring
            platform for UK businesses and accountancy firms.
          </p>
        </Section>

        <Section title="2. Our Business &amp; Supply Chain">
          <p>
            As a software-as-a-service (SaaS) company, our operations are primarily digital. Our supply
            chain consists of:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong style={{ color: C.text }}>Cloud infrastructure providers</strong> &mdash; Microsoft Azure (UK South region)</li>
            <li><strong style={{ color: C.text }}>Payment processing</strong> &mdash; Stripe (PCI-DSS certified)</li>
            <li><strong style={{ color: C.text }}>Communication services</strong> &mdash; ClickSend for transactional email and SMS</li>
            <li><strong style={{ color: C.text }}>Government data sources</strong> &mdash; Companies House and HMRC public APIs</li>
            <li><strong style={{ color: C.text }}>Professional services</strong> &mdash; accounting, legal, and auditing firms</li>
          </ul>
        </Section>

        <Section title="3. Our Policies">
          <p>We are committed to preventing modern slavery and human trafficking through:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <strong style={{ color: C.text }}>Ethical Employment Policy</strong> &mdash; all team members
              are employed under fair terms with living wage compliance, transparent contracts, and no
              forced or compulsory labour.
            </li>
            <li style={{ marginTop: 6 }}>
              <strong style={{ color: C.text }}>Supplier Due Diligence</strong> &mdash; we assess key suppliers
              for modern slavery risk and prioritise established, publicly audited technology providers.
            </li>
            <li style={{ marginTop: 6 }}>
              <strong style={{ color: C.text }}>Whistleblowing</strong> &mdash; we maintain a confidential
              reporting channel for any concerns about unethical conduct, including suspected modern slavery
              in our supply chain.
            </li>
          </ul>
        </Section>

        <Section title="4. Risk Assessment">
          <p>
            As a digital-first business with a UK-based team and established technology suppliers, we
            assess our risk of modern slavery involvement as low. However, we remain vigilant and review
            our supply chain annually for changes that could introduce higher-risk relationships.
          </p>
          <p style={{ marginTop: 12 }}>
            Key risk mitigations include selecting suppliers who publish their own modern slavery statements,
            conducting background checks on new suppliers, and requiring contractual commitments to
            anti-slavery standards.
          </p>
        </Section>

        <Section title="5. Training &amp; Awareness">
          <p>
            We provide guidance to all team members about the indicators of modern slavery and the
            importance of reporting concerns. As we grow, we will formalise this into mandatory training
            for all employees and contractors.
          </p>
        </Section>

        <Section title="6. Monitoring &amp; Review">
          <p>
            This statement is reviewed and updated annually. We will expand our due diligence procedures
            as the business scales and our supply chain evolves. Any concerns about modern slavery within
            our operations or supply chain can be reported to{" "}
            <a href="mailto:compliance@fineguardpro.com" style={{ color: C.accent }}>compliance@fineguardpro.com</a>.
          </p>
        </Section>

        <Section title="7. Approval">
          <p>
            This statement has been approved by the board of directors of FINE GUARD LTD and will be
            reviewed no later than March 2027.
          </p>
          <p style={{ marginTop: 16 }}>
            FINE GUARD LTD
            <br />
            Devonshire Green, Sheffield, South Yorkshire
            <br />
            Company No. 16895564
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
          <Link href="/regulatory" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Regulatory</Link>
          <Link href="/contact" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
