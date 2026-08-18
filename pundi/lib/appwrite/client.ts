/**
 * lib/appwrite/client.ts
 * Browser-side Appwrite client
 */
import { Client, Account, Databases } from "appwrite";

export function createBrowserAppwriteClient() {
  const client = new Client();

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const project  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "pundi-production";

  client
    .setEndpoint(endpoint)
    .setProject(project);

  return {
    client,
    account:   new Account(client),
    databases: new Databases(client),
  };
}
