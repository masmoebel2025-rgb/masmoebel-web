import { AbsoluteFill } from "remotion";

// Portada de blog 1200x630 — plantilla FIJA de marca; variable = title + serie + acabado.
export interface BlogHeroProps {
  title: string;
  serie: string;
  acabado: string;
}

const DARK = "#1A1A1A";
const GOLD = "#D4AF37";

export const BlogHero: React.FC<BlogHeroProps> = ({ title, serie, acabado }) => {
  return (
    <AbsoluteFill style={{ background: `linear-gradient(135deg, #262626 0%, ${DARK} 55%, #0d0d0d 100%)`, padding: 80, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      {/* Marca arriba */}
      <div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 34, color: GOLD, letterSpacing: "7px" }}>MASMOEBEL</div>
        <div style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", letterSpacing: "3px", marginTop: 6 }}>COCINAS A MEDIDA · HUELVA</div>
      </div>

      {/* Titulo del articulo */}
      <div style={{ maxWidth: 1000 }}>
        <div style={{ width: 70, height: 3, backgroundColor: GOLD, marginBottom: 26 }} />
        <div style={{ fontFamily: "Georgia, serif", fontSize: 60, lineHeight: 1.12, color: "#fff", fontWeight: 700, textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
          {title}
        </div>
      </div>

      {/* Pie: serie/acabado real (variable) + web */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 26px", border: `1.5px solid ${GOLD}`, borderRadius: 50 }}>
          <span style={{ fontSize: 19, color: "rgba(255,255,255,0.6)", letterSpacing: "2px" }}>SERIE</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 26, color: "#fff" }}>{serie}</span>
          <span style={{ color: GOLD, fontSize: 22 }}>·</span>
          <span style={{ fontSize: 24, color: GOLD }}>{acabado}</span>
        </div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 28, color: GOLD }}>masmoebel.es</div>
      </div>
    </AbsoluteFill>
  );
};
