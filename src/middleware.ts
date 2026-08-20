import { defineMiddleware } from 'astro:middleware';
import {
  pideMarkdown,
  esPaginaHtml,
  htmlAMarkdown,
  tokensAproximados,
} from './lib/markdown-agentes';

// CSP construido desde el inventario real de recursos (Google Fonts, GTM/Analytics,
// Google Maps embed, chat wa.masmoebel.es). 'unsafe-inline' es necesario por los
// scripts y estilos inline del sitio. Se despliega primero en modo Report-Only.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://maps.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://wa.masmoebel.es https://*.google-analytics.com https://www.googletagmanager.com https://maps.googleapis.com",
  "frame-src https://www.google.com",
].join('; ');

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  // CSP efectivo (validado con cero violaciones en Report-Only el 2026-06-05,
  // incluido el chat con envío real). Para diagnosticar cambios futuros, volver
  // temporalmente a 'Content-Security-Policy-Report-Only'.
  response.headers.set('Content-Security-Policy', CSP);
  // La respuesta cambia segun lo que pida el cliente: que las caches no mezclen
  // la version HTML con la version markdown.
  response.headers.append('Vary', 'Accept');

  const esGetCorrecto = context.request.method === 'GET' && response.status === 200;
  if (!esGetCorrecto || !pideMarkdown(context.request) || !esPaginaHtml(response)) {
    return response;
  }

  const markdown = htmlAMarkdown(await response.text());
  const cabeceras = new Headers(response.headers);
  cabeceras.set('Content-Type', 'text/markdown; charset=utf-8');
  cabeceras.set('x-markdown-tokens', String(tokensAproximados(markdown)));
  cabeceras.delete('content-length');
  return new Response(markdown, { status: response.status, headers: cabeceras });
});
