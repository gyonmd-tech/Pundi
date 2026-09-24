import type { Databases } from "node-appwrite";
import { DATABASE_ID } from "@/lib/appwrite/collections";

export async function getOwnedDocument(
  databases: Databases,
  collectionId: string,
  documentId: string,
  userId: string,
) {
  const document = await databases.getDocument(DATABASE_ID, collectionId, documentId);

  if (String(document.userId ?? "") !== userId) {
    throw new Error("Data tidak ditemukan atau Anda tidak memiliki akses.");
  }

  return document;
}