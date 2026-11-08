import { beforeEach, describe, expect, it } from "vitest";
import { FakeDatabases } from "../helpers/fakeDatabases";
import { COLLECTIONS } from "@/lib/appwrite/collections";
import { checkSharedRateLimit } from "@/lib/security/sharedRateLimit";
import { seedDefaultsForUser } from "@/lib/appwrite/seedDefaults";
import { mockCategories } from "@/lib/data/mock";

type SeedDbs = Parameters<typeof seedDefaultsForUser>[0];
let db: FakeDatabases;
const shared = () => async () => db as unknown as Awaited<ReturnType<NonNullable<Parameters<typeof checkSharedRateLimit>[3]>>>;

beforeEach(() => {
  db = new FakeDatabases();
});

describe("rate limit bersama (R4)", () => {
  const now = Date.UTC(2026, 10, 8, 10, 0, 0);

  it("mengizinkan tepat sebanyak limit, termasuk saat paralel", async () => {
    const results = await Promise.all(Array.from({ length: 12 }, () => checkSharedRateLimit("login:1.2.3.4:a@b.c", 5, 60_000, shared(), now)));
    expect(results.filter((r) => r.allowed)).toHaveLength(5);
    expect(results.find((r) => !r.allowed)?.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("hitungan dibagi antar instance (dokumen yang sama)", async () => {
    for (let i = 0; i < 3; i++) await checkSharedRateLimit("k", 3, 60_000, shared(), now);
    expect((await checkSharedRateLimit("k", 3, 60_000, shared(), now)).allowed).toBe(false);
    expect(db.all(COLLECTIONS.RATE_LIMITS)).toHaveLength(1);
  });

  it("jendela baru → kembali diizinkan", async () => {
    for (let i = 0; i < 3; i++) await checkSharedRateLimit("k2", 3, 60_000, shared(), now);
    expect((await checkSharedRateLimit("k2", 3, 60_000, shared(), now + 60_000)).allowed).toBe(true);
  });

  it("Appwrite bermasalah → jatuh ke limiter memori, tidak memblokir login", async () => {
    db.failNext = () => true;
    expect((await checkSharedRateLimit("k3", 3, 60_000, shared(), now)).allowed).toBe(true);
  });
});

describe("seed data awal idempoten (R5)", () => {
  it("dipanggil dua kali (atau paralel) tetap satu set data", async () => {
    const dbs = db as unknown as SeedDbs;
    await Promise.all([seedDefaultsForUser(dbs, "u1"), seedDefaultsForUser(dbs, "u1")]);
    await seedDefaultsForUser(dbs, "u1");
    expect(db.all(COLLECTIONS.ACCOUNTS)).toHaveLength(1);
    expect(db.all(COLLECTIONS.CATEGORIES)).toHaveLength(mockCategories.length);
  });

  it("melanjutkan seed yang sempat gagal di tengah", async () => {
    const dbs = db as unknown as SeedDbs;
    let n = 0;
    db.failNext = (op, c) => op === "create" && c === COLLECTIONS.CATEGORIES && ++n === 3;
    await expect(seedDefaultsForUser(dbs, "u1")).rejects.toThrow();
    await seedDefaultsForUser(dbs, "u1");
    expect(db.all(COLLECTIONS.CATEGORIES)).toHaveLength(mockCategories.length);
  });

  it("pengguna berbeda mendapat data masing-masing", async () => {
    const dbs = db as unknown as SeedDbs;
    await seedDefaultsForUser(dbs, "u1");
    await seedDefaultsForUser(dbs, "u2");
    expect(db.all(COLLECTIONS.ACCOUNTS)).toHaveLength(2);
  });
});
