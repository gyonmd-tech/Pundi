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
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Terapkan tema & warna aksen dari cache sebelum hidrasi, supaya
            tidak ada kedipan (flash) warna terang saat halaman dimuat.
            Nilai sebenarnya (dari preferensi tersimpan) menyusul lewat
            ThemeEffect setelah data bootstrap dimuat. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pundi-theme-cache");if(t)document.documentElement.dataset.theme=t;var a=localStorage.getItem("pundi-accent-cache");var p={mint:["#1CB78C","#159B78","#0B6B54"],ember:["#EE7683","#E95766","#B83547"],lavender:["#9483DD","#7B61D1","#5E46B8"],cyan:["#25A6BE","#168AA0","#0F6B7B"]}[a];if(p){var r=document.documentElement.style;r.setProperty("--color-brand-500",p[0]);r.setProperty("--color-brand-600",p[1]);r.setProperty("--color-brand-700",p[2]);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${bricolage.variable} ${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
