"use server";

import { createAdminServerClient, createSessionServerClient } from "@/lib/appwrite/server";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { seedDefaultCategoriesAction } from "./seed";

const SESSION_COOKIE_NAME = "pundi-session";

function authErrorMessage(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : "";
  const message = raw.toLowerCase();

  if (message.includes("invalid endpoint url")) {
    return "Konfigurasi layanan akun belum valid. Periksa endpoint Appwrite pada environment deployment.";
  }
  if (message.includes("project is paused")) {
    return "Layanan akun sedang tidak aktif. Aktifkan kembali proyek Appwrite, lalu coba lagi.";
  }
  if (message.includes("already exists") || message.includes("user_already_exists")) {
    return "Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.";
  }
  if (message.includes("invalid credentials") || message.includes("user_invalid_credentials")) {
    return "Email atau password tidak cocok.";
  }
  if (message.includes("api key") || message.includes("scope") || message.includes("unauthorized")) {
    return "Layanan akun belum memiliki izin yang diperlukan. Periksa API key Appwrite pada deployment.";
  }

  return raw || fallback;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  isDemo?: boolean;
}

export async function getAuthUserAction(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) return null;

  if (sessionCookie.value === "demo-session-token") {
    return {
      id: "demo-user-1",
      name: "Sarah Dewi",
      email: "demo@pundi.id",
      isDemo: true,
    };
  }

  try {
    const { account } = await createSessionServerClient();
    const user = await account.get();
    return { id: user.$id, name: user.name, email: user.email };
  } catch {
    return null;
  }
}

export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { success: false, error: "Email dan password wajib diisi." };
  }

  if (email === "demo@pundi.id" || email === "sarah@email.com") {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "demo-session-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return { success: true };
  }

  try {
    const { account } = await createAdminServerClient();
    const session = await account.createEmailPasswordSession({ email, password });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: authErrorMessage(error, "Gagal masuk. Periksa email dan password.") };
  }
}

export async function signUpAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { success: false, error: "Semua data formulir wajib diisi." };
  }
  if (password.length < 8) {
    return { success: false, error: "Password minimal 8 karakter." };
  }

  try {
    const { account, users } = await createAdminServerClient();
    const userId = ID.unique();
    await users.create({ userId, email, password, name });
    const session = await account.createEmailPasswordSession({ email, password });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    const seeded = await seedDefaultCategoriesAction(userId);
    if (!seeded.success) {
      return { success: false, error: "Akun dibuat, tetapi data awal gagal disiapkan. Silakan masuk kembali." };
    }
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: authErrorMessage(error, "Gagal mendaftar akun baru.") };
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);

  if (session && session.value !== "demo-session-token") {
    try {
      const { account } = await createSessionServerClient();
      await account.deleteSession("current");
    } catch {
      // Session may already be expired.
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  return { success: true };
}
export async function updateProfileNameAction(nameInput: string): Promise<{ success: boolean; name?: string; error?: string }> {
  const user = await getAuthUserAction();
  if (!user) return { success: false, error: "Sesi login telah berakhir." };

  const name = nameInput.trim();
  if (name.length < 2 || name.length > 100) {
    return { success: false, error: "Nama harus terdiri dari 2–100 karakter." };
  }
  if (user.isDemo) return { success: true, name };

  try {
    const { users } = await createAdminServerClient();
    await users.updateName({ userId: user.id, name });
    return { success: true, name };
  } catch (error: unknown) {
    return { success: false, error: authErrorMessage(error, "Nama profil gagal diperbarui.") };
  }
}