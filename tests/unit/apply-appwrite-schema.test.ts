import { describe, expect, it } from "vitest";
import schema from "../../appwrite.json";
import { applyAppwriteSchema, type AppwriteSchema, type SchemaDatabases, type SchemaStorage } from "../../scripts/lib/applyAppwriteSchema";
import { recordAuditLog } from "@/lib/appwrite/auditLog";

type FakeCollection = { attributes: { key: string; status: string }[]; indexes: { key: string; status: string }[] };

function appwriteError(code: number, message: string) {
  return Object.assign(new Error(message), { code });
}

/**
 * Appwrite tiruan secukupnya untuk skrip setup. Meniru dua perilaku asli yang
 * pernah membuat skema rusak diam-diam: atribut wajib tidak boleh punya default,
 * dan collection yang sudah penuh menolak atribut baru.
 */
function fakeAppwrite(initial: Record<string, FakeCollection> = {}, options: { full?: string[]; databaseError?: number } = {}) {
  const collections = new Map(Object.entries(initial));
  const created: string[] = [];
  const createAttribute = (collectionId: string, key: string, required: boolean, fallback: unknown) => {
    if (required && fallback !== undefined) throw appwriteError(400, "Cannot set default value for required attribute");
    if (options.full?.includes(collectionId)) throw appwriteError(400, "The maximum number or size of attributes has been reached.");
    collections.get(collectionId)!.attributes.push({ key, status: "available" });
    created.push(`${collectionId}.${key}`);
  };
  const databases: SchemaDatabases = {
    get: async () => {
      if (options.databaseError) throw appwriteError(options.databaseError, "Server error");
      return {};
    },
    create: async () => ({}),
    getCollection: async (_db, id) => {
      const collection = collections.get(id);
      if (!collection) throw appwriteError(404, "Collection not found");
      return collection;
    },
    createCollection: async (_db, id) => {
      collections.set(id, { attributes: [], indexes: [] });
      return {};
    },
    createStringAttribute: async (_db, col, key, _size, required, fallback) => createAttribute(col, key, required, fallback),
    createIntegerAttribute: async (_db, col, key, required, _min, _max, fallback) => createAttribute(col, key, required, fallback),
    createFloatAttribute: async (_db, col, key, required, _min, _max, fallback) => createAttribute(col, key, required, fallback),
    createBooleanAttribute: async (_db, col, key, required, fallback) => createAttribute(col, key, required, fallback),
    createDatetimeAttribute: async (_db, col, key, required, fallback) => createAttribute(col, key, required, fallback),
    createEnumAttribute: async (_db, col, key, _elements, required, fallback) => createAttribute(col, key, required, fallback),
    createIndex: async (_db, col, key) => {
      collections.get(col)!.indexes.push({ key, status: "available" });
      return {};
    },
  };
  const storage: SchemaStorage = {
    getBucket: async () => ({}),
    createBucket: async () => ({}),
  };
  return { databases, storage, created, collections };
}

const silent = () => undefined;
const schemaWith = (attributes: object[]): AppwriteSchema => ({
  databases: [{ collections: [{ $id: "logs", name: "logs", documentSecurity: true, enabled: true, attributes, indexes: [] }] }],
});

describe("applyAppwriteSchema (npm run db:setup)", () => {
  it("membuat seluruh skema appwrite.json di project kosong tanpa kegagalan", async () => {
    const fake = fakeAppwrite();
    const failures = await applyAppwriteSchema({ ...fake, databaseId: "pundi-db", schema, log: silent });
    expect(failures).toEqual([]);
    expect(fake.created).toContain("audit_logs.actor");
    expect(fake.created).toContain("rate_limits.key");
  });

  it("melaporkan atribut yang ditolak Appwrite alih-alih menelannya", async () => {
    const fake = fakeAppwrite();
    const failures = await applyAppwriteSchema({
      ...fake,
      databaseId: "db",
      schema: schemaWith([{ key: "actor", type: "string", size: 16, required: true, default: "user" }]),
      log: silent,
    });
    expect(failures).toEqual(["atribut logs.actor: Cannot set default value for required attribute"]);
  });

  it("melewati atribut & index yang sudah ada, termasuk di collection yang sudah penuh", async () => {
    const fake = fakeAppwrite(
      { logs: { attributes: [{ key: "content", status: "available" }], indexes: [{ key: "idx", status: "available" }] } },
      { full: ["logs"] },
    );
    const target = schemaWith([{ key: "content", type: "string", size: 100, required: true }]);
    target.databases[0].collections[0].indexes = [{ key: "idx", type: "key", attributes: ["content"] }];
    const failures = await applyAppwriteSchema({ ...fake, databaseId: "db", schema: target, log: silent });
    expect(failures).toEqual([]);
    expect(fake.created).toEqual([]);
  });

  it("melaporkan atribut yang ada tapi berstatus gagal di Appwrite", async () => {
    const fake = fakeAppwrite({ logs: { attributes: [{ key: "content", status: "failed" }], indexes: [] } });
    const failures = await applyAppwriteSchema({
      ...fake,
      databaseId: "db",
      schema: schemaWith([{ key: "content", type: "string", size: 100, required: true }]),
      log: silent,
    });
    expect(failures).toEqual(["atribut logs.content: ada di Appwrite dengan status 'failed'"]);
  });

  it("berhenti dengan kegagalan bila database tidak bisa diperiksa", async () => {
    const fake = fakeAppwrite({}, { databaseError: 500 });
    const failures = await applyAppwriteSchema({ ...fake, databaseId: "db", schema, log: silent });
    expect(failures).toEqual(["database db: Server error"]);
    expect(fake.collections.size).toBe(0);
  });
});

describe("recordAuditLog", () => {
  it("hanya mengirim field yang ada di skema audit_logs", async () => {
    const auditLogs = schema.databases[0].collections.find((collection) => collection.$id === "audit_logs")!;
    const known = new Set(auditLogs.attributes.map((attribute) => attribute.key));
    let sent: Record<string, unknown> = {};
    const databases = {
      createDocument: async (_db: string, _col: string, _id: string, data: Record<string, unknown>) => {
        sent = data;
        return {};
      },
    };
    await recordAuditLog(databases as never, "user-1", {
      entityType: "transaction", entityId: "trx-1", action: "create", actor: "agent", summary: "uji", before: { a: 1 }, after: { a: 2 },
    });
    expect(Object.keys(sent).length).toBeGreaterThan(0);
    expect(Object.keys(sent).filter((key) => !known.has(key))).toEqual([]);
  });
});
