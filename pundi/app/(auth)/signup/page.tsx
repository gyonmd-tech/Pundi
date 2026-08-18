import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Daftar Pundi",
};

export default function SignupPage() {
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
              className="font-bold text-white text-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              P
            </span>
          </div>
          <h1
            className="text-heading font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Buat Akun Pundi
          </h1>
          <p
            className="text-small mt-1"
            style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-ui)" }}
          >
            Atau{" "}
            <Link href="/dashboard" style={{ color: "var(--color-pine)" }}>
              langsung coba demo
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label
              className="block text-small font-medium mb-1.5"
              style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink)" }}
            >
              Nama
            </label>
            <input
              type="text"
              placeholder="Nama lengkap"
              className="w-full px-3 py-2.5 rounded-card border text-body outline-none"
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
              Email
            </label>
            <input
              type="email"
              placeholder="kamu@email.com"
              className="w-full px-3 py-2.5 rounded-card border text-body outline-none"
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
              placeholder="Minimal 8 karakter"
              className="w-full px-3 py-2.5 rounded-card border text-body outline-none"
              style={{
                borderColor: "var(--color-rule)",
                backgroundColor: "var(--color-paper)",
                fontFamily: "var(--font-ui)",
                color: "var(--color-ink)",
              }}
            />
          </div>
          <button
            className="w-full py-3 rounded-card text-body font-medium"
            style={{
              backgroundColor: "var(--color-pine)",
              color: "white",
              fontFamily: "var(--font-ui)",
            }}
          >
            Buat Akun
          </button>
        </div>

        <p
          className="text-small text-center mt-4"
          style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink-muted)" }}
        >
          Sudah punya akun?{" "}
          <Link href="/login" style={{ color: "var(--color-pine)" }}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
