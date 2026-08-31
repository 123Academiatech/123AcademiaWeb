# 🛠️ Stack Tecnológico — 123AcademiaTech Web

> Documentación técnica del proyecto **123AcademiaTech** · Actualizada: Agosto 2026

---

## 📁 Estructura General del Proyecto

```
123AcademiaWeb/
│
├── index.html            → Página principal (Home)
├── cursos.html           → Catálogo de Cursos para Público General
├── productos.html        → Catálogo de Productos & Stock
├── articulos.html        → Blog Técnico & Guías
├── nosotros.html         → Acerca de 123AcademiaTech
├── contacto.html         → Formulario de Contacto
├── login.html            → Inicio de Sesión (4 niveles de rol)
├── admin.html            → Panel CRUD Administrador (Nivel 4)
│
├── supabase-client.js    → Cliente REST propio para Supabase
├── courses-data.js       → Módulo de Cursos & Combos
├── products-data.js      → Módulo de Productos & Stock
├── articles-data.js      → Módulo de Artículos & Blog (CRUD Supabase)
├── users-data.js         → Módulo de Usuarios (4 Niveles de Acceso)
├── cart-data.js          → Módulo de Carrito de Compras
│
└── TECNOLOGIAS.md        → Este archivo
```

---

## 🎨 Estilos & Interfaz de Usuario

### Tailwind CSS (vía CDN)
- **Versión**: Tailwind CSS 3.x (CDN — sin build step)
- **Uso**: Framework de utilidades CSS que controla **toda** la maquetación del sitio:
  - Sistema de grids responsivos (`grid`, `sm:grid-cols-2`, `lg:grid-cols-3`)
  - Tipografía, espaciado, colores y sombras
  - Estados de hover, transiciones y animaciones utilitarias
  - Diseño completamente responsivo (Mobile First)
- **Clases personalizadas**: Se extiende con configuración `theme.extend` inline:
  - `shadow-luxury` — sombra suave con difuminado
  - `font-headline` — tipografía de titulares (Syne)
  - `max-w-container-max` — ancho máximo de contenedor

### CSS Custom Properties
Variables CSS globales definidas en cada página para los colores corporativos:

```css
:root {
  --color-primary:   #1a2e5a;   /* Azul Marino Corporativo */
  --color-secondary: #e87722;   /* Naranja Técnico */
}
```

### Google Material Symbols (CDN)
- Biblioteca oficial de iconos vectoriales de Google
- Se usa como componente inline:
  ```html
  <span class="material-symbols-outlined">school</span>
  ```
- Iconos usados en: navegación, botones de acción, tarjetas, formularios, indicadores de estado

### Google Fonts (CDN)
| Fuente | Rol en el diseño |
|--------|-----------------|
| **Syne** | Titulares y elementos de marca (`font-headline`) |
| **Inter** | Cuerpo de texto, párrafos y datos (`font-sans`) |

---

## ⚙️ JavaScript

### Vanilla JavaScript (ES6+)
- **Sin frameworks de UI** (sin React, Vue ni Angular)
- Toda la interactividad se construye con JS nativo del navegador:
  - `document.getElementById()` / `querySelector()`
  - Template literals para renderizado dinámico de HTML
  - `classList.add/remove/toggle` para control de visibilidad
  - `addEventListener` para eventos de usuario
  - **Async/Await** para todas las operaciones con Supabase

### Arquitectura de Módulos JS Propios

#### `supabase-client.js` — Cliente REST para Supabase
```js
// Cliente propio sin usar el SDK oficial de Supabase
const SupabaseAPI = {
  query(table, select, order) { ... },   // GET (SELECT)
  insert(table, payload) { ... },         // POST (INSERT)
  update(table, id, payload) { ... },     // PATCH (UPDATE)
  delete(table, id) { ... }              // DELETE
}
```

#### `articles-data.js` — Blog & Guías Técnicas
| Función | Descripción |
|---------|-------------|
| `fetchArticlesFromDB()` | Trae todos los artículos desde Supabase |
| `createArticleInDB(data)` | Crea un nuevo artículo en la tabla `articulos` |
| `updateArticleInDB(id, data)` | Edita un artículo existente |
| `deleteArticleInDB(id)` | Elimina permanentemente un artículo |
| `toggleArticleStatusInDB(id, status)` | Alterna entre `published` y `draft` |
| `incrementArticleViewsInDB(id)` | Suma +1 a las lecturas del artículo |

#### `courses-data.js` — Cursos & Combos Empresariales
| Función | Descripción |
|---------|-------------|
| `getCourses()` | Retorna cursos para Público General (desde localStorage) |
| `getBusinessCombos()` | Retorna Combos B2B para Empresas (desde localStorage) |
| `saveCourses(data)` | Persiste cursos en localStorage |
| `fetchCoursesFromDB()` | Sincroniza con Supabase |

#### `products-data.js` — Stock de Productos & Herramientas
| Función | Descripción |
|---------|-------------|
| `getProducts()` | Retorna lista de productos (desde localStorage) |
| `fetchProductsFromDB()` | Sincroniza con Supabase |
| `createProductInDB(data)` | Crea producto en tabla `productos` de Supabase |
| `updateProductInDB(id, data)` | Edita producto en Supabase |
| `deleteProductInDB(id)` | Elimina producto de Supabase |

#### `users-data.js` — Gestión de Usuarios con 4 Niveles
| Función | Descripción |
|---------|-------------|
| `fetchUsersFromDB()` | Trae usuarios de Supabase ordenados por nivel |
| `createUserInDB(data)` | Registra nuevo usuario en Supabase |
| `updateUserInDB(id, data)` | Edita datos del usuario |
| `deleteUserInDB(id)` | Elimina usuario de Supabase |
| `toggleUserStatusInDB(id, status)` | Activa o suspende una cuenta |
| `cycleUserLevelInDB(id, nivel)` | Cicla el nivel jerárquico (1→2→3→4→1) |

#### `cart-data.js` — Carrito de Compras
- Persistencia del carrito en `localStorage`
- Funciones: `addToCart()`, `removeFromCart()`, `getCartItems()`, `clearCart()`

### Almacenamiento del Lado del Cliente
| Almacenamiento | Uso |
|---------------|-----|
| `localStorage` | Caché de datos, sesión del usuario, preferencias de audiencia |
| `sessionStorage` | Datos de sesión temporal |

### Fetch API (nativa)
Todas las llamadas a Supabase usan `fetch()` nativo (sin Axios ni librerías externas):
```js
const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
  method: 'GET',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🗄️ Backend & Base de Datos

### Supabase (Backend as a Service)
- **URL del proyecto**: `https://pbswarzkotjznmasniax.supabase.co`
- **Motor de base de datos**: PostgreSQL (en la nube)
- **Acceso**: REST API automática (PostgREST) + Row Level Security (RLS)

#### Tablas en Supabase
| Tabla | Descripción |
|-------|-------------|
| `articulos` | Blog técnico y guías de reparación |
| `productos` | Stock de herramientas e instrumental |
| `cursos` | Cursos para Público General |
| `combos` | Paquetes empresariales B2B |
| `usuarios` | Cuentas de usuario con niveles de acceso |

#### Políticas RLS (Row Level Security)
- Lectura pública (`anon role`): permitida para `articulos`, `cursos`, `productos`
- Escritura: permitida con `anon key` para operaciones CRUD desde el panel Admin
- Los usuarios de nivel 4 (Admin) tienen acceso total a todas las tablas

### Sistema de Autenticación
> **Nota**: No se usa Supabase Auth. El sistema de login es propio:
- Consulta la tabla `usuarios` comparando `email` + `password_hash`
- Guarda la sesión en `localStorage` con flags como `123_is_admin`, `123_user_nivel`
- Redirige según el nivel de rol detectado

---

## 👥 Sistema de Roles y Niveles de Acceso

| Nivel | Rol | Email de Prueba | Contraseña | Acceso |
|-------|-----|----------------|------------|--------|
| **1** | Visitante | `contacto@visitante.com` | `visitante123` | Solo lectura del sitio público |
| **2** | Alumno | `david.ramos@alumno.tech` | `alumno123` | Catálogo de Cursos |
| **3** | Docente | `carlos.mendoza@123academiatech.com` | `docente123` | Gestión de Artículos/Blog |
| **4** | Administrador | `admin@123academiatech.com` | `admin123` | Panel CRUD completo |

---

## 🌐 Infraestructura & Despliegue

### Servidor de Desarrollo Local
```bash
npx serve -l 3000 .
# Acceso: http://localhost:3000
```

### Repositorio en GitHub
- **URL**: https://github.com/123Academiatech/123AcademiaWeb
- **Rama principal**: `main`
- **Despliegue**: Archivos HTML/CSS/JS estáticos (compatible con GitHub Pages)

### Sincronización con GitHub
Se usa un script Node.js propio (`sync_html_to_github.mjs`) que:
1. Lee el contenido de cada archivo HTML/JS
2. Lo codifica en Base64
3. Usa la API REST de GitHub para hacer commit automático en la rama `main`

---

## 📋 Resumen Ejecutivo del Stack

```
Frontend:
  ├── HTML5 (sin SSR ni templates)
  ├── Tailwind CSS 3.x (CDN)
  ├── Vanilla JavaScript ES6+ (sin frameworks)
  ├── Google Material Symbols (iconos)
  └── Google Fonts: Syne + Inter

Backend:
  └── Supabase (PostgreSQL + REST API)
      ├── Tablas: articulos, productos, cursos, combos, usuarios
      └── Cliente REST propio (supabase-client.js)

Herramientas de Desarrollo:
  ├── npx serve (servidor local estático)
  ├── Node.js (scripts de sincronización)
  └── GitHub (control de versiones + hosting estático)
```

---

> **Filosofía del stack**: El proyecto prioriza la **portabilidad** y el **acceso sin dependencias**.
> No requiere `npm install`, build steps ni bundlers. Cualquier servidor de archivos estáticos puede servirlo.

---

*Documentación generada automáticamente · 123AcademiaTech © 2026*
