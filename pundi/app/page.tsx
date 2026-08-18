import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pundi — Satu dashboard untuk semua arus keuanganmu",
  description:
    "Pundi menyatukan pencatatan transaksi, anggaran, arus kas, dan investasi dalam satu tampilan yang rapi dan mudah dibaca.",
};

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-paper)", fontFamily: "var(--font-ui)" }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}
      >
        <span
          className="font-display font-semibold text-heading"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          Pundi
        </span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-small font-medium px-3 py-1.5 rounded-card border transition-colors"
            style={{
              borderColor: "var(--color-rule)",
              color: "var(--color-ink-muted)",
            }}
          >
            Masuk
          </Link>
          <Link
            href="/dashboard"
            className="text-small font-medium px-4 py-1.5 rounded-card transition-colors"
            style={{
              backgroundColor: "var(--color-pine)",
              color: "white",
            }}
          >
            Coba Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6"
          style={{
            borderColor: "var(--color-rule)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--color-pine)" }}
          />
          <span
            className="text-small font-medium"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Portfolio Demo — Data Sintetis
          </span>
        </div>

        <h1
          className="text-display-l font-semibold mb-4 max-w-2xl"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-ink)",
            lineHeight: "var(--leading-display-l)",
          }}
        >
          Satu dashboard untuk semua arus keuanganmu.
        </h1>

        <p
          className="text-body mb-8 max-w-md"
          style={{
            color: "var(--color-ink-muted)",
            lineHeight: "var(--leading-body)",
          }}
        >
          Pundi menyatukan pencatatan transaksi, anggaran bulanan, arus kas,
          dan gambaran aset dalam satu tampilan yang tenang dan mudah dibaca.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-card text-body font-medium transition-colors"
            style={{ backgroundColor: "var(--color-pine)", color: "white" }}
          >
            Lihat Demo Dashboard
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 rounded-card text-body font-medium border transition-colors"
            style={{
              borderColor: "var(--color-rule)",
              color: "var(--color-ink)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            Buat Akun
          </Link>
        </div>

        {/* Demo disclaimer */}
        <p
          className="text-small mt-6"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Demo menggunakan data sintetis. Tidak ada data finansial nyata yang disimpan.
        </p>
      </section>

      {/* Feature highlights */}
      <section
        className="border-t px-6 py-12"
        style={{ borderColor: "var(--color-rule)", backgroundColor: "var(--color-surface)" }}
      >
        <div className="max-w-container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Budgeting Real-time",
              desc: "Pantau anggaran bulanan per kategori. Dapat notifikasi saat mendekati atau melewati batas.",
            },
            {
              title: "Arus Kas Visual",
              desc: "Grafik arus kas 6 bulan terakhir dengan signature Ledger Baseline — desain yang presisi seperti buku kas.",
            },
            {
              title: "Overview Aset & Goal",
              desc: "Pantau net worth dan kemajuan tujuan tabungan dalam satu tampilan terpadu.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-card border"
              style={{ borderColor: "var(--color-rule)" }}
            >
              <div
                className="w-8 h-1 rounded-full mb-4"
                style={{ backgroundColor: "var(--color-pine)" }}
              />
              <h3
                className="text-heading font-medium mb-2"
                style={{ fontFamily: "var(--font-ui)", color: "var(--color-ink)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-body"
                style={{ color: "var(--color-ink-muted)", lineHeight: "var(--leading-body)" }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-4 border-t text-center"
        style={{ borderColor: "var(--color-rule)" }}
      >
        <p
          className="text-small"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Pundi · Portfolio project by{" "}
          <span style={{ color: "var(--color-ink)" }}>Rumah Design</span>
        </p>
      </footer>
    </main>
  );
}
