"use client";

/**
 * components/landing/LandingVideo.tsx
 * Video loop latar hero (komposisi Remotion `HeroLoop` di /video —
 * `npm run render:hero`). Video tanpa teks, berulang mulus 10 dtk.
 * 16:9 untuk layar lebar, 4:5 untuk ponsel. Autoplay senyap + tombol jeda
 * (WCAG 2.2.2); prefers-reduced-motion → hanya poster.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function useMedia(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export function HeroVideoBackdrop({ className }: { className?: string }) {
  const mobile = useMedia(MOBILE_QUERY, false);
  const reduced = useMedia(REDUCED_QUERY, false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const base = mobile ? "/landing/hero-loop-mobile" : "/landing/hero-loop";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    video.play().catch(() => undefined);
  }, [base, reduced]);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-[#112772]", className)} aria-hidden={false}>
      {/* Poster selalu ada di bawah video → tidak ada kedip saat video mulai. */}
      <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${base}-poster.jpg)` }} />
      {!reduced ? (
        <video
          key={base}
          ref={videoRef}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Animasi latar: Penjaga Pundi dikelilingi kartu transaksi yang melayang."
          onCanPlay={() => setReady(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={`${base}.mp4`} type="video/mp4" />
        </video>
      ) : null}
      {!reduced ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Jeda animasi latar" : "Putar animasi latar"}
          className="absolute bottom-4 right-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white backdrop-blur-md transition hover:bg-white/20 sm:bottom-6 sm:right-6"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
        </button>
      ) : null}
    </div>
  );
}
