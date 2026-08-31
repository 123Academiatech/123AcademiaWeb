# 🚀 123AcademiaTech - Plataforma Web & Sistema CRUD

Plataforma web con diseño **Techno-Luxury** (Azul Marino `#0B1B3D` y Naranja Vibrante `#FF6B00`) diseñada para la venta de cursos técnicos presenciales, showcase de instalaciones y panel de gestión CRUD interactivo.

---

## 📂 Estructura del Proyecto

* **`index.html`**: Landing page principal con selector dual de audiencias *Two-in-One Split Access* (Público General / Empresas), Hero de impacto, propuesta de valor, habilidades y cursos destacados sincronizados en tiempo real con el CRUD.
* **`cursos.html`**: Catálogo interactivo de cursos (Ofimática, Reparación de PC, Reparación de Celulares, Redes & Servidores, Mantenimiento de Impresoras) con buscador dinámico, filtros por categoría y modal de inscripción.
* **`admin.html`**: Panel de control CRUD completo donde puedes:
  * ➕ **Crear:** Agregar nuevos cursos con temario, costos, cupos e imagen.
  * ✏️ **Editar:** Modificar cualquier presentación o contenido en tiempo real.
  * 👁️ **Toggle de Estado:** Ocultar o publicar cursos en la web pública con un solo clic.
  * 🗑️ **Eliminar:** Remover cursos con confirmación.
* **`nosotros.html`**: Sección "Sobre Nosotros e Instalaciones" con galería fotográfica de laboratorios (Microelectrónica, Redes, Cómputo, Taller de Impresoras), misión, visión, KPIs y agendamiento de visitas presenciales.
* **`contacto.html`**: Formulario de contacto, dirección de la sede física, horarios y botón directo a WhatsApp.
* **`login.html`**: Pantalla de autenticación y acceso administrativo.
* **`courses-data.js`**: Motor de almacenamiento de cursos persistido en `localStorage` (sin necesidad de configurar base de datos externa para funcionar de inmediato).
* **Archivos descargados de Stitch**: `stitch_landing.html`, `stitch_crud.html`, `stitch_catalog.html`, `stitch_about.html`, `stitch_mobile_home.html`, `stitch_crud_mobile.html`, etc.

---

## 💻 ¿Cómo visualizar y ejecutar la web localmente?

### Opción 1: Abrir directamente en el navegador
Haz doble clic en cualquier archivo `.html` (por ejemplo `index.html` o `admin.html`) para abrirlo en tu navegador favorito (Chrome, Edge, Firefox, etc.).

### Opción 2: Ejecutar con servidor local (Node.js)
Abre tu terminal en esta carpeta y ejecuta:
```bash
npm start
```
O bien:
```bash
npx serve .
```
Luego abre la URL local que aparezca (por ejemplo `http://localhost:3000`).

---

## 🎨 Paleta de Colores
* **Azul Marino Profundo (Estructura/Fondo primario):** `#0B1B3D`
* **Naranja Vibrante (Botones de acción y llamadas a la acción):** `#FF6B00`
* **Fondos de Contenido:** `#FFFFFF` y `#F8FAFC`
* **Tipografías:** *Montserrat* (Títulos y botones) / *Inter* (Textos y párrafos).
