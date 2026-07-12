import { Composition } from "remotion";
import { BlogHero } from "./BlogHero";
import { MiaPromo, DURACION_FRAMES, FPS } from "./MiaPromo";

// Portada de blog 1200x630. Variable = title + serie + acabado.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BlogHero"
        component={BlogHero}
        durationInFrames={1}
        fps={30}
        width={1200}
        height={630}
        defaultProps={{
          title: "Cocinas a medida en Huelva",
          serie: "Real",
          acabado: "Roble Aurora",
        }}
      />
      {/* Promo de Mía con voz (Sarah) — horizontal y vertical */}
      <Composition
        id="MiaPromo-169"
        component={MiaPromo}
        durationInFrames={DURACION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="MiaPromo-916"
        component={MiaPromo}
        durationInFrames={DURACION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
