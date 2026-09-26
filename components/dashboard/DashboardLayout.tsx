"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "pundi-dashboard-layout-v1";
const labels: Record<string, string> = {
  summary: "Ringkasan saldo",
  cashflow: "Grafik arus kas",
  accounts: "Kalender & rekening",
  activity: "Aktivitas & target",
  debts: "Utang & piutang",
  insights: "Insight Pundi",
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

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentIds = idsKey.split("|").filter(Boolean);
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as LayoutState | null;
        if (saved) {
          const order = [...saved.order.filter((id) => currentIds.includes(id)), ...currentIds.filter((id) => !saved.order.includes(id))];
          setLayout({ order, hidden: saved.hidden.filter((id) => currentIds.includes(id)) });
        }
      } catch { /* reset invalid local preference */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [idsKey]);

  React.useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout, ready]);

  function move(id: string, direction: -1 | 1) {
    setLayout((current) => {
      const from = current.order.indexOf(id);
      const to = from + direction;
      if (to < 0 || to >= current.order.length) return current;
      const order = [...current.order];
      [order[from], order[to]] = [order[to], order[from]];
      return { ...current, order };
    });
  }

  function drop(target: string) {
    if (!dragged || dragged === target) return setDragged(null);
    setLayout((current) => {
      const order = current.order.filter((id) => id !== dragged);
      order.splice(order.indexOf(target), 0, dragged);
      return { ...current, order };
    });
    setDragged(null);
  }

  const byId = new Map(elements.map((element) => [element.props["data-widget-id"], element]));
  return <>
    <div className="flex justify-end"><Button variant="soft" size="sm" onClick={() => setEditing(true)}><SlidersHorizontal className="h-4 w-4" /> Atur dashboard</Button></div>
    <div className="space-y-5 sm:space-y-6">
      {layout.order.filter((id) => !layout.hidden.includes(id)).map((id) => <React.Fragment key={id}>{byId.get(id)}</React.Fragment>)}
    </div>
    {editing ? <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(false); }}><aside className="absolute inset-y-0 right-0 flex w-full max-w-[430px] flex-col bg-white shadow-float sm:bottom-3 sm:right-3 sm:top-3 sm:rounded-[26px] sm:border sm:border-pine/10"><header className="flex items-start justify-between border-b border-rule p-5"><div><p className="eyebrow">Layout dinamis</p><h2 className="mt-1 text-xl font-black text-ink">Susun dashboard Anda</h2><p className="mt-1 text-xs text-ink-muted">Geser widget atau gunakan tombol panah. Pilihan tersimpan di perangkat ini.</p></div><IconButton variant="soft" aria-label="Tutup" onClick={() => setEditing(false)}><X className="h-4 w-4" /></IconButton></header>
      <div className="flex-1 space-y-2 overflow-y-auto p-5">{layout.order.map((id, index) => { const hidden = layout.hidden.includes(id); return <div key={id} draggable onDragStart={() => setDragged(id)} onDragOver={(event) => event.preventDefault()} onDrop={() => drop(id)} className={cn("flex items-center gap-2 rounded-2xl border p-3 transition", dragged === id ? "border-pine bg-pine-10 opacity-60" : "border-rule bg-paper/70")}><GripVertical className="h-5 w-5 cursor-grab text-ink-muted" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold text-ink">{labels[id] || id}</p><p className="text-[11px] text-ink-muted">{hidden ? "Disembunyikan" : `Posisi ${index + 1}`}</p></div><IconButton variant="ghost" size="icon" aria-label="Naik" disabled={index === 0} onClick={() => move(id, -1)}><ChevronUp className="h-4 w-4" /></IconButton><IconButton variant="ghost" size="icon" aria-label="Turun" disabled={index === layout.order.length - 1} onClick={() => move(id, 1)}><ChevronDown className="h-4 w-4" /></IconButton><IconButton variant="ghost" size="icon" aria-label={hidden ? "Tampilkan" : "Sembunyikan"} onClick={() => setLayout((current) => ({ ...current, hidden: hidden ? current.hidden.filter((item) => item !== id) : [...current.hidden, id] }))}>{hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</IconButton></div>; })}</div>
      <footer className="grid grid-cols-[auto_1fr] gap-2 border-t border-rule p-4"><Button variant="outline" onClick={() => setLayout({ order: [...ids], hidden: [] })}><RotateCcw className="h-4 w-4" /> Reset</Button><Button onClick={() => setEditing(false)}><Check className="h-4 w-4" /> Selesai</Button></footer></aside></div> : null}
  </>;
}
