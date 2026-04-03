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
  const isActive = status?.toLowerCase() === "active";
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

export default function CompanySearch() {
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const searchQuery = trpc.companies.search.useQuery(
    { q: searchTerm },
    { enabled: searchTerm.trim().length > 0 }
  );

  const addMutation = trpc.companies.addCompany.useMutation({
    onSuccess: (_data, variables) => {
      setSavedIds((prev) => new Set([...prev, variables.companyNumber]));
      setSavingId(null);
    },
    onError: () => {
      setSavingId(null);
    },
  });

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

  function handleSaveToPortfolio(company: { companyNumber: string; companyName: string }) {
    setSavingId(company.companyNumber);
    addMutation.mutate({ companyNumber: company.companyNumber });
  }

  return (
    <div
      style={{
        backgroundColor: C.bg,
        minHeight: "100vh",
        padding: "32px",
        fontFamily: "system-ui, sans-serif",
        color: C.text,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "4px" }}>
          Company Search
        </h1>
        <p style={{ color: C.textMuted, fontSize: "13px" }}>
          Search any UK limited company and add it to your monitoring portfolio
        </p>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "12px", marginBottom: "32px", maxWidth: "680px" }}
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
            padding: "13px 18px",
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
            padding: "13px 28px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Search
        </button>
      </form>

      {/* Loading */}
      {searchQuery.isLoading && searchTerm && (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
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

      {/* Error */}
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
            maxWidth: "680px",
          }}
        >
          Search failed. Please try again.
        </div>
      )}

      {/* No results */}
      {!searchQuery.isLoading && searchTerm && results.length === 0 && !searchQuery.isError && (
        <div
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "48px 24px",
            textAlign: "center",
            maxWidth: "680px",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <p style={{ color: C.textDim, fontSize: "15px" }}>
            No companies found for <strong style={{ color: C.text }}>"{searchTerm}"</strong>
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "800px" }}>
          <p style={{ color: C.textMuted, fontSize: "13px", marginBottom: "4px" }}>
            {results.length} result{results.length !== 1 ? "s" : ""} for "{searchTerm}"
          </p>
          {results.map((company) => {
            const isSaved = savedIds.has(company.companyNumber);
            const isSaving = savingId === company.companyNumber;
            return (
              <div
                key={company.companyNumber}
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${isSaved ? C.green : C.border}`,
                  borderRadius: "12px",
                  padding: "20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <Link
                      href={`/company/${company.companyNumber}`}
                      style={{ fontSize: "15px", fontWeight: 700, color: C.text, textDecoration: "none" }}
                    >
                      {company.companyName}
                    </Link>
                    <StatusBadge status={company.companyStatus} />
                  </div>
                  <div style={{ color: C.textMuted, fontSize: "12px" }}>
                    No. {company.companyNumber}
                    {company.dateOfCreation && <> · Incorporated {company.dateOfCreation}</>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <Link
                    href={`/company/${company.companyNumber}`}
                    style={{
                      color: C.textDim,
                      fontSize: "13px",
                      textDecoration: "none",
                      padding: "8px 14px",
                      border: `1px solid ${C.border}`,
                      borderRadius: "7px",
                    }}
                  >
                    View
                  </Link>
                  <button
                    disabled={isSaved || isSaving}
                    onClick={() => handleSaveToPortfolio(company)}
                    style={{
                      backgroundColor: isSaved ? "rgba(34,197,94,0.12)" : C.accent,
                      color: isSaved ? C.green : "#fff",
                      border: isSaved ? `1px solid rgba(34,197,94,0.3)` : "none",
                      padding: "8px 16px",
                      borderRadius: "7px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: isSaved || isSaving ? "default" : "pointer",
                      opacity: isSaving ? 0.7 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isSaved ? "✓ Saved" : isSaving ? "Saving…" : "Save to Portfolio"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Link to monitored companies */}
      {savedIds.size > 0 && (
        <div style={{ marginTop: "24px" }}>
          <Link
            href="/monitored"
            style={{ color: C.accent, fontSize: "14px", textDecoration: "none", fontWeight: 500 }}
          >
            View your monitored companies ({savedIds.size} added this session) →
          </Link>
        </div>
      )}
    </div>
  );
}
