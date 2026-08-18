import { Client, Databases, Account } from "node-appwrite";

const projectId = "6a841470001604d1c937";
const apiKey = "standard_a0c8c16d670597fbb8030000ce98773f148f5275bb5ac2bfc2d151ea8833c2dd95abe498955fe6a3545436dc00f7deeb93d7ff6f21d125837f59592e6a84673d4fbe16987e1d73cb1a64f9ce6caf70cb982670cd90d722794fcbce86fe775a854309d7976501bad3eee8ecc2854ffd93945b542dbaee242a6cd080f422cc7000";

const endpoints = [
  "https://cloud.appwrite.io/v1",
  "https://sgp.cloud.appwrite.io/v1",
  "https://sgp.appwrite.global/v1",
];

async function test() {
  for (const ep of endpoints) {
    try {
      console.log(`Testing endpoint: ${ep}...`);
      const client = new Client().setEndpoint(ep).setProject(projectId).setKey(apiKey);
      const db = new Databases(client);
      const res = await db.list();
      console.log(`✓ SUCCESS with endpoint ${ep}! Found ${res.total} databases.`);
      return;
    } catch (e: any) {
      console.log(`✕ Failed with ${ep}: ${e.message}`);
    }
  }
}

test();
