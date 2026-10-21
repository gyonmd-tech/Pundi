import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Intro } from "./scenes/Intro";
import { Story } from "./scenes/Story";
import { Drafts } from "./scenes/Drafts";
import { Dashboard } from "./scenes/Dashboard";
import { Outro } from "./scenes/Outro";

export const SCENES = {
  intro: 90,
  story: 165,
  drafts: 170,
  dashboard: 150,
  outro: 105,
};
export const TRANSITION = 15;
export const STORY_DURATION = Object.values(SCENES).reduce((sum, value) => sum + value, 0) - TRANSITION * 4;

/** Video hero landing page: cerita → draft → dashboard rapi. */
export const PundiStory: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Intro" durationInFrames={SCENES.intro}>
      <Intro />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION })} />
    <TransitionSeries.Sequence name="Cerita" durationInFrames={SCENES.story}>
      <Story />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: TRANSITION })} />
    <TransitionSeries.Sequence name="Draft" durationInFrames={SCENES.drafts}>
      <Drafts />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: TRANSITION })} />
    <TransitionSeries.Sequence name="Dashboard" durationInFrames={SCENES.dashboard}>
      <Dashboard />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION })} />
    <TransitionSeries.Sequence name="Penutup" durationInFrames={SCENES.outro}>
      <Outro />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
