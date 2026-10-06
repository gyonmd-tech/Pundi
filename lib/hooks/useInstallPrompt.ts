"use client";

/**
 * lib/hooks/useInstallPrompt.ts
 * Menangkap event `beforeinstallprompt` (Chromium/Android) supaya tombol
 * "Pasang aplikasi" bisa memicu dialog install bawaan browser kapan saja.
 * Di iOS Safari event ini tidak ada, jadi kita tandai `isIos` agar UI bisa
 * menampilkan instruksi manual "Bagikan → Tambah ke Layar Utama".
 */
import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallState {
  canPrompt: boolean;
  isStandalone: boolean;
  isIos: boolean;
}

let deferred: BeforeInstallPromptEvent | null = null;
let state: InstallState = { canPrompt: false, isStandalone: false, isIos: false };
const serverState: InstallState = state;
const listeners = new Set<() => void>();
let initialized = false;

function emit(next: Partial<InstallState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const standaloneQuery = window.matchMedia("(display-mode: standalone)");
  const isStandalone = () =>
    standaloneQuery.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);

  state = { ...state, isStandalone: isStandalone(), isIos };

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    emit({ canPrompt: true });
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    emit({ canPrompt: false, isStandalone: true });
  });
  standaloneQuery.addEventListener("change", () => emit({ isStandalone: isStandalone() }));
}

function subscribe(listener: () => void) {
  init();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Panggil sedini mungkin (mis. dari root layout) agar event tidak terlewat. */
export function initInstallPrompt() {
  init();
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  emit({ canPrompt: false });
  return outcome === "accepted";
}

export function useInstallPrompt() {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => serverState);
  return {
    ...snapshot,
    /** Tombol install layak ditampilkan: belum terpasang, dan ada jalur install. */
    installable: !snapshot.isStandalone && (snapshot.canPrompt || snapshot.isIos),
    promptInstall,
  };
}
