/**
 * scripts/setup-appwrite.ts
 * Skrip CLI otomasi untuk inisialisasi Database 'pundi-db', Collections, Attributes, dan Indexes di Appwrite.
 * Jalankan: npm run db:setup
 */

import { Client, Databases, Storage } from "node-appwrite";
import fs from "fs";
import path from "path";
import schema from "../appwrite.json";
import { applyAppwriteSchema } from "./lib/applyAppwriteSchema";

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

function normalizeEnvironmentValue(value: string | undefined, fallback = "") {
  let normalized = (value ?? fallback).trim();
  while (normalized.length >= 2) {
    const first = normalized.at(0);
    const last = normalized.at(-1);
    if (!((first === '"' && last === '"') || (first === "'" && last === "'"))) break;
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized || fallback;
}

const endpoint = normalizeEnvironmentValue(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT, "https://sgp.cloud.appwrite.io/v1").replace(/\/+$/, "");
const projectId = normalizeEnvironmentValue(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
const apiKey = normalizeEnvironmentValue(process.env.APPWRITE_API_KEY);
const databaseId = normalizeEnvironmentValue(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID, "pundi-db");

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
const storage = new Storage(client);

console.log(`\n🚀 Memulai inisialisasi database Appwrite pada project: ${projectId}...`);

applyAppwriteSchema({ databases, storage, databaseId, schema })
  .then((failures) => {
    if (failures.length > 0) {
      console.error(`\n✕ ${failures.length} bagian skema gagal dibuat:`);
      for (const failure of failures) console.error(`  - ${failure}`);
      console.error("Perbaiki appwrite.json (atau project Appwrite), lalu jalankan ulang npm run db:setup.\n");
      process.exit(1);
    }
    console.log(`\n🎉 Seluruh collection, atribut, index, dan bucket Appwrite sesuai skema.\n`);
  })
  .catch((e) => {
    console.error("Error during setup:", e);
    process.exit(1);
  });
