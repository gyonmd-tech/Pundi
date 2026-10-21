# Architect — Index
[DISCOVERED]
- Rute app di `app/(app)/*` dengan layout bersama (sidebar desktop, bottom nav mobile, Header, RightSidebar/QuickAdd).
- Penjaga: `lib/penjaga/*` (service, tools MCP, directAgent, config), `components/penjaga/*`, provider global `PenjagaProvider` (chat state hanya di memori — hilang saat reload).
- Anggaran: `Budget` (period YYYY-MM, limitAmount bulanan, cadence daily/weekly/monthly, cadenceAmount, rollover) + `lib/utils/budgetPace.ts`.
- Kalkulator: `app/(app)/kalkulator` + `components/calculator/{MoneyCalculator,MoneyTools}` + `lib/utils/moneyMath.ts` (6 alat dalam tab).
- Landing: `app/page.tsx` + `components/landing/*`, video hero MP4 dari `video/` (Remotion).
