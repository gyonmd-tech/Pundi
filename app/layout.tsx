import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  preload: true,
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  preload: true,
});

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
      <body className={`${bricolage.variable} ${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
