/**
 * Server-side Appwrite clients for Server Components and Server Actions.
 */
import { Account, Client, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  normalizeEnvironmentValue,
} from "@/lib/appwrite/config";

function createBaseClient() {
  return new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
}

export async function createSessionServerClient() {
  const client = createBaseClient();
  const cookieStore = await cookies();
  const session = cookieStore.get("pundi-session");

  if (session) client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

export async function createAdminServerClient() {
  const apiKey = normalizeEnvironmentValue(process.env.APPWRITE_API_KEY);
  const client = createBaseClient().setKey(apiKey);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get users() {
      return new Users(client);
    },
  };
}