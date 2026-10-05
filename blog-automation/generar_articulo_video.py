#!/usr/bin/env python3
"""Genera UN articulo de blog sobre un VIDEO de YouTube (@Masmoebel), con el video dentro. 05/10/2026.

Sebas: «subirle a Mia los videos para el blog y que empiece a hacerlos». Los martes alternan: si el ultimo
articulo publicado NO era de video y hay un video ya publicado sin articulo, toca video; si no, sale con
codigo 3 y el flujo escribe el de siempre (catalogo).

Solo usa datos reales: el texto del video (videos_blog.json) y, si es de Planobras, la ficha oficial de la app
(hechos_planobras.md). Nada de precios, plazos ni marcas ajenas: si aparecen, aviso y el flujo no publica.

Uso: python generar_articulo_video.py <videos_blog.json> <hechos_planobras.md> <dir_blog> [--ahora ISO]
Escribe <dir_blog>/<slug>.md e imprime el JSON de props de portada:
  {"slug","title","serie","acabado","etiqueta","_warnings":[...]}
Codigo de salida 3 = hoy no toca articulo de video.
"""
import datetime
import glob
import json
import os
import re
import sys

MODELO = "claude-opus-5-5"            # el cerebro de Mia (no acepta thinking «between_tools»)
MARCAS_AJENAS = re.compile(r"(?i)\b(leroy|merlin|bricomart|bricodepot|brico\s?d[eé]p[oô]t|ikea|obramat|"
                           r"magicplan|kitchendraw|bosch|leica|stabila)\b")
PRECIO = re.compile(r"(?i)\b\d+([.,]\d+)?\s?(eur|euros|€|\$|usd)\b|€\s?\d")


def frontmatter(path):
    txt = open(path, encoding="utf-8").read()
    fm = txt.split("---", 2)[1] if txt.startswith("---") else ""
    datos = {}
    for k in ("title", "date", "youtube"):
        m = re.search(r"^%s:\s*\"?(.+?)\"?\s*$" % k, fm, re.M)
        if m:
            datos[k] = m.group(1).strip()
    return datos


def elegir(videos, blogdir, ahora):
    posts = [frontmatter(f) for f in sorted(glob.glob(os.path.join(blogdir, "*.md")))]
    usados = {p["youtube"] for p in posts if p.get("youtube")}
    ultimo = max(posts, key=lambda p: p.get("date", ""), default={})
    if ultimo.get("youtube"):
        return None, "el ultimo articulo ya fue de video: hoy toca catalogo"
    for v in videos:
        if not v.get("youtube") or v["youtube"] in usados:
            continue
        if datetime.datetime.fromisoformat(v["publica"]) > ahora:
            continue
        return v, ""
    return None, "no hay ningun video publicado sin articulo"


def main():
    resto = sys.argv[1:]
    if "--ahora" in resto:
        i = resto.index("--ahora")
        resto = resto[:i] + resto[i + 2:]
    args = [a for a in resto if not a.startswith("--")]
    if len(args) != 3:
        sys.stderr.write(__doc__)
        sys.exit(2)
    vjson, hechos_path, blogdir = args
    ahora = datetime.datetime.now(datetime.timezone.utc)
    if "--ahora" in sys.argv:
        ahora = datetime.datetime.fromisoformat(sys.argv[sys.argv.index("--ahora") + 1])
    videos = json.load(open(vjson, encoding="utf-8"))["videos"]
    v, motivo = elegir(videos, blogdir, ahora)
    if not v:
        sys.stderr.write("Hoy no toca articulo de video: %s\n" % motivo)
        sys.exit(3)
    if "--solo-elegir" in sys.argv:
        print(json.dumps({"elegido": v["clave"], "youtube": v["youtube"]}))
        return

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.stderr.write("ERROR: falta ANTHROPIC_API_KEY en el entorno\n")
        sys.exit(2)
    import anthropic

    titulos = [frontmatter(f).get("title", "") for f in sorted(glob.glob(os.path.join(blogdir, "*.md")))]
    if v["tipo"] == "planobras":
        fuente = ("FICHA OFICIAL DE LA APP PLANOBRAS (lo unico que puedes afirmar de la app):\n"
                  + open(hechos_path, encoding="utf-8").read()
                  + "\n\nLO QUE ENSENA ESTE VIDEO:\n" + v["texto"])
        enfoque = ("Planobras es la app que Masmoebel ha hecho para medir cocinas y banos en obra, para profesionales "
                   "(medidores, montadores, reformistas). Se prueba 7 dias completa en Google Play (busca «Planobras») "
                   "o en planobras.es. Cuenta lo que ensena el video y por que le sirve a quien mide en obra.")
    else:
        fuente = "LO QUE ENSENA ESTE VIDEO:\n" + v["texto"]
        enfoque = ("Mia es la asistente con inteligencia artificial de Masmoebel. Cuenta lo que ensena el video. "
                   "Para hablar con ella: WhatsApp 623 22 96 53 o masmoebel.es.")

    prompt = f"""Eres el redactor del blog de MASMOEBEL (cocinas a medida y apps con IA, Bonares, Huelva).
Escribe UN articulo en espanol que acompane a este video de nuestro canal de YouTube: «{v['titulo_video']}».
El video ira incrustado al principio del articulo; el texto lo explica y lo amplia.

{enfoque}

REGLAS ESTRICTAS:
- Usa UNICAMENTE lo que pone abajo. No inventes funciones, cifras, clientes ni opiniones.
- NO menciones precios, tarifas ni plazos. NO nombres ninguna otra marca o tienda.
- Trato de usted, tono cercano y profesional, sin exagerar.
- 450-700 palabras, con subtitulos markdown (##). No repitas el titulo como H1.
- Termina con una invitacion breve (probar Planobras o hablar con Mia, segun el caso).
- Titulo nuevo, distinto de estos ya publicados:
{chr(10).join('- ' + t for t in titulos)}

{fuente}

Devuelve EXCLUSIVAMENTE un objeto JSON valido:
{{"title": "max ~65 caracteres", "description": "max 155 caracteres", "tags": ["2-4 en minuscula"],
"slug": "kebab-case-sin-acentos", "body_md": "cuerpo en markdown"}}"""

    cli = anthropic.Anthropic(api_key=api_key)
    msg = cli.messages.create(model=MODELO, max_tokens=4000, messages=[{"role": "user", "content": prompt}])
    raw = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")
    m = re.search(r"\{.*\}", raw, re.S)
    if not m:
        sys.stderr.write("No se encontro JSON en la respuesta:\n" + raw[:500])
        sys.exit(1)
    data = json.loads(m.group(0))

    warn = []
    todo = " ".join([data["title"], data["description"], data["body_md"]])
    if MARCAS_AJENAS.search(todo):
        warn.append("MARCA AJENA: %s" % MARCAS_AJENAS.search(todo).group(0))
    if PRECIO.search(todo):
        warn.append("posible PRECIO: %s" % PRECIO.search(todo).group(0))
    slug = re.sub(r"[^a-z0-9-]", "", data["slug"].lower().replace(" ", "-"))[:80].strip("-")
    if not slug:
        warn.append("slug vacio")
    if os.path.exists(os.path.join(blogdir, f"{slug}.md")):
        warn.append("ya existe un articulo con ese slug: %s" % slug)

    titulo = data["title"].replace('"', "'")
    md = (
        "---\n"
        f"title: \"{titulo}\"\n"
        f"description: \"{data['description'].replace(chr(34), chr(39))}\"\n"
        f"date: {datetime.date.today().isoformat()}\n"
        f"image: /images/blog/{slug}.png\n"
        f"imageAlt: \"{titulo}\"\n"
        f"tags: {json.dumps(data['tags'], ensure_ascii=False)}\n"
        f"youtube: \"{v['youtube']}\"\n"
        f"youtubeVertical: {'true' if v['vertical'] else 'false'}\n"
        "---\n\n"
        f"{data['body_md'].strip()}\n"
    )
    if not warn:
        open(os.path.join(blogdir, f"{slug}.md"), "w", encoding="utf-8").write(md)
    es_planobras = v["tipo"] == "planobras"
    props = {"slug": slug, "title": data["title"], "etiqueta": "VÍDEO",
             "serie": "Planobras" if es_planobras else "Mía",
             "acabado": "App para medir obra" if es_planobras else "Asistente con IA",
             "_warnings": warn}
    print(json.dumps(props, ensure_ascii=False))


if __name__ == "__main__":
    main()
