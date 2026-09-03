/**
 * 123AcademiaTech - Componentes Unificados (DRY Framework)
 * Maneja el renderizado centralizado de Header Navbar, Footer Corporativo y Cart Drawer en todas las páginas.
 */

const AppComponents = {
  getHeaderHTML(currentPage = '') {
    const isPage = (name) => currentPage === name ? 'text-secondary font-bold' : 'text-slate-600 hover:text-primary';

    return `
  <header class="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 shadow-luxury w-full">
    <div class="max-w-container-max mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
      <!-- Logo (Compacto 20% reducido) -->
      <a href="index.html" class="flex items-center gap-2 group shrink-0">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
          <span class="material-symbols-outlined text-lg text-secondary">terminal</span>
        </div>
        <div>
          <span class="font-headline font-extrabold text-base tracking-tight text-primary">123Academia<span class="text-secondary">Tech</span></span>
          <p class="text-[8.5px] text-slate-500 font-semibold tracking-wider uppercase -mt-0.5">Capacitación Presencial</p>
        </div>
      </a>

      <!-- Desktop Nav Links (Tamaño y espacio 20% compacto) -->
      <nav class="hidden lg:flex items-center gap-4.5">
        <!-- Inicio with Dropdown -->
        <div class="relative group">
          <a href="index.html" class="inline-flex items-center gap-1 font-headline font-semibold text-xs ${isPage('index')} py-1.5 transition-colors">
            <span>Inicio</span>
            <span class="material-symbols-outlined text-sm transition-transform group-hover:rotate-180 duration-200">expand_more</span>
          </a>
          <div class="absolute left-0 top-full pt-1 w-64 hidden group-hover:block z-50">
            <div class="bg-white rounded-xl shadow-luxury border border-slate-100 p-1.5 space-y-0.5">
              <a href="index.html?audience=general" onclick="selectAudience('general')" class="flex items-center gap-2 p-2.5 rounded-lg hover:bg-orange-50/80 transition-colors group/item">
                <div class="w-7 h-7 rounded-lg bg-orange-100 text-secondary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">person</span>
                </div>
                <div>
                  <p class="font-headline font-bold text-xs text-primary group-hover/item:text-secondary transition-colors">Público General</p>
                  <p class="text-[10px] text-slate-500">Cursos técnicos individuales</p>
                </div>
              </a>
              <a href="index.html?audience=business" onclick="selectAudience('business')" class="flex items-center gap-2 p-2.5 rounded-lg hover:bg-blue-50/80 transition-colors group/item">
                <div class="w-7 h-7 rounded-lg bg-blue-100 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">corporate_fare</span>
                </div>
                <div>
                  <p class="font-headline font-bold text-xs text-primary group-hover/item:text-secondary transition-colors">Emprendimientos y Negocios</p>
                  <p class="text-[10px] text-slate-500">Capacitación corporativa y B2B</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- Catálogo with Dropdown -->
        <div class="relative group">
          <a href="cursos.html" class="inline-flex items-center gap-1 font-headline font-semibold text-xs ${isPage('cursos') || isPage('productos') ? 'text-secondary font-bold' : 'text-slate-600 hover:text-primary'} py-1.5 transition-colors">
            <span>Catálogo</span>
            <span class="material-symbols-outlined text-sm transition-transform group-hover:rotate-180 duration-200">expand_more</span>
          </a>
          <div class="absolute left-0 top-full pt-1 w-64 hidden group-hover:block z-50">
            <div class="bg-white rounded-xl shadow-luxury border border-slate-100 p-1.5 space-y-0.5">
              <a href="cursos.html" class="flex items-center gap-2 p-2.5 rounded-lg hover:bg-orange-50/80 transition-colors group/item">
                <div class="w-7 h-7 rounded-lg bg-orange-100 text-secondary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">school</span>
                </div>
                <div>
                  <p class="font-headline font-bold text-xs text-primary group-hover/item:text-secondary transition-colors">Cursos Técnicos Presenciales</p>
                  <p class="text-[10px] text-slate-500">Talleres prácticos con certificación</p>
                </div>
              </a>
              <a href="productos.html" class="flex items-center gap-2 p-2.5 rounded-lg hover:bg-blue-50/80 transition-colors group/item">
                <div class="w-7 h-7 rounded-lg bg-blue-100 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-base">home_repair_service</span>
                </div>
                <div>
                  <p class="font-headline font-bold text-xs text-primary group-hover/item:text-secondary transition-colors">Herramientas & Productos</p>
                  <p class="text-[10px] text-slate-500">Equipamiento e insumos de taller</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <a href="articulos.html" class="font-headline font-semibold text-xs ${isPage('articulos')} py-1.5 transition-colors">Artículos & Blog</a>
        <a href="nosotros.html" class="font-headline font-semibold text-xs ${isPage('nosotros')} py-1.5 transition-colors">Sobre Nosotros</a>
        <a href="contacto.html" class="font-headline font-semibold text-xs ${isPage('contacto')} py-1.5 transition-colors">Contacto & Sede</a>
        <a href="admin.html" class="admin-only-link hidden font-headline font-bold text-xs text-secondary hover:text-secondary-hover py-1.5 transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">tune</span>
          <span>Panel CRUD</span>
        </a>
      </nav>

      <!-- Desktop Right Actions (Compactas) -->
      <div class="hidden lg:flex items-center gap-3">
        <button onclick="openCartDrawer()" class="relative p-2 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-secondary transition-colors group" title="Ver Carrito y Cotizador">
          <span class="material-symbols-outlined text-lg">shopping_cart</span>
          <span class="cart-badge-count absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary text-white text-[9px] font-bold flex items-center justify-center shadow-sm hidden">0</span>
        </button>

        <div class="auth-nav-slot">
          <a href="login.html" class="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-headline font-bold text-xs shadow-sm transition-all">
            Iniciar Sesión
          </a>
        </div>
      </div>

      <!-- Mobile Menu Trigger -->
      <div class="flex items-center gap-2 lg:hidden">
        <button onclick="openCartDrawer()" class="relative p-1.5 rounded-lg bg-slate-100 text-slate-700">
          <span class="material-symbols-outlined text-lg">shopping_cart</span>
          <span class="cart-badge-count absolute -top-1 -right-1 w-4 h-4 rounded-full bg-secondary text-white text-[9px] font-bold flex items-center justify-center hidden">0</span>
        </button>
        <button onclick="toggleMobileMenu()" class="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100">
          <span class="material-symbols-outlined text-xl">menu</span>
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown Navigation -->
    <div id="mobile-menu" class="hidden lg:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-3">
      <a href="index.html" class="block py-2 text-slate-700 font-headline font-semibold text-sm">Inicio</a>
      <a href="cursos.html" class="block py-2 text-slate-700 font-headline font-semibold text-sm">Cursos Técnicos</a>
      <a href="productos.html" class="block py-2 text-slate-700 font-headline font-semibold text-sm">Herramientas & Stock</a>
      <a href="articulos.html" class="block py-2 text-slate-700 font-headline font-semibold text-sm">Artículos & Blog</a>
      <a href="nosotros.html" class="block py-2 text-slate-700 font-headline font-semibold text-sm">Sobre Nosotros</a>
      <a href="contacto.html" class="block py-2 text-slate-700 font-headline font-semibold text-sm">Contacto</a>
      <a href="admin.html" class="admin-only-link hidden block py-2 text-secondary font-headline font-bold text-sm">Panel CRUD Admin</a>
      <div class="pt-3 border-t border-slate-100 auth-nav-mobile-slot">
        <a href="login.html" class="block text-center py-3 rounded-xl bg-primary text-white font-headline font-bold text-xs">
          Iniciar Sesión
        </a>
      </div>
    </div>
  </header>
    `;
  },

  getFooterHTML() {
    return `
  <footer class="bg-primary text-white border-t border-slate-800 mt-auto">
    <div class="max-w-container-max mx-auto px-6 md:px-12 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Col 1: Brand & Info -->
        <div class="space-y-4">
          <a href="index.html" class="flex items-center gap-2 group shrink-0">
            <div class="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-white shadow-sm shrink-0">
              <span class="material-symbols-outlined text-lg">terminal</span>
            </div>
            <div>
              <span class="font-headline font-extrabold text-lg tracking-tight text-white">123Academia<span class="text-secondary">Tech</span></span>
            </div>
          </a>
          <p class="text-xs text-slate-400 leading-relaxed">
            Centro de capacitación presencial y especializada en tecnologías de información, soporte técnico, reparación de hardware y redes.
          </p>
        </div>

        <!-- Col 2: Enlaces Rápidos -->
        <div class="space-y-3">
          <h4 class="font-headline font-bold text-sm tracking-wider uppercase text-secondary">Navegación</h4>
          <ul class="space-y-2 text-xs text-slate-300">
            <li><a href="index.html" class="hover:text-white transition-colors">Inicio</a></li>
            <li><a href="cursos.html" class="hover:text-white transition-colors">Catálogo de Cursos</a></li>
            <li><a href="productos.html" class="hover:text-white transition-colors">Herramientas de Taller</a></li>
            <li><a href="articulos.html" class="hover:text-white transition-colors">Artículos & Guías</a></li>
            <li><a href="nosotros.html" class="hover:text-white transition-colors">Sobre Nosotros</a></li>
          </ul>
        </div>

        <!-- Col 3: Cursos Clave -->
        <div class="space-y-3">
          <h4 class="font-headline font-bold text-sm tracking-wider uppercase text-secondary">Programas</h4>
          <ul class="space-y-2 text-xs text-slate-300">
            <li><a href="cursos.html" class="hover:text-white transition-colors">Reparación de Laptops</a></li>
            <li><a href="cursos.html" class="hover:text-white transition-colors">Micro-Soldadura de Celulares</a></li>
            <li><a href="cursos.html" class="hover:text-white transition-colors">Redes & Telecomunicaciones</a></li>
            <li><a href="cursos.html" class="hover:text-white transition-colors">Ofimática Avanzada</a></li>
          </ul>
        </div>

        <!-- Col 4: Sede & Contacto -->
        <div class="space-y-3">
          <h4 class="font-headline font-bold text-sm tracking-wider uppercase text-secondary">Sede Central</h4>
          <p class="text-xs text-slate-300">Av. Tecnológica 123, Edificio TecnoPro, Piso 4.</p>
          <p class="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-[#25D366]">chat</span>WhatsApp: 
            <a href="https://wa.me/584122012501" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors underline decoration-dotted">+58 4122012501</a>
          </p>
        </div>
      </div>

      <div class="pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-400">
        <p>© 2026 123AcademiaTech. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
    `;
  },

  getCartDrawerHTML() {
    return `
  <div id="cart-drawer" class="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm hidden flex justify-end">
    <div class="fixed inset-0" onclick="closeCartDrawer()"></div>
    <div id="cart-drawer-panel" class="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col transform translate-x-full transition-transform duration-300 ease-out overflow-hidden">
      
      <!-- Cart Header -->
      <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-secondary text-xl">shopping_cart</span>
          </div>
          <div>
            <h3 class="font-headline font-bold text-base text-primary">Carrito & Cotizador</h3>
            <p class="text-[11px] text-slate-500">Talleres, Combos B2B y Herramientas</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="clearCart()" class="text-slate-400 hover:text-rose-500 p-2 text-xs font-semibold" title="Vaciar Carrito">
            <span class="material-symbols-outlined text-lg">delete_sweep</span>
          </button>
          <button onclick="closeCartDrawer()" class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center shadow-sm">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      <!-- Cart Items Scroll Area -->
      <div class="p-6 overflow-y-auto flex-grow space-y-4">
        <div id="cart-empty-state" class="py-16 text-center text-slate-400 space-y-3">
          <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto">
            <span class="material-symbols-outlined text-3xl">shopping_bag</span>
          </div>
          <p class="font-headline font-bold text-sm text-slate-600">El cotizador está vacío</p>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">Agrega cursos individuales o combos empresariales para armar tu paquete.</p>
        </div>

        <div id="cart-items-container" class="space-y-3"></div>
      </div>

      <!-- Cart Footer / Summary & Actions -->
      <div id="cart-filled-state" class="p-6 border-t border-slate-100 bg-slate-50/90 shrink-0 space-y-4 hidden">
        <div class="space-y-1.5 text-xs">
          <div class="flex justify-between text-slate-500">
            <span>Subtotal Estimado:</span>
            <strong id="cart-drawer-subtotal" class="text-primary font-bold">$0.00 USD</strong>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>Modalidad:</span>
            <span class="text-emerald-600 font-semibold">100% Presencial en Laboratorios</span>
          </div>
          <div class="pt-2 border-t border-slate-200 flex justify-between items-baseline">
            <span class="font-headline font-bold text-sm text-primary">TOTAL ESTIMADO:</span>
            <span id="cart-drawer-total" class="font-headline font-black text-xl text-secondary">$0.00 USD</span>
          </div>
        </div>

        <div class="space-y-2">
          <button onclick="checkoutViaWhatsApp()" class="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-headline font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all">
            <span class="material-symbols-outlined text-base">chat</span>
            SOLICITAR INSCRIPCIÓN / COTIZAR WHATSAPP
          </button>
          
          <button onclick="transferCartToContactForm()" class="w-full py-3 rounded-xl bg-primary hover:bg-secondary text-white font-headline font-bold text-xs flex items-center justify-center gap-2 transition-colors">
            <span class="material-symbols-outlined text-base">mail</span>
            ENVIAR A FORMULARIO DE CONTACTO
          </button>
        </div>
      </div>

    </div>
  </div>
    `;
  },

  renderAll() {
    const pageName = document.body.dataset.page || '';
    const headerContainer = document.getElementById('app-header');
    if (headerContainer) headerContainer.innerHTML = this.getHeaderHTML(pageName);

    const footerContainer = document.getElementById('app-footer');
    if (footerContainer) footerContainer.innerHTML = this.getFooterHTML();

    const drawerContainer = document.getElementById('app-cart-drawer');
    if (drawerContainer) drawerContainer.innerHTML = this.getCartDrawerHTML();

    if (typeof renderAuthNavUI === 'function') {
      renderAuthNavUI();
    }
    if (typeof updateCartBadge === 'function') {
      updateCartBadge();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AppComponents.renderAll();
});
