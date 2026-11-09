/**
 * lib/native.ts
 * Jembatan ke aplikasi native (Capacitor) tanpa menambah JS untuk pengguna web.
 *
 * Aplikasi Android/iOS memuat situs ini di WebView dan menyuntikkan
 * `window.Capacitor` beserta proxy plugin native (App, SplashScreen, dan
 * plugin inti SystemBars). Kita memanggilnya lewat global itu, bukan lewat
 * paket npm, jadi di browser biasa semua fungsi di sini tidak melakukan apa-apa.
 */

type Listener = { remove: () => Promise<void> | void };
type NativePlugin = Record<string, ((...args: never[]) => unknown) | undefined> & {
  addListener?: (event: string, callback: (data: never) => void) => Promise<Listener> | Listener;
};

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
  Plugins?: Record<string, NativePlugin | undefined>;
}

function capacitor(): CapacitorGlobal | null {
  if (typeof window === "undefined") return null;
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  return cap?.isNativePlatform?.() ? cap : null;
}

export function isNativeApp() {
  return capacitor() !== null;
}

export function nativePlatform(): "android" | "ios" | null {
  const platform = capacitor()?.getPlatform?.();
  return platform === "android" || platform === "ios" ? platform : null;
}

function plugin(name: string) {
  return capacitor()?.Plugins?.[name] ?? null;
}

async function call(name: string, method: string, options?: unknown) {
  const fn = plugin(name)?.[method] as ((options?: unknown) => Promise<unknown>) | undefined;
  if (!fn) return;
  try {
    await fn(options);
  } catch {
    // Plugin belum terpasang di build native lama — abaikan.
  }
}

/**
 * Warna ikon status bar mengikuti tema aplikasi. Sejak Android 15 latar status
 * bar selalu tembus (edge-to-edge), jadi yang bisa diatur hanya warna ikonnya:
 * "DARK" = ikon terang untuk latar gelap, "LIGHT" = ikon gelap untuk latar terang.
 */
export function syncNativeStatusBar(theme: "light" | "dark" | "system") {
  const style = theme === "dark" ? "DARK" : theme === "light" ? "LIGHT" : "DEFAULT";
  void call("SystemBars", "setStyle", { style });
}

export function hideNativeSplash() {
  void call("SplashScreen", "hide", { fadeOutDuration: 250 });
}

export function minimizeNativeApp() {
  void call("App", "minimizeApp");
}

/** Mendaftarkan penanganan tombol back Android; mengembalikan fungsi pelepas. */
export function onNativeBackButton(handler: (event: { canGoBack: boolean }) => void): () => void {
  const app = plugin("App");
  if (!app?.addListener) return () => undefined;
  let listener: Listener | null = null;
  let removed = false;
  Promise.resolve(app.addListener("backButton", handler as (data: never) => void)).then((value) => {
    listener = value;
    if (removed) void listener.remove();
  });
  return () => {
    removed = true;
    if (listener) void listener.remove();
  };
}
