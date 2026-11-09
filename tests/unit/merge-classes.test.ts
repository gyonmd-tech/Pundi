import { describe, expect, it } from "vitest";
import { extendTailwindMerge } from "tailwind-merge";
import { mergeClasses } from "@/lib/utils/mergeClasses";
import corpus from "../fixtures/cn-corpus.json";

// Pembanding: tailwind-merge yang DIKONFIGURASI dengan tema Pundi. Tanpa
// konfigurasi ini tailwind-merge salah mengira `text-small`/`text-body` sebagai
// warna dan diam-diam membuangnya, serta tidak mengenal radius/bayangan kustom.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["body", "small", "heading", "display-xl", "display-l", "data-l", "data-m"],
      radius: ["card", "panel"],
      shadow: ["card", "float", "focus"],
    },
  },
});

const asSet = (classes: string) => new Set(classes.split(/\s+/).filter(Boolean));

describe("mergeClasses (pengganti tailwind-merge)", () => {
  it("setara tailwind-merge untuk semua input cn() nyata dari seluruh halaman", () => {
    const inputs = corpus as string[];
    expect(inputs.length).toBeGreaterThan(200);
    const mismatches = inputs
      .filter((input) => {
        const expected = asSet(twMerge(input));
        const actual = asSet(mergeClasses(input));
        return expected.size !== actual.size || [...expected].some((cls) => !actual.has(cls));
      })
      .map((input) => ({ input, expected: twMerge(input), actual: mergeClasses(input) }));
    expect(mismatches).toEqual([]);
  });

  it.each([
    ["h-10 min-h-10 w-10 px-0 h-9 min-h-9 w-9", "px-0 h-9 min-h-9 w-9"],
    ["px-4 text-sm font-semibold text-xs font-bold", "px-4 text-xs font-bold"],
    ["bg-brand-600 text-white bg-ember hover:bg-brand-700 hover:bg-ember-ink", "text-white bg-ember hover:bg-ember-ink"],
    ["text-ink text-sm text-ember-ink", "text-sm text-ember-ink"],
    ["border border-rule border-ember/35", "border border-ember/35"],
    ["px-2 py-1 p-4", "p-4"],
    ["p-4 px-2", "p-4 px-2"],
    ["rounded-sm rounded-full sm:rounded-card", "rounded-full sm:rounded-card"],
    ["text-[11px] text-[#FFB4B8] text-[13px]", "text-[#FFB4B8] text-[13px]"],
    ["shadow-card shadow-[0_1px_2px_rgba(0,0,0,.1)]", "shadow-[0_1px_2px_rgba(0,0,0,.1)]"],
    ["hidden sm:inline-flex inline-flex", "sm:inline-flex inline-flex"],
    ["grid h-9 w-9 place-items-center flex", "h-9 w-9 place-items-center flex"],
  ])("%s", (input, expected) => {
    expect(asSet(mergeClasses(input))).toEqual(asSet(twMerge(input)));
    expect(asSet(mergeClasses(input))).toEqual(asSet(expected));
  });
});
