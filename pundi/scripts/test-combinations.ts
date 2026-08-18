import { Client, Databases } from "node-appwrite";

const apiKey = "standard_a0c8c16d670597fbb8030000ce98773f148f5275bb5ac2bfc2d151ea8833c2dd95abe498955fe6a3545436dc00f7deeb93d7ff6f21d125837f59592e6a84673d4fbe16987e1d73cb1a64f9ce6caf70cb982670cd90d722794fcbce86fe775a854309d7976501bad3eee8ecc2854ffd93945b542dbaee242a6cd080f422cc7000";

const testCases = [
  { endpoint: "https://cloud.appwrite.io/v1", project: "6a841470001604d1c937" },
  { endpoint: "https://cloud.appwrite.io/v1", project: "project-sgp-6a841470001604d1c937" },
  { endpoint: "https://sgp.cloud.appwrite.io/v1", project: "6a841470001604d1c937" },
  { endpoint: "https://sgp.cloud.appwrite.io/v1", project: "project-sgp-6a841470001604d1c937" },
];

async function run() {
  for (const tc of testCases) {
    try {
      console.log(`Trying: Endpoint=${tc.endpoint}, Project=${tc.project}`);
      const client = new Client().setEndpoint(tc.endpoint).setProject(tc.project).setKey(apiKey);
      const db = new Databases(client);
      const res = await db.list();
      console.log(`\n🎉 SUCCESS! Endpoint: ${tc.endpoint}, Project: ${tc.project}\nDatabases count: ${res.total}`);
      return;
    } catch (e: any) {
      console.log(`  -> Error: ${e.code} ${e.type || e.message}`);
    }
  }
}

run();
