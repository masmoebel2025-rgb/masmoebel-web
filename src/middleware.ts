import { defineMiddleware } from 'astro:middleware';

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

export const onRequest = defineMiddleware(async (_context, next) => {
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
  return response;
});
