/**
 * app/api/mcp/route.ts
 * MCP server Pundi (transport Streamable HTTP, mode stateless JSON).
 * Hermes Agent terhubung lewat ~/.hermes/config.yaml:
 *
 *   mcp_servers:
 *     pundi:
 *       url: https://<domain-pundi>/api/mcp
 *       headers:
 *         Authorization: "Bearer pnd_..."
 *
 * Token dibuat di halaman Penjaga → "Hubungkan Hermes". Setiap token
 * terikat ke satu pengguna; semua tool berjalan atas nama pemilik token.
 */
import { bearerToken, resolveAgentToken } from "@/lib/penjaga/tokens";
import { PENJAGA_INSTRUCTIONS, penjagaTools } from "@/lib/penjaga/tools";
import { checkRateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPPORTED_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const CALLS_PER_MINUTE = 60;

type JsonRpcId = string | number | null;
interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
}

const result = (id: JsonRpcId, value: unknown) => ({ jsonrpc: "2.0", id, result: value });
const failure = (id: JsonRpcId, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(message: JsonRpcRequest, userId: string) {
  const id = message.id ?? null;
  switch (message.method) {
    case "initialize": {
      const requested = String(message.params?.protocolVersion ?? "");
      return result(id, {
        protocolVersion: SUPPORTED_VERSIONS.includes(requested) ? requested : SUPPORTED_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "pundi", title: "Pundi — Penjaga Keuangan", version: "1.0.0" },
        instructions: PENJAGA_INSTRUCTIONS,
      });
    }
    case "ping":
      return result(id, {});
    case "tools/list":
      return result(id, {
        tools: penjagaTools.map(({ name, title, description, inputSchema, annotations }) => ({ name, title, description, inputSchema, annotations })),
      });
    case "tools/call": {
      const name = String(message.params?.name ?? "");
      const tool = penjagaTools.find((item) => item.name === name);
      if (!tool) return failure(id, -32602, `Tool tidak dikenal: ${name}`);
      const limit = checkRateLimit(`mcp:${userId}`, CALLS_PER_MINUTE, 60_000);
      if (!limit.allowed) {
        return result(id, { isError: true, content: [{ type: "text", text: `Terlalu banyak permintaan. Coba lagi dalam ${limit.retryAfterSeconds} detik.` }] });
      }
      try {
        const args = (message.params?.arguments ?? {}) as Record<string, unknown>;
        const output = await tool.run(userId, args);
        return result(id, {
          content: [{ type: "text", text: JSON.stringify(output) }],
          structuredContent: output,
        });
      } catch (error) {
        return result(id, { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "Tool gagal dijalankan." }] });
      }
    }
    default:
      return failure(id, -32601, `Metode tidak didukung: ${message.method}`);
  }
}

export async function POST(request: Request) {
  let userId: string | null;
  try {
    userId = await resolveAgentToken(bearerToken(request));
  } catch (error) {
    console.error("[mcp] Gagal memverifikasi token:", error instanceof Error ? error.message : error);
    return Response.json(failure(null, -32603, "Layanan Pundi belum siap (jalankan `npm run db:setup`)."), { status: 503 });
  }
  if (!userId) {
    return Response.json(failure(null, -32001, "Token Penjaga tidak valid atau sudah dicabut."), {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="pundi-mcp"' },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(failure(null, -32700, "JSON tidak valid."), { status: 400 });
  }

  const batch = Array.isArray(body);
  const messages = (batch ? body : [body]) as JsonRpcRequest[];
  // Notifikasi (tanpa id) tidak dibalas; respons hanya untuk request.
  const requests = messages.filter((message) => message && typeof message.method === "string" && message.id !== undefined);
  if (requests.length === 0) return new Response(null, { status: 202 });

  const responses = await Promise.all(requests.map((message) => handle(message, userId)));
  return Response.json(batch ? responses : responses[0]);
}

export async function GET() {
  // Server stateless: tidak ada stream SSE yang dimulai server.
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}

export async function DELETE() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
