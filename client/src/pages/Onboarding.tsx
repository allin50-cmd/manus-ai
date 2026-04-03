import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/onboarding/welcome");
  }, [setLocation]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#0a0f1e",
        color: "#94a3b8",
        fontSize: "16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      Redirecting...
    </div>
  );
}
