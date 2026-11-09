/**
 * lib/utils/mergeClasses.ts
 * Penggabung class Tailwind ringan (±2 KB) pengganti tailwind-merge (±27 KB
 * di setiap halaman). Aturannya sama untuk kasus yang dipakai Pundi: bila dua
 * class dari kelompok yang sama bertemu (mis. `h-10` lalu `h-9`, atau
 * `bg-brand-600` lalu `bg-ember`), yang terakhir menang — per varian
 * (`sm:`, `hover:`, …). Class yang tidak dikenali tidak pernah dibuang.
 *
 * Kesetaraannya dengan tailwind-merge diuji terhadap korpus input cn() nyata
 * dari seluruh halaman (tests/unit/merge-classes.test.ts).
 */

const SIZE_WORDS = new Set(["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", "body", "small", "heading", "display-xl", "display-l", "data-l", "data-m"]);
const FONT_WEIGHTS = new Set(["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"]);
const DISPLAY = new Set(["block", "inline-block", "inline", "flex", "inline-flex", "grid", "inline-grid", "hidden", "contents", "table", "table-row", "table-cell", "flow-root", "list-item"]);
const POSITION = new Set(["static", "fixed", "absolute", "relative", "sticky"]);
const TEXT_ALIGN = new Set(["left", "center", "right", "justify", "start", "end"]);
const TEXT_WRAP = new Set(["wrap", "nowrap", "balance", "pretty"]);
const ALONE: Record<string, string> = {
  truncate: "text-overflow", "text-ellipsis": "text-overflow", "text-clip": "text-overflow",
  uppercase: "text-transform", lowercase: "text-transform", capitalize: "text-transform", "normal-case": "text-transform",
  italic: "font-style", "not-italic": "font-style",
  underline: "text-decoration", "no-underline": "text-decoration", "line-through": "text-decoration",
  grow: "grow", "grow-0": "grow", shrink: "shrink", "shrink-0": "shrink",
  visible: "visibility", invisible: "visibility", collapse: "visibility",
  "sr-only": "sr", "not-sr-only": "sr",
  "tabular-nums": "fvn-spacing", "proportional-nums": "fvn-spacing",
  border: "border-w", "border-0": "border-w", "border-2": "border-w", "border-4": "border-w", "border-8": "border-w",
  rounded: "rounded", shadow: "shadow", ring: "ring-w", outline: "outline-style", "outline-none": "outline-style",
  transition: "transition", "transition-none": "transition",
};

function isColorValue(value: string) {
  if (value.startsWith("[")) {
    const inner = value.slice(1, -1);
    return /^(#|rgb|hsl|oklch|color-mix|var\(--color|color:)/.test(inner);
  }
  // Warna token: inherit/current/transparent/black/white/<nama>(-<shade>)?(/opacity)?
  return !/^\d/.test(value) && !SIZE_WORDS.has(value.split("/")[0]);
}

function isLengthArbitrary(value: string) {
  return /^\[(\d|clamp|calc|min\(|max\(|var\(--text|length:)/.test(value);
}

/** Kunci kelompok konflik untuk satu class tanpa varian; null = tidak dikenali. */
function groupOf(base: string): string | null {
  const cls = base.replace(/^!/, "").replace(/!$/, "").replace(/^-/, "");
  if (ALONE[cls]) return ALONE[cls];
  if (DISPLAY.has(cls)) return "display";
  if (POSITION.has(cls)) return "position";

  const dash = cls.indexOf("-");
  const head = dash === -1 ? cls : cls.slice(0, dash);
  const rest = dash === -1 ? "" : cls.slice(dash + 1);

  switch (head) {
    case "p": case "px": case "py": case "pt": case "pr": case "pb": case "pl": case "ps": case "pe":
    case "m": case "mx": case "my": case "mt": case "mr": case "mb": case "ml": case "ms": case "me":
    case "w": case "h": case "size": case "z": case "order": case "basis": case "top": case "right": case "bottom": case "left":
    case "opacity": case "leading": case "tracking": case "duration": case "delay": case "ease": case "animate": case "aspect":
    case "cursor": case "select": case "whitespace": case "break": case "origin": case "rotate": case "fill": case "stroke":
      if (head === "stroke" && /^\d|^\[\d/.test(rest)) return "stroke-w";
      return head;
    case "min": case "max": return cls.startsWith("min-w-") ? "min-w" : cls.startsWith("min-h-") ? "min-h" : cls.startsWith("max-w-") ? "max-w" : cls.startsWith("max-h-") ? "max-h" : null;
    case "inset": return rest.startsWith("x-") ? "inset-x" : rest.startsWith("y-") ? "inset-y" : "inset";
    case "gap": return rest.startsWith("x-") ? "gap-x" : rest.startsWith("y-") ? "gap-y" : "gap";
    case "space": return rest.startsWith("x-") ? "space-x" : "space-y";
    case "overflow": return rest.startsWith("x-") ? "overflow-x" : rest.startsWith("y-") ? "overflow-y" : "overflow";
    case "translate": return rest.startsWith("x-") ? "translate-x" : "translate-y";
    case "scale": return rest.startsWith("x-") ? "scale-x" : rest.startsWith("y-") ? "scale-y" : "scale";
    case "items": case "justify": case "self": case "content": case "object": return rest.startsWith("items-") || rest.startsWith("self-") ? `${head}-${rest.split("-")[0]}` : head;
    case "place": return `place-${rest.split("-")[0]}`;
    case "grid": return rest.startsWith("cols-") ? "grid-cols" : rest.startsWith("rows-") ? "grid-rows" : rest.startsWith("flow-") ? "grid-flow" : null;
    case "col": return rest.startsWith("span-") ? "col-span" : rest.startsWith("start-") ? "col-start" : "col-end";
    case "row": return rest.startsWith("span-") ? "row-span" : "row";
    case "flex":
      if (["row", "row-reverse", "col", "col-reverse"].includes(rest)) return "flex-dir";
      if (["wrap", "wrap-reverse", "nowrap"].includes(rest)) return "flex-wrap";
      return "flex";
    case "pointer": return "pointer-events";
    case "transition": return "transition";
    case "backdrop": return rest.startsWith("blur") ? "backdrop-blur" : `backdrop-${rest.split("-")[0]}`;
    case "blur": return "blur";
    case "font":
      if (FONT_WEIGHTS.has(rest) || /^\[\d/.test(rest)) return "font-weight";
      return "font-family";
    case "text":
      if (TEXT_ALIGN.has(rest)) return "text-align";
      if (TEXT_WRAP.has(rest)) return "text-wrap";
      if (SIZE_WORDS.has(rest.split("/")[0]) || isLengthArbitrary(rest)) return "text-size";
      return isColorValue(rest) ? "text-color" : null;
    case "bg":
      if (rest.startsWith("gradient") || rest.startsWith("linear") || rest.startsWith("radial") || rest === "none" || rest.startsWith("[url") || rest.startsWith("[linear") || rest.startsWith("[radial")) return "bg-image";
      if (["cover", "contain", "auto"].includes(rest)) return "bg-size";
      if (["center", "top", "bottom", "left", "right"].includes(rest)) return "bg-position";
      if (["fixed", "local", "scroll", "clip-border", "clip-padding", "clip-content", "clip-text"].includes(rest)) return null;
      return isColorValue(rest) ? "bg-color" : null;
    case "border": {
      const side = /^(x|y|t|r|b|l|s|e)(-|$)/.exec(rest);
      const value = side ? rest.slice(side[0].length) : rest;
      const suffix = side ? `-${side[1]}` : "";
      if (["solid", "dashed", "dotted", "double", "none", "hidden"].includes(value)) return "border-style";
      if (value === "" || /^\d+$/.test(value) || /^\[\d/.test(value)) return `border-w${suffix}`;
      return isColorValue(value) ? `border-color${suffix}` : null;
    }
    case "rounded": {
      const corner = /^(t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee)(-|$)/.exec(rest);
      return corner ? `rounded-${corner[1]}` : "rounded";
    }
    case "ring":
      if (rest.startsWith("offset-")) return /^offset-(\d|\[\d)/.test(rest) ? "ring-offset-w" : "ring-offset-color";
      if (rest === "" || /^\d/.test(rest) || /^\[\d/.test(rest)) return "ring-w";
      if (rest === "inset") return "ring-inset";
      return "ring-color";
    case "outline":
      if (["dashed", "dotted", "double", "none", "solid"].includes(rest)) return "outline-style";
      if (rest.startsWith("offset-")) return "outline-offset";
      if (/^\d|^\[\d/.test(rest)) return "outline-w";
      return "outline-color";
    case "shadow":
      if (rest === "" || ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inner", "none", "card", "float", "focus"].includes(rest) || rest.startsWith("[") && !isColorValue(rest)) return "shadow";
      return "shadow-color";
    case "line": return rest.startsWith("clamp") ? "line-clamp" : null;
    case "divide":
      if (rest.startsWith("x") && /^x(-|$)/.test(rest)) return /^x(-\d|$)/.test(rest) ? "divide-x" : null;
      if (/^y(-\d|$)/.test(rest)) return "divide-y";
      if (["solid", "dashed", "dotted", "double", "none"].includes(rest)) return "divide-style";
      return isColorValue(rest) ? "divide-color" : null;
    default:
      return null;
  }
}

/** Kelompok yang ditimpa oleh kelompok lain bila muncul belakangan (mis. `p-4` menimpa `px-2`). */
const OVERRIDES: Record<string, string[]> = {
  p: ["px", "py", "pt", "pr", "pb", "pl", "ps", "pe"], px: ["pr", "pl", "ps", "pe"], py: ["pt", "pb"],
  m: ["mx", "my", "mt", "mr", "mb", "ml", "ms", "me"], mx: ["mr", "ml", "ms", "me"], my: ["mt", "mb"],
  inset: ["inset-x", "inset-y", "top", "right", "bottom", "left"], "inset-x": ["right", "left"], "inset-y": ["top", "bottom"],
  gap: ["gap-x", "gap-y"], overflow: ["overflow-x", "overflow-y"], size: ["w", "h"],
  rounded: ["rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-s", "rounded-e", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
  "rounded-t": ["rounded-tl", "rounded-tr"], "rounded-b": ["rounded-bl", "rounded-br"], "rounded-l": ["rounded-tl", "rounded-bl"], "rounded-r": ["rounded-tr", "rounded-br"],
  "border-w": ["border-w-x", "border-w-y", "border-w-t", "border-w-r", "border-w-b", "border-w-l", "border-w-s", "border-w-e"],
  "border-w-x": ["border-w-r", "border-w-l"], "border-w-y": ["border-w-t", "border-w-b"],
  "border-color": ["border-color-x", "border-color-y", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
  "text-size": ["leading"],
  "line-clamp": ["display", "overflow"],
};

function splitVariant(token: string) {
  // Pisahkan varian (`sm:hover:`) dengan mengabaikan ':' di dalam [...]
  let depth = 0;
  let last = -1;
  for (let i = 0; i < token.length; i++) {
    const char = token[i];
    if (char === "[") depth++;
    else if (char === "]") depth--;
    else if (char === ":" && depth === 0) last = i;
  }
  return last === -1 ? { variant: "", base: token } : { variant: token.slice(0, last + 1), base: token.slice(last + 1) };
}

export function mergeClasses(classes: string): string {
  const tokens = classes.split(/\s+/).filter(Boolean);
  const keep: boolean[] = new Array(tokens.length).fill(true);
  const seen = new Set<string>();
  // Dari belakang ke depan: class yang lebih akhir menang.
  for (let i = tokens.length - 1; i >= 0; i--) {
    const { variant, base } = splitVariant(tokens[i]);
    const important = base.startsWith("!") || base.endsWith("!") ? "!" : "";
    const group = groupOf(base);
    const exact = `exact:${tokens[i]}`;
    if (seen.has(exact)) { keep[i] = false; continue; }
    seen.add(exact);
    if (!group) continue;
    const key = `${variant}${important}${group}`;
    if (seen.has(key)) { keep[i] = false; continue; }
    seen.add(key);
    for (const child of OVERRIDES[group] ?? []) seen.add(`${variant}${important}${child}`);
  }
  return tokens.filter((_, index) => keep[index]).join(" ");
}
