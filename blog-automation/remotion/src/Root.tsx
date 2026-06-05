import { Composition } from "remotion";
import { BlogHero } from "./BlogHero";

// Solo la portada de blog 1200x630. Variable = title + serie + acabado.
export const RemotionRoot: React.FC = () => {
  return (
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
  );
};
