/**
 * app/api/penjaga/chat/route.ts
 * Chat Penjaga di aplikasi. Klien mengirim { threadId?, message }; server:
 *   1. membuat thread bila belum ada & menyimpan pesan pengguna (ADR-002),
 *   2. membaca 12 pesan terakhir thread dari database sebagai konteks AI
 *      (klien tidak bisa memalsukan riwayat),
 *   3. menjalankan mesin AI — LLM langsung atau Hermes Agent API server,
 *   4. menyimpan jawaban Penjaga setelah stream selesai, juga bila klien
 *      menutup tab di tengah jalan.
 *
 * Respons berupa NDJSON:
 *   {"t":"thread","id","title"}  {"t":"delta","v":"teks"}  {"t":"tool","name"}
 *   {"t":"done"}                 {"t":"error","message":"..."}
 */
import { getAuthUserAction } from "@/actions/auth";
import { getHermesConfig, getPenjagaEngine } from "@/lib/penjaga/config";
import { runDirectAgent } from "@/lib/penjaga/directAgent";
import { appendMessage, createThread, getThreadMessages } from "@/lib/penjaga/history";
import { PENJAGA_INSTRUCTIONS } from "@/lib/penjaga/tools";
import { todayInJakarta } from "@/lib/penjaga/service";
import { checkRateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const CONTEXT_MESSAGES = 12;
const MAX_CHARS = 4000;

type Send = (payload: Record<string, unknown>) => void;

/** Nama tool dari event progres Hermes — formatnya bisa berbeda antar versi, jadi baca secara defensif. */
function toolNameFrom(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  const candidate = record.tool ?? record.tool_name ?? record.name ?? (record.function as Record<string, unknown> | undefined)?.name;
  return typeof candidate === "string" ? candidate : undefined;
}

const NDJSON_HEADERS = { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" };

/** Menjalankan Hermes Agent API server dan meneruskan SSE-nya sebagai event. */
async function runHermes(userId: string, system: string, history: { role: "user" | "assistant"; content: string }[], send: Send) {
  const config = getHermesConfig();
  const today = todayInJakarta();
  let upstream: Response;
  try {
    upstream = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "X-Hermes-Session-Id": `pundi-${userId}-${today}`,
        "X-Hermes-Session-Key": `pundi-${userId}`,
      },
      body: JSON.stringify({ model: config.model, stream: true, messages: [{ role: "system", content: system }, ...history] }),
    });
  } catch {
    throw new Error("Hermes Agent tidak dapat dihubungi. Pastikan `hermes gateway` berjalan dan URL-nya dapat diakses.");
  }
  if (!upstream.ok || !upstream.body) {
    throw new Error(upstream.status === 401 ? "API key Hermes ditolak." : upstream.status === 429 ? "Hermes sedang sibuk menjalankan tugas lain." : `Hermes membalas status ${upstream.status}.`);
  }

  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();
  let buffer = "";
  let event = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line || line.startsWith(":")) {
        if (!line) event = "";
        continue;
      }
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
        continue;
      }
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(data);
      } catch {
        continue;
      }
      if (event === "hermes.tool.progress") {
        const name = toolNameFrom(parsed);
        if (name) send({ t: "tool", name });
        continue;
      }
      const delta = (parsed as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content;
      if (delta) send({ t: "delta", v: delta });
    }
  }
}

export async function POST(request: Request) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return Response.json({ error: "Masuk dengan akun untuk mengobrol dengan Penjaga." }, { status: 401 });

  const { access, engine } = getPenjagaEngine(user.email);
  if (access === "not-configured") return Response.json({ error: "AI Penjaga belum diaktifkan di server Pundi." }, { status: 503 });
  if (access === "not-owner") return Response.json({ error: "Hermes Agent ini hanya melayani pemiliknya." }, { status: 403 });

  const limit = checkRateLimit(`penjaga-chat:${user.id}`, 30, 60_000);
  if (!limit.allowed) return Response.json({ error: "Pelan-pelan dulu ya — coba lagi sebentar lagi." }, { status: 429 });

  const body = await request.json().catch(() => null) as { threadId?: unknown; message?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, MAX_CHARS) : "";
  if (!message) return Response.json({ error: "Pesan kosong." }, { status: 400 });

  // 1. Thread & pesan pengguna — gagal di sini = tidak ada yang dikirim ke AI.
  let threadId = typeof body?.threadId === "string" && body.threadId ? body.threadId : "";
  let newThread: { id: string; title: string } | null = null;
  let history: { role: "user" | "assistant"; content: string }[];
  try {
    if (!threadId) {
      newThread = await createThread(user.id, message);
      threadId = newThread.id;
    }
    await appendMessage(user.id, threadId, { role: "user", content: message });
    history = (await getThreadMessages(user.id, threadId, CONTEXT_MESSAGES))
      .filter((item) => !item.error && item.content.trim())
      .map((item) => ({ role: item.role, content: item.content }));
  } catch (error) {
    const text = error instanceof Error ? error.message : "";
    const notReady = /collection|not found|could not be found/i.test(text) && !/Percakapan/.test(text);
    return Response.json(
      { error: notReady ? "Riwayat chat belum disiapkan di server (jalankan `npm run db:setup`)." : text || "Percakapan tidak dapat disimpan." },
      { status: notReady ? 503 : 400 },
    );
  }

  const system = `${PENJAGA_INSTRUCTIONS} Pengguna: ${user.name || "pemilik Pundi"}. Hari ini ${todayInJakarta()} (WIB). ` +
    "Pesan ini datang dari panel Penjaga di aplikasi Pundi: pengguna meninjau dan menyimpan draft langsung di aplikasi, " +
    "jadi setelah membuat draft cukup beri ringkasan singkat dan arahkan untuk menekan tombol Simpan.";

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let open = true;
      let reply = "";
      const tools: string[] = [];
      let failure: string | null = null;

      // Tetap mengumpulkan jawaban walau klien sudah pergi — supaya bisa disimpan.
      const send: Send = (payload) => {
        if (payload.t === "delta" && typeof payload.v === "string") reply += payload.v;
        if (payload.t === "tool" && typeof payload.name === "string" && !tools.includes(payload.name)) tools.push(payload.name);
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
        } catch {
          open = false;
        }
      };

      if (newThread) send({ t: "thread", id: newThread.id, title: newThread.title });
      try {
        if (engine === "direct") await runDirectAgent(user.id, system, history, send);
        else await runHermes(user.id, system, history, send);
        send({ t: "done" });
      } catch (error) {
        failure = error instanceof Error ? error.message : "AI Penjaga gagal menjawab.";
        send({ t: "error", message: failure });
      } finally {
        try {
          await appendMessage(user.id, threadId, {
            role: "assistant",
            content: failure ?? reply,
            tools,
            error: Boolean(failure),
          });
        } catch (error) {
          console.error("[penjaga] Gagal menyimpan jawaban:", error instanceof Error ? error.message : error);
        }
        if (open) {
          try { controller.close(); } catch { /* klien sudah menutup */ }
        }
      }
    },
  });

  return new Response(stream, { headers: NDJSON_HEADERS });
}
