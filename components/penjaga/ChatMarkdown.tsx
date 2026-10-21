/**
 * components/penjaga/ChatMarkdown.tsx
 * Render markdown ringan dari jawaban AI: paragraf, daftar (- / * / 1.),
 * **tebal**, *miring*, `kode`. Teks diubah menjadi elemen React — tidak
 * ada HTML mentah, jadi aman dari injeksi. Format lain tampil sebagai teks.
 */
import { Fragment, type ReactNode } from "react";

const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*|_[^_\n]+_)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={key} className="font-bold text-ink">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={key} className="rounded-md bg-surface-soft px-1.5 py-0.5 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      if (part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

type Block =
  | { type: "p"; lines: string[] }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "h"; text: string };

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of source.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    const last = blocks.at(-1);
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const heading = /^\s*#{1,4}\s+(.*)$/.exec(line);

    if (!line.trim()) {
      blocks.push({ type: "p", lines: [] });
    } else if (heading) {
      blocks.push({ type: "h", text: heading[1] });
    } else if (bullet) {
      if (last?.type === "ul") last.items.push(bullet[1]);
      else blocks.push({ type: "ul", items: [bullet[1]] });
    } else if (numbered) {
      if (last?.type === "ol") last.items.push(numbered[1]);
      else blocks.push({ type: "ol", items: [numbered[1]] });
    } else if (last?.type === "p") {
      last.lines.push(line);
    } else {
      blocks.push({ type: "p", lines: [line] });
    }
  }
  return blocks.filter((block) => block.type !== "p" || block.lines.length > 0);
}

export function ChatMarkdown({ text }: { text: string }) {
  return (
    <div className="space-y-2.5">
      {parseBlocks(text).map((block, index) => {
        const key = `b${index}`;
        if (block.type === "h") return <p key={key} className="font-bold text-ink">{renderInline(block.text, key)}</p>;
        if (block.type === "ul") {
          return (
            <ul key={key} className="space-y-1 pl-1">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`} className="flex gap-2">
                  <span aria-hidden className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <span className="min-w-0">{renderInline(item, `${key}-${itemIndex}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={key} className="space-y-1 pl-1">
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`} className="flex gap-2">
                  <span className="w-5 shrink-0 text-right font-semibold tabular-nums text-ink-muted">{itemIndex + 1}.</span>
                  <span className="min-w-0">{renderInline(item, `${key}-${itemIndex}`)}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={key}>
            {block.lines.map((line, lineIndex) => (
              <Fragment key={`${key}-${lineIndex}`}>
                {lineIndex ? <br /> : null}
                {renderInline(line, `${key}-${lineIndex}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
