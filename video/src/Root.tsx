import { Composition, Folder } from "remotion";
import { PundiStory, SCENES, STORY_DURATION } from "./PundiStory";
import { Intro } from "./scenes/Intro";
import { Story } from "./scenes/Story";
import { Drafts } from "./scenes/Drafts";
import { Dashboard } from "./scenes/Dashboard";
import { Outro } from "./scenes/Outro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Adegan">
        <Composition id="Intro" component={Intro} width={1920} height={1080} fps={30} durationInFrames={SCENES.intro} />
        <Composition id="Cerita" component={Story} width={1920} height={1080} fps={30} durationInFrames={SCENES.story} />
        <Composition id="Draft" component={Drafts} width={1920} height={1080} fps={30} durationInFrames={SCENES.drafts} />
        <Composition id="Dashboard" component={Dashboard} width={1920} height={1080} fps={30} durationInFrames={SCENES.dashboard} />
        <Composition id="Penutup" component={Outro} width={1920} height={1080} fps={30} durationInFrames={SCENES.outro} />
      </Folder>
      {/* Landing desktop (16:9) dan mobile (4:5) — adegan menyesuaikan rasio lewat useLayout(). */}
      <Composition id="PundiStory" component={PundiStory} width={1920} height={1080} fps={30} durationInFrames={STORY_DURATION} />
      <Composition id="PundiStoryMobile" component={PundiStory} width={1080} height={1350} fps={30} durationInFrames={STORY_DURATION} />
    </>
  );
};
