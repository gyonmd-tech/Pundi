/**
 * app/api/penjaga/chat/route.ts
 * Proxy chat dari panel Penjaga di aplikasi ke Hermes Agent API server
 * (POST /v1/chat/completions, stream). Hermes sendiri yang memanggil tool
 * MCP Pundi (/api/mcp) untuk membuat draft — route ini hanya meneruskan
 * percakapan dan mengubah SSE Hermes menjadi NDJSON sederhana:
 *
 *   {"t":"delta","v":"teks"}  {"t":"tool","name":"pundi_buat_draft"}
 *   {"t":"done"}              {"t":"error","message":"..."}
 */
import { getAuthUserAction } from "@/actions/auth";
import { getHermesConfig, getPenjagaEngine } from "@/lib/penjaga/config";
import { runDirectAgent } from "@/lib/penjaga/directAgent";
import { PENJAGA_INSTRUCTIONS } from "@/lib/penjaga/tools";
import { todayInJakarta } from "@/lib/penjaga/service";
import { checkRateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MAX_MESSAGES = 24;
const MAX_CHARS = 4000;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

function sanitize(messages: unknown): IncomingMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((message): message is IncomingMessage =>
      Boolean(message) &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0)
    .slice(-MAX_MESSAGES)
    .map((message) => ({ role: message.role, content: message.content.slice(0, MAX_CHARS) }));
}

/** Nama tool dari event progres Hermes — formatnya bisa berbeda antar versi, jadi baca secara defensif. */
function toolNameFrom(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;
  const candidate = record.tool ?? record.tool_name ?? record.name ?? (record.function as Record<string, unknown> | undefined)?.name;
  return typeof candidate === "string" ? candidate : undefined;
}

const NDJSON_HEADERS = { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" };

/** Mesin LLM langsung: server Pundi menjalankan model + tool Pundi sendiri. */
function directResponse(userId: string, system: string, messages: IncomingMessage[], signal: AbortSignal) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: Record<string, unknown>) => controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      try {
        await runDirectAgent(userId, system, messages.slice(-12), send, signal);
        send({ t: "done" });
      } catch (error) {
        send({ t: "error", message: error instanceof Error ? error.message : "AI Penjaga gagal menjawab." });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: NDJSON_HEADERS });
}

export async function POST(request: Request) {
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return Response.json({ error: "Masuk dengan akun untuk mengobrol dengan Hermes." }, { status: 401 });

  const { access, engine } = getPenjagaEngine(user.email);
  if (access === "not-configured") return Response.json({ error: "AI Penjaga belum diaktifkan di server Pundi." }, { status: 503 });
  if (access === "not-owner") return Response.json({ error: "Hermes Agent ini hanya melayani pemiliknya." }, { status: 403 });

  const limit = checkRateLimit(`penjaga-chat:${user.id}`, 30, 60_000);
  if (!limit.allowed) return Response.json({ error: "Pelan-pelan dulu ya — coba lagi sebentar lagi." }, { status: 429 });

  const body = await request.json().catch(() => null) as { messages?: unknown } | null;
  const messages = sanitize(body?.messages);
  if (messages.length === 0 || messages.at(-1)?.role !== "user") {
    return Response.json({ error: "Pesan kosong." }, { status: 400 });
  }

  const today = todayInJakarta();
  const system = `${PENJAGA_INSTRUCTIONS} Pengguna: ${user.name || "pemilik Pundi"}. Hari ini ${today} (WIB). ` +
    "Pesan ini datang dari panel Penjaga di aplikasi Pundi: pengguna meninjau dan menyimpan draft langsung di aplikasi, " +
    "jadi setelah membuat draft cukup beri ringkasan singkat dan arahkan untuk menekan tombol Simpan.";

  if (engine === "direct") return directResponse(user.id, system, messages, request.signal);

  const config = getHermesConfig();
  let upstream: Response;
  try {
    upstream = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        // Satu sesi Hermes per pengguna per hari — "cerita hari ini" tetap utuh antar pesan.
        "X-Hermes-Session-Id": `pundi-${user.id}-${today}`,
        "X-Hermes-Session-Key": `pundi-${user.id}`,
      },
      body: JSON.stringify({ model: config.model, stream: true, messages: [{ role: "system", content: system }, ...messages] }),
      signal: request.signal,
    });
  } catch {
    return Response.json({ error: "Hermes Agent tidak dapat dihubungi. Pastikan `hermes gateway` berjalan dan URL-nya dapat diakses." }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const status = upstream.status === 401 ? "API key Hermes ditolak." : upstream.status === 429 ? "Hermes sedang sibuk menjalankan tugas lain." : `Hermes membalas status ${upstream.status}.`;
    return Response.json({ error: status }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: Record<string, unknown>) => controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      let buffer = "";
      let event = "";
      try {
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
        send({ t: "done" });
      } catch {
        send({ t: "error", message: "Koneksi ke Hermes terputus." });
      } finally {
        controller.close();
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    },
  });

  return new Response(stream, { headers: NDJSON_HEADERS });
}
