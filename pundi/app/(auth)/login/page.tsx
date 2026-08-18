import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Masuk ke Pundi",
};

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--color-paper)" }}
    >
      <div
        className="w-full max-w-sm rounded-card border p-8"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-rule)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "var(--color-pine)" }}
          >
            <span
              className="font-display font-bold text-white text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              P
            </span>
          </div>
          <h1
            className="text-heading font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Masuk ke Pundi
          </h1>
          <p
            className="text-small mt-1"
            style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-ui)" }}
          >
            Dashboard keuangan pribadi
          </p>
        </div>

        {/* Demo CTA */}
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-card text-body font-medium mb-4 transition-colors"
          style={{
            backgroundColor: "var(--color-pine)",
            color: "white",
            fontFamily: "var(--font-ui)",
          }}
        >
          Coba Demo (tanpa daftar)
        </Link>

        <div
          className="flex items-center gap-3 mb-4"
        >
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-rule)" }} />
          <span className="text-small" style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-ui)" }}>atau</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--color-rule)" }} />
        </div>

        {/* Form placeholder */}
        <div className="space-y-3">
          <div>
            <label
              className="block text-small font-medium mb-1.5"
              style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink)" }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="kamu@email.com"
              className="w-full px-3 py-2.5 rounded-card border text-body outline-none transition-all"
              style={{
                borderColor: "var(--color-rule)",
                backgroundColor: "var(--color-paper)",
                fontFamily: "var(--font-ui)",
                color: "var(--color-ink)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-small font-medium mb-1.5"
              style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink)" }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-card border text-body outline-none transition-all"
              style={{
                borderColor: "var(--color-rule)",
                backgroundColor: "var(--color-paper)",
                fontFamily: "var(--font-ui)",
                color: "var(--color-ink)",
              }}
            />
          </div>
          <button
            className="w-full py-3 rounded-card text-body font-medium border transition-colors"
            style={{
              borderColor: "var(--color-rule)",
              backgroundColor: "var(--color-surface)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-ui)",
            }}
          >
            Masuk
          </button>
        </div>

        <p
          className="text-small text-center mt-4"
          style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink-muted)" }}
        >
          Belum punya akun?{" "}
          <Link href="/signup" style={{ color: "var(--color-pine)" }}>
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
