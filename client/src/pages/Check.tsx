import React, { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

function StatusBadge({ status }: { status: string }) {
  const isActive = status.toLowerCase() === "active";
  return (
    <span
      style={{
        backgroundColor: isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)",
        color: isActive ? C.green : C.red,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

export default function Check() {
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const searchQuery = trpc.companies.search.useQuery(
    { q: searchTerm },
    { enabled: searchTerm.trim().length > 0 }
  );

  const results: Array<{
    companyNumber: string;
    companyName: string;
    companyStatus: string;
    dateOfCreation: string;
  }> = (searchQuery.data as typeof searchQuery.data & Array<{ companyNumber: string; companyName: string; companyStatus: string; dateOfCreation: string }>) ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchTerm(inputValue.trim());
  }

  return (
    <div
      style={{
        backgroundColor: C.bg,
        minHeight: "100vh",
        padding: "64px 24px",
        fontFamily: "system-ui, sans-serif",
        color: C.text,
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: "680px", margin: "0 auto", textAlign: "center", marginBottom: "48px" }}>
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            marginBottom: "12px",
          }}
        >
          Check Any UK Company
        </h1>
        <p style={{ color: C.textDim, fontSize: "16px" }}>
          Search any UK limited company by name or Companies House number
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: "680px", margin: "0 auto 48px", display: "flex", gap: "12px" }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Company name or number e.g. 12345678"
          style={{
            flex: 1,
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            padding: "14px 18px",
            color: C.text,
            fontSize: "15px",
            outline: "none",
          }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = C.accent)}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = C.border)}
        />
        <button
          type="submit"
          style={{
            backgroundColor: C.accent,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "14px 28px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Search
        </button>
      </form>

      {/* Results */}
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {searchQuery.isLoading && searchTerm && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                border: `3px solid ${C.border}`,
                borderTopColor: C.accent,
                borderRadius: "50%",
                margin: "0 auto 12px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: C.textDim, fontSize: "14px" }}>Searching Companies House…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {searchQuery.isError && (
          <div
            style={{
              backgroundColor: "rgba(239,68,68,0.08)",
              border: `1px solid rgba(239,68,68,0.2)`,
              borderRadius: "12px",
              padding: "20px 24px",
              color: C.red,
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            Failed to search. Please try again.
          </div>
        )}

        {!searchQuery.isLoading && searchTerm && results.length === 0 && !searchQuery.isError && (
          <div
            style={{
              backgroundColor: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              padding: "40px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
            <p style={{ color: C.textDim, fontSize: "15px" }}>
              No companies found for <strong style={{ color: C.text }}>"{searchTerm}"</strong>
            </p>
            <p style={{ color: C.textMuted, fontSize: "13px", marginTop: "8px" }}>
              Try searching by company number or check the spelling.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {results.map((company) => (
              <div
                key={company.companyNumber}
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700 }}>{company.companyName}</span>
                    <StatusBadge status={company.companyStatus} />
                  </div>
                  <div style={{ color: C.textMuted, fontSize: "12px" }}>
                    No. {company.companyNumber}
                    {company.dateOfCreation && (
                      <> · Incorporated {company.dateOfCreation}</>
                    )}
                  </div>
                </div>
                <Link
                  href={`/company/${company.companyNumber}`}
                  style={{
                    backgroundColor: C.accent,
                    color: "#fff",
                    padding: "9px 18px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  Monitor This Company
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Sign-in prompt */}
        <div style={{ marginTop: "48px", textAlign: "center" }}>
          <p style={{ color: C.textMuted, fontSize: "14px" }}>
            Already monitoring?{" "}
            <Link href="/dashboard" style={{ color: C.accent, textDecoration: "none", fontWeight: 500 }}>
              Sign in to your dashboard →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
