import { Composition, Folder } from "remotion";
import { HeroLoop, HERO_LOOP_SECONDS } from "./HeroLoop";
import { PundiStory, SCENES, STORY_DURATION } from "./PundiStory";
import { Intro } from "./scenes/Intro";
import { Story } from "./scenes/Story";
import { Drafts } from "./scenes/Drafts";
import { Dashboard } from "./scenes/Dashboard";
import { Outro } from "./scenes/Outro";
import { GajianReels, GajianVideo, GAJIAN_DURATION, REELS_DURATION } from "./jujur/GajianVideo";
import { Hook, HOOK_FRAMES } from "./jujur/scenes/Hook";
import { PromiseScene, PROMISE_FRAMES } from "./jujur/scenes/Promise";
import { Cycle, CYCLE_FRAMES } from "./jujur/scenes/Cycle";
import { Honest, HONEST_FRAMES } from "./jujur/scenes/Honest";
import { Transfer, TRANSFER_FRAMES } from "./jujur/scenes/Transfer";
import { Proof, PROOF_FRAMES } from "./jujur/scenes/Proof";
import { Cta, CTA_FRAMES } from "./jujur/scenes/Cta";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Video "Dari Gajian ke Gajian" — identitas 2026-11 (kobalt + lime, Fraunces + Geist). */}
      <Folder name="Gajian-Adegan">
        <Composition id="G1-Hook" component={Hook} width={1920} height={1080} fps={30} durationInFrames={HOOK_FRAMES} />
        <Composition id="G2-Janji" component={PromiseScene} width={1920} height={1080} fps={30} durationInFrames={PROMISE_FRAMES} />
        <Composition id="G3-Siklus" component={Cycle} width={1920} height={1080} fps={30} durationInFrames={CYCLE_FRAMES} />
        <Composition id="G4-Jujur" component={Honest} width={1920} height={1080} fps={30} durationInFrames={HONEST_FRAMES} />
        <Composition id="G5-Pindahkan" component={Transfer} width={1920} height={1080} fps={30} durationInFrames={TRANSFER_FRAMES} />
        <Composition id="G6-Bukti" component={Proof} width={1920} height={1080} fps={30} durationInFrames={PROOF_FRAMES} />
        <Composition id="G7-Ajakan" component={Cta} width={1920} height={1080} fps={30} durationInFrames={CTA_FRAMES} />
      </Folder>
      <Folder name="Gajian">
        <Composition id="Gajian" component={GajianVideo} width={1920} height={1080} fps={30} durationInFrames={GAJIAN_DURATION} />
        <Composition id="GajianVertikal" component={GajianVideo} width={1080} height={1920} fps={30} durationInFrames={GAJIAN_DURATION} />
        <Composition id="GajianReels15" component={GajianReels} width={1080} height={1920} fps={30} durationInFrames={REELS_DURATION} />
      </Folder>
      <Folder name="Adegan">
        <Composition id="Intro" component={Intro} width={1920} height={1080} fps={30} durationInFrames={SCENES.intro} />
        <Composition id="Cerita" component={Story} width={1920} height={1080} fps={30} durationInFrames={SCENES.story} />
        <Composition id="Draft" component={Drafts} width={1920} height={1080} fps={30} durationInFrames={SCENES.drafts} />
        <Composition id="Dashboard" component={Dashboard} width={1920} height={1080} fps={30} durationInFrames={SCENES.dashboard} />
        <Composition id="Penutup" component={Outro} width={1920} height={1080} fps={30} durationInFrames={SCENES.outro} />
      </Folder>
      {/* Latar hero landing — loop mulus tanpa teks (ADR-003). */}
      <Composition id="HeroLoop" component={HeroLoop} width={1920} height={1080} fps={30} durationInFrames={HERO_LOOP_SECONDS * 30} />
      <Composition id="HeroLoopMobile" component={HeroLoop} width={1080} height={1350} fps={30} durationInFrames={HERO_LOOP_SECONDS * 30} />
      {/* Landing desktop (16:9) dan mobile (4:5) — adegan menyesuaikan rasio lewat useLayout(). */}
      <Composition id="PundiStory" component={PundiStory} width={1920} height={1080} fps={30} durationInFrames={STORY_DURATION} />
      <Composition id="PundiStoryMobile" component={PundiStory} width={1080} height={1350} fps={30} durationInFrames={STORY_DURATION} />
    </>
  );
};
