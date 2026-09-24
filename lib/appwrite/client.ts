/**
 * Browser-side Appwrite client.
 */
import { Account, Client, Databases } from "appwrite";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from "@/lib/appwrite/config";

export function createBrowserAppwriteClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
  };
}