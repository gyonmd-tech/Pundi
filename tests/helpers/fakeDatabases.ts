/**
 * Fake Appwrite `Databases` dalam memori untuk test integrasi logika server.
 *
 * Setiap operasi menunggu satu "tick" (setTimeout 0) sebelum membaca/menulis,
 * sehingga operasi paralel benar-benar saling menyela — perilaku yang memicu
 * lost update pada pola baca-lalu-tulis. increment/decrement bersifat atomik,
 * seperti di Appwrite asli. createDocument dengan ID yang sudah ada → 409.
 */
type Doc = Record<string, unknown> & { $id: string; $createdAt: string; $updatedAt: string };

export class AppwriteLikeError extends Error {
  constructor(message: string, public code: number) {
    super(message);
  }
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
let counter = 0;

interface ParsedQuery { method: string; attribute?: string; values?: unknown[] }

export class FakeDatabases {
  collections = new Map<string, Map<string, Doc>>();
  /** Gagalkan operasi berikutnya yang cocok — untuk menguji rollback. */
  failNext: ((op: string, collectionId: string, documentId?: string) => boolean) | null = null;
  calls: { op: string; collectionId: string; documentId?: string }[] = [];

  private col(id: string) {
    if (!this.collections.has(id)) this.collections.set(id, new Map());
    return this.collections.get(id)!;
  }

  private maybeFail(op: string, collectionId: string, documentId?: string) {
    this.calls.push({ op, collectionId, documentId });
    if (this.failNext && this.failNext(op, collectionId, documentId)) {
      this.failNext = null;
      throw new AppwriteLikeError(`Simulasi gagal: ${op}`, 500);
    }
  }

  seed(collectionId: string, doc: Record<string, unknown> & { $id: string }) {
    const now = new Date().toISOString();
    this.col(collectionId).set(doc.$id, { $createdAt: now, $updatedAt: now, ...doc });
  }

  get(collectionId: string, id: string) {
    return this.col(collectionId).get(id);
  }

  all(collectionId: string) {
    return [...this.col(collectionId).values()];
  }

  async getDocument(_db: string, collectionId: string, documentId: string) {
    await tick();
    this.maybeFail("get", collectionId, documentId);
    const doc = this.col(collectionId).get(documentId);
    if (!doc) throw new AppwriteLikeError("Document not found", 404);
    return { ...doc };
  }

  async createDocument(_db: string, collectionId: string, documentId: string, data: Record<string, unknown>) {
    await tick();
    this.maybeFail("create", collectionId, documentId);
    const id = documentId === "unique()" ? `doc_${++counter}` : documentId;
    const store = this.col(collectionId);
    if (store.has(id)) throw new AppwriteLikeError("Document already exists", 409);
    const now = new Date().toISOString();
    const doc: Doc = { ...data, $id: id, $createdAt: now, $updatedAt: now };
    store.set(id, doc);
    return { ...doc };
  }

  async updateDocument(_db: string, collectionId: string, documentId: string, data: Record<string, unknown>) {
    await tick();
    this.maybeFail("update", collectionId, documentId);
    const doc = this.col(collectionId).get(documentId);
    if (!doc) throw new AppwriteLikeError("Document not found", 404);
    Object.assign(doc, data, { $updatedAt: new Date().toISOString() });
    return { ...doc };
  }

  async deleteDocument(_db: string, collectionId: string, documentId: string) {
    await tick();
    this.maybeFail("delete", collectionId, documentId);
    this.col(collectionId).delete(documentId);
    return {};
  }

  private async shift(params: { collectionId: string; documentId: string; attribute: string; value?: number; min?: number; max?: number }, sign: 1 | -1) {
    await tick();
    this.maybeFail(sign > 0 ? "increment" : "decrement", params.collectionId, params.documentId);
    const doc = this.col(params.collectionId).get(params.documentId);
    if (!doc) throw new AppwriteLikeError("Document not found", 404);
    const next = Number(doc[params.attribute] ?? 0) + sign * (params.value ?? 1);
    if (params.min != null && next < params.min) throw new AppwriteLikeError("Value below min", 400);
    if (params.max != null && next > params.max) throw new AppwriteLikeError("Value above max", 400);
    doc[params.attribute] = next;
    return { ...doc };
  }

  incrementDocumentAttribute(params: { databaseId: string; collectionId: string; documentId: string; attribute: string; value?: number; max?: number }) {
    return this.shift(params, 1);
  }

  decrementDocumentAttribute(params: { databaseId: string; collectionId: string; documentId: string; attribute: string; value?: number; min?: number }) {
    return this.shift(params, -1);
  }

  async listDocuments(_db: string, collectionId: string, queries: string[] = []) {
    await tick();
    this.maybeFail("list", collectionId);
    const parsed = queries.map((q) => JSON.parse(q) as ParsedQuery);
    let docs = [...this.col(collectionId).values()];
    for (const q of parsed) {
      if (q.method === "equal") docs = docs.filter((d) => (q.values ?? []).includes(d[q.attribute!]));
      if (q.method === "greaterThan") docs = docs.filter((d) => String(d[q.attribute!]) > String(q.values![0]));
      if (q.method === "lessThanEqual") docs = docs.filter((d) => String(d[q.attribute!]) <= String(q.values![0]));
    }
    const total = docs.length;
    const cursor = parsed.find((q) => q.method === "cursorAfter")?.values?.[0];
    if (cursor) docs = docs.slice(docs.findIndex((d) => d.$id === cursor) + 1);
    const limit = Number(parsed.find((q) => q.method === "limit")?.values?.[0] ?? 25);
    return { total, documents: docs.slice(0, limit).map((d) => ({ ...d })) };
  }
}
