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

const CookieTable = () => (
  <div style={{ overflowX: "auto", marginTop: 12 }}>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 13,
        color: C.textDim,
      }}
    >
      <thead>
        <tr>
          {["Cookie Name", "Provider", "Purpose", "Duration", "Type"].map((h) => (
            <th
              key={h}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderBottom: `1px solid ${C.border}`,
                color: C.text,
                fontWeight: 600,
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          { name: "fg_session", provider: "FineGuard Pro", purpose: "Maintains your authenticated session", duration: "Session", type: "Strictly Necessary" },
          { name: "fg_csrf", provider: "FineGuard Pro", purpose: "CSRF protection token", duration: "Session", type: "Strictly Necessary" },
          { name: "fg_consent", provider: "FineGuard Pro", purpose: "Stores your cookie consent preferences", duration: "1 year", type: "Strictly Necessary" },
          { name: "_ga, _gid", provider: "Google Analytics", purpose: "Anonymous usage statistics to improve the Service", duration: "Up to 2 years", type: "Analytics" },
          { name: "_stripe_mid", provider: "Stripe", purpose: "Fraud prevention during payment processing", duration: "1 year", type: "Functional" },
          { name: "fg_theme", provider: "FineGuard Pro", purpose: "Remembers your display theme preference", duration: "1 year", type: "Functional" },
        ].map((c) => (
          <tr key={c.name}>
            <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}`, fontFamily: "monospace", fontSize: 12 }}>{c.name}</td>
            <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>{c.provider}</td>
            <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>{c.purpose}</td>
            <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>{c.duration}</td>
            <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.border}` }}>{c.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function CookiePolicy() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <MarketingBreadcrumb
        crumbs={[{ label: "Home", href: "/" }, { label: "Cookie Policy" }]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Cookie Policy",
            description: "How FineGuard Pro uses cookies and similar technologies.",
            publisher: { "@type": "Organization", name: "FINE GUARD LTD", url: "https://fineguardpro.com" },
          }),
        }}
      />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <h1 style={{ color: C.text, fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Cookie Policy
        </h1>
        <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 40 }}>
          Last updated: 1 April 2026 &middot; FINE GUARD LTD (Company No. 16895564)
        </p>

        <Section title="1. What Are Cookies?">
          <p>
            Cookies are small text files stored on your device when you visit a website. They help the site
            remember your preferences, keep you signed in, and understand how you interact with the Service.
            This policy covers cookies and similar technologies (local storage, session storage) used by
            FineGuard Pro.
          </p>
        </Section>

        <Section title="2. How We Use Cookies">
          <p>We use cookies for three purposes:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <strong style={{ color: C.text }}>Strictly Necessary</strong> &mdash; essential for the Service
              to function, including authentication, security, and cookie consent management. These cannot be
              disabled.
            </li>
            <li style={{ marginTop: 6 }}>
              <strong style={{ color: C.text }}>Functional</strong> &mdash; remember your preferences such as
              display theme and language settings to improve your experience.
            </li>
            <li style={{ marginTop: 6 }}>
              <strong style={{ color: C.text }}>Analytics</strong> &mdash; help us understand how visitors use
              the Service so we can improve features and performance. Data is anonymised and aggregated.
            </li>
          </ul>
          <p style={{ marginTop: 12 }}>
            We do <strong style={{ color: C.text }}>not</strong> use advertising or tracking cookies. We do not
            sell data collected through cookies to third parties.
          </p>
        </Section>

        <Section title="3. Cookies We Set">
          <CookieTable />
        </Section>

        <Section title="4. Third-Party Cookies">
          <p>
            Some cookies are placed by third-party services that appear on our pages. We use Google Analytics
            for anonymous usage statistics and Stripe for secure payment processing. These providers have their
            own cookie policies:
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>
              <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
                Google Analytics Cookie Policy
              </a>
            </li>
            <li>
              <a href="https://stripe.com/cookies-policy" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>
                Stripe Cookie Policy
              </a>
            </li>
          </ul>
        </Section>

        <Section title="5. Managing Your Cookie Preferences">
          <p>
            When you first visit FineGuard Pro, we display a cookie consent banner where you can accept or
            decline optional cookies. You can change your preferences at any time by clicking the &quot;Cookie
            Settings&quot; link in the footer of any page.
          </p>
          <p style={{ marginTop: 12 }}>
            You can also manage cookies through your browser settings. Most browsers allow you to block or
            delete cookies. Note that blocking strictly necessary cookies may prevent the Service from
            functioning correctly.
          </p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>Firefox</a></li>
            <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/manage-cookies-in-microsoft-edge" target="_blank" rel="noopener noreferrer" style={{ color: C.accent }}>Microsoft Edge</a></li>
          </ul>
        </Section>

        <Section title="6. Changes to This Policy">
          <p>
            We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for
            operational, legal, or regulatory reasons. We will notify you of material changes by displaying a
            notice on the Service. The &quot;Last updated&quot; date at the top indicates the latest revision.
          </p>
        </Section>

        <Section title="7. Contact">
          <p>
            If you have questions about our use of cookies, contact us at{" "}
            <a href="mailto:privacy@fineguardpro.com" style={{ color: C.accent }}>privacy@fineguardpro.com</a>
            .
          </p>
          <p style={{ marginTop: 8 }}>
            FINE GUARD LTD &middot; Devonshire Green, Sheffield, South Yorkshire
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
          <Link href="/privacy" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Terms of Service</Link>
          <Link href="/contact" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
