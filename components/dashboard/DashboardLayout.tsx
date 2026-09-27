"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp, Eye, GripVertical, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "pundi-dashboard-layout-v2";
const labels: Record<string, string> = {
  balance: "Total saldo", income: "Pemasukan", expense: "Pengeluaran",
  cashflow: "Arus kas", composition: "Komposisi pengeluaran", calendar: "Kalender finansial",
  accounts: "Saldo rekening", recent: "Transaksi terkini", budgets: "Anggaran",
  goals: "Tujuan", payable: "Utang", receivable: "Piutang", insights: "Insight Pundi",
};
const spans: Record<string, string> = {
  balance: "md:col-span-6 xl:col-span-6", income: "md:col-span-3 xl:col-span-3", expense: "md:col-span-3 xl:col-span-3",
  cashflow: "md:col-span-6 xl:col-span-8", composition: "md:col-span-3 xl:col-span-4", calendar: "md:col-span-3 xl:col-span-5",
  accounts: "md:col-span-6 xl:col-span-7", recent: "md:col-span-6 xl:col-span-7 xl:row-span-2", budgets: "md:col-span-3 xl:col-span-5",
  goals: "md:col-span-3 xl:col-span-5", payable: "md:col-span-3 xl:col-span-6", receivable: "md:col-span-3 xl:col-span-6",
  insights: "md:col-span-6 xl:col-span-12",
};
type LayoutState = { order: string[]; hidden: string[] };

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const elements = React.Children.toArray(children) as React.ReactElement<{ "data-widget-id"?: string }>[];
  const ids = elements.map((element) => element.props["data-widget-id"]).filter(Boolean) as string[];
  const idsKey = ids.join("|");
  const [layout, setLayout] = React.useState<LayoutState>({ order: ids, hidden: [] });
  const [editing, setEditing] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [dragged, setDragged] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentIds = idsKey.split("|").filter(Boolean);
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as LayoutState | null;
        if (saved) setLayout({
          order: [...saved.order.filter((id) => currentIds.includes(id)), ...currentIds.filter((id) => !saved.order.includes(id))],
          hidden: saved.hidden.filter((id) => currentIds.includes(id)),
        });
      } catch { /* invalid preferences fall back to the default bento */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [idsKey]);

  React.useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); }, [layout, ready]);

  function move(id: string, direction: -1 | 1) {
    setLayout((current) => {
      const from = current.order.indexOf(id); const to = from + direction;
      if (to < 0 || to >= current.order.length) return current;
      const order = [...current.order]; [order[from], order[to]] = [order[to], order[from]];
      return { ...current, order };
    });
  }

  function drop(target: string) {
    if (!dragged || dragged === target) { setDragged(null); setOver(null); return; }
    setLayout((current) => {
      const order = current.order.filter((id) => id !== dragged);
      order.splice(order.indexOf(target), 0, dragged);
      return { ...current, order };
    });
    setDragged(null); setOver(null);
  }

  const byId = new Map(elements.map((element) => [element.props["data-widget-id"], element]));
  const visible = layout.order.filter((id) => !layout.hidden.includes(id));

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-end gap-2">
      {editing ? <>
        <span className="mr-auto rounded-full border border-pine/15 bg-white/75 px-3 py-2 text-[11px] font-bold text-ink-muted shadow-clay-soft">Geser card lewat handle, atau gunakan panah.</span>
        <Button variant="outline" size="sm" onClick={() => setLayout({ order: [...ids], hidden: [] })}><RotateCcw className="h-4 w-4" /> Reset</Button>
        <Button size="sm" onClick={() => setEditing(false)}><Check className="h-4 w-4" /> Selesai</Button>
      </> : <Button variant="soft" size="sm" onClick={() => setEditing(true)}><SlidersHorizontal className="h-4 w-4" /> Atur dashboard</Button>}
    </div>

    {editing && layout.hidden.length ? <div className="flex flex-wrap gap-2 rounded-[18px] border border-dashed border-pine/20 bg-white/55 p-3">{layout.hidden.map((id) => <button key={id} type="button" onClick={() => setLayout((current) => ({ ...current, hidden: current.hidden.filter((item) => item !== id) }))} className="inline-flex items-center gap-2 rounded-full bg-pine-10 px-3 py-2 text-xs font-bold text-pine transition hover:bg-pine-20"><Eye className="h-3.5 w-3.5" /> Tampilkan {labels[id]}</button>)}</div> : null}

    <div className="grid grid-flow-dense grid-cols-1 items-stretch gap-4 md:grid-cols-6 xl:grid-cols-12">
      {visible.map((id, index) => <div key={id} draggable={editing}
        onDragStart={(event) => { setDragged(id); event.dataTransfer.effectAllowed = "move"; }}
        onDragEnd={() => { setDragged(null); setOver(null); }}
        onDragOver={(event) => { if (editing) { event.preventDefault(); setOver(id); } }} onDrop={() => drop(id)}
        className={cn("dashboard-widget relative min-w-0 transition-[transform,opacity,filter] duration-200", spans[id] || "md:col-span-3", editing && "rounded-[28px] ring-2 ring-dashed ring-pine/20 hover:ring-pine/45", dragged === id && "scale-[0.985] opacity-45 saturate-50", over === id && dragged !== id && "translate-y-1 ring-pine/60")}
      >
        {editing ? <div className="absolute -top-3 left-1/2 z-20 flex -translate-x-1/2 items-center rounded-full border border-white/80 bg-white/95 p-1 shadow-float backdrop-blur">
          <span className="flex cursor-grab items-center gap-1 px-2 text-[10px] font-extrabold text-ink"><GripVertical className="h-4 w-4 text-pine" />{labels[id]}</span>
          <IconButton variant="ghost" size="icon" className="h-7 min-h-7 w-7" aria-label={`Pindahkan ${labels[id]} ke atas`} disabled={index === 0} onClick={() => move(id, -1)}><ChevronUp className="h-3.5 w-3.5" /></IconButton>
          <IconButton variant="ghost" size="icon" className="h-7 min-h-7 w-7" aria-label={`Pindahkan ${labels[id]} ke bawah`} disabled={index === visible.length - 1} onClick={() => move(id, 1)}><ChevronDown className="h-3.5 w-3.5" /></IconButton>
          <IconButton variant="ghost" size="icon" className="h-7 min-h-7 w-7" aria-label={`Sembunyikan ${labels[id]}`} onClick={() => setLayout((current) => ({ ...current, hidden: [...current.hidden, id] }))}><Eye className="h-3.5 w-3.5" /></IconButton>
        </div> : null}
        <div className="h-full">{byId.get(id)}</div>
      </div>)}
    </div>
  </div>;
}
