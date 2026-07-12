// ============================================================
// MiaPromo.tsx — vídeo publicitario de Mía (~44s, con voz Sarah)
//
// ASSETS en public/:
//   mia_video.mp4      → clip Seedance de Mía (1920x1088, 24fps, 10s)
//   croquis_cocina.jpg → foto del croquis (solo bloque 2)
//   voz_bloque1..4.mp3 → locución ElevenLabs (voz Sarah) por bloque
//
// La línea de tiempo se CALCULA a partir de la duración real de cada
// locución: cada bloque dura DELAY_VOZ + duración del MP3 + COLA_S.
// Para afinar, toca las constantes de "AJUSTES RÁPIDOS".
// ============================================================

import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Loop,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ============================================================
// AJUSTES RÁPIDOS
// ============================================================

export const FPS = 30;

// Clip de fondo: 10.04s reales, ralentizado para que cada pasada dure más.
const CLIP_DURACION_S = 10.04;
const VIDEO_PLAYBACK_RATE = 0.8; // 1 = velocidad normal

// Duración medida de cada MP3 de voz (segundos) — de duraciones.json
const VOZ_S = {
  bloque1: 5.04,
  bloque2: 13.4,
  bloque3: 6.5,
  bloque4: 11.83,
};

const DELAY_VOZ_S = 0.3; // la voz entra un pelín después que el subtítulo
const COLA_S = 0.9; // aire tras acabar la voz antes del siguiente bloque
const CIERRE_S = 2.5; // duración del rótulo final
const FADE_S = 0.5; // fundido de entrada/salida de los textos

const COLOR_ACENTO = "#b07d3c"; // marrón tierra de marca
const FUENTE = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';

const TEXTOS = {
  bloque1:
    "Hola, soy Mía, tu diseñadora de cocinas. Pedirme un presupuesto es muy fácil.",
  bloque2:
    "Escríbeme por WhatsApp, dibuja un plano de tu cocina y hazle una foto —yo te muestro cómo hacer el plano—. Con esa foto miro tu cocina y te preparo el precio, sin moverte del sofá y a cualquier hora.",
  bloque3:
    "Si ya tienes un presupuesto de otra tienda en papel, mándamelo: lo estudio y te hago mi mejor oferta.",
  bloque4:
    "Si te gusta, aceptas y te doy cita con nuestro asesor. Así de sencillo. Diseña tu cocina conmigo, 24/7, los 365 días. Sin compromiso y gratis.",
  cierreTitulo: "Diseñado por Mía",
  cierreWhatsapp: "WhatsApp 692 686 148",
};

// ============================================================
// Línea de tiempo calculada (no tocar: se deriva de lo de arriba)
// ============================================================

interface Bloque {
  texto: string;
  audio: string;
  from: number; // segundos
  dur: number; // segundos
}

const construirBloques = (): Bloque[] => {
  const orden = ["bloque1", "bloque2", "bloque3", "bloque4"] as const;
  const bloques: Bloque[] = [];
  let cursor = 0;
  for (const nombre of orden) {
    const dur = DELAY_VOZ_S + VOZ_S[nombre] + COLA_S;
    bloques.push({
      texto: TEXTOS[nombre],
      audio: `voz_${nombre}.mp3`,
      from: cursor,
      dur,
    });
    cursor += dur;
  }
  return bloques;
};

const BLOQUES = construirBloques();
const CIERRE_FROM_S = BLOQUES[BLOQUES.length - 1].from + BLOQUES[BLOQUES.length - 1].dur;
export const DURACION_S = CIERRE_FROM_S + CIERRE_S;
export const DURACION_FRAMES = Math.ceil(DURACION_S * FPS);

// ============================================================
// Helpers
// ============================================================

const useFade = (durF: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeF = FADE_S * fps;
  return interpolate(
    frame,
    [0, fadeF, Math.max(fadeF + 1, durF - fadeF), durF],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

// ============================================================
// Subtítulo (bloques 1-4)
// ============================================================

const Subtitulo = ({ texto, durF }: { texto: string; durF: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const esVertical = height > width;
  const opacity = useFade(durF);

  const translateY = interpolate(frame, [0, FADE_S * fps], [24, 0], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const fontSize = Math.round(width * (esVertical ? 0.048 : 0.028));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: esVertical ? height * 0.1 : height * 0.07,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          maxWidth: width * (esVertical ? 0.9 : 0.72),
          backgroundColor: "rgba(18, 12, 6, 0.62)",
          borderLeft: `10px solid ${COLOR_ACENTO}`,
          borderRadius: 18,
          padding: `${fontSize * 0.55}px ${fontSize * 0.9}px`,
          color: "#ffffff",
          fontFamily: FUENTE,
          fontSize,
          fontWeight: 600,
          lineHeight: 1.35,
          textAlign: "center",
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Croquis (solo durante el bloque 2)
// ============================================================

const Croquis = ({ durF }: { durF: number }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const esVertical = height > width;
  const opacity = useFade(durF);

  const scale = interpolate(frame, [0, FADE_S * fps], [0.9, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // 16:9 → a la izquierda de Mía. 9:16 → sobre el torso, a la altura de
  // las manos (como si mostrara el plano), dejando la cara libre.
  const estiloPosicion: React.CSSProperties = esVertical
    ? { top: height * 0.31, left: "50%", width: width * 0.56 }
    : { top: height * 0.16, left: width * 0.05, width: width * 0.28 };

  return (
    <div
      style={{
        position: "absolute",
        ...estiloPosicion,
        opacity,
        transform: `${esVertical ? "translateX(-50%) " : ""}rotate(-3.5deg) scale(${scale})`,
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: 14,
          paddingBottom: 40,
          borderRadius: 8,
          boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
        }}
      >
        <Img
          src={staticFile("croquis_cocina.jpg")}
          style={{ width: "100%", display: "block", borderRadius: 4 }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FUENTE,
            fontSize: 22,
            fontWeight: 600,
            color: COLOR_ACENTO,
          }}
        >
          Tu plano, así de simple ✏️
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Cierre: "Diseñado por Mía" + WhatsApp
// ============================================================

const Cierre = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const esVertical = height > width;
  const fadeF = FADE_S * fps;

  const opacity = interpolate(frame, [0, fadeF], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, fadeF * 1.6], [0.92, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const tituloSize = Math.round(width * (esVertical ? 0.085 : 0.05));
  const whatsappSize = Math.round(width * (esVertical ? 0.052 : 0.03));

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(circle at center, rgba(20,13,6,0.55) 0%, rgba(20,13,6,0.8) 100%)",
        opacity,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: tituloSize * 0.35,
          fontFamily: FUENTE,
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: "#ffffff",
            fontSize: tituloSize,
            fontWeight: 800,
            letterSpacing: 1,
            textShadow: "0 4px 16px rgba(0,0,0,0.6)",
          }}
        >
          {TEXTOS.cierreTitulo}
        </div>
        <div
          style={{
            width: tituloSize * 2.2,
            height: 7,
            borderRadius: 4,
            backgroundColor: COLOR_ACENTO,
          }}
        />
        <div
          style={{
            color: "#ffffff",
            fontSize: whatsappSize,
            fontWeight: 700,
            backgroundColor: COLOR_ACENTO,
            borderRadius: 100,
            padding: `${whatsappSize * 0.45}px ${whatsappSize * 1.2}px`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          {TEXTOS.cierreWhatsapp}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Composición principal — se adapta sola a 16:9 y 9:16
// ============================================================

export const MiaPromo = () => {
  const { fps } = useVideoConfig();
  const s = (seg: number) => Math.round(seg * fps);

  // Una pasada del clip ralentizado, en frames de la composición
  const loopFrames = Math.floor((CLIP_DURACION_S / VIDEO_PLAYBACK_RATE) * fps);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a140e" }}>
      {/* FONDO: clip de Mía en loop suave, ralentizado, sin audio propio */}
      <Loop durationInFrames={loopFrames}>
        <OffthreadVideo
          src={staticFile("mia_video.mp4")}
          muted
          playbackRate={VIDEO_PLAYBACK_RATE}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Loop>

      {/* Degradado inferior sutil para el contraste de los subtítulos */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(15,10,5,0.5) 0%, rgba(15,10,5,0) 30%)",
        }}
      />

      {/* BLOQUES 1-4: subtítulo + locución (+ croquis en el bloque 2) */}
      {BLOQUES.map((bloque, i) => (
        <Sequence
          key={bloque.audio}
          from={s(bloque.from)}
          durationInFrames={s(bloque.dur)}
        >
          {i === 1 && <Croquis durF={s(bloque.dur)} />}
          <Subtitulo texto={bloque.texto} durF={s(bloque.dur)} />
          <Sequence from={s(DELAY_VOZ_S)}>
            <Audio src={staticFile(bloque.audio)} />
          </Sequence>
        </Sequence>
      ))}

      {/* CIERRE */}
      <Sequence from={s(CIERRE_FROM_S)}>
        <Cierre />
      </Sequence>
    </AbsoluteFill>
  );
};
