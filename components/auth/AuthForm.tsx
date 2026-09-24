"use client";

import * as React from "react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import styles from "@/components/auth/AuthForm.module.css";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [activeMode, setActiveMode] = React.useState<AuthMode>(mode);
  const [moving, setMoving] = React.useState(false);

  React.useEffect(() => {
    function syncFromHistory() {
      const nextMode: AuthMode = window.location.pathname === "/signup" ? "signup" : "login";
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      setActiveMode(nextMode);
      setMoving(isDesktop);
    }

    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, []);

  function switchMode() {
    if (moving) return;

    const nextMode: AuthMode = activeMode === "login" ? "signup" : "login";
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

    setActiveMode(nextMode);
    setMoving(isDesktop);
    window.history.pushState(null, "", nextMode === "login" ? "/login" : "/signup");
  }

  return (
    <main className={styles.shell} data-mode={activeMode}>
      <div className={styles.formsGrid}>
        <AuthPanel mode="signup" active={activeMode === "signup"} onSwitch={switchMode} />
        <AuthPanel mode="login" active={activeMode === "login"} onSwitch={switchMode} />
      </div>

      <AuthVisualPanel
        mode={activeMode}
        moving={moving}
        onMotionEnd={() => setMoving(false)}
      />
    </main>
  );
}