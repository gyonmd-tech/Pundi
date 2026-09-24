import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Buat Akun Pundi" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
