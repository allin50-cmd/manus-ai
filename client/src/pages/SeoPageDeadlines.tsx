const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const faqs = [
  { q: "When is the deadline to file annual accounts?", a: "For private limited companies, annual accounts must be filed at Companies House within 9 months of the financial year-end. For public limited companies (PLCs), this is within 6 months. First accounts after incorporation must be filed within 21 months of incorporation." },
  { q: "What is the deadline for a Confirmation Statement?", a: "A Confirmation Statement (CS01) must be filed at least once every 12 months. The due date is calculated from the date of the last Confirmation Statement or, for first filings, from the date of incorporation. You can file early, which resets the 12-month clock." },
  { q: "What happens if I miss the Companies House deadline?", a: "Missing a filing deadline triggers automatic late filing penalties. For annual accounts, these start at £150 for delays up to 1 month and escalate to £1,500 or more for delays over 6 months. If a company files late twice in a row, penalties are doubled. In extreme cases, Companies House may strike off the company." },
  { q: "Can filing deadlines be extended?", a: "Companies House may grant a deadline extension in specific circumstances, such as a public health emergency or circumstances beyond your control. Extensions must be applied for before the deadline expires. HMRC also offers Time to Pay arrangements for tax-related deadlines, but these must be agreed in advance." },
  { q: "How does FineGuard help with filing deadlines?", a: "FineGuard Pro monitors all statutory filing deadlines for your monitored companies and sends automated alerts 30, 14, and 7 days before each deadline. You receive alerts via email, SMS, and app notifications, ensuring you never miss a critical filing date." },
];

export default function SeoPageDeadlines() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <span style={{ background: C.accent + "22", color: C.accent, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4 }}>Companies House</span>
            <span style={{ background: C.green + "22", color: C.green, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4 }}>Guide</span>
          </div>
          <h1 style={{ color: C.text, fontSize: 36, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>Companies House Filing Deadlines: A Complete Guide for UK Directors and Accountants</h1>
          <p style={{ color: C.textDim, fontSize: 16, lineHeight: 1.7, margin: "0 0 20px" }}>
            Every UK limited company has statutory filing obligations with Companies House. Missing these deadlines results in financial penalties, reputational damage, and in serious cases, company strike-off. This guide explains every key deadline, how they are calculated, what the penalties are, and how modern compliance software like FineGuard Pro keeps you ahead of every obligation.
          </p>
          <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Last updated: October 2024 · 8 min read</p>
        </div>

        {/* Deadline summary table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 40 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.surfaceHover }}>
            <h2 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: 0 }}>Key Filing Deadlines at a Glance</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0d1629" }}>
                {["Filing", "Who Must File", "Deadline", "Penalty if Late"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Annual Accounts (AA)", "All limited companies", "9 months after FYE (private)", "£150–£1,500+"],
                ["Confirmation Statement (CS01)", "All limited companies", "Every 12 months", "Fine / prosecution"],
                ["Corporation Tax Return (CT600)", "All active companies", "12 months after AP end", "£100 automatic penalty"],
                ["VAT Return", "VAT-registered businesses", "1 month 7 days after period end", "Surcharge / points"],
                ["PAYE/RTI Full Payment Submission", "Employers", "On or before payday", "Automatic penalty"],
                ["Self Assessment (SA)", "Directors with income", "31 January (online)", "£100 automatic fine"],
              ].map(([filing, who, deadline, penalty]) => (
                <tr key={filing} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px", color: C.text, fontSize: 13, fontWeight: 500 }}>{filing}</td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 13 }}>{who}</td>
                  <td style={{ padding: "12px 16px", color: C.accent, fontSize: 13 }}>{deadline}</td>
                  <td style={{ padding: "12px 16px", color: C.red, fontSize: 13 }}>{penalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Article sections */}
        {[
          {
            h2: "Annual Accounts Deadline",
            body: `The annual accounts deadline is one of the most important filing obligations for any UK limited company. Private companies must file their annual accounts at Companies House within 9 months of their financial year-end. Public limited companies (PLCs) have a shorter window of just 6 months.

For a company with a financial year ending on 31 March, the accounts must be filed by 31 December of the same year. If a company misses this deadline, Companies House automatically imposes a late filing penalty. For private companies, this starts at £150 for accounts filed up to 1 month late and rises sharply — £375 for 1 to 3 months late, £750 for 3 to 6 months, and £1,500 for over 6 months late.

If a company is late filing two years in a row, all these penalties are automatically doubled. A company that persistently fails to file may ultimately be struck off the Companies House register, which can have serious consequences for directors and shareholders.`,
          },
          {
            h2: "Confirmation Statement Deadline",
            body: `Every UK limited company must file a Confirmation Statement (formerly the Annual Return) at Companies House at least once every 12 months. This filing confirms that the company's recorded information — including its registered address, directors, shareholders, and SIC codes — is up to date.

The confirmation date is typically the anniversary of the company's last Confirmation Statement or the date of incorporation for first filings. Companies can file their Confirmation Statement at any point during the 12-month period, and doing so early resets the 12-month clock.

Failing to file a Confirmation Statement on time is a criminal offence. Both the company and its directors can be prosecuted, and the company may be struck off the register. The government filing fee is £13 when filing online (free if no changes) or £40 by paper.`,
          },
          {
            h2: "How Deadlines Are Calculated",
            body: `Filing deadlines are not always on the same date each year. For annual accounts, the clock starts from the last day of the accounting reference period. If a company changes its accounting period, the deadlines shift accordingly. Companies House calculates deadlines based on exact calendar months, which means deadlines can fall on any day of the week.

For a company incorporated mid-year, the first set of accounts may cover an extended period of up to 18 months. In this case, the filing deadline is extended accordingly. Understanding how your deadline is calculated is essential — FineGuard Pro automatically tracks each company's individual deadline based on real Companies House data.`,
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "18px 20px" }}>
              <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>Q: {faq.q}</p>
              <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.65, margin: 0 }}>A: {faq.a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}44`, borderRadius: 12, padding: 28, textAlign: "center" }}>
          <h3 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>Never Miss a Filing Deadline Again</h3>
          <p style={{ color: C.textDim, fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
            FineGuard Pro monitors every filing deadline for every company you manage. Get automated alerts weeks before deadlines hit.
          </p>
          <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Start Free Trial</button>
        </div>
      </div>
    </div>
  );
}
