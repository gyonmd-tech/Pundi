"use client";

import * as React from "react";
import { Grip, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const STORAGE_KEY = "pundi-dashboard-layout-v3";
const labels: Record<string, string> = {
  balance: "Total saldo", income: "Pemasukan", expense: "Pengeluaran",
  cashflow: "Arus kas", composition: "Komposisi pengeluaran", rhythm: "Ritme pengeluaran",
  health: "Kesehatan kas", calendar: "Kalender finansial", accounts: "Saldo rekening",
  recent: "Transaksi terkini", budgets: "Anggaran", goals: "Tujuan", payable: "Utang",
  receivable: "Piutang", insights: "Insight Pundi",
};
const spans: Record<string, string> = {
  balance: "md:col-span-6 xl:col-span-6", income: "md:col-span-3 xl:col-span-3", expense: "md:col-span-3 xl:col-span-3",
  cashflow: "md:col-span-6 xl:col-span-8", composition: "md:col-span-3 xl:col-span-4", rhythm: "md:col-span-3 xl:col-span-5",
  health: "md:col-span-3 xl:col-span-3", calendar: "md:col-span-3 xl:col-span-4", accounts: "md:col-span-6 xl:col-span-7",
  recent: "md:col-span-6 xl:col-span-7 xl:row-span-2", budgets: "md:col-span-3 xl:col-span-5", goals: "md:col-span-3 xl:col-span-5",
  payable: "md:col-span-3 xl:col-span-6", receivable: "md:col-span-3 xl:col-span-6", insights: "md:col-span-6 xl:col-span-12",
};

function subscribeFinePointer(callback: () => void) {
  const media = window.matchMedia("(pointer: fine)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const elements = React.Children.toArray(children) as React.ReactElement<{ "data-widget-id"?: string }>[];
  const ids = elements.map((element) => element.props["data-widget-id"]).filter(Boolean) as string[];
  const idsKey = ids.join("|");
  const [order, setOrder] = React.useState(ids);
  const [ready, setReady] = React.useState(false);
  const [dragged, setDragged] = React.useState<string | null>(null);
  const [over, setOver] = React.useState<string | null>(null);
  // Drag & drop HTML5 tidak andal di layar sentuh — di ponsel kartu tersusun tetap.
  const canDrag = React.useSyncExternalStore(subscribeFinePointer, () => window.matchMedia("(pointer: fine)").matches, () => true);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentIds = idsKey.split("|").filter(Boolean);
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as string[] | null;
        if (saved) setOrder([...saved.filter((id) => currentIds.includes(id)), ...currentIds.filter((id) => !saved.includes(id))]);
      } catch { setOrder(currentIds); }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [idsKey]);

  React.useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(order)); }, [order, ready]);

  function drop(target: string) {
    if (!dragged || dragged === target) { setDragged(null); setOver(null); return; }
    setOrder((current) => {
      const next = current.filter((id) => id !== dragged);
      next.splice(next.indexOf(target), 0, dragged);
      return next;
    });
    setDragged(null); setOver(null);
  }

  const byId = new Map(elements.map((element) => [element.props["data-widget-id"], element]));

  return <div className="space-y-4">
    {canDrag ? <div className="hidden flex-wrap items-center justify-between gap-3 rounded-[22px] md:flex border border-brand-950 bg-brand-900 px-4 py-3 text-white shadow-card">
      <div className="flex items-center gap-2 text-xs font-semibold"><Grip className="h-4 w-4" /><span>Tarik kartu langsung untuk menyusun puzzle dashboard.</span></div>
      <Button variant="outline" size="sm" onClick={() => setOrder([...ids])}><RotateCcw className="h-4 w-4" /> Atur ulang</Button>
    </div> : null}

    <div className={cn("dashboard-puzzle grid grid-flow-dense grid-cols-2 items-stretch gap-3 sm:gap-4 rounded-[30px] transition-all md:grid-cols-6 xl:grid-cols-12", dragged && "is-dragging p-3")}>
      {order.map((id) => <div
        key={id}
        draggable={canDrag}
        aria-label={canDrag ? `${labels[id]}. Tarik untuk memindahkan kartu.` : labels[id]}
        onDragStart={(event) => { setDragged(id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", id); }}
        onDragEnd={() => { setDragged(null); setOver(null); }}
        onDragEnter={() => { if (dragged && dragged !== id) setOver(id); }}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }}
        onDrop={() => drop(id)}
        className={cn(
          "dashboard-widget group relative min-w-0 touch-pan-y transition-[transform,opacity,filter,box-shadow] duration-200",
          canDrag && "cursor-grab active:cursor-grabbing",
          id === "income" || id === "expense" ? "col-span-1" : "col-span-2",
          spans[id] || "md:col-span-3",
          dragged === id && "scale-[0.97] opacity-35 saturate-50",
          over === id && dragged !== id && "scale-[1.015] rounded-[30px] ring-4 ring-brand-500/25",
        )}
      >
        <div className="h-full">{byId.get(id)}</div>
      </div>)}
    </div>
  </div>;
}
