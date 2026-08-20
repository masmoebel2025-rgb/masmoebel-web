import TurndownService from 'turndown';

/* Markdown for Agents: cuando un agente pide `Accept: text/markdown` se le
   devuelve la misma pagina en markdown en vez de en HTML. Asi no tiene que
   masticar el HTML entero para enterarse de lo que ofrecemos.
   Spec: https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/ */

/** Lo que no le sirve de nada a un agente: codigo, estilos y navegacion. */
const ETIQUETAS_A_QUITAR = [
  'script',
  'style',
  'noscript',
  'svg',
  'head',
  'title',
  'nav',
  'header',
  'iframe',
  'form',
];

/** Aproximacion suficiente para la cabecera informativa: ~4 caracteres por token. */
const CARACTERES_POR_TOKEN = 4;

const conversor = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});
conversor.remove(ETIQUETAS_A_QUITAR as unknown as string);

/** Solo cuando el cliente lo pide expresamente. Un navegador nunca lo pide. */
export function pideMarkdown(request: Request): boolean {
  const accept = request.headers.get('accept') ?? '';
  return accept.toLowerCase().includes('text/markdown');
}

export function esPaginaHtml(response: Response): boolean {
  return (response.headers.get('content-type') ?? '').includes('text/html');
}

function tituloDe(html: string): string | null {
  const encontrado = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!encontrado) return null;
  const limpio = encontrado[1].replace(/\s+/g, ' ').trim();
  return limpio.length > 0 ? limpio : null;
}

/** El titular de la portada va quemado dentro de una imagen, asi que el <title>
    es lo unico que le dice al agente de que va la pagina. Por eso se antepone. */
export function htmlAMarkdown(html: string): string {
  const cuerpo = conversor.turndown(html).replace(/\n{3,}/g, '\n\n').trim();
  const titulo = tituloDe(html);
  return titulo ? `# ${titulo}\n\n${cuerpo}\n` : `${cuerpo}\n`;
}

export function tokensAproximados(texto: string): number {
  return Math.ceil(texto.length / CARACTERES_POR_TOKEN);
}
