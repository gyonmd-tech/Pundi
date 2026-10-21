/**
 * lib/penjaga/directAgent.ts
 * Mesin "LLM langsung": server Pundi memanggil model OpenAI-compatible
 * (Nous Portal, OpenRouter, dll.) dengan tool Pundi, lalu menjalankan tool
 * tersebut sendiri atas nama pengguna yang login. Tidak butuh Hermes di PC
 * atau tunnel, sehingga chat berjalan dari web maupun aplikasi mobile.
 *
 * Hemat token: riwayat dipotong, hasil tool dipersingkat, putaran tool dibatasi.
 */
import { getDirectLlmConfig } from "./config";
import { penjagaTools } from "./tools";

const MAX_ROUNDS = 5;
const MAX_TOOL_RESULT_CHARS = 6000;
const MAX_OUTPUT_TOKENS = 700;

type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export type AgentEvent = { t: "delta"; v: string } | { t: "tool"; name: string };

const openAiTools = penjagaTools.map((tool) => ({
  type: "function" as const,
  function: { name: tool.name, description: tool.description, parameters: tool.inputSchema },
}));

function describeHttpError(status: number, body: string) {
  if (status === 401 || status === 403) return "API key AI ditolak. Periksa PENJAGA_LLM_API_KEY.";
  if (status === 402 || /credit|balance|insufficient/i.test(body)) return "Kredit AI habis. Isi saldo di penyedia API-mu.";
  if (status === 404 || /model/i.test(body)) return `Model AI tidak ditemukan. Periksa PENJAGA_LLM_MODEL. (${body.slice(0, 160)})`;
  if (status === 429) return "Penyedia AI sedang membatasi permintaan. Coba lagi sebentar lagi.";
  return `Penyedia AI membalas status ${status}.`;
}

/** Daftar model dari endpoint /models penyedia — untuk pesan error yang bisa langsung ditindaklanjuti. */
async function listModels(baseUrl: string, apiKey: string) {
  try {
    const response = await fetch(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!response.ok) return [];
    const data = await response.json() as { data?: { id?: string }[] };
    return (data.data ?? [])
      .map((model) => String(model.id ?? ""))
      .filter((id) => id && !/whisper|tts|embed|guard|vision|image|audio/i.test(id))
      .slice(0, 12);
  } catch {
    return [];
  }
}

export async function runDirectAgent(
  userId: string,
  system: string,
  history: { role: "user" | "assistant"; content: string }[],
  emit: (event: AgentEvent) => void,
  signal?: AbortSignal,
) {
  const config = getDirectLlmConfig();
  const messages: ChatMessage[] = [{ role: "system", content: system }, ...history];

  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages,
        tools: openAiTools,
        tool_choice: "auto",
        temperature: 0.2,
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
      signal,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      let message = describeHttpError(response.status, body);
      if (/model_not_found|does not exist|not found/i.test(body)) {
        const available = await listModels(config.baseUrl, config.apiKey);
        if (available.length) message = `Model "${config.model}" tidak tersedia. Ganti PENJAGA_LLM_MODEL dengan salah satu: ${available.join(", ")}`;
      }
      throw new Error(message);
    }

    const data = await response.json() as { choices?: { message?: { content?: string | null; tool_calls?: ToolCall[] } }[] };
    const message = data.choices?.[0]?.message;
    if (!message) throw new Error("Penyedia AI tidak mengembalikan jawaban.");

    const calls = message.tool_calls ?? [];
    if (!calls.length) {
      const text = message.content?.trim() || "Maaf, aku belum bisa menjawab itu.";
      // Kirim bertahap agar maskot "berbicara" seperti streaming.
      for (let index = 0; index < text.length; index += 24) emit({ t: "delta", v: text.slice(index, index + 24) });
      return;
    }

    messages.push({ role: "assistant", content: message.content ?? null, tool_calls: calls });
    for (const call of calls) {
      emit({ t: "tool", name: call.function.name });
      const tool = penjagaTools.find((item) => item.name === call.function.name);
      let content: string;
      try {
        if (!tool) throw new Error(`Tool tidak dikenal: ${call.function.name}`);
        const args = call.function.arguments ? JSON.parse(call.function.arguments) as Record<string, unknown> : {};
        content = JSON.stringify(await tool.run(userId, args));
      } catch (error) {
        content = JSON.stringify({ error: error instanceof Error ? error.message : "Tool gagal dijalankan." });
      }
      messages.push({ role: "tool", tool_call_id: call.id, content: content.slice(0, MAX_TOOL_RESULT_CHARS) });
    }
  }

  emit({ t: "delta", v: "Aku sudah menyiapkan catatannya — cek daftar draft di bawah ya." });
}
