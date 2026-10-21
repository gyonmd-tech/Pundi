"use client";

/**
 * components/ui/usePortalPosition.ts
 * Posisi panel popover (Select, DatePicker) yang dirender lewat portal ke
 * <body> — tidak lagi terpotong oleh parent ber-overflow (ADR-001).
 * Panel ditempel di bawah pemicu, pindah ke atas bila ruang bawah kurang,
 * dan dihitung ulang saat scroll/resize/keyboard virtual muncul.
 */
import { useCallback, useLayoutEffect, useState, useSyncExternalStore, type RefObject } from "react";

export interface PortalPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "bottom" | "top";
}

const GAP = 8;
const EDGE = 12;

const noopSubscribe = () => () => undefined;

/** true setelah hidrasi — portal hanya boleh dirender di klien. */
export function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function usePortalPosition(
  triggerRef: RefObject<HTMLElement | null>,
  open: boolean,
  options: { preferredHeight?: number; minWidth?: number } = {},
) {
  const { preferredHeight = 280, minWidth = 0 } = options;
  const [position, setPosition] = useState<PortalPosition | null>(null);

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const viewportWidth = window.innerWidth;
    const below = viewportHeight - rect.bottom - GAP - EDGE;
    const above = rect.top - GAP - EDGE;
    const placement = below >= Math.min(preferredHeight, 200) || below >= above ? "bottom" : "top";
    const maxHeight = Math.max(120, Math.min(preferredHeight, placement === "bottom" ? below : above));
    const width = Math.min(Math.max(rect.width, minWidth), viewportWidth - EDGE * 2);
    const left = Math.min(Math.max(EDGE, rect.left), viewportWidth - width - EDGE);
    const top = placement === "bottom" ? rect.bottom + GAP : rect.top - GAP;
    setPosition({ top, left, width, maxHeight, placement });
  }, [minWidth, preferredHeight, triggerRef]);

  useLayoutEffect(() => {
    if (!open) return;
    update();
    const onChange = () => update();
    window.addEventListener("scroll", onChange, true);
    window.addEventListener("resize", onChange);
    window.visualViewport?.addEventListener("resize", onChange);
    return () => {
      window.removeEventListener("scroll", onChange, true);
      window.removeEventListener("resize", onChange);
      window.visualViewport?.removeEventListener("resize", onChange);
    };
  }, [open, update]);

  return open ? position : null;
}

/** Gaya inline untuk panel: panel "top" ditempel dari bawah supaya tingginya bebas. */
export function portalPanelStyle(position: PortalPosition): React.CSSProperties {
  return position.placement === "bottom"
    ? { position: "fixed", top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight }
    : { position: "fixed", bottom: (window.visualViewport?.height ?? window.innerHeight) - position.top, left: position.left, width: position.width, maxHeight: position.maxHeight };
}
