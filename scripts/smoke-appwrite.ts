/**
 * scripts/smoke-appwrite.ts — uji asap terhadap Appwrite ASLI.
 *
 *   npm run test:appwrite
 *
 * Membuktikan di project Appwrite-mu (bukan database tiruan) bahwa:
 *   1. increment/decrement atomik tersedia (Appwrite ≥ 1.7) dan saldo tepat
 *      setelah 20 transaksi paralel;
 *   2. transaksi berulang tidak dobel saat dua pemuatan berjalan bersamaan;
 *   3. rate limit bersama bekerja (koleksi `rate_limits` — perlu `npm run db:setup`).
 *
 * Membuat pengguna sementara `smoke-<waktu>@pundi.test` beserta datanya, lalu
 * MENGHAPUS semuanya di akhir (juga saat gagal). Data pengguna lain tidak
 * disentuh. Butuh .env.local berisi kredensial Appwrite (lihat .env.example).
 */
import fs from "fs";
import path from "path";

function loadEnv(file: string) {
  const envPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match || line.trim().startsWith("#")) continue;
    const value = (match[2] || "").replace(/^(['"])(.*)\1$/, "$2");
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}
loadEnv(".env.local");
loadEnv(".env");

async function main() {
  // Impor setelah env dimuat — modul config membaca env saat diimpor.
  const { ID, Query } = await import("node-appwrite");
  const { createAdminServerClient } = await import("@/lib/appwrite/server");
  const { COLLECTIONS, DATABASE_ID } = await import("@/lib/appwrite/collections");
  const { createTransactionForUser } = await import("@/lib/appwrite/transactionService");
  const { generateDueRecurringTransactions } = await import("@/lib/appwrite/recurringGenerator");
  const { checkSharedRateLimit, rateLimitDocumentId } = await import("@/lib/security/sharedRateLimit");
  const { listAllDocuments } = await import("@/lib/appwrite/pagination");

  const { databases, users } = await createAdminServerClient();
  const userId = ID.unique();
  const created: [string, string][] = [];
  let failures = 0;
  const check = (label: string, ok: boolean, detail = "") => {
    console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
    if (!ok) failures += 1;
  };

  await users.create({ userId, email: `smoke-${Date.now()}@pundi.test`, password: ID.unique() + "Aa1!", name: "Smoke Test" });
  console.log(`Pengguna sementara dibuat: ${userId}`);

  try {
    const account = await databases.createDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, ID.unique(), {
      userId, name: "Smoke", type: "bank", balance: 1_000_000, colorTag: "#2459DE", isActive: true,
    });
    created.push([COLLECTIONS.ACCOUNTS, account.$id]);

    // 1. Saldo atomik dengan 20 transaksi paralel.
    await Promise.all(Array.from({ length: 20 }, () =>
      createTransactionForUser(databases, userId, { accountId: account.$id, type: "expense", amount: 1_000, date: new Date(), tags: [] }),
    ));
    const after = await databases.getDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, account.$id);
    check("Saldo tepat setelah 20 pengeluaran paralel", Number(after.balance) === 980_000, `saldo ${after.balance}, harapan 980000`);

    // 2. Transaksi berulang: dua pemuatan bersamaan.
    const start = new Date(Date.now() - 40 * 86_400_000);
    const rule = await databases.createDocument(DATABASE_ID, COLLECTIONS.RECURRING_RULES, ID.unique(), {
      userId, accountId: account.$id, type: "expense", amount: 10_000, frequency: "weekly",
      startDate: start.toISOString(), nextOccurrence: start.toISOString(), isActive: true,
    });
    created.push([COLLECTIONS.RECURRING_RULES, rule.$id]);
    await Promise.all([
      generateDueRecurringTransactions(databases, userId, [rule]),
      generateDueRecurringTransactions(databases, userId, [rule]),
    ]);
    const recurring = await listAllDocuments(databases, COLLECTIONS.TRANSACTIONS, [Query.equal("userId", userId), Query.equal("recordKind", "recurring")]);
    const finalAccount = await databases.getDocument(DATABASE_ID, COLLECTIONS.ACCOUNTS, account.$id);
    check("Transaksi berulang tidak dobel", recurring.length === 6, `${recurring.length} transaksi, harapan 6 (mingguan selama 40 hari)`);
    check("Saldo terpotong sekali per kejadian", Number(finalAccount.balance) === 980_000 - recurring.length * 10_000, `saldo ${finalAccount.balance}`);

    // 3. Rate limit bersama.
    const key = `smoke:${userId}`;
    const results = await Promise.all(Array.from({ length: 8 }, () => checkSharedRateLimit(key, 5, 60_000)));
    const allowed = results.filter((result) => result.allowed).length;
    created.push([COLLECTIONS.RATE_LIMITS, rateLimitDocumentId(key, Math.floor(Date.now() / 60_000) * 60_000)]);
    check("Rate limit bersama (koleksi rate_limits)", allowed === 5, `${allowed} dari 8 diizinkan, harapan 5${allowed === 8 ? " — koleksi belum ada? jalankan npm run db:setup" : ""}`);
  } finally {
    const leftovers = await Promise.all([COLLECTIONS.TRANSACTIONS, COLLECTIONS.AUDIT_LOGS].map(async (collectionId) =>
      (await listAllDocuments(databases, collectionId, [Query.equal("userId", userId)])).map((doc) => [collectionId, doc.$id] as [string, string]),
    ));
    for (const [collectionId, id] of [...leftovers.flat(), ...created]) {
      await databases.deleteDocument(DATABASE_ID, collectionId, id).catch(() => undefined);
    }
    await users.delete({ userId }).catch(() => undefined);
    console.log("Data uji dibersihkan.");
  }

  if (failures > 0) {
    console.error(`\n${failures} pemeriksaan gagal.`);
    process.exit(1);
  }
  console.log("\nSemua pemeriksaan lolos di Appwrite asli.");
}

main().catch((error) => {
  console.error("Uji asap gagal dijalankan:", error instanceof Error ? error.message : error);
  process.exit(1);
});
