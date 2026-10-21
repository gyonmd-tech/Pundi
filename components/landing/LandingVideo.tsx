"use client";

/**
 * components/landing/LandingVideo.tsx
 * Video motion graphics hero landing (dirender dari proyek Remotion di
 * /video — `npm run render` di folder itu). 16:9 untuk layar lebar, 4:5
 * untuk ponsel. Autoplay senyap + loop, dengan tombol jeda (WCAG 2.2.2) dan
 * tidak autoplay bila pengguna memilih prefers-reduced-motion.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";

const MOBILE_QUERY = "(max-width: 639px)";
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

export function LandingVideo() {
  const mobile = useMedia(MOBILE_QUERY, false);
  const reduced = useMedia(REDUCED_QUERY, false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const base = mobile ? "/landing/pundi-story-mobile" : "/landing/pundi-story";

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
    <div className="relative overflow-hidden rounded-[1.5rem] border border-rule bg-brand-900 shadow-float sm:rounded-[1.75rem]">
      <video
        key={base}
        ref={videoRef}
        className="block aspect-[4/5] w-full object-cover sm:aspect-video"
        poster={`${base}-poster.jpg`}
        autoPlay={!reduced}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Animasi: pengguna bercerita ke Penjaga, Penjaga menyusun draft transaksi, lalu dashboard Pundi diperbarui."
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={`${base}.mp4`} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Jeda video" : "Putar video"}
        className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-brand-950/60 text-white backdrop-blur-md transition hover:bg-brand-950/80 sm:bottom-4 sm:right-4"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
      </button>
    </div>
  );
}
