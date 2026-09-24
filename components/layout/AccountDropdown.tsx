"use client";

import { Check, ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useAccounts } from "@/lib/data/store";
import { formatRupiah } from "@/lib/utils/formatter";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

export function AccountDropdown({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const accounts = useAccounts();
  const selected = accounts.find((account) => account.id === selectedId);
  const total = accounts.reduce((sum, account) => sum + account.balance, 0);
  return (
    <Dropdown align="left" contentClassName="w-72" trigger={({ open, toggle }) => <Button type="button" variant={open ? "soft" : "outline"} size="sm" onClick={toggle} aria-expanded={open} className="max-w-[165px] justify-start sm:max-w-[220px]"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: selected?.colorTag || "var(--color-pine)" }} /><span className="truncate">{selected?.name || "Semua Akun"}</span><ChevronDown className={`ml-auto h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} /></Button>}>
      {({ close }) => <><p className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-ink-muted">Sumber dana</p><DropdownItem onClick={() => { onSelect("all"); close(); }}><span className="h-2.5 w-2.5 rounded-full bg-pine" /><span className="flex-1">Semua Akun</span><span className="font-mono text-[11px] text-ink-muted">{formatRupiah(total)}</span>{selectedId === "all" ? <Check className="h-4 w-4 text-pine" /> : null}</DropdownItem>{accounts.map((account) => <DropdownItem key={account.id} onClick={() => { onSelect(account.id); close(); }}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: account.colorTag }} /><span className="min-w-0 flex-1 truncate">{account.name}</span><span className="font-mono text-[11px] text-ink-muted">{formatRupiah(account.balance)}</span>{selectedId === account.id ? <Check className="h-4 w-4 text-pine" /> : null}</DropdownItem>)}<div className="mt-2 border-t border-rule pt-2"><Link href="/pengaturan" className="flex min-h-10 items-center justify-between rounded-[12px] px-3 text-xs font-bold text-pine hover:bg-pine-10">Kelola rekening<ExternalLink className="h-3.5 w-3.5" /></Link></div></>}
    </Dropdown>
  );
}
