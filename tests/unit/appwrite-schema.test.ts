import { describe, expect, it } from "vitest";
import schema from "../../appwrite.json";

type Attribute = { key: string; required?: boolean; default?: unknown };
type Collection = { $id: string; attributes?: Attribute[] };

const collections = (schema.databases[0]?.collections ?? []) as Collection[];

describe("appwrite.json", () => {
  // Appwrite menolak atribut wajib yang punya default ("Cannot set default value
  // for required attribute"). db:setup hanya mencatat penolakan itu, sehingga
  // atribut tidak pernah dibuat dan setiap createDocument yang mengirim field
  // tersebut ditolak di produksi (kasus audit_logs.actor).
  it("tidak punya atribut wajib dengan nilai default", () => {
    const invalid = collections.flatMap((collection) =>
      (collection.attributes ?? [])
        .filter((attr) => attr.required && attr.default !== undefined && attr.default !== null)
        .map((attr) => `${collection.$id}.${attr.key}`),
    );
    expect(invalid).toEqual([]);
  });
});
