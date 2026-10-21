/**
 * lib/penjaga/config.ts
 * Penjaga punya dua "mesin" chat di aplikasi:
 *
 * 1. Hermes Agent API server milik pengguna (OpenAI-compatible):
 *      HERMES_API_URL        mis. https://hermes.domainmu.com  (boleh diakhiri /v1)
 *      HERMES_API_KEY        nilai API_SERVER_KEY di ~/.hermes/.env
 *      HERMES_MODEL          default "hermes-agent" (atau nama profil Hermes)
 *      PENJAGA_OWNER_EMAILS  email (dipisah koma) yang boleh memakai Hermes ini.
 *    PENJAGA_OWNER_EMAILS wajib: Hermes memakai SATU token MCP milik
 *    pemiliknya, jadi pengguna lain tidak boleh mengobrol dengan Hermes itu.
 *
 * 2. LLM langsung (tanpa PC/tunnel) — server Pundi memanggil model
 *    OpenAI-compatible dan menjalankan tool Pundi atas nama pengguna yang
 *    login, sehingga aman untuk semua akun:
 *      PENJAGA_LLM_API_KEY   API key (mis. dari portal.nousresearch.com atau openrouter.ai)
 *      PENJAGA_LLM_BASE_URL  default https://inference-api.nousresearch.com/v1
 *      PENJAGA_LLM_MODEL     nama model yang mendukung tool calling
 *
 * Bila keduanya tersedia, pemilik Hermes memakai Hermes; pengguna lain memakai LLM langsung.
 */
import { normalizeEnvironmentValue } from "@/lib/appwrite/config";

/** Tambah /v1 hanya untuk URL tanpa path (mis. https://hermes.domainmu.com);
 *  URL ber-path dibiarkan, mis. Gemini https://…/v1beta/openai. */
function withV1(raw: string) {
  const url = raw.replace(/\/+$/, "");
  if (!url) return "";
  try {
    return new URL(url).pathname === "/" ? `${url}/v1` : url;
  } catch {
    return url;
  }
}

export function getHermesConfig() {
  return {
    baseUrl: withV1(normalizeEnvironmentValue(process.env.HERMES_API_URL)),
    apiKey: normalizeEnvironmentValue(process.env.HERMES_API_KEY),
    model: normalizeEnvironmentValue(process.env.HERMES_MODEL, "hermes-agent"),
    ownerEmails: normalizeEnvironmentValue(process.env.PENJAGA_OWNER_EMAILS)
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  };
}

export function getDirectLlmConfig() {
  return {
    baseUrl: withV1(normalizeEnvironmentValue(process.env.PENJAGA_LLM_BASE_URL, "https://inference-api.nousresearch.com/v1")),
    apiKey: normalizeEnvironmentValue(process.env.PENJAGA_LLM_API_KEY),
    model: normalizeEnvironmentValue(process.env.PENJAGA_LLM_MODEL, "Hermes-4-70B"),
  };
}

export type PenjagaEngine = "hermes" | "direct";
export type HermesChatAccess = "ready" | "not-configured" | "not-owner";

export function getPenjagaEngine(email: string | undefined): { access: HermesChatAccess; engine?: PenjagaEngine; model?: string } {
  const hermes = getHermesConfig();
  const hermesReady = Boolean(hermes.baseUrl && hermes.apiKey && hermes.ownerEmails.length);
  const isOwner = Boolean(email && hermes.ownerEmails.includes(email.toLowerCase()));
  if (hermesReady && isOwner) return { access: "ready", engine: "hermes", model: hermes.model };

  const direct = getDirectLlmConfig();
  if (direct.apiKey) return { access: "ready", engine: "direct", model: direct.model };

  return { access: hermesReady ? "not-owner" : "not-configured" };
}
