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
    <h2
      style={{
        color: C.text,
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 12,
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </h2>
    <div style={{ color: C.textDim, fontSize: 14, lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function Terms() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <MarketingBreadcrumb
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Terms of Service" },
        ]}
      />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Terms of Service",
            description:
              "Terms and conditions governing your use of FineGuard Pro compliance monitoring services.",
            publisher: {
              "@type": "Organization",
              name: "FINE GUARD LTD",
              url: "https://fineguardpro.com",
            },
          }),
        }}
      />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1
          style={{
            color: C.text,
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Terms of Service
        </h1>
        <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 40 }}>
          Last updated: 1 April 2026 &middot; Effective immediately for all new users
        </p>

        <Section title="1. About These Terms">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your access to and use of FineGuard Pro
            (&quot;the Service&quot;), a compliance monitoring platform operated by{" "}
            <strong style={{ color: C.text }}>FINE GUARD LTD</strong>, a company registered in
            England and Wales (Company No. 16895564), with its registered office at Devonshire
            Green, Sheffield, South Yorkshire.
          </p>
          <p style={{ marginTop: 12 }}>
            By accessing or using the Service, you agree to be bound by these Terms. If you do not
            agree, you must not use the Service.
          </p>
        </Section>

        <Section title="2. Service Description">
          <p>FineGuard Pro provides:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Automated Companies House filing deadline monitoring</li>
            <li>Compliance alerts and risk scoring for UK limited companies</li>
            <li>Director change monitoring and officer tracking</li>
            <li>Multi-channel notifications (email, SMS, WhatsApp, push)</li>
            <li>Client portfolio management for accountancy firms</li>
            <li>API access for enterprise integrations</li>
          </ul>
          <p style={{ marginTop: 12 }}>
            Data is sourced from public registers including Companies House, HMRC, and other
            official UK government sources. While we endeavour to keep data accurate and up to
            date, we do not guarantee the completeness or timeliness of third-party data.
          </p>
        </Section>

        <Section title="3. Account Registration">
          <p>
            To use certain features you must create an account. You agree to provide accurate,
            current and complete information and to keep your account credentials secure. You are
            responsible for all activity that occurs under your account.
          </p>
          <p style={{ marginTop: 12 }}>
            We reserve the right to suspend or terminate accounts that violate these Terms, contain
            fraudulent information, or are used for purposes inconsistent with the Service.
          </p>
        </Section>

        <Section title="4. Subscription &amp; Payment">
          <p>
            Paid plans are billed monthly or annually via Stripe. All prices are in GBP and
            exclusive of VAT unless stated otherwise. You may cancel your subscription at any time;
            cancellations take effect at the end of the current billing period.
          </p>
          <p style={{ marginTop: 12 }}>
            We offer a 14-day cooling-off period for new subscriptions in compliance with the
            Consumer Contracts Regulations 2013. Refund requests after this period are at our
            discretion.
          </p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to reverse-engineer, scrape, or access the Service beyond its intended API</li>
            <li>Resell or redistribute data obtained from the Service without written permission</li>
            <li>Upload malicious code or attempt to compromise system security</li>
            <li>Use automated tools to access the Service at rates that exceed reasonable limits</li>
          </ul>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            All intellectual property in the Service (including software, design, trademarks, and
            content) belongs to FINE GUARD LTD or its licensors. Your subscription grants a
            limited, non-exclusive, non-transferable licence to use the Service for your internal
            business purposes only.
          </p>
        </Section>

        <Section title="7. Data Protection">
          <p>
            We process personal data in accordance with our{" "}
            <Link href="/privacy" style={{ color: C.accent }}>
              Privacy Policy
            </Link>{" "}
            and applicable data protection legislation including the UK GDPR and the Data
            Protection Act 2018. By using the Service you acknowledge that you have read and
            understood our Privacy Policy.
          </p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, FINE GUARD LTD shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or any loss of
            profits or revenues, arising from your use of the Service.
          </p>
          <p style={{ marginTop: 12 }}>
            Our total aggregate liability for any claims arising from or relating to these Terms
            or the Service shall not exceed the amount you paid to us in the 12 months preceding
            the claim.
          </p>
          <p style={{ marginTop: 12 }}>
            Nothing in these Terms excludes liability for death or personal injury caused by
            negligence, fraud, or any other liability that cannot be excluded by English law.
          </p>
        </Section>

        <Section title="9. Disclaimers">
          <p>
            The Service is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We
            do not provide legal, tax, or financial advice. Compliance data and alerts are
            informational only and should not be relied upon as a substitute for professional
            advice.
          </p>
          <p style={{ marginTop: 12 }}>
            Companies House data may be subject to delays; filing deadlines shown are based on
            publicly available information and may not reflect recent submissions.
          </p>
        </Section>

        <Section title="10. Termination">
          <p>
            Either party may terminate these Terms at any time. Upon termination, your right to
            access the Service ceases immediately. We may retain anonymised, aggregated data for
            analytics purposes. Data deletion requests are handled per our Privacy Policy and GDPR
            obligations.
          </p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p>
            We may update these Terms from time to time. Material changes will be communicated via
            email or in-app notification at least 30 days before they take effect. Continued use of
            the Service after changes constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="12. Governing Law &amp; Disputes">
          <p>
            These Terms are governed by and construed in accordance with the laws of England and
            Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of
            England and Wales, except where you are a consumer and entitled to bring proceedings in
            your local courts.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            For questions about these Terms, please contact us at{" "}
            <a href="mailto:legal@fineguardpro.com" style={{ color: C.accent }}>
              legal@fineguardpro.com
            </a>{" "}
            or write to:
          </p>
          <p style={{ marginTop: 8 }}>
            FINE GUARD LTD
            <br />
            Devonshire Green, Sheffield
            <br />
            South Yorkshire, England
            <br />
            Company No. 16895564
          </p>
        </Section>

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
          <Link href="/privacy" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>
            Privacy Policy
          </Link>
          <Link href="/cookies" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>
            Cookie Policy
          </Link>
          <Link href="/modern-slavery" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>
            Modern Slavery Statement
          </Link>
          <Link href="/regulatory" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>
            Regulatory
          </Link>
          <Link href="/contact" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
