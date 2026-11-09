import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeDatabases } from "../helpers/fakeDatabases";
import { COLLECTIONS } from "@/lib/appwrite/collections";
import { DEFAULT_PREFERENCES, type Insight } from "@/lib/data/mock";

const mocks = vi.hoisted(() => ({
  user: null as null | { id: string; name: string; email: string; isDemo: boolean },
  databases: null as unknown,
  generateInsights: vi.fn(),
}));

vi.mock("@/actions/auth", () => ({ getAuthUserAction: async () => mocks.user }));
vi.mock("@/actions/preferences", () => ({ getPreferencesAction: async () => DEFAULT_PREFERENCES }));
vi.mock("@/lib/appwrite/server", () => ({ createAdminServerClient: async () => ({ databases: mocks.databases }) }));
vi.mock("@/lib/appwrite/insightGenerator", () => ({ generateInsights: mocks.generateInsights }));

const { loadAppBootstrap } = await import("@/lib/appwrite/bootstrap");

const insight = (id: string): Insight => ({ id, type: "tip", message: id, isRead: false, createdAt: new Date() });

beforeEach(() => {
  const db = new FakeDatabases();
  db.seed(COLLECTIONS.ACCOUNTS, { $id: "bank", userId: "u1", name: "Bank", type: "bank", balance: 1_000, isActive: true });
  db.seed(COLLECTIONS.CATEGORIES, { $id: "food", userId: "u1", name: "Makan", type: "expense" });
  mocks.databases = db;
  mocks.user = { id: "u1", name: "Uji", email: "uji@pundi.test", isDemo: false };
  mocks.generateInsights.mockReset();
});

describe("loadAppBootstrap (data awal di-stream dari layout server)", () => {
  it("data awal tidak menunggu pembuatan insight baru", async () => {
    let finishInsights!: (value: Insight[]) => void;
    mocks.generateInsights.mockReturnValue(new Promise<Insight[]>((resolve) => { finishInsights = resolve; }));

    const { result, newInsights } = loadAppBootstrap();
    const data = await result; // akan menggantung bila result menunggu insight
    expect(data.mode).toBe("cloud");
    expect(data.error).toBeUndefined();
    expect(data.data.accounts.map((account) => account.id)).toEqual(["bank"]);

    finishInsights([insight("baru")]);
    expect((await newInsights).map((item) => item.id)).toEqual(["baru"]);
    expect(mocks.generateInsights).toHaveBeenCalledWith(mocks.databases, "u1", expect.objectContaining({ categories: expect.any(Array) }), []);
  });

  it("gagal membuat insight tidak membuat aplikasi error", async () => {
    mocks.generateInsights.mockRejectedValue(new Error("Appwrite down"));
    const { result, newInsights } = loadAppBootstrap();
    expect((await result).error).toBeUndefined();
    expect(await newInsights).toEqual([]);
  });

  it("tamu & demo memakai data contoh tanpa membuat insight", async () => {
    mocks.user = null;
    const guest = loadAppBootstrap();
    expect((await guest.result).mode).toBe("guest");
    expect(await guest.newInsights).toEqual([]);

    mocks.user = { id: "demo-user-1", name: "Sarah Dewi", email: "demo@pundi.id", isDemo: true };
    const demo = loadAppBootstrap();
    expect((await demo.result).mode).toBe("demo");
    expect(await demo.newInsights).toEqual([]);
    expect(mocks.generateInsights).not.toHaveBeenCalled();
  });

  it("kegagalan memuat data cloud dilaporkan tanpa menggantungkan insight", async () => {
    mocks.databases = { listDocuments: async () => { throw new Error("koneksi putus"); } };
    const { result, newInsights } = loadAppBootstrap();
    expect((await result).error).toBe("koneksi putus");
    expect(await newInsights).toEqual([]);
  });
});
