const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const penaltyTable = [
  { delay: "Up to 1 month", private: "£150", public: "£750", notes: "Applies from day 1 after deadline" },
  { delay: "1 to 3 months", private: "£375", public: "£1,500", notes: "Second late filing doubles penalty" },
  { delay: "3 to 6 months", private: "£750", public: "£3,000", notes: "HMRC may also open enquiry" },
  { delay: "Over 6 months", private: "£1,500", public: "£7,500", notes: "Strike-off risk escalates significantly" },
];

const faqs = [
  { q: "Can I appeal a Companies House late filing penalty?", a: "Yes. You can appeal a late filing penalty if there were exceptional circumstances that made it impossible to file on time. Common accepted reasons include serious illness of the key person responsible, natural disasters, and HMRC or Companies House system failures. Normal work pressure or unfamiliarity with requirements are not accepted. You must appeal within 28 days of receiving the penalty notice." },
  { q: "What is the appeal process for late filing penalties?", a: "To appeal, you must write to Companies House with your company number, the amount of the penalty, and full details of why filing was impossible. There is no online appeal form — appeals must be submitted in writing. Companies House aims to respond within 6 weeks. If your appeal is rejected, you can request a second review." },
  { q: "Does the penalty double if I file late two years in a row?", a: "Yes. If a company files its annual accounts late two consecutive years, the standard penalty amount is automatically doubled for the second offence. This applies even if the second filing is only marginally late." },
  { q: "What happens if I ignore the penalty?", a: "Ignoring a late filing penalty is serious. Companies House can enforce the penalty through the courts, which can result in additional costs. Persistent non-filing can lead to the company being struck off the register, which makes it illegal to carry on trading as a limited company." },
];

export default function SeoPagePenalties() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <span style={{ background: C.red + "22", color: C.red, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4 }}>Penalties</span>
          <span style={{ background: C.accent + "22", color: C.accent, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4 }}>Companies House</span>
        </div>
        <h1 style={{ color: C.text, fontSize: 36, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>Companies House Late Filing Penalties: Amounts, Appeals and How to Avoid Them</h1>
        <p style={{ color: C.textDim, fontSize: 16, lineHeight: 1.7, margin: "0 0 12px" }}>
          Late filing penalties from Companies House are automatic, non-negotiable, and can be doubled for repeat offenders. This guide explains exactly how much you could face, how to appeal, and how FineGuard Pro prevents penalties before they happen.
        </p>
        <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 40 }}>Last updated: October 2024 · 7 min read</p>

        {/* Penalty table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.red}44`, overflow: "hidden", marginBottom: 40 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.red + "18" }}>
            <h2 style={{ color: C.red, fontSize: 16, fontWeight: 700, margin: 0 }}>Annual Accounts Late Filing Penalty Amounts</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["How Late", "Private Company", "Public Company (PLC)", "Notes"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {penaltyTable.map((row) => (
                <tr key={row.delay} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{row.delay}</td>
                  <td style={{ padding: "13px 16px", color: C.red, fontSize: 14, fontWeight: 700 }}>{row.private}</td>
                  <td style={{ padding: "13px 16px", color: C.red, fontSize: 14, fontWeight: 700 }}>{row.public}</td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 12 }}>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, background: C.amber + "12" }}>
            <p style={{ color: C.amber, fontSize: 13, margin: 0, fontWeight: 500 }}>Note: All penalties are automatically doubled if the company files late two years in a row.</p>
          </div>
        </div>

        {/* Article body */}
        {[
          {
            h2: "Why Are Late Filing Penalties Automatic?",
            body: `Companies House does not send warning letters before imposing penalties. Once a filing deadline passes, the penalty is triggered automatically when the late accounts are eventually received. This means there is no grace period and no opportunity to negotiate before the penalty is applied.

The penalty regime was introduced to encourage timely filing and ensure the public register remains accurate and up to date. Companies House sends the penalty notice to the company's registered address, which is another reason to ensure your registered address is current and monitored.`,
          },
          {
            h2: "How to Appeal a Late Filing Penalty",
            body: `You can appeal a late filing penalty if you have a genuine exceptional reason for missing the deadline. Companies House takes a strict view — the test is whether filing was impossible, not merely difficult. Accepted reasons typically include the sudden serious illness of the sole person responsible for filing, bereavement of a key person at a critical time, or a documented failure of the Companies House online filing system.

To appeal, write to the Late Filing Penalty team at Companies House. Include your company number, the penalty reference number, and a clear explanation of the exceptional circumstances, supported by evidence where possible. You must appeal within 28 days of the penalty notice date. The first appeal decision is reviewed by a Companies House officer. If rejected, you may request a second review.

A significant proportion of penalty appeals are rejected. It is always better to file on time or apply for an extension before the deadline than to rely on a successful appeal.`,
          },
          {
            h2: "How FineGuard Pro Prevents Late Filing Penalties",
            body: `FineGuard Pro is designed specifically to eliminate late filing penalties. By continuously monitoring Companies House data for all your companies, FineGuard calculates precise filing deadlines and sends automated alerts via email, SMS, and in-app notifications at 30, 14, and 7 days before each deadline.

For accountancy firms managing dozens or hundreds of clients, FineGuard provides a portfolio-level view of all upcoming deadlines, letting you prioritise and delegate work before time runs short. Our risk scan feature identifies companies approaching high-risk territory, while our Confirmation Statement and annual accounts trackers give you a single source of truth for the entire filing calendar. FineGuard users report a 94% reduction in near-miss penalty situations.`,
          },
        ].map((s) => (
          <div key={s.h2} style={{ marginBottom: 36 }}>
            <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{s.h2}</h2>
            {s.body.split("\n\n").map((para, i) => (
              <p key={i} style={{ color: C.textDim, fontSize: 15, lineHeight: 1.75, marginBottom: 12 }}>{para}</p>
            ))}
          </div>
        ))}

        {/* FAQ */}
        <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "18px 20px" }}>
              <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>Q: {faq.q}</p>
              <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.65, margin: 0 }}>A: {faq.a}</p>
            </div>
          ))}
        </div>

        <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}44`, borderRadius: 12, padding: 28, textAlign: "center" }}>
          <h3 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>Stop Penalties Before They Start</h3>
          <p style={{ color: C.textDim, fontSize: 14, margin: "0 0 20px" }}>FineGuard Pro monitors all your companies and alerts you weeks before any deadline. Start your free trial today.</p>
          <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Start Free Trial</button>
        </div>
      </div>
    </div>
  );
}
