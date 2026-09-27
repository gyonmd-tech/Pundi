import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", preload: true });

export const metadata: Metadata = {
  title: {
    template: "%s | Pundi",
    default: "Pundi — Satu dashboard untuk semua arus keuanganmu",
  },
  description:
    "Pundi adalah dashboard manajemen keuangan pribadi yang menyatukan pencatatan transaksi, anggaran, arus kas, dan gambaran aset/investasi dalam satu tampilan yang rapi.",
  keywords: ["keuangan pribadi", "dashboard", "budgeting", "arus kas", "investasi"],
  authors: [{ name: "Pundi" }],
  applicationName: "Pundi",
  icons: {
    icon: [
      { url: "/PUNDI-brand-assets/favicon.svg", type: "image/svg+xml" },
      { url: "/PUNDI-brand-assets/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/PUNDI-brand-assets/app-icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
