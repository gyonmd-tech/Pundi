/**
 * Video "Dari Gajian ke Gajian" (konsep A): hook → janji → 3 fitur → bukti → ajakan.
 * Satu master untuk 16:9 dan 9:16 (tata letak menyesuaikan lewat useLayout),
 * plus potongan 15 detik untuk Reels/TikTok.
 */
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Hook, HOOK_FRAMES } from "./scenes/Hook";
import { PromiseScene, PROMISE_FRAMES } from "./scenes/Promise";
import { Cycle, CYCLE_FRAMES } from "./scenes/Cycle";
import { Honest, HONEST_FRAMES } from "./scenes/Honest";
import { Transfer, TRANSFER_FRAMES } from "./scenes/Transfer";
import { Proof, PROOF_FRAMES } from "./scenes/Proof";
import { Cta, CTA_FRAMES } from "./scenes/Cta";

export const T = 12;
const timing = linearTiming({ durationInFrames: T });

export const GAJIAN_DURATION = HOOK_FRAMES + PROMISE_FRAMES + CYCLE_FRAMES + HONEST_FRAMES + TRANSFER_FRAMES + PROOF_FRAMES + CTA_FRAMES - T * 6;

export const GajianVideo: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Hook" durationInFrames={HOOK_FRAMES}>
      <Hook />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={timing} />
    <TransitionSeries.Sequence name="Janji" durationInFrames={PROMISE_FRAMES}>
      <PromiseScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={timing} />
    <TransitionSeries.Sequence name="Siklus gajian" durationInFrames={CYCLE_FRAMES}>
      <Cycle />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />
    <TransitionSeries.Sequence name="Jatah jujur" durationInFrames={HONEST_FRAMES}>
      <Honest />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />
    <TransitionSeries.Sequence name="Pindahkan jatah" durationInFrames={TRANSFER_FRAMES}>
      <Transfer />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
    <TransitionSeries.Sequence name="Bukti" durationInFrames={PROOF_FRAMES}>
      <Proof />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={timing} />
    <TransitionSeries.Sequence name="Ajakan" durationInFrames={CTA_FRAMES}>
      <Cta />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);

/** Potongan 15 detik: masalah → momen "wow" → ajakan. */
export const REELS_CTA = 150;
export const REELS_DURATION = HOOK_FRAMES + TRANSFER_FRAMES + REELS_CTA - T * 2;

export const GajianReels: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Hook" durationInFrames={HOOK_FRAMES}>
      <Hook />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
    <TransitionSeries.Sequence name="Pindahkan jatah" durationInFrames={TRANSFER_FRAMES}>
      <Transfer />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={timing} />
    <TransitionSeries.Sequence name="Ajakan" durationInFrames={REELS_CTA}>
      <Cta />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
