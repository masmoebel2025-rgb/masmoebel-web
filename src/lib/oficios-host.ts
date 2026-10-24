// La app Oficios tiene su propia dirección, oficios.masmoebel.es (24/10/2026, Sebas: «más coherente», como
// mia.masmoebel.es). La página sigue siendo src/pages/oficios/index.astro de esta misma web: en esa dirección
// la portada enseña la página de Oficios y lo demás vuelve a masmoebel.es.

export const OFICIOS_HOST = 'oficios.masmoebel.es';
export const OFICIOS_URL = `https://${OFICIOS_HOST}/`;
const TIENDA_HOSTS = new Set(['masmoebel.es', 'www.masmoebel.es']);

export type Destino =
  | { tipo: 'reescribir'; ruta: string }
  | { tipo: 'redirigir'; url: string }
  | null;

export function destinoOficios(host: string, ruta: string, busqueda = ''): Destino {
  const h = host.toLowerCase().replace(/:\d+$/, '');
  if (h === OFICIOS_HOST) {
    if (ruta === '/' || ruta === '') return { tipo: 'reescribir', ruta: '/oficios/' };
    if (ruta === '/oficios' || ruta.startsWith('/oficios/')) return { tipo: 'redirigir', url: OFICIOS_URL };
    return { tipo: 'redirigir', url: `https://masmoebel.es${ruta}${busqueda}` };
  }
  // la dirección de antes (masmoebel.es/oficios/) lleva a la nueva
  if (TIENDA_HOSTS.has(h) && (ruta === '/oficios' || ruta === '/oficios/')) {
    return { tipo: 'redirigir', url: OFICIOS_URL };
  }
  return null;
}
