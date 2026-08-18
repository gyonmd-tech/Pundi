/**
 * lib/db.ts
 * Placeholder / re-export untuk Appwrite databases.
 * (Sesuai ARCHITECTURE.md: Backend berpindah ke Appwrite, tidak memakai Prisma).
 */
export * from "./appwrite/collections";
export { createBrowserAppwriteClient } from "./appwrite/client";
export { createSessionServerClient, createAdminServerClient } from "./appwrite/server";
