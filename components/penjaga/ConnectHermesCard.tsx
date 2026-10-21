"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy, KeyRound, MessageSquare, Plug, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/lib/context/ToastContext";
import { createAgentTokenAction, listAgentTokensAction, revokeAgentTokenAction } from "@/actions/penjaga";
import type { AgentTokenInfo } from "@/lib/penjaga/types";
import { cn } from "@/lib/utils/cn";
import { usePenjaga } from "./PenjagaProvider";

const noopSubscribe = () => () => undefined;

function CopyBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{label}</span>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value).catch(() => undefined);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-brand-700 transition hover:bg-brand-50"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto rounded-[14px] bg-[#112772] p-3.5 text-[12px] leading-relaxed text-[#E7EFFF]"><code>{value}</code></pre>
    </div>
  );
}

export function ConnectHermesCard({ className }: { className?: string }) {
  const { status } = usePenjaga();
  const { showToast } = useToast();
  const [tokens, setTokens] = useState<AgentTokenInfo[]>([]);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const origin = useSyncExternalStore(noopSubscribe, () => window.location.origin, () => "https://domain-pundi-kamu");
  const isCloud = status?.mode === "cloud";

  const load = useCallback(async () => {
    const result = await listAgentTokensAction();
    setTokens(result.data.filter((token) => !token.revoked));
  }, []);

  useEffect(() => {
    if (!isCloud) return;
    let active = true;
    listAgentTokensAction().then((result) => {
      if (active) setTokens(result.data.filter((token) => !token.revoked));
    });
    return () => { active = false; };
  }, [isCloud]);

  async function create() {
    setCreating(true);
    const result = await createAgentTokenAction("Hermes Agent");
    setCreating(false);
    if (!result.success || !result.token) {
      showToast({ type: "error", title: "Token gagal dibuat", message: result.error });
      return;
    }
    setFreshToken(result.token);
    load();
  }

  async function revoke(id: string) {
    const result = await revokeAgentTokenAction(id);
    if (!result.success) showToast({ type: "error", title: "Gagal mencabut token", message: result.error });
    load();
  }

  const config = `mcp_servers:
  pundi:
    url: ${origin}/api/mcp
    headers:
      Authorization: "Bearer ${freshToken ?? "pnd_TOKEN_KAMU"}"`;

  const chatState = status?.chat;

  const engineLabel = status?.engine === "hermes" ? "Hermes Agent milikmu" : status?.engine === "direct" ? `AI langsung · ${status.model ?? "model"}` : null;

  return (
    <div className={cn("grid gap-5 lg:grid-cols-2", className)}>
      <section className="space-y-3" aria-labelledby="penjaga-chat-title">
        <h3 id="penjaga-chat-title" className="flex items-center gap-2 text-sm font-extrabold text-ink"><MessageSquare className="h-4 w-4 text-pine" /> Chat Penjaga di aplikasi</h3>
        {!isCloud ? (
          <p className="rounded-[14px] bg-brand-50 p-3.5 text-xs leading-relaxed text-ink">
            Kamu sedang di <b>mode latihan</b> — Penjaga memakai pengurai lokal. Masuk dengan akun Pundi untuk memakai AI sungguhan.
          </p>
        ) : chatState === "ready" ? (
          <p className="rounded-[14px] bg-mint-10 p-3.5 text-xs leading-relaxed text-mint-ink">
            Aktif memakai <b>{engineLabel}</b>. Chat di web dan aplikasi mobile siap dipakai.
          </p>
        ) : (
          <div className="space-y-2 rounded-[14px] bg-brand-50 p-3.5 text-xs leading-relaxed text-ink">
            <p><b>Belum aktif.</b> Pilih salah satu, lalu isi Environment Variables di Vercel dan redeploy:</p>
            <p><b>A. AI langsung (disarankan)</b> — tanpa PC menyala: <code className="font-mono">PENJAGA_LLM_API_KEY</code>, <code className="font-mono">PENJAGA_LLM_MODEL</code>, opsional <code className="font-mono">PENJAGA_LLM_BASE_URL</code>.</p>
            <p><b>B. Hermes milikmu</b> — PC harus menyala + tunnel: <code className="font-mono">HERMES_API_URL</code>, <code className="font-mono">HERMES_API_KEY</code>, <code className="font-mono">PENJAGA_OWNER_EMAILS</code>.</p>
          </div>
        )}
        <p className="text-xs leading-relaxed text-ink-muted">Apa pun mesinnya, Penjaga hanya membuat <b>draft</b>. Saldo berubah setelah kamu menekan Simpan.</p>
      </section>

      <section className="space-y-3" aria-labelledby="penjaga-mcp-title">
        <h3 id="penjaga-mcp-title" className="flex items-center gap-2 text-sm font-extrabold text-ink"><Plug className="h-4 w-4 text-pine" /> Hermes di komputer / Telegram (MCP)</h3>
        {!isCloud ? (
          <p className="text-xs leading-relaxed text-ink-muted">Tersedia untuk akun cloud.</p>
        ) : (
          <ol className="space-y-4">
            <li className="space-y-2.5">
              <p className="text-sm font-semibold text-ink"><span className="mr-2 text-brand-600">1.</span>Buat token akses</p>
              {freshToken ? (
                <div className="rounded-[14px] border border-warning/40 bg-warning-10 p-3 text-xs text-warning-ink">
                  Salin sekarang — token ini hanya ditampilkan sekali.
                  <code className="mt-2 block break-all rounded-[10px] bg-surface-high p-2 font-mono text-[12px] text-ink">{freshToken}</code>
                </div>
              ) : null}
              <Button size="sm" variant="outline" onClick={create} loading={creating}>
                <KeyRound className="h-4 w-4" /> Buat token baru
              </Button>
              {tokens.length ? (
                <ul className="divide-y divide-rule rounded-[14px] border border-rule">
                  {tokens.map((token) => (
                    <li key={token.id} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-ink">{token.label} <span className="font-mono text-ink-muted">{token.prefix}…</span></p>
                        <p className="text-[11px] text-ink-muted">
                          {token.lastUsedAt ? `Terakhir dipakai ${new Date(token.lastUsedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}` : "Belum pernah dipakai"}
                        </p>
                      </div>
                      <button type="button" onClick={() => revoke(token.id)} aria-label="Cabut token" className="tap-target grid h-8 w-8 place-items-center rounded-full text-ink-soft transition hover:bg-ember-10 hover:text-ember-ink">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
            <li className="space-y-2.5">
              <p className="text-sm font-semibold text-ink"><span className="mr-2 text-brand-600">2.</span>Tempel di akhir <code className="rounded bg-brand-50 px-1 text-[12px]">config.yaml</code> Hermes</p>
              <CopyBlock label="config.yaml" value={config} />
              <p className="text-xs leading-relaxed text-ink-muted">
                Windows: <code className="font-mono">%LOCALAPPDATA%\hermes\config.yaml</code> · Mac/Linux: <code className="font-mono">~/.hermes/config.yaml</code>. Token hanya di baris Authorization. Lalu buka ulang Hermes.
              </p>
            </li>
          </ol>
        )}
      </section>
    </div>
  );
}
