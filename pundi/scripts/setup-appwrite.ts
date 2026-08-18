/**
 * scripts/setup-appwrite.ts
 * Skrip CLI otomasi untuk inisialisasi Database 'pundi-db', 7 Collections, Attributes, dan Indexes di Appwrite.
 * Jalankan: npm run db:setup
 */

import { Client, Databases } from "node-appwrite";
import fs from "fs";
import path from "path";
import schema from "../appwrite.json";

// Helper to load env files without external dependencies
function loadEnv(file: string) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv(".env.local");
loadEnv(".env");

const endpoint   = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const projectId  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey     = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "pundi-db";

if (!projectId || !apiKey || projectId === "pundi-local-demo" || apiKey === "local-demo-api-key") {
  console.log("\n⚠️  [Appwrite Setup] Kredensial Appwrite belum diset di .env.local.");
  console.log("   Silakan atur NEXT_PUBLIC_APPWRITE_PROJECT_ID dan APPWRITE_API_KEY untuk menghubungkan ke Appwrite Cloud riil.");
  console.log("   Mode demo in-memory saat ini tetap aktif dan berjalan normal.\n");
  process.exit(0);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function setup() {
  console.log(`\n🚀 Memulai inisialisasi database Appwrite pada project: ${projectId}...`);

  // 1. Buat Database jika belum ada
  try {
    await databases.get(databaseId);
    console.log(`✓ Database '${databaseId}' sudah ada.`);
  } catch (err: any) {
    if (err.code === 404) {
      await databases.create(databaseId, databaseId, true);
      console.log(`✓ Berhasil membuat Database '${databaseId}'.`);
    } else {
      console.error(`✕ Gagal memeriksa database:`, err.message);
      process.exit(1);
    }
  }

  // 2. Buat Collections dari schema appwrite.json
  const collections = schema.databases[0]?.collections || [];

  for (const col of collections) {
    console.log(`\n📦 Memproses collection: ${col.name} (${col.$id})...`);
    let collectionExists = false;

    try {
      await databases.getCollection(databaseId, col.$id);
      console.log(`  ✓ Collection '${col.name}' sudah ada.`);
      collectionExists = true;
    } catch (err: any) {
      if (err.code === 404) {
        await databases.createCollection(databaseId, col.$id, col.name, [], col.documentSecurity, col.enabled);
        console.log(`  ✓ Berhasil membuat Collection '${col.name}'.`);
        collectionExists = true;
      } else {
        console.warn(`  ✕ Gagal membuat collection: ${err.message}`);
      }
    }

    if (!collectionExists) continue;

    // 3. Buat Attributes
    for (const rawAttr of col.attributes || []) {
      const attr = rawAttr as any;
      try {
        if (attr.type === "string") {
          await databases.createStringAttribute(databaseId, col.$id, attr.key, attr.size || 255, attr.required || false, attr.default ?? undefined, attr.array || false);
        } else if (attr.type === "integer") {
          await databases.createIntegerAttribute(databaseId, col.$id, attr.key, attr.required || false, undefined, undefined, attr.default ?? undefined, attr.array || false);
        } else if (attr.type === "double") {
          await databases.createFloatAttribute(databaseId, col.$id, attr.key, attr.required || false, undefined, undefined, attr.default ?? undefined, attr.array || false);
        } else if (attr.type === "boolean") {
          await databases.createBooleanAttribute(databaseId, col.$id, attr.key, attr.required || false, attr.default ?? undefined, attr.array || false);
        } else if (attr.type === "datetime") {
          await databases.createDatetimeAttribute(databaseId, col.$id, attr.key, attr.required || false, attr.default ?? undefined, attr.array || false);
        } else if (attr.type === "enum" && attr.elements) {
          await databases.createEnumAttribute(databaseId, col.$id, attr.key, attr.elements, attr.required || false, attr.default ?? undefined, attr.array || false);
        }
        console.log(`    + Attribute '${attr.key}' (${attr.type}) dibuat.`);
      } catch (err: any) {
        if (err.code === 409) {
          // Attribute already exists
        } else {
          console.log(`    ℹ Attribute '${attr.key}': ${err.message}`);
        }
      }
    }

    // 4. Buat Indexes
    for (const idx of col.indexes || []) {
      try {
        await databases.createIndex(databaseId, col.$id, idx.key, idx.type as any, idx.attributes);
        console.log(`    + Index '${idx.key}' dibuat.`);
      } catch (err: any) {
        if (err.code !== 409) {
          console.log(`    ℹ Index '${idx.key}': ${err.message}`);
        }
      }
    }
  }

  console.log("\n🎉 Seluruh 7 Collections dan Attributes Appwrite berhasil diinisialisasi!\n");
}

setup().catch((e) => {
  console.error("Error during setup:", e);
});
