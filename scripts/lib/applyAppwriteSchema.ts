/**
 * Menerapkan skema appwrite.json ke project Appwrite: membuat database,
 * collection, atribut, index, dan bucket yang belum ada. Tidak pernah mengubah
 * atau menghapus yang sudah ada.
 *
 * Mengembalikan daftar kegagalan. Pemanggil (scripts/setup-appwrite.ts) keluar
 * dengan kode 1 bila daftar ini tidak kosong, agar skema yang tidak terbentuk
 * tidak lolos diam-diam — seperti audit_logs.actor yang dulu ditolak Appwrite
 * (atribut wajib dengan default) tapi hanya dicatat sebagai info, sehingga
 * semua audit log gagal tersimpan di produksi.
 */

type AppwriteError = { code?: number; message?: string };
type Keyed = { key: string; status: string };

export interface SchemaDatabases {
  get(databaseId: string): Promise<unknown>;
  create(databaseId: string, name: string, enabled?: boolean): Promise<unknown>;
  getCollection(databaseId: string, collectionId: string): Promise<{ attributes: unknown[]; indexes: unknown[] }>;
  createCollection(databaseId: string, collectionId: string, name: string, permissions?: string[], documentSecurity?: boolean, enabled?: boolean): Promise<unknown>;
  createStringAttribute(...args: any[]): Promise<unknown>;
  createIntegerAttribute(...args: any[]): Promise<unknown>;
  createFloatAttribute(...args: any[]): Promise<unknown>;
  createBooleanAttribute(...args: any[]): Promise<unknown>;
  createDatetimeAttribute(...args: any[]): Promise<unknown>;
  createEnumAttribute(...args: any[]): Promise<unknown>;
  createIndex(...args: any[]): Promise<unknown>;
}

export interface SchemaStorage {
  getBucket(bucketId: string): Promise<unknown>;
  createBucket(params: any): Promise<unknown>;
}

export interface AppwriteSchema {
  databases: { collections: any[] }[];
  buckets?: any[];
}

export interface ApplySchemaOptions {
  databases: SchemaDatabases;
  storage: SchemaStorage;
  databaseId: string;
  schema: AppwriteSchema;
  log?: (message: string) => void;
}

const BROKEN_STATUSES = new Set(["failed", "stuck"]);

function errorOf(err: unknown): AppwriteError {
  return (err && typeof err === "object" ? err : { message: String(err) }) as AppwriteError;
}

export async function applyAppwriteSchema({ databases, storage, databaseId, schema, log = console.log }: ApplySchemaOptions): Promise<string[]> {
  const failures: string[] = [];
  const fail = (label: string, message = "tanpa pesan") => {
    failures.push(`${label}: ${message}`);
    log(`    ✕ ${label}: ${message}`);
  };

  // 1. Database
  try {
    await databases.get(databaseId);
    log(`✓ Database '${databaseId}' sudah ada.`);
  } catch (err) {
    const { code, message } = errorOf(err);
    if (code !== 404) {
      fail(`database ${databaseId}`, message);
      return failures; // tanpa database, langkah berikutnya pasti gagal
    }
    await databases.create(databaseId, databaseId, true);
    log(`✓ Berhasil membuat Database '${databaseId}'.`);
  }

  // 2. Collections, atribut, index
  for (const col of schema.databases[0]?.collections ?? []) {
    log(`\n📦 Memproses collection: ${col.name} (${col.$id})...`);
    let existingAttributes = new Map<string, string>();
    let existingIndexes = new Map<string, string>();

    try {
      const existing = await databases.getCollection(databaseId, col.$id);
      log(`  ✓ Collection '${col.name}' sudah ada.`);
      existingAttributes = new Map((existing.attributes as Keyed[]).map((attr) => [attr.key, attr.status]));
      existingIndexes = new Map((existing.indexes as Keyed[]).map((idx) => [idx.key, idx.status]));
    } catch (err) {
      const { code, message } = errorOf(err);
      if (code !== 404) {
        fail(`collection ${col.$id}`, message);
        continue;
      }
      // Collection-level permissions sengaja kosong ([]): akses ditentukan
      // per-dokumen (documentSecurity: true) lewat Permission.*(Role.user(userId))
      // yang diset saat createDocument di actions/*.ts.
      try {
        await databases.createCollection(databaseId, col.$id, col.name, [], col.documentSecurity, col.enabled);
        log(`  ✓ Berhasil membuat Collection '${col.name}'.`);
      } catch (createErr) {
        fail(`collection ${col.$id}`, errorOf(createErr).message);
        continue;
      }
    }

    for (const attr of col.attributes ?? []) {
      const label = `atribut ${col.$id}.${attr.key}`;
      const status = existingAttributes.get(attr.key);
      if (status) {
        if (BROKEN_STATUSES.has(status)) fail(label, `ada di Appwrite dengan status '${status}'`);
        continue;
      }
      const required = attr.required || false;
      const fallback = attr.default ?? undefined;
      const array = attr.array || false;
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(databaseId, col.$id, attr.key, attr.size || 255, required, fallback, array);
        } else if (attr.type === "integer") {
          await databases.createIntegerAttribute(databaseId, col.$id, attr.key, required, undefined, undefined, fallback, array);
        } else if (attr.type === "double") {
          await databases.createFloatAttribute(databaseId, col.$id, attr.key, required, undefined, undefined, fallback, array);
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(databaseId, col.$id, attr.key, required, fallback, array);
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(databaseId, col.$id, attr.key, required, fallback, array);
        } else if (attr.type === "enum" && attr.elements) {
          await databases.createEnumAttribute(databaseId, col.$id, attr.key, attr.elements, required, fallback, array);
        } else {
          fail(label, `tipe '${attr.type}' tidak didukung skrip setup`);
          continue;
        }
        log(`    + Attribute '${attr.key}' (${attr.type}) dibuat.`);
      } catch (err) {
        const { code, message } = errorOf(err);
        if (code !== 409) fail(label, message);
      }
    }

    for (const idx of col.indexes ?? []) {
      const label = `index ${col.$id}.${idx.key}`;
      const status = existingIndexes.get(idx.key);
      if (status) {
        if (BROKEN_STATUSES.has(status)) fail(label, `ada di Appwrite dengan status '${status}'`);
        continue;
      }
      try {
        await databases.createIndex(databaseId, col.$id, idx.key, idx.type, idx.attributes);
        log(`    + Index '${idx.key}' dibuat.`);
      } catch (err) {
        const { code, message } = errorOf(err);
        if (code !== 409) fail(label, message);
      }
    }
  }

  // 3. Storage buckets (mis. avatar profil)
  for (const bucket of schema.buckets ?? []) {
    log(`\n🪣 Memproses bucket: ${bucket.name} (${bucket.$id})...`);
    try {
      await storage.getBucket(bucket.$id);
      log(`  ✓ Bucket '${bucket.name}' sudah ada.`);
      continue;
    } catch (err) {
      const { code, message } = errorOf(err);
      if (code !== 404) {
        fail(`bucket ${bucket.$id}`, message);
        continue;
      }
    }
    try {
      await storage.createBucket({
        bucketId: bucket.$id,
        name: bucket.name,
        permissions: bucket.$permissions || [],
        fileSecurity: bucket.fileSecurity,
        enabled: bucket.enabled,
        maximumFileSize: bucket.maximumFileSize,
        allowedFileExtensions: bucket.allowedFileExtensions,
        compression: bucket.compression,
        encryption: bucket.encryption,
        antivirus: bucket.antivirus,
      });
      log(`  ✓ Berhasil membuat bucket '${bucket.name}'.`);
    } catch (err) {
      fail(`bucket ${bucket.$id}`, errorOf(err).message);
    }
  }

  return failures;
}
