import type { TransitionEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import styles from "./AuthForm.module.css";

interface AuthVisualPanelProps {
  mode: "login" | "signup";
  moving: boolean;
  onMotionEnd: () => void;
}

export function AuthVisualPanel({ mode, moving, onMotionEnd }: AuthVisualPanelProps) {
  function handleTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.target === event.currentTarget && event.propertyName === "transform") {
      onMotionEnd();
    }
  }

  return (
    <section
      className={cn(
        styles.visualPanel,
        mode === "signup" && styles.visualSignup,
        moving && styles.visualMoving,
      )}
      aria-label="Ilustrasi pengelolaan keuangan Pundi"
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={styles.panelSurface}>
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_center,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-sky/35 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-mint/20 blur-3xl" />
      </div>

      <div className={cn(styles.colorSwipe, mode === "signup" ? styles.swipeForward : styles.swipeBackward)} aria-hidden />

      <div className={cn(styles.illustrationFloat, "relative z-10 aspect-square w-full max-w-[270px] sm:max-w-[330px] lg:max-w-[560px]")}>
        <div className="absolute inset-[10%] rounded-full bg-white/10 blur-2xl" />
        <Image
          src="/illustrasi-authpage.png"
          alt="Ilustrasi dashboard dan analisis keuangan Pundi"
          fill
          priority
          unoptimized
          sizes="(min-width: 1024px) 48vw, 330px"
          className="object-contain drop-shadow-[0_28px_38px_rgba(17,13,72,0.3)]"
        />
      </div>
    </section>
  );
}