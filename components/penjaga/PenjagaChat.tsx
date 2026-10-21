"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Cog, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PenjagaAvatar } from "./PenjagaAvatar";
import { toolLabel, usePenjaga } from "./PenjagaProvider";

const SUGGESTIONS = [
  "Hari ini sarapan 15rb, makan siang soto 25rb, bensin 30rb pakai cash",
  "Gajian 5,5jt masuk BCA, terus transfer 1jt ke tabungan",
  "Berapa total pengeluaranku minggu ini?",
];

export function PenjagaChat({ className }: { className?: string }) {
  const { messages, busy, send, status } = usePenjaga();
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const disabled = !status || status.chat === "not-configured" || status.chat === "not-owner";

  useEffect(() => {
    const list = listRef.current;
    if (list && messages.length) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }, [text]);

  async function submit(value = text) {
    if (!value.trim() || busy || disabled) return;
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
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div ref={listRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center px-2 py-4 text-center">
            <p className="max-w-sm text-sm leading-relaxed text-ink-muted">
              Ceritakan harimu dengan bahasa sehari-hari. Penjaga memecahnya menjadi catatan, lalu kamu cukup memeriksa dan menekan <b className="text-ink">Simpan</b>.
            </p>
            <div className="mt-5 flex w-full flex-col gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={disabled}
                  onClick={() => submit(suggestion)}
                  className="rounded-[14px] border border-rule bg-paper px-3.5 py-2.5 text-left text-[13px] font-medium leading-snug text-ink transition hover:border-brand-300 hover:bg-brand-50 active:scale-[.99] disabled:opacity-50"
                >
                  “{suggestion}”
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) => message.role === "user" ? (
          <div key={message.id} className="flex justify-end">
            <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-[18px] rounded-br-[6px] bg-brand-600 px-4 py-2.5 text-sm leading-relaxed text-white shadow-[0_8px_18px_rgba(36,89,222,.18)]">
              {message.content}
            </p>
          </div>
        ) : (
          <div key={message.id} className="flex items-end gap-2.5">
            <PenjagaAvatar size={34} />
            <div className="min-w-0 max-w-[85%]">
              {message.tools?.length ? (
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  {message.tools.map((tool) => (
                    <span key={tool} className="inline-flex items-center gap-1 rounded-full bg-lavender-10 px-2 py-0.5 text-[10px] font-bold text-lavender-ink">
                      <Cog className="h-3 w-3" aria-hidden /> {toolLabel(tool)}
                    </span>
                  ))}
                </div>
              ) : null}
              <div
                className={cn(
                  "whitespace-pre-wrap break-words rounded-[18px] rounded-bl-[6px] px-4 py-2.5 text-sm leading-relaxed",
                  message.error ? "border border-ember/30 bg-ember-10 text-ember-ink" : "border border-rule bg-surface-high text-ink",
                )}
              >
                {message.error ? <TriangleAlert className="mb-1 h-4 w-4" aria-hidden /> : null}
                {message.content || <TypingDots />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        className="border-t border-rule bg-surface-high/80 p-3 backdrop-blur sm:p-4"
        onSubmit={(event) => { event.preventDefault(); submit(); }}
      >
        <div className="flex items-end gap-2 rounded-[18px] border border-rule bg-paper p-1.5 pl-3.5 transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-500/10">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            disabled={disabled}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={disabled ? "Hubungkan Hermes untuk mulai mengobrol" : "Ceritakan pengeluaranmu hari ini…"}
            aria-label="Pesan untuk Penjaga"
            className="max-h-[140px] min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-snug text-ink outline-none placeholder:text-ink-soft disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!text.trim() || busy || disabled}
            aria-label="Kirim"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-brand-600 text-white shadow-[0_6px_14px_rgba(36,89,222,.3)] transition active:scale-95 disabled:bg-brand-200 disabled:shadow-none"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>
      </form>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Penjaga sedang mengetik">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400"
          style={{ animationDelay: `${index * 0.15}s` }}
        />
      ))}
    </span>
  );
}
