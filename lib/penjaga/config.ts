/**
 * lib/penjaga/config.ts
 * Konfigurasi koneksi ke Hermes Agent API server (OpenAI-compatible).
 *
 *   HERMES_API_URL        mis. https://hermes.domainmu.com  (boleh diakhiri /v1)
 *   HERMES_API_KEY        nilai API_SERVER_KEY di ~/.hermes/.env
 *   HERMES_MODEL          default "hermes-agent" (atau nama profil Hermes)
 *   PENJAGA_OWNER_EMAILS  email (dipisah koma) yang boleh memakai chat Hermes di app.
 *
 * PENJAGA_OWNER_EMAILS wajib: Hermes memakai SATU token MCP (milik
 * pemiliknya), jadi pengguna lain tidak boleh mengobrol dengan Hermes yang
 * sama — mereka akan membaca/menulis keuangan pemilik token.
 */
import { normalizeEnvironmentValue } from "@/lib/appwrite/config";

export function getHermesConfig() {
  const rawUrl = normalizeEnvironmentValue(process.env.HERMES_API_URL).replace(/\/+$/, "");
  const baseUrl = rawUrl ? (rawUrl.endsWith("/v1") ? rawUrl : `${rawUrl}/v1`) : "";
  return {
    baseUrl,
    apiKey: normalizeEnvironmentValue(process.env.HERMES_API_KEY),
    model: normalizeEnvironmentValue(process.env.HERMES_MODEL, "hermes-agent"),
    ownerEmails: normalizeEnvironmentValue(process.env.PENJAGA_OWNER_EMAILS)
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  };
}

export type HermesChatAccess = "ready" | "not-configured" | "not-owner";

export function getHermesChatAccess(email: string | undefined): HermesChatAccess {
  const config = getHermesConfig();
  if (!config.baseUrl || !config.apiKey || config.ownerEmails.length === 0) return "not-configured";
  if (!email || !config.ownerEmails.includes(email.toLowerCase())) return "not-owner";
  return "ready";
}
