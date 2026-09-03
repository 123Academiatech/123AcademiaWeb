/**
 * 123AcademiaTech - Auth Navigation & User Profile Chip Helper
 * Maneja el estado visual de sesión (Avatar, Chip de Usuario, Dropdown y Logout) en todas las páginas.
 */

const ROLE_CONFIGS = {
  1: { name: 'Visitante', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'visibility', defaultAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' },
  2: { name: 'Alumno', badgeClass: 'bg-blue-100 text-primary border-blue-200', icon: 'school', defaultAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80' },
  3: { name: 'Docente', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: 'engineering', defaultAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80' },
  4: { name: 'Administrador', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold', icon: 'admin_panel_settings', defaultAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }
};

function getActiveUserSession() {
  const userName = localStorage.getItem('123_user_name');
  const userEmail = localStorage.getItem('123_user_email');
  const userNivel = Number(localStorage.getItem('123_user_nivel')) || 0;
  const isAdmin = localStorage.getItem('123_is_admin') === 'true' || userNivel === 4;
  const userAvatar = localStorage.getItem('123_user_avatar');
  const userRol = localStorage.getItem('123_user_rol');

  if (userName || userEmail || isAdmin || userNivel > 0) {
    const roleCfg = ROLE_CONFIGS[userNivel] || (isAdmin ? ROLE_CONFIGS[4] : ROLE_CONFIGS[1]);
    return {
      name: userName || (isAdmin ? 'Administrador' : 'Usuario'),
      email: userEmail || (isAdmin ? 'admin@123academiatech.com' : 'usuario@123academiatech.com'),
      nivel: userNivel || (isAdmin ? 4 : 1),
      rolName: userRol || roleCfg.name,
      avatar: userAvatar || roleCfg.defaultAvatar,
      isAdmin: isAdmin || userNivel === 4,
      roleCfg: roleCfg
    };
  }
  return null;
}

function renderAuthNavUI() {
  const session = getActiveUserSession();
  const desktopContainers = document.querySelectorAll('.auth-nav-slot');
  const mobileContainers = document.querySelectorAll('.auth-nav-mobile-slot');

  if (session) {
    // Revelar enlaces exclusivos de administración si es Nivel 4
    if (session.isAdmin) {
      document.querySelectorAll('.admin-only-link').forEach(el => el.classList.remove('hidden'));
    } else {
      document.querySelectorAll('.admin-only-link').forEach(el => el.classList.add('hidden'));
    }

    // 1. Renderizar en Navbar Desktop
    desktopContainers.forEach(container => {
      container.innerHTML = `
        <div class="relative auth-user-dropdown-container">
          <button onclick="toggleUserProfileMenu(event)" class="flex items-center gap-2 py-1 px-2.5 rounded-full bg-slate-100/90 hover:bg-orange-50/80 border border-slate-200 transition-all text-left shadow-sm group">
            <img src="${session.avatar}" alt="${session.name}" class="w-8 h-8 rounded-full object-cover border border-white shadow-sm shrink-0" onerror="this.src='${session.roleCfg.defaultAvatar}'" />
            <div class="hidden md:block leading-tight text-left">
              <span class="font-headline font-bold text-xs text-primary group-hover:text-secondary transition-colors block max-w-[100px] truncate">${session.name}</span>
              <span class="inline-flex items-center gap-0.5 text-[9px] font-bold py-0.2 px-1.5 rounded ${session.roleCfg.badgeClass}">
                ${session.rolName}
              </span>
            </div>
            <span class="material-symbols-outlined text-slate-400 group-hover:text-secondary text-base transition-transform group-hover:translate-y-0.5">expand_more</span>
          </button>

          <!-- Floating User Dropdown Menu -->
          <div id="user-profile-dropdown" class="hidden absolute right-0 mt-2.5 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-luxury border border-slate-100 p-2.5 z-50">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 mb-2">
              <img src="${session.avatar}" class="w-10 h-10 rounded-full object-cover border border-white shadow-sm shrink-0" onerror="this.src='${session.roleCfg.defaultAvatar}'" />
              <div class="overflow-hidden">
                <h4 class="font-headline font-bold text-xs text-primary truncate leading-tight">${session.name}</h4>
                <p class="text-[11px] text-slate-500 truncate">${session.email}</p>
                <span class="inline-flex items-center gap-1 text-[9px] font-bold py-0.5 px-2 rounded-md ${session.roleCfg.badgeClass} mt-1">
                  <span class="material-symbols-outlined text-xs">${session.roleCfg.icon}</span>
                  Nivel ${session.nivel}: ${session.rolName}
                </span>
              </div>
            </div>

            <div class="py-1 space-y-0.5 text-xs font-semibold text-slate-700">
              ${session.isAdmin ? `
                <a href="admin.html" class="flex items-center gap-2.5 p-2 rounded-xl bg-orange-50/80 text-secondary hover:bg-orange-100 transition-colors font-bold">
                  <span class="material-symbols-outlined text-base">tune</span>
                  <span>Panel CRUD Supabase</span>
                </a>
              ` : ''}
              <a href="cursos.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors">
                <span class="material-symbols-outlined text-base text-slate-400">school</span>
                <span>Catálogo de Cursos</span>
              </a>
              <a href="productos.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors">
                <span class="material-symbols-outlined text-base text-slate-400">home_repair_service</span>
                <span>Instrumental & Stock</span>
              </a>
              <a href="articulos.html" class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors">
                <span class="material-symbols-outlined text-base text-slate-400">article</span>
                <span>Artículos & Guías</span>
              </a>
            </div>

            <div class="pt-1 mt-1 border-t border-slate-100">
              <button onclick="handleUserLogout()" class="w-full flex items-center gap-2 p-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors">
                <span class="material-symbols-outlined text-base">logout</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      `;
    });

    // 2. Renderizar en Mobile Menu
    mobileContainers.forEach(container => {
      container.innerHTML = `
        <div class="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2.5">
          <div class="flex items-center gap-3">
            <img src="${session.avatar}" class="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" onerror="this.src='${session.roleCfg.defaultAvatar}'" />
            <div class="overflow-hidden flex-1">
              <div class="flex items-center justify-between">
                <h4 class="font-headline font-bold text-xs text-primary truncate">${session.name}</h4>
                <span class="text-[9px] font-bold py-0.5 px-1.5 rounded ${session.roleCfg.badgeClass}">${session.rolName}</span>
              </div>
              <p class="text-[11px] text-slate-400 truncate">${session.email}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-1 border-t border-slate-200/60">
            ${session.isAdmin ? `
              <a href="admin.html" class="flex-1 py-2 rounded-xl bg-secondary text-white font-headline font-bold text-xs text-center">
                Panel CRUD
              </a>
            ` : ''}
            <button onclick="handleUserLogout()" class="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-headline font-bold text-xs text-center transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      `;
    });

  } else {
    // Si no ha iniciado sesión, mostrar botón "Iniciar Sesión"
    desktopContainers.forEach(container => {
      container.innerHTML = `
        <a href="login.html" class="px-3.5 py-2 font-headline font-semibold text-xs text-slate-600 hover:text-primary transition-colors">Iniciar Sesión</a>
      `;
    });

    mobileContainers.forEach(container => {
      container.innerHTML = `
        <a href="login.html" class="block text-center py-2.5 rounded-xl border border-slate-300 font-headline font-semibold text-sm text-primary hover:bg-slate-50 transition-colors">Iniciar Sesión</a>
      `;
    });

    document.querySelectorAll('.admin-only-link').forEach(el => el.classList.add('hidden'));
  }
}

function toggleUserProfileMenu(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('user-profile-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('user-profile-dropdown');
  const container = document.querySelector('.auth-user-dropdown-container');
  if (dropdown && !dropdown.classList.contains('hidden')) {
    if (!container || !container.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  }
});

function handleUserLogout() {
  if (typeof SupabaseAPI !== 'undefined' && typeof SupabaseAPI.logout === 'function') {
    SupabaseAPI.logout();
    return;
  }
  localStorage.removeItem('sb-pbswarzkotjznmasniax-auth-token');
  localStorage.removeItem('123_user_id');
  localStorage.removeItem('123_user_name');
  localStorage.removeItem('123_user_email');
  localStorage.removeItem('123_user_nivel');
  localStorage.removeItem('123_user_rol');
  localStorage.removeItem('123_user_avatar');
  localStorage.removeItem('123_is_admin');
  localStorage.removeItem('123_admin_email');

  renderAuthNavUI();

  if (window.location.pathname.includes('admin.html')) {
    window.location.href = 'login.html';
  } else {
    window.location.reload();
  }
}

// Inicializar automáticamente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAuthNavUI);
} else {
  renderAuthNavUI();
}
