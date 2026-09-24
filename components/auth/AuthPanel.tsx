"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { loginAction, signUpAction } from "@/actions/auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { AuthUnderlineInput } from "./AuthUnderlineInput";
import styles from "./AuthForm.module.css";

interface AuthPanelProps {
  mode: "login" | "signup";
  active: boolean;
  onSwitch: () => void;
}

export function AuthPanel({ mode, active, onSwitch }: AuthPanelProps) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [pending, setPending] = React.useState(false);
  const [demoPending, setDemoPending] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    const result = isSignup ? await signUpAction(formData) : await loginAction(formData);
    setPending(false);
    if (!result.success) {
      setError(result.error || "Permintaan tidak dapat diproses.");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  async function enterDemo() {
    setDemoPending(true);
    setError("");
    const formData = new FormData();
    formData.set("email", "demo@pundi.id");
    formData.set("password", "demo-pundi");
    const result = await loginAction(formData);
    setDemoPending(false);
    if (!result.success) {
      setError(result.error || "Mode demo tidak dapat dibuka.");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <section
      className={cn(styles.formPanel, isSignup ? styles.signupForm : styles.loginForm, !active && styles.inactiveForm)}
      aria-hidden={!active}
      inert={!active}
    >
      <div className="my-auto w-full max-w-[410px] text-center">
        <Link href="/" aria-label="Kembali ke halaman utama Pundi" tabIndex={active ? 0 : -1} className="inline-flex rounded-[14px] p-1 transition hover:bg-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine/25">
          <Image src="/PUNDI-brand-assets/pundi-logo.svg" alt="Pundi" width={150} height={44} priority className="h-9 w-auto object-contain sm:h-10" />
        </Link>

        <h1 className="mt-5 text-3xl font-black sm:mt-7 sm:text-4xl tracking-[-0.05em] text-ink">{isSignup ? "Sign up" : "Login"}</h1>

        <form action={submit} className="mt-5 space-y-3.5 sm:mt-7 sm:space-y-5">
          {isSignup ? <AuthUnderlineInput label="Nama" name="name" icon={UserRound} required autoComplete="name" placeholder="Nama lengkap" tabIndex={active ? 0 : -1} /> : null}
          <AuthUnderlineInput label="Email" name="email" type="email" icon={Mail} required autoComplete="email" inputMode="email" placeholder="nama@email.com" tabIndex={active ? 0 : -1} />
          <AuthUnderlineInput
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            icon={LockKeyhole}
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="Minimal 8 karakter"
            tabIndex={active ? 0 : -1}
            suffix={<button type="button" tabIndex={active ? 0 : -1} onClick={() => setShowPassword((visible) => !visible)} className="grid h-9 w-9 place-items-center rounded-full text-ink-muted transition hover:bg-paper hover:text-pine focus-visible:shadow-none" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>}
          />

          {error ? <div role="alert" aria-live="polite" className="rounded-[12px] bg-ember-10 px-4 py-3 text-left text-xs font-semibold leading-relaxed text-ember">{error}</div> : null}

          <Button type="submit" size="lg" loading={pending} tabIndex={active ? 0 : -1} className="group w-full shadow-[0_12px_28px_rgba(91,74,239,.24)]">
            {pending ? "Memproses..." : isSignup ? "Sign up" : "Login"}
            {!pending ? <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /> : null}
          </Button>
        </form>

        <div className="my-3 flex items-center gap-3 sm:my-5" aria-hidden><span className="h-px flex-1 bg-rule" /><span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-muted">atau</span><span className="h-px flex-1 bg-rule" /></div>

        <Button type="button" variant="ghost" size="md" loading={demoPending} onClick={enterDemo} tabIndex={active ? 0 : -1} className="w-full text-pine hover:bg-pine-10">
          {!demoPending ? <Sparkles className="h-4 w-4" /> : null}{demoPending ? "Membuka..." : "Mode demo"}
        </Button>

        <button type="button" onClick={onSwitch} tabIndex={active ? 0 : -1} className="mt-2 rounded-lg px-3 py-2 sm:mt-4 text-sm font-extrabold text-pine transition hover:bg-pine-10 focus-visible:shadow-none">
          {isSignup ? "Login" : "Sign up"}
        </button>
      </div>
    </section>
  );
}
