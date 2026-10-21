# CTO — Index
[DISCOVERED] Stack: Next.js 16.3 (App Router, Turbopack), React 19.2, Tailwind v4, Appwrite (DB + auth, admin key di server), Vercel hosting, Capacitor 8 (WebView memuat situs produksi), Remotion 4 (proyek terpisah di `video/`).
[DISCOVERED] Arsitektur: monolit Next.js; Server Actions untuk mutasi; state klien di `lib/data/store.tsx` (reducer + bootstrap action); mode demo/guest tanpa Appwrite.
[DISCOVERED] AI: Penjaga (Hermes MCP `/api/mcp` + chat `/api/penjaga/chat` dengan mesin Hermes atau LLM langsung — produksi memakai Groq `openai/gpt-oss-120b`).

Fitur aktif: `design-revamp` (lihat file per fitur).
