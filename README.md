# Masmoebel Web

Sitio web oficial de Masmoebel - Muebles de cocina de alta calidad.

## 🚀 Descripción

Página web responsive construida con **Astro** y **Tailwind CSS** que presenta:
- Catálogo de cocinas por series
- Sistema de contacto
- Información sobre la empresa
- Experiencias de clientes
- Política de privacidad y legal

## 📦 Stack Tecnológico

- **Framework**: Astro 6.1.10
- **Estilos**: Tailwind CSS 4.2.4
- **Node**: >=22.12.0

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Vista previa del build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── pages/          # Rutas y páginas
├── components/     # Componentes reutilizables
├── layouts/        # Layouts base
├── data/           # Datos estáticos (series.ts, reviews.json)
└── styles/         # Estilos globales
public/            # Assets estáticos
```

## 🔗 Páginas Principales

- `/` - Inicio
- `/cocinas` - Catálogo de cocinas
- `/cocinas/[slug]` - Detalle de serie
- `/nosotros` - Sobre la empresa
- `/experiencias` - Testimonios
- `/contacto` - Formulario de contacto
- `/privacidad` - Política de privacidad
- `/cookies` - Política de cookies

## 👨‍💻 Desarrollo

Cambios en `src/` se reflejan automáticamente en desarrollo con HMR.

## 📄 Licencia

MIT

## 👥 Autores

Bastian Deutsche & IA Assistant
