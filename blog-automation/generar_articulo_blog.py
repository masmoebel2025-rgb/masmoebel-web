#!/usr/bin/env python3
"""Genera UN articulo de blog para Masmoebel con Claude, usando SOLO datos reales del catalogo.

Autocontenido para GitHub Actions: lee ANTHROPIC_API_KEY del entorno (secret del repo),
no depende de rutas del servidor CODEX.

- Marca + Mia + Bonares/Huelva.
- No inventa series/acabados/materiales (valida contra el catalogo).
- No menciona precios ni plazos.
- Evita repetir los temas ya publicados (lee los frontmatter de la carpeta del blog).

Uso: python generar_articulo_blog.py <catalogo.json> <dir_blog_existente> <outdir>
  - <catalogo.json>: catalogo_blog.json (datos publicos reales)
  - <dir_blog_existente>: carpeta con los .md ya publicados (para no repetir temas)
  - <outdir>: carpeta donde escribir el nuevo .md (normalmente la misma del blog)

Escribe <outdir>/<slug>.md e imprime por stdout el JSON de props de portada:
  {"slug","title","serie","acabado","_warnings":[...]}
"""
import sys, os, re, glob, json, datetime

if len(sys.argv) != 4:
    sys.stderr.write(__doc__)
    sys.exit(2)

cat_path, blogdir, outdir = sys.argv[1], sys.argv[2], sys.argv[3]

api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    sys.stderr.write("ERROR: falta ANTHROPIC_API_KEY en el entorno\n")
    sys.exit(2)

import anthropic

catalogo = json.load(open(cat_path, encoding="utf-8"))
series_validas = {s["nombre"]: s["acabados"] for s in catalogo["series"]}

# Titulos ya publicados (leidos del frontmatter de cada .md existente)
existentes = []
for f in sorted(glob.glob(os.path.join(blogdir, "*.md"))):
    try:
        txt = open(f, encoding="utf-8").read()
        m = re.search(r'^title:\s*"?(.+?)"?\s*$', txt, re.M)
        if m:
            existentes.append(m.group(1).strip())
    except OSError:
        pass

PROMPT = f"""Eres el redactor de contenidos de MASMOEBEL, empresa de cocinas a medida en Bonares (Huelva).
Escribe UN articulo de blog en espanol, optimizado para SEO local (cocinas + Huelva), con la voz de la marca.

REGLAS ESTRICTAS:
- Usa UNICAMENTE los datos de este catalogo real. NO inventes series, acabados, materiales ni caracteristicas que no aparezcan.
- NO menciones precios, tarifas ni plazos de entrega.
- Trato de usted. Tono cercano y profesional. Nada de exageraciones.
- Menciona a "Mia" (la asistente virtual que da presupuesto desde el plano y agenda visita por WhatsApp o web) de forma natural, sin forzar.
- 600-900 palabras, con subtitulos en formato markdown (##). Cierra invitando a contactar/usar a Mia.
- Elige UN tema NUEVO que NO coincida con los ya publicados.

CATALOGO REAL (json):
{json.dumps(catalogo, ensure_ascii=False)}

TITULOS YA PUBLICADOS (evita estos temas):
{chr(10).join('- ' + t for t in existentes) if existentes else '- (ninguno todavia)'}

Devuelve EXCLUSIVAMENTE un objeto JSON valido (sin texto fuera del JSON), con estas claves:
{{
  "title": "titulo atractivo con keyword (max ~65 caracteres)",
  "description": "meta description SEO, max 155 caracteres",
  "tags": ["2-4 etiquetas en minuscula"],
  "serie": "una serie EXACTA del catalogo que encaje con el articulo",
  "acabado": "un acabado EXACTO de esa serie",
  "slug": "slug-en-kebab-case-sin-acentos",
  "body_md": "cuerpo del articulo en markdown (sin el titulo H1, empieza con un parrafo)"
}}"""

client = anthropic.Anthropic(api_key=api_key)
msg = client.messages.create(
    model="claude-opus-4-7", max_tokens=4500,
    messages=[{"role": "user", "content": PROMPT}],
)
raw = msg.content[0].text
m = re.search(r"\{.*\}", raw, re.S)
if not m:
    sys.stderr.write("No se encontro JSON en la respuesta:\n" + raw[:500])
    sys.exit(1)
data = json.loads(m.group(0))

# Validacion anti-invencion: serie y acabado deben existir en el catalogo
serie = data["serie"].strip()
acabado = data["acabado"].strip()
warn = []
if serie not in series_validas:
    warn.append(f"SERIE inventada: {serie}")
elif acabado not in series_validas[serie]:
    warn.append(f"ACABADO inventado para {serie}: {acabado}")
# heuristica anti-precios
if re.search(r"\b\d+\s?(eur|euros|€)\b", data["body_md"], re.I):
    warn.append("posible PRECIO en el cuerpo")

slug = re.sub(r"[^a-z0-9-]", "", data["slug"].lower().replace(" ", "-"))
md = (
    "---\n"
    f"title: \"{data['title']}\"\n"
    f"description: \"{data['description']}\"\n"
    f"date: {datetime.date.today().isoformat()}\n"
    f"image: /images/blog/{slug}.png\n"
    f"imageAlt: \"{data['title']}\"\n"
    f"tags: {json.dumps(data['tags'], ensure_ascii=False)}\n"
    "---\n\n"
    f"{data['body_md'].strip()}\n"
)
os.makedirs(outdir, exist_ok=True)
open(os.path.join(outdir, f"{slug}.md"), "w", encoding="utf-8").write(md)

props = {"slug": slug, "title": data["title"], "serie": serie, "acabado": acabado, "_warnings": warn}
print(json.dumps(props, ensure_ascii=False))
