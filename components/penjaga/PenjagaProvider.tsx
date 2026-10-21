"use client";

/**
 * components/penjaga/PenjagaProvider.tsx
 * State Penjaga yang hidup di seluruh area aplikasi (bukan hanya halaman
 * /penjaga): percakapan, draft yang menunggu konfirmasi, dan mood maskot.
 * Badge navigasi & tombol maskot mengambang membaca konteks ini.
 *
 * Cloud  → chat diteruskan ke Hermes (/api/penjaga/chat); Hermes membuat
 *          draft lewat MCP, lalu draft diambil ulang dari server.
 * Demo   → "Penjaga latihan": cerita diurai lokal (lib/penjaga/demoParser)
 *          dan draft disimpan di state klien.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useApp } from "@/lib/data/store";
import {
  confirmDraftsAction,
  getPendingDraftsAction,
  getPenjagaStatusAction,
  rejectDraftsAction,
  type PenjagaStatus,
} from "@/actions/penjaga";
import { parseStory } from "@/lib/penjaga/demoParser";
import type { AgentDraft, DraftEdit, PenjagaChatMessage, PenjagaMood } from "@/lib/penjaga/types";
import type { Account, Transaction } from "@/lib/data/mock";
import { formatRupiah } from "@/lib/utils/formatter";

const DRAFT_POLL_MS = 30_000;

interface PenjagaContextValue {
  status: PenjagaStatus | null;
  messages: PenjagaChatMessage[];
  drafts: AgentDraft[];
  mood: PenjagaMood;
  busy: boolean;
  send: (text: string) => Promise<void>;
  confirm: (ids: string[], edits: Record<string, DraftEdit>) => Promise<{ saved: number; failed: { draftId: string; error: string }[] }>;
  reject: (ids: string[]) => Promise<void>;
  refreshDrafts: () => Promise<void>;
  celebrate: () => void;
}

const PenjagaContext = createContext<PenjagaContextValue | null>(null);

const TOOL_LABELS: Record<string, string> = {
  pundi_konteks: "Membaca rekening & kategori",
  pundi_buat_draft: "Menyusun draft",
  pundi_daftar_draft: "Memeriksa draft",
  pundi_konfirmasi_draft: "Menyimpan transaksi",
  pundi_tolak_draft: "Membuang draft",
  pundi_transaksi: "Melihat transaksi",
  pundi_ringkasan: "Menghitung ringkasan",
};

export function toolLabel(name: string) {
  // Hermes menamai tool MCP "mcp__<server>__<tool>", mis. mcp__pundi__pundi_buat_draft.
  const short = name.replace(/^mcp[_-]+pundi[_-]+/, "").replace(/^pundi[._-]/, "pundi_");
  return TOOL_LABELS[short] ?? TOOL_LABELS[name] ?? name;
}

let sequence = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(sequence += 1)}`;

function balanceChanges(transaction: Pick<Transaction, "type" | "amount" | "accountId" | "destinationAccountId">) {
  const changes = new Map<string, number>();
  if (transaction.type === "income") changes.set(transaction.accountId, transaction.amount);
  if (transaction.type === "expense") changes.set(transaction.accountId, -transaction.amount);
  if (transaction.type === "transfer" && transaction.destinationAccountId) {
    changes.set(transaction.accountId, -transaction.amount);
    changes.set(transaction.destinationAccountId, transaction.amount);
  }
  return changes;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function PenjagaProvider({ children }: { children: ReactNode }) {
  const { state, dispatch, connection } = useApp();
  const [status, setStatus] = useState<PenjagaStatus | null>(null);
  const [messages, setMessages] = useState<PenjagaChatMessage[]>([]);
  const [drafts, setDrafts] = useState<AgentDraft[]>([]);
  const [phase, setPhase] = useState<"idle" | "thinking" | "talking">("idle");
  const [flash, setFlash] = useState<"happy" | "alert" | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountsRef = useRef(state.accounts);
  useEffect(() => { accountsRef.current = state.accounts; }, [state.accounts]);

  const isCloud = status?.mode === "cloud";

  const showFlash = useCallback((kind: "happy" | "alert", ms = 2600) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash(kind);
    flashTimer.current = setTimeout(() => setFlash(null), ms);
  }, []);

  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  useEffect(() => {
    if (connection.status !== "ready") return;
    let active = true;
    getPenjagaStatusAction().then((result) => { if (active) setStatus(result); });
    return () => { active = false; };
  }, [connection.status]);

  const refreshDrafts = useCallback(async () => {
    if (!isCloud) return;
    const result = await getPendingDraftsAction();
    if (!result.error) setDrafts(result.data);
  }, [isCloud]);

  // Draft bisa datang dari Hermes di Telegram/CLI kapan saja — ambil ulang berkala saat tab terlihat.
  useEffect(() => {
    if (!isCloud) return;
    refreshDrafts();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refreshDrafts();
    }, DRAFT_POLL_MS);
    const onVisible = () => { if (document.visibilityState === "visible") refreshDrafts(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isCloud, refreshDrafts]);

  const patchMessage = useCallback((id: string, patch: (message: PenjagaChatMessage) => PenjagaChatMessage) => {
    setMessages((current) => current.map((message) => message.id === id ? patch(message) : message));
  }, []);

  const sendDemo = useCallback(async (text: string, replyId: string) => {
    await wait(900);
    const parsed = parseStory(text, state.accounts, state.categories);
    const now = new Date().toISOString();
    const created: AgentDraft[] = parsed.map((item) => ({
      id: nextId("draft"),
      status: "pending",
      source: "demo",
      type: item.type,
      amount: item.amount,
      accountId: item.accountId,
      destinationAccountId: item.destinationAccountId,
      categoryId: item.categoryId,
      date: now,
      note: item.note,
      rawText: item.rawText,
      createdAt: now,
    }));
    if (created.length) setDrafts((current) => [...created, ...current]);

    const reply = created.length
      ? `Siap! Aku menemukan ${created.length} catatan dari ceritamu:\n${created
          .map((draft) => `• ${draft.note} — ${formatRupiah(draft.amount)}`)
          .join("\n")}\n\nCek dulu draft-nya, lengkapi kalau ada yang kosong, lalu tekan Simpan ya.`
      : "Hmm, aku belum menemukan nominal di ceritamu. Coba sebutkan seperti: \"makan siang 25rb, bensin 30rb, gajian 5jt\".";

    setPhase("talking");
    for (let index = 0; index < reply.length; index += 3) {
      const slice = reply.slice(0, index + 3);
      patchMessage(replyId, (message) => ({ ...message, content: slice }));
      await wait(14);
    }
    if (!created.length) showFlash("alert", 1800);
  }, [patchMessage, showFlash, state.accounts, state.categories]);

  const sendCloud = useCallback(async (history: PenjagaChatMessage[], replyId: string) => {
    const response = await fetch("/api/penjaga/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.filter((message) => !message.error).map(({ role, content }) => ({ role, content })) }),
    });
    if (!response.ok || !response.body) {
      const body = await response.json().catch(() => ({})) as { error?: string };
      throw new Error(body.error ?? "Hermes tidak merespons.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let touchedDrafts = false;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line) as { t: string; v?: string; name?: string; message?: string };
        if (event.t === "delta" && event.v) {
          setPhase("talking");
          patchMessage(replyId, (message) => ({ ...message, content: message.content + event.v }));
        } else if (event.t === "tool" && event.name) {
          if (/draft/.test(event.name)) touchedDrafts = true;
          patchMessage(replyId, (message) => ({
            ...message,
            tools: message.tools?.includes(event.name!) ? message.tools : [...(message.tools ?? []), event.name!],
          }));
        } else if (event.t === "error") {
          throw new Error(event.message ?? "Koneksi ke Hermes terputus.");
        }
      }
    }
    if (touchedDrafts) await refreshDrafts();
    else refreshDrafts();
  }, [patchMessage, refreshDrafts]);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || phase !== "idle" || !status) return;
    const userMessage: PenjagaChatMessage = { id: nextId("msg"), role: "user", content: text };
    const reply: PenjagaChatMessage = { id: nextId("msg"), role: "assistant", content: "" };
    const history = [...messages, userMessage];
    setMessages([...history, reply]);
    setPhase("thinking");
    try {
      if (status.chat === "demo") await sendDemo(text, reply.id);
      else await sendCloud(history, reply.id);
    } catch (error) {
      patchMessage(reply.id, (message) => ({
        ...message,
        error: true,
        content: error instanceof Error ? error.message : "Terjadi kesalahan.",
      }));
      showFlash("alert");
    } finally {
      setPhase("idle");
    }
  }, [messages, patchMessage, phase, sendCloud, sendDemo, showFlash, status]);

  const applyLocally = useCallback((transactions: Transaction[]) => {
    const accounts = new Map<string, Account>(accountsRef.current.map((account) => [account.id, account]));
    for (const transaction of transactions) {
      dispatch({ type: "ADD_TRANSACTION", payload: transaction });
      for (const [accountId, delta] of balanceChanges(transaction)) {
        const account = accounts.get(accountId);
        if (!account) continue;
        const updated = { ...account, balance: account.balance + delta };
        accounts.set(accountId, updated);
        dispatch({ type: "UPDATE_ACCOUNT", payload: updated });
      }
    }
  }, [dispatch]);

  const confirm = useCallback(async (ids: string[], edits: Record<string, DraftEdit>) => {
    if (isCloud) {
      const result = await confirmDraftsAction(ids, edits);
      if (result.error && !result.saved.length && !result.failed.length) throw new Error(result.error);
      applyLocally(result.saved.map(({ transaction }) => transaction));
      const savedIds = new Set(result.saved.map(({ draftId }) => draftId));
      setDrafts((current) => current.filter((draft) => !savedIds.has(draft.id)));
      if (result.saved.length) showFlash("happy");
      else showFlash("alert");
      return { saved: result.saved.length, failed: result.failed };
    }

    const failed: { draftId: string; error: string }[] = [];
    const saved: Transaction[] = [];
    const savedIds = new Set<string>();
    for (const id of ids) {
      const stored = drafts.find((draft) => draft.id === id);
      if (!stored) continue;
      const draft = { ...stored, ...edits[id] };
      if (!draft.accountId) { failed.push({ draftId: id, error: "Pilih rekening terlebih dahulu." }); continue; }
      if (draft.type === "transfer" && (!draft.destinationAccountId || draft.destinationAccountId === draft.accountId)) {
        failed.push({ draftId: id, error: "Pilih rekening tujuan yang berbeda." });
        continue;
      }
      saved.push({
        id: nextId("tx"),
        type: draft.type,
        amount: draft.amount,
        accountId: draft.accountId,
        destinationAccountId: draft.type === "transfer" ? draft.destinationAccountId : undefined,
        transferKind: draft.type === "transfer" ? "account" : undefined,
        categoryId: draft.type === "transfer" ? undefined : draft.categoryId,
        date: new Date(draft.date),
        createdAt: new Date(),
        note: draft.note,
        tags: ["penjaga"],
        recordKind: "standard",
      });
      savedIds.add(id);
    }
    applyLocally(saved);
    setDrafts((current) => current.filter((draft) => !savedIds.has(draft.id)));
    showFlash(saved.length ? "happy" : "alert");
    return { saved: saved.length, failed };
  }, [applyLocally, drafts, isCloud, showFlash]);

  const reject = useCallback(async (ids: string[]) => {
    const remove = new Set(ids);
    setDrafts((current) => current.filter((draft) => !remove.has(draft.id)));
    if (isCloud) {
      const result = await rejectDraftsAction(ids);
      if (!result.success) refreshDrafts();
    }
  }, [isCloud, refreshDrafts]);

  const mood: PenjagaMood = flash
    ?? (phase !== "idle" ? phase
      : status?.chat === "not-configured" || status?.chat === "not-owner" ? "sleeping"
      : "idle");

  const value = useMemo<PenjagaContextValue>(() => ({
    status,
    messages,
    drafts,
    mood,
    busy: phase !== "idle",
    send,
    confirm,
    reject,
    refreshDrafts,
    celebrate: () => showFlash("happy"),
  }), [confirm, drafts, messages, mood, phase, refreshDrafts, reject, send, showFlash, status]);

  return <PenjagaContext.Provider value={value}>{children}</PenjagaContext.Provider>;
}

export function usePenjaga() {
  const context = useContext(PenjagaContext);
  if (!context) throw new Error("usePenjaga harus digunakan di dalam <PenjagaProvider>");
  return context;
}
