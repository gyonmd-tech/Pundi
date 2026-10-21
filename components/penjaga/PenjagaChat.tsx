"use client";

/**
 * components/penjaga/PenjagaChat.tsx
 * Tampilan percakapan bergaya aplikasi LLM: kolom tengah yang lega tanpa
 * card pembungkus, pesan Penjaga tanpa gelembung, draft tampil di dalam alur
 * percakapan, dan kolom ketik menempel di bawah layar (di atas navigasi
 * bawah pada ponsel).
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowUp, Cog, Settings2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useApp } from "@/lib/data/store";
import { PenjagaAvatar } from "./PenjagaAvatar";
import { PenjagaCharacter } from "./PenjagaCharacter";
import { DraftReview } from "./DraftReview";
import { toolLabel, usePenjaga } from "./PenjagaProvider";

const SUGGESTIONS = [
  { title: "Catat pengeluaran", text: "Hari ini sarapan 15rb, makan siang soto 25rb, bensin 30rb pakai cash" },
  { title: "Gaji & transfer", text: "Gajian 5,5jt masuk BCA, terus transfer 1jt ke tabungan" },
  { title: "Tanya ringkasan", text: "Berapa total pengeluaranku minggu ini?" },
];

function useChatAvailability() {
  const { status } = usePenjaga();
  const disabled = !status || status.chat === "not-configured" || status.chat === "not-owner";
  return { status, disabled };
}

export function PenjagaThread() {
  const { messages, drafts, mood, send, busy } = usePenjaga();
  const { connection } = useApp();
  const { disabled, status } = useChatAvailability();
  const endRef = useRef<HTMLDivElement>(null);
  const firstName = (connection.userName ?? "").split(" ")[0];

  useEffect(() => {
    if (messages.length || drafts.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, drafts.length]);

  if (messages.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-1 pb-6 pt-6 text-center sm:pt-12">
        <PenjagaCharacter mood={mood} size={132} title="Penjaga" />
        <h1 className="mt-4 font-display text-[clamp(1.6rem,4.5vw,2.4rem)] font-black leading-tight tracking-[-0.035em] text-ink">
          {firstName ? `Halo, ${firstName}!` : "Halo!"} Ceritakan harimu.
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-[15px]">
          Tulis seperti bercerita ke teman. Penjaga memecahnya menjadi catatan, kamu cukup periksa lalu tekan <b className="text-ink">Simpan</b>.
        </p>
        {disabled && status?.mode === "cloud" ? (
          <Link
            href="/pengaturan#penjaga"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-warning-10 px-4 py-2 text-xs font-bold text-warning-ink transition hover:brightness-95"
          >
            <Settings2 className="h-4 w-4" /> AI Penjaga belum aktif — atur di Pengaturan
          </Link>
        ) : null}
        <div className="mt-7 grid w-full gap-2.5 text-left sm:grid-cols-3">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.title}
              type="button"
              disabled={disabled || busy}
              onClick={() => send(suggestion.text)}
              className="group rounded-[18px] border border-rule bg-surface-high p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card active:translate-y-0 disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-pine">{suggestion.title}</span>
              <span className="mt-1.5 block text-[13px] leading-snug text-ink-muted group-hover:text-ink">“{suggestion.text}”</span>
            </button>
          ))}
        </div>
        {drafts.length ? <DraftReview className="mt-8 w-full text-left" /> : null}
        <div ref={endRef} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-1 pb-6 pt-4" aria-live="polite">
      {messages.map((message) => message.role === "user" ? (
        <div key={message.id} className="flex justify-end">
          <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-[20px] rounded-br-[6px] bg-brand-600 px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-[0_8px_18px_rgba(36,89,222,.18)]">
            {message.content}
          </p>
        </div>
      ) : (
        <div key={message.id} className="flex items-start gap-3">
          <PenjagaAvatar size={32} className="mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink-muted">Penjaga</p>
            {message.tools?.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {message.tools.map((tool) => (
                  <span key={tool} className="inline-flex items-center gap-1 rounded-full bg-lavender-10 px-2 py-0.5 text-[11px] font-bold text-lavender-ink">
                    <Cog className="h-3 w-3" aria-hidden /> {toolLabel(tool)}
                  </span>
                ))}
              </div>
            ) : null}
            <div className={cn(
              "mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed",
              message.error ? "rounded-[14px] border border-ember/30 bg-ember-10 px-3.5 py-2.5 text-ember-ink" : "text-ink",
            )}>
              {message.error ? <TriangleAlert className="mb-1 h-4 w-4" aria-hidden /> : null}
              {message.content || <TypingDots />}
            </div>
          </div>
        </div>
      ))}
      {drafts.length ? <DraftReview /> : null}
      <div ref={endRef} />
    </div>
  );
}

export function PenjagaComposer() {
  const { busy, send } = usePenjaga();
  const { disabled, status } = useChatAvailability();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
  }, [text]);

  async function submit() {
    if (!text.trim() || busy || disabled) return;
    const value = text;
    setText("");
    await send(value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 -mx-4 bg-gradient-to-t from-paper via-paper/95 to-transparent px-4 pb-3 pt-6 sm:-mx-6 sm:px-6 md:bottom-0 md:pb-5 lg:-mx-8 lg:px-8">
      <form
        className="mx-auto w-full max-w-3xl"
        onSubmit={(event) => { event.preventDefault(); submit(); }}
      >
        <div className="flex items-end gap-2 rounded-[24px] border border-rule bg-surface-high p-2 pl-4 shadow-float transition focus-within:border-brand-300">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            disabled={disabled}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={disabled ? (status?.mode === "cloud" ? "Aktifkan AI Penjaga di Pengaturan dulu" : "Menyiapkan Penjaga…") : "Ceritakan pengeluaranmu hari ini…"}
            aria-label="Pesan untuk Penjaga"
            className="max-h-[180px] min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-base leading-snug text-ink outline-none placeholder:text-ink-soft disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!text.trim() || busy || disabled}
            aria-label="Kirim"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white shadow-[0_6px_14px_rgba(36,89,222,.3)] transition active:scale-95 disabled:bg-rule disabled:text-ink-soft disabled:shadow-none"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-soft">Penjaga hanya membuat draft — saldo berubah setelah kamu menekan Simpan.</p>
      </form>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1.5" aria-label="Penjaga sedang mengetik">
      {[0, 1, 2].map((index) => (
        <span key={index} className="h-2 w-2 animate-bounce rounded-full bg-brand-400" style={{ animationDelay: `${index * 0.15}s` }} />
      ))}
    </span>
  );
}
