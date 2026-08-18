"use server";

/**
 * actions/auth.ts
 * Server actions untuk registrasi, login, logout, dan session check via Appwrite.
 * Dilengkapi graceful fallback untuk mode demo.
 */

import { createAdminServerClient, createSessionServerClient } from "@/lib/appwrite/server";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { seedDefaultCategoriesAction } from "./seed";

const SESSION_COOKIE_NAME = "pundi-session";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  isDemo?: boolean;
}

export async function getAuthUserAction(): Promise<UserSession | null> {
  try {
    const { account } = await createSessionServerClient();
    const user = await account.get();
    return {
      id: user.$id,
      name: user.name,
      email: user.email,
    };
  } catch {
    // If not authenticated or in demo mode
    return {
      id: "demo-user-1",
      name: "Sarah Dewi",
      email: "sarah.dewi@email.com",
      isDemo: true,
    };
  }
}

export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email dan password wajib diisi." };
  }

  // Demo shortcut
  if (email === "demo@pundi.id" || email === "sarah@email.com") {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "demo-session-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true };
  }

  try {
    const { account } = await createAdminServerClient();
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal masuk. Periksa email & password." };
  }
}

export async function signUpAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { success: false, error: "Semua data formulir wajib diisi." };
  }

  try {
    const { account, users } = await createAdminServerClient();
    const userId = ID.unique();
    await users.create(userId, email, undefined, password, name);

    // Auto login session
    const session = await account.createEmailPasswordSession(email, password);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Seed default categories
    await seedDefaultCategoriesAction(userId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mendaftar akun baru." };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const { account } = await createSessionServerClient();
    await account.deleteSession("current");
  } catch {
    // Ignore error if session expired
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}
