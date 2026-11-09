import { AppShell } from "@/components/layout/AppShell";
import { loadAppBootstrap } from "@/lib/appwrite/bootstrap";

/**
 * Layout server: query Appwrite dimulai saat halaman diminta, paralel dengan
 * unduhan JS di ponsel. Promise-nya tidak ditunggu di sini — hasilnya di-stream
 * ke AppProvider, sehingga kerangka halaman tetap tampil seketika.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell bootstrap={loadAppBootstrap()}>{children}</AppShell>;
}
