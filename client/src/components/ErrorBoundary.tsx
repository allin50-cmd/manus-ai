import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary — catches render errors in the component tree and
 * displays a branded fallback UI instead of crashing the entire app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log to console in development; in production this could go to Sentry/AppInsights
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #050d1f 0%, #0a1a3a 100%)",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 520,
              width: "100%",
              background: "rgba(15, 25, 50, 0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: "48px 36px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Shield icon */}
            <div style={{ marginBottom: 20 }}>
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f87171"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1
              style={{
                color: "#f0f4ff",
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                color: "#94a3b8",
                fontSize: 14,
                lineHeight: 1.6,
                margin: "0 0 24px",
              }}
            >
              An unexpected error occurred. Our team has been notified.
              {this.state.error?.message && (
                <span
                  style={{
                    display: "block",
                    marginTop: 12,
                    padding: "8px 12px",
                    background: "rgba(248,113,113,0.08)",
                    border: "1px solid rgba(248,113,113,0.15)",
                    borderRadius: 8,
                    color: "#fca5a5",
                    fontSize: 12,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {this.state.error.message}
                </span>
              )}
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.opacity = "0.85")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.opacity = "1")
                }
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: "10px 24px",
                  background: "rgba(255,255,255,0.06)",
                  color: "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background =
                    "rgba(255,255,255,0.1)";
                  (e.target as HTMLElement).style.color = "#f0f4ff";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background =
                    "rgba(255,255,255,0.06)";
                  (e.target as HTMLElement).style.color = "#94a3b8";
                }}
              >
                Go Home
              </button>
            </div>

            <p
              style={{
                color: "#475569",
                fontSize: 11,
                marginTop: 24,
                letterSpacing: "0.02em",
              }}
            >
              FineGuard Pro &bull; Compliance Protection Platform
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
