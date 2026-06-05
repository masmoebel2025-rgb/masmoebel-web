# Blog automático de Masmoebel (Mía)

Genera un post de blog semanal con Claude usando **solo datos reales** del catálogo,
renderiza la portada de marca con Remotion, comprueba el build de Astro y publica en `main`
(Netlify despliega solo).

## Piezas

- `catalogo_blog.json` — datos **públicos** del catálogo (series, acabados, encimeras). Sin precios ni datos internos.
- `generar_articulo_blog.py` — pide a Claude un artículo nuevo (evita temas ya publicados), valida que no invente series/acabados ni cuele precios, escribe el `.md` y devuelve las props de portada.
- `remotion/` — proyecto Remotion mínimo con la plantilla fija `BlogHero` (1200×630). Variable: título + serie + acabado.
- `../.github/workflows/blog-semanal.yml` — el orquestador.

## Estado

- **Manual** (`workflow_dispatch`). El cron semanal está **comentado** hasta validar.
- Para activar el semanal: descomentar el bloque `schedule` del workflow (martes 10:00 Madrid = `0 8 * * 2` en verano, `0 9 * * 2` en invierno).

## Secrets del repositorio (Settings → Secrets and variables → Actions)

| Secret | Obligatorio | Para qué |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Sí** | Generar el artículo con Claude. Misma key que usa CODEX. |
| `WHATSAPP_TOKEN` | Opcional | Avisar al owner por WhatsApp si el run falla. |
| `WHATSAPP_PHONE_ID` | Opcional | Phone ID de Meta Cloud API. |
| `OWNER_PHONE` | Opcional | Número del owner (formato internacional sin `+`). |

Si los 3 de WhatsApp no están, el aviso de fallo simplemente se omite (el resto funciona igual).

## Cómo se ejecuta a mano

GitHub → pestaña **Actions** → **Blog semanal (Mía)** → **Run workflow**.

## Probar en local

```bash
# 1) artículo (requiere ANTHROPIC_API_KEY en el entorno)
export ANTHROPIC_API_KEY=sk-ant-...
python blog-automation/generar_articulo_blog.py \
  blog-automation/catalogo_blog.json src/content/blog src/content/blog

# 2) portada (usa las props que imprime el paso 1)
cd blog-automation/remotion && npm install
npx remotion still BlogHero ../../public/images/blog/<slug>.png --props=<props.json>
```

## Refrescar el catálogo

Cuando cambie el catálogo real, regenerar `catalogo_blog.json` con el exportador del servidor
(`export_catalogo_blog.py` en CODEX) y reemplazar el fichero aquí.
