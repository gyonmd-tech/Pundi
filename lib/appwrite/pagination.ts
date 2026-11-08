/**
 * lib/appwrite/pagination.ts
 * Mengambil SEMUA dokumen yang cocok dengan query memakai cursor pagination,
 * menggantikan pola lama `Query.limit(500)` yang diam-diam memotong data
 * pengguna yang transaksinya sudah banyak.
 *
 * `maxDocuments` adalah rem pengaman agar satu permintaan tidak pernah
 * menarik data tanpa batas; pemanggil memilih batas yang masuk akal.
 */
import { Query, type Models } from "node-appwrite";
import { DATABASE_ID } from "@/lib/appwrite/collections";

const PAGE_SIZE = 500;

type ListDatabases = {
  listDocuments(databaseId: string, collectionId: string, queries?: string[]): Promise<Models.DocumentList<Models.Document>>;
};

export async function listAllDocuments(
  databases: ListDatabases,
  collectionId: string,
  queries: string[],
  { maxDocuments = 10_000, pageSize = PAGE_SIZE }: { maxDocuments?: number; pageSize?: number } = {},
): Promise<Models.Document[]> {
  const documents: Models.Document[] = [];
  let cursor: string | undefined;

  while (documents.length < maxDocuments) {
    const limit = Math.min(pageSize, maxDocuments - documents.length);
    const page = await databases.listDocuments(DATABASE_ID, collectionId, [
      ...queries,
      Query.limit(limit),
      ...(cursor ? [Query.cursorAfter(cursor)] : []),
    ]);
    documents.push(...page.documents);
    if (page.documents.length < limit) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }

  return documents;
}
