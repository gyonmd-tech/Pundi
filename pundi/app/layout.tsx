import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Pundi",
    default: "Pundi — Satu dashboard untuk semua arus keuanganmu",
  },
  description:
    "Pundi adalah dashboard manajemen keuangan pribadi yang menyatukan pencatatan transaksi, anggaran, arus kas, dan gambaran aset/investasi dalam satu tampilan yang rapi.",
  keywords: ["keuangan pribadi", "dashboard", "budgeting", "arus kas", "investasi"],
  authors: [{ name: "Rumah Design" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Fonts loaded via tokens.css @import */}
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
