/**
 * MarketingBreadcrumb — dark-navy breadcrumb bar for public marketing pages.
 *
 * Usage:
 *   <MarketingBreadcrumb crumbs={[
 *     { label: "Home", href: "/" },
 *     { label: "Check Your Company Deadlines" },   // last item — no href
 *   ]} />
 *
 * Also injects JSON-LD BreadcrumbList structured data for Google.
 */
import React from "react";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
}

const C = {
  bg: "rgba(5,13,31,0.60)",
  border: "rgba(255,255,255,0.07)",
  textDim: "#64748b",
  textMuted: "#94a3b8",
  text: "#f0f4ff",
};

export function MarketingBreadcrumb({ crumbs }: Props) {
  // Build JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `https://fineguardpro.com${crumb.href}` } : {}),
    })),
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visual breadcrumb bar */}
      <div
        style={{
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          padding: "0 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            height: 36,
            flexWrap: "wrap",
          }}
        >
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <React.Fragment key={i}>
                {i > 0 && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                    style={{ flexShrink: 0 }}
                  >
                    <path
                      d="M4 2l4 4-4 4"
                      stroke={C.textDim}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {isLast || !crumb.href ? (
                  <span
                    style={{
                      color: isLast ? C.textMuted : C.textDim,
                      fontSize: 12,
                      fontWeight: isLast ? 500 : 400,
                      whiteSpace: "nowrap",
                    }}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <a
                    href={crumb.href}
                    style={{
                      color: C.textDim,
                      fontSize: 12,
                      fontWeight: 400,
                      textDecoration: "none",
                      transition: "color 0.12s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = C.textMuted)
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = C.textDim)
                    }
                  >
                    {crumb.label}
                  </a>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
}
