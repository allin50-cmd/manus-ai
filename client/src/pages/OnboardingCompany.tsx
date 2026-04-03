import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  surfaceHover: "#1a2540",
  border: "#1e2d45",
  accent: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

const TOTAL_STEPS = 5;

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: "32px", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: C.textMuted,
          marginBottom: "8px",
        }}
      >
        <span>Step {step} of {TOTAL_STEPS}</span>
        <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
      </div>
      <div
        style={{
          height: "6px",
          background: C.border,
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(step / TOTAL_STEPS) * 100}%`,
            background: C.accent,
            borderRadius: "3px",
          }}
        />
      </div>
    </div>
  );
}

interface CompanyResult {
  company_number: string;
  title: string;
  company_status: string;
  date_of_creation?: string;
}

export default function OnboardingCompany() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selected, setSelected] = useState<CompanyResult | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { data: results, isLoading } = trpc.companies.search.useQuery(
    { q: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  function handleQueryChange(val: string) {
    setQuery(val);
    setSelected(null);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => setDebouncedQuery(val), 400);
    setDebounceTimer(timer);
  }

  function handleSelect(company: CompanyResult) {
    setSelected(company);
    setQuery(company.title);
  }

  function handleContinue() {
    const existing = JSON.parse(sessionStorage.getItem("fg_onboarding") || "{}");
    sessionStorage.setItem(
      "fg_onboarding",
      JSON.stringify({ ...existing, selectedCompany: selected })
    );
    setLocation("/onboarding/alerts");
  }

  const statusColor = (status: string) => {
    if (status === "active") return C.green;
    if (status === "dissolved") return C.red;
    return C.amber;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "16px",
          padding: "40px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              background: C.accent,
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            F
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>FineGuard Pro</span>
        </div>

        <ProgressBar step={2} />

        <h1 style={{ fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>
          Add Your First Company
        </h1>
        <p style={{ fontSize: "14px", color: C.textDim, marginBottom: "24px" }}>
          Search by company name or Companies House number.
        </p>

        {/* Search input */}
        <div style={{ position: "relative", marginBottom: "8px" }}>
          <input
            type="text"
            placeholder="e.g. Acme Ltd or 12345678"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: C.bg,
              border: `1px solid ${selected ? C.accent : C.border}`,
              borderRadius: "10px",
              color: C.text,
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {isLoading && (
            <span
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: C.textMuted,
              }}
            >
              Searching...
            </span>
          )}
        </div>

        {/* Results */}
        {!selected && debouncedQuery.length >= 2 && (results as CompanyResult[] | undefined) && (
          <div
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "16px",
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            {(results as CompanyResult[]).length === 0 ? (
              <div
                style={{ padding: "16px", textAlign: "center", color: C.textMuted, fontSize: "14px" }}
              >
                No companies found
              </div>
            ) : (
              (results as CompanyResult[]).map((company, i) => (
                <div
                  key={company.company_number}
                  onClick={() => handleSelect(company)}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderBottom:
                      i < (results as CompanyResult[]).length - 1
                        ? `1px solid ${C.border}`
                        : "none",
                    transition: "background 0.15s",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background = C.surfaceHover)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                  }
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: C.text }}>
                      {company.title}
                    </div>
                    <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>
                      #{company.company_number}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      background: `${statusColor(company.company_status)}20`,
                      color: statusColor(company.company_status),
                      textTransform: "capitalize",
                      fontWeight: 500,
                    }}
                  >
                    {company.company_status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Selected confirmation */}
        {selected && (
          <div
            style={{
              background: `${C.green}10`,
              border: `1px solid ${C.green}30`,
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span style={{ color: C.green, fontSize: "16px" }}>✓</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: C.text }}>
                {selected.title}
              </div>
              <div style={{ fontSize: "12px", color: C.textMuted }}>
                #{selected.company_number} · {selected.company_status}
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
          <button
            onClick={handleContinue}
            disabled={!selected}
            style={{
              width: "100%",
              padding: "13px",
              background: selected ? C.accent : C.border,
              border: "none",
              borderRadius: "10px",
              color: selected ? "#fff" : C.textMuted,
              fontSize: "15px",
              fontWeight: 600,
              cursor: selected ? "pointer" : "not-allowed",
              transition: "background 0.2s",
            }}
          >
            Continue →
          </button>
          <Link href="/onboarding/alerts">
            <button
              style={{
                width: "100%",
                padding: "11px",
                background: "none",
                border: "none",
                color: C.textMuted,
                fontSize: "13px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Skip for now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
