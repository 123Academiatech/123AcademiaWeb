/**
 * 123AcademiaTech - Módulo de Administración & Control CRUD (admin.js)
 * Maneja la lógica de Métricas, Programas Técnicos, Combos B2B, Productos, Artículos, Usuarios y Solicitudes.
 */

let currentTab = 'dashboard';
let currentProgramFilter = 'all'; 
let currentUserLevelFilter = 'all';
let allCourses = [];
let allCombos = [];
let allProducts = [];
let allArticles = [];
let allUsers = [];

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

function selectAudience(type) {
  localStorage.setItem('audience_preference', type);
  window.location.href = `index.html?audience=${type}`;
}

let screenViews = {
  courses: 'cards',
  products: 'cards',
  articles: 'cards',
  users: 'cards'
};

function setScreenView(screen, mode) {
  screenViews[screen] = mode;

  const cardsBtn = document.getElementById(`view-btn-${screen}-cards`);
  const tableBtn = document.getElementById(`view-btn-${screen}-table`);
  const cardsContainer = document.getElementById(`${screen}-cards-container`);
  const tableContainer = document.getElementById(`${screen}-table-container`);

  if (mode === 'cards') {
    if (cardsBtn) cardsBtn.className = "px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all bg-white text-secondary shadow-sm flex items-center gap-1";
    if (tableBtn) tableBtn.className = "px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition-all text-slate-500 hover:text-primary flex items-center gap-1";
    if (cardsContainer) cardsContainer.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
  } else {
    if (cardsBtn) cardsBtn.className = "px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition-all text-slate-500 hover:text-primary flex items-center gap-1";
    if (tableBtn) tableBtn.className = "px-3 py-1.5 rounded-lg text-xs font-headline font-bold transition-all bg-white text-secondary shadow-sm flex items-center gap-1";
    if (cardsContainer) cardsContainer.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');
  }
}

function switchTab(tabId) {
  currentTab = tabId;

  const screenDash = document.getElementById('screen-dashboard');
  if (screenDash) screenDash.classList.add('hidden');
  const screenCourses = document.getElementById('screen-courses');
  if (screenCourses) screenCourses.classList.add('hidden');
  const screenProducts = document.getElementById('screen-products');
  if (screenProducts) screenProducts.classList.add('hidden');
  const screenArticles = document.getElementById('screen-articles');
  if (screenArticles) screenArticles.classList.add('hidden');
  const screenUsers = document.getElementById('screen-users');
  if (screenUsers) screenUsers.classList.add('hidden');
  const screenSol = document.getElementById('screen-solicitudes');
  if (screenSol) screenSol.classList.add('hidden');

  const tabs = ['dashboard', 'courses', 'products', 'articles', 'users', 'solicitudes'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    if (btn) {
      btn.className = "px-4 py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center gap-2 transition-all text-slate-600 hover:bg-slate-100 shrink-0";
    }
  });

  const activeScreen = document.getElementById(`screen-${tabId}`);
  if (activeScreen) activeScreen.classList.remove('hidden');

  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeBtn) {
    activeBtn.className = "px-4 py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center gap-2 transition-all bg-primary text-white shadow-sm shrink-0";
  }

  const navBtnText = document.getElementById('tab-action-btn-text');
  if (navBtnText) {
    if (tabId === 'courses') navBtnText.innerText = '+ AGREGAR PROGRAMA';
    else if (tabId === 'products') navBtnText.innerText = '+ AGREGAR PRODUCTO';
    else if (tabId === 'articles') navBtnText.innerText = '+ NUEVO ARTÍCULO';
    else if (tabId === 'users') navBtnText.innerText = '+ NUEVO USUARIO';
    else navBtnText.innerText = '+ AGREGAR REGISTRO';
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabId === 'courses') filterCoursesTable();
  if (tabId === 'products') filterProductsTable();
  if (tabId === 'articles') filterArticlesTable();
  if (tabId === 'users') filterUsersTable();
  if (tabId === 'solicitudes') renderSolicitudesTable();
  if (tabId === 'dashboard') updateDashboardMetrics();
}

function openCurrentTabModal() {
  if (currentTab === 'products') {
    openProductModal();
  } else if (currentTab === 'articles') {
    openArticleModal();
  } else if (currentTab === 'users') {
    openUserModal();
  } else {
    openCourseModal(null, currentProgramFilter === 'combo' ? 'combo' : 'course');
  }
}

function setCourseProgramFilter(filterType) {
  currentProgramFilter = filterType;
  document.querySelectorAll('.prog-pill').forEach(el => {
    el.className = "prog-pill px-4 py-2 rounded-xl font-headline font-bold text-xs bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shrink-0 transition-all";
  });
  const activeEl = document.getElementById(`prog-filter-${filterType}`);
  if (activeEl) {
    activeEl.className = "prog-pill px-4 py-2 rounded-xl font-headline font-bold text-xs bg-secondary text-white shadow-sm shrink-0 transition-all";
  }
  filterCoursesTable();
}

function renderCoursesCards(programs) {
  const container = document.getElementById('courses-cards-container');
  if (!container) return;

  if (programs.length === 0) {
    container.innerHTML = `<div class="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm"><span class="material-symbols-outlined text-4xl text-slate-300 mb-2">school</span><p class="font-headline font-bold">No se encontraron cursos o combos registrados.</p></div>`;
    return;
  }

  container.innerHTML = programs.map(p => `
    <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-luxury flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
      <div>
        <div class="relative h-48 overflow-hidden bg-slate-100 cursor-pointer" onclick="openCardSheet('${p.id}', '${p.itemType}')">
          <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span class="inline-flex items-center gap-1 text-[11px] font-headline font-bold py-1 px-2.5 rounded-full shadow-sm ${p.typeBadgeClass}">
              <span class="material-symbols-outlined text-xs">${p.typeIcon}</span>
              ${p.typeLabel}
            </span>
          </div>
          <button onclick="event.stopPropagation(); toggleProgramStatus('${p.id}', '${p.itemType}')" class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md transition-colors ${p.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-700/80 text-slate-200'}">
            ${p.status === 'active' ? '● Activo' : '○ Oculto'}
          </button>
        </div>
        <div class="p-5 space-y-3">
          <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm text-secondary">schedule</span> ${p.duration}</span>
            <span class="text-secondary font-bold">${p.displayExtra}</span>
          </div>
          <h3 onclick="openCardSheet('${p.id}', '${p.itemType}')" class="font-headline font-bold text-base text-primary group-hover:text-secondary transition-colors cursor-pointer leading-snug line-clamp-2">
            ${p.title}
          </h3>
          <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
            ${p.displayDetails}
          </p>
        </div>
      </div>
      <div class="p-5 pt-0 space-y-3">
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-400 font-semibold uppercase">Inversión</span>
            <p class="font-headline font-black text-secondary text-lg">${p.price}</p>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="openCardSheet('${p.id}', '${p.itemType}')" class="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-secondary transition-colors" title="Ver Ficha Completa">
              <span class="material-symbols-outlined text-lg">visibility</span>
            </button>
            <button onclick="openCourseModal('${p.id}', '${p.itemType}')" class="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Editar">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button onclick="deleteProgram('${p.id}', '${p.itemType}')" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors" title="Eliminar">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

async function initApp() {
  allCourses = getCourses();
  allCombos = getBusinessCombos();
  allProducts = getProducts();
  allArticles = getArticles();
  allUsers = getCachedUsers();

  updateDashboardMetrics();
  filterCoursesTable();
  filterProductsTable();
  filterArticlesTable();
  filterUsersTable();
  if (typeof updateCartBadge === 'function') updateCartBadge();

  syncAllFromSupabase();

  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  if (['courses', 'products', 'articles', 'users', 'solicitudes'].includes(tabParam)) {
    switchTab(tabParam);
  }
}

async function syncAllFromSupabase() {
  const indicator = document.getElementById('supabase-status-indicator');
  if (indicator) {
    indicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span><span>Sincronizando DB...</span>`;
  }

  try {
    const [cData, pData, aData, uData] = await Promise.all([
      fetchCoursesFromDB(),
      fetchProductsFromDB(),
      fetchArticlesFromDB(),
      fetchUsersFromDB()
    ]);

    if (cData) { allCourses = cData.courses; allCombos = cData.combos; }
    if (pData) allProducts = pData;
    if (aData) allArticles = aData;
    if (uData) allUsers = uData;

    if (indicator) {
      indicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Supabase Cloud DB Activa</span>`;
    }

    filterCoursesTable();
    filterProductsTable();
    filterArticlesTable();
    filterUsersTable();
    updateDashboardMetrics();
  } catch (e) {
    console.warn('Error en sincronización global de Supabase:', e);
  }
}

async function updateDashboardMetrics() {
  allCourses = getCourses();
  allCombos = getBusinessCombos();
  allProducts = getProducts();
  allArticles = getArticles();
  allUsers = getUsers();
  await loadSolicitudesData();

  const activeCoursesCount = allCourses.filter(c => c.status === 'active').length;
  const activeCombosCount = allCombos.filter(c => c.status === 'active').length;
  const productsCount = allProducts.length;
  const publishedArticlesCount = allArticles.filter(a => a.status === 'published').length;
  const totalUsersCount = allUsers.length;

  const lvl1Count = allUsers.filter(u => Number(u.nivel) === 1).length;
  const lvl2Count = allUsers.filter(u => Number(u.nivel) === 2).length;
  const lvl3Count = allUsers.filter(u => Number(u.nivel) === 3).length;
  const lvl4Count = allUsers.filter(u => Number(u.nivel) === 4).length;

  const dashCourses = document.getElementById('dash-courses-count');
  if (dashCourses) dashCourses.innerText = activeCoursesCount;
  const dashCombos = document.getElementById('dash-combos-count');
  if (dashCombos) dashCombos.innerText = activeCombosCount;
  const dashProds = document.getElementById('dash-products-count');
  if (dashProds) dashProds.innerText = productsCount;
  const dashArts = document.getElementById('dash-articles-count');
  if (dashArts) dashArts.innerText = publishedArticlesCount;
  const dashUsers = document.getElementById('dash-users-count');
  if (dashUsers) dashUsers.innerText = totalUsersCount;

  const dashSolEl = document.getElementById('dash-solicitudes-count');
  if (dashSolEl) dashSolEl.innerText = allSolicitudes.length;

  const pendingCount = allSolicitudes.filter(s => s.estado === 'Pendiente').length;
  const badgeTabEl = document.getElementById('badge-solicitudes-count');
  if (badgeTabEl) {
    badgeTabEl.innerText = pendingCount;
    if (pendingCount > 0) badgeTabEl.classList.remove('hidden');
    else badgeTabEl.classList.add('hidden');
  }

  const dashGenSub = document.getElementById('dash-general-subtotal');
  if (dashGenSub) dashGenSub.innerText = `${allCourses.length} Cursos (${activeCoursesCount} Activos)`;
  const dashBizSub = document.getElementById('dash-business-subtotal');
  if (dashBizSub) dashBizSub.innerText = `${allCombos.length} Combos (${activeCombosCount} Activos)`;
  const dashProdSub = document.getElementById('dash-products-subtotal');
  if (dashProdSub) dashProdSub.innerText = `${productsCount} Artículos`;
  const dashArtSub = document.getElementById('dash-articles-subtotal');
  if (dashArtSub) dashArtSub.innerText = `${allArticles.length} Artículos (${publishedArticlesCount} Publicados)`;

  const dashU1 = document.getElementById('dash-u-lvl1');
  if (dashU1) dashU1.innerText = `${lvl1Count} Visitantes`;
  const dashU2 = document.getElementById('dash-u-lvl2');
  if (dashU2) dashU2.innerText = `${lvl2Count} Alumnos`;
  const dashU3 = document.getElementById('dash-u-lvl3');
  if (dashU3) dashU3.innerText = `${lvl3Count} Docentes`;
  const dashU4 = document.getElementById('dash-u-lvl4');
  if (dashU4) dashU4.innerText = `${lvl4Count} Admins`;

  const cAllProg = document.getElementById('count-all-prog');
  if (cAllProg) cAllProg.innerText = (allCourses.length + allCombos.length);
  const cCourseProg = document.getElementById('count-course-prog');
  if (cCourseProg) cCourseProg.innerText = allCourses.length;
  const cComboProg = document.getElementById('count-combo-prog');
  if (cComboProg) cComboProg.innerText = allCombos.length;

  const cAllUsers = document.getElementById('count-all-users');
  if (cAllUsers) cAllUsers.innerText = totalUsersCount;
  const cLvl1 = document.getElementById('count-lvl1-users');
  if (cLvl1) cLvl1.innerText = lvl1Count;
  const cLvl2 = document.getElementById('count-lvl2-users');
  if (cLvl2) cLvl2.innerText = lvl2Count;
  const cLvl3 = document.getElementById('count-lvl3-users');
  if (cLvl3) cLvl3.innerText = lvl3Count;
  const cLvl4 = document.getElementById('count-lvl4-users');
  if (cLvl4) cLvl4.innerText = lvl4Count;
}

// ==========================================
// LÓGICA DE SOLICITUDES DE CONTACTO
// ==========================================
let allSolicitudes = [];

async function loadSolicitudesData() {
  try {
    let remoteData = null;
    if (typeof SupabaseAPI !== 'undefined' && typeof SupabaseAPI.query === 'function') {
      remoteData = await SupabaseAPI.query('solicitudes_contacto', '*', 'created_at.desc');
    }
    let localData = JSON.parse(localStorage.getItem('123_local_solicitudes') || '[]');
    
    if (Array.isArray(remoteData) && remoteData.length > 0) {
      const remoteIds = new Set(remoteData.map(r => String(r.id)));
      const filteredLocal = localData.filter(l => !remoteIds.has(String(l.id)));
      allSolicitudes = [...remoteData, ...filteredLocal];
    } else {
      allSolicitudes = localData;
    }
  } catch (err) {
    console.warn('Cargando solicitudes desde almacenamiento local fallback:', err);
    allSolicitudes = JSON.parse(localStorage.getItem('123_local_solicitudes') || '[]');
  }
}

async function renderSolicitudesTable() {
  await loadSolicitudesData();
  const tbody = document.getElementById('solicitudes-table-body');
  const filterSelect = document.getElementById('solicitudes-filter-status');
  if (!tbody) return;

  const statusFilter = filterSelect ? filterSelect.value : 'todos';
  let filtered = allSolicitudes;

  if (statusFilter !== 'todos') {
    filtered = allSolicitudes.filter(s => s.estado === statusFilter);
  }

  const pendingCount = allSolicitudes.filter(s => s.estado === 'Pendiente').length;
  const dashCountEl = document.getElementById('dash-solicitudes-count');
  if (dashCountEl) dashCountEl.innerText = allSolicitudes.length;

  const badgeTabEl = document.getElementById('badge-solicitudes-count');
  if (badgeTabEl) {
    badgeTabEl.innerText = pendingCount;
    if (pendingCount > 0) badgeTabEl.classList.remove('hidden');
    else badgeTabEl.classList.add('hidden');
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-8 text-center text-slate-400">
          <span class="material-symbols-outlined text-3xl mb-1 text-slate-300">inbox</span>
          <p class="font-headline font-bold text-xs">No hay solicitudes registradas ${statusFilter !== 'todos' ? `en estado '${statusFilter}'` : ''}</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const fecha = item.created_at ? new Date(item.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }) : 'Reciente';
    const isPendiente = item.estado === 'Pendiente';
    const statusBadge = isPendiente
      ? `<span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full"><span class="material-symbols-outlined text-xs">schedule</span>Pendiente</span>`
      : `<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full"><span class="material-symbols-outlined text-xs">check_circle</span>Atendido</span>`;

    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">${fecha}</td>
        <td class="p-4 font-headline font-bold text-primary">${item.nombre || 'Cliente'}</td>
        <td class="p-4 font-semibold text-slate-700 whitespace-nowrap">${item.telefono || '-'}</td>
        <td class="p-4 font-medium text-secondary max-w-[200px] truncate" title="${item.curso_interes}">${item.curso_interes || 'Información General'}</td>
        <td class="p-4 text-slate-600 max-w-[260px] truncate" title="${item.mensaje}">${item.mensaje || '<em class="text-slate-400">Sin mensaje adicional</em>'}</td>
        <td class="p-4">${statusBadge}</td>
        <td class="p-4 text-right whitespace-nowrap space-x-1">
          <button onclick="openSolicitudDetailModal('${item.id}')" class="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors inline-flex items-center gap-1 font-headline font-bold text-[11px]" title="Ver Descripción Completa">
            <span class="material-symbols-outlined text-sm">visibility</span>
            <span>Ver Descripción</span>
          </button>
          <button onclick="toggleSolicitudEstado('${item.id}', '${item.estado}')" class="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors inline-flex items-center" title="Alternar Estado (Atendido/Pendiente)">
            <span class="material-symbols-outlined text-base">${isPendiente ? 'task_alt' : 'history'}</span>
          </button>
          <button onclick="deleteSolicitudItem('${item.id}')" class="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors inline-flex items-center" title="Eliminar Solicitud">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openSolicitudDetailModal(id) {
  const item = allSolicitudes.find(s => String(s.id) === String(id));
  if (!item) return;

  const modal = document.getElementById('solicitud-detail-modal');
  const card = document.getElementById('solicitud-detail-card');

  document.getElementById('modal-sol-name').innerText = item.nombre || 'Cliente';
  document.getElementById('modal-sol-phone').innerText = item.telefono || 'Sin teléfono';
  document.getElementById('modal-sol-course').innerText = item.curso_interes || 'Información General';
  document.getElementById('modal-sol-date').innerText = item.created_at ? new Date(item.created_at).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : 'Reciente';
  document.getElementById('modal-sol-message').innerText = item.mensaje || 'El usuario no incluyó un mensaje adicional.';

  const isPendiente = item.estado === 'Pendiente';
  const statusBadge = isPendiente
    ? `<span class="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full"><span class="material-symbols-outlined text-sm">schedule</span>Pendiente</span>`
    : `<span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full"><span class="material-symbols-outlined text-sm">check_circle</span>Atendido</span>`;
  
  document.getElementById('modal-sol-status-badge').innerHTML = statusBadge;

  const toggleBtn = document.getElementById('modal-sol-btn-toggle');
  if (toggleBtn) {
    toggleBtn.innerText = isPendiente ? 'Marcar como Atendido' : 'Marcar como Pendiente';
    toggleBtn.onclick = async () => {
      await toggleSolicitudEstado(item.id, item.estado);
      closeSolicitudDetailModal();
    };
  }

  if (modal && card) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    });
  }
}

function closeSolicitudDetailModal() {
  const modal = document.getElementById('solicitud-detail-modal');
  const card = document.getElementById('solicitud-detail-card');
  if (!modal) return;
  if (card) {
    card.classList.remove('scale-100');
    card.classList.add('scale-95');
  }
  modal.classList.add('opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 250);
}

async function toggleSolicitudEstado(id, currentStatus) {
  const newStatus = currentStatus === 'Pendiente' ? 'Atendido' : 'Pendiente';
  try {
    if (String(id).startsWith('loc_')) {
      let localData = JSON.parse(localStorage.getItem('123_local_solicitudes') || '[]');
      const item = localData.find(l => l.id === id);
      if (item) item.estado = newStatus;
      localStorage.setItem('123_local_solicitudes', JSON.stringify(localData));
    } else if (typeof SupabaseAPI !== 'undefined') {
      await SupabaseAPI.update('solicitudes_contacto', id, { estado: newStatus });
    }
  } catch (err) {
    console.warn('Error al cambiar estado de solicitud:', err);
  }
  renderSolicitudesTable();
}

async function deleteSolicitudItem(id) {
  if (!confirm('¿Deseas eliminar esta solicitud de contacto?')) return;
  try {
    if (String(id).startsWith('loc_')) {
      let localData = JSON.parse(localStorage.getItem('123_local_solicitudes') || '[]');
      localData = localData.filter(l => l.id !== id);
      localStorage.setItem('123_local_solicitudes', JSON.stringify(localData));
    } else if (typeof SupabaseAPI !== 'undefined') {
      await SupabaseAPI.delete('solicitudes_contacto', id);
    }
  } catch (err) {
    console.warn('Error al eliminar solicitud:', err);
  }
  renderSolicitudesTable();
}

async function clearAllOldSolicitudes() {
  if (!confirm('¿Deseas eliminar todas las solicitudes marcadas como Atendidas para mantener la base de datos limpia?')) return;
  const atendidas = allSolicitudes.filter(s => s.estado === 'Atendido');
  for (const s of atendidas) {
    await deleteSolicitudItem(s.id);
  }
  renderSolicitudesTable();
}

function getCombinedPrograms() {
  const coursesMapped = allCourses.map(c => ({
    ...c,
    itemType: 'course',
    typeLabel: 'Público General',
    typeBadgeClass: 'bg-blue-100 text-primary border border-blue-200',
    typeIcon: 'person',
    displayExtra: c.spots || 'Cupos Disponibles',
    displayDetails: c.description
  }));

  const combosMapped = allCombos.map(cb => ({
    ...cb,
    itemType: 'combo',
    typeLabel: 'Combo Empresarial (B2B)',
    typeBadgeClass: 'bg-orange-100 text-secondary border border-orange-200',
    typeIcon: 'corporate_fare',
    displayExtra: cb.groupSize || 'Grupal',
    displayDetails: (cb.includes && cb.includes.length > 0) ? `Incluye: ${cb.includes.join(' • ')}` : cb.description
  }));

  return [...coursesMapped, ...combosMapped];
}

function filterCoursesTable() {
  const search = (document.getElementById('course-search-input')?.value || '').toLowerCase();
  const status = document.getElementById('course-status-filter')?.value || 'all';
  let combined = getCombinedPrograms();

  if (currentProgramFilter !== 'all') {
    combined = combined.filter(p => p.itemType === currentProgramFilter);
  }

  if (status !== 'all') {
    combined = combined.filter(p => p.status === status);
  }

  if (search) {
    combined = combined.filter(p => 
      (p.title || '').toLowerCase().includes(search) || 
      (p.description || '').toLowerCase().includes(search) ||
      (p.category || '').toLowerCase().includes(search)
    );
  }

  renderCoursesCards(combined);
  renderCoursesTable(combined);
}

function renderCoursesTable(programs) {
  const tbody = document.getElementById('courses-tbody');
  if (!tbody) return;

  if (programs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400 font-medium">No se encontraron cursos o combos.</td></tr>`;
    return;
  }

  tbody.innerHTML = programs.map(p => `
    <tr class="hover:bg-slate-50/80 transition-colors">
      <td class="py-4 px-6">
        <span class="inline-flex items-center gap-1 text-[11px] font-headline font-bold py-1 px-2.5 rounded-lg ${p.typeBadgeClass}">
          <span class="material-symbols-outlined text-xs">${p.typeIcon}</span>
          ${p.typeLabel}
        </span>
      </td>
      <td class="py-4 px-6 flex items-center gap-3.5">
        <img src="${p.image}" alt="${p.title}" class="w-14 h-12 rounded-xl object-cover shadow-sm shrink-0 bg-slate-100 cursor-pointer" onclick="openCardSheet('${p.id}', '${p.itemType}')"/>
        <div>
          <span onclick="openCardSheet('${p.id}', '${p.itemType}')" class="font-headline font-bold text-slate-800 text-sm block hover:text-secondary cursor-pointer transition-colors">${p.title}</span>
          <p class="text-xs text-slate-400 line-clamp-1">${p.displayDetails}</p>
        </div>
      </td>
      <td class="py-4 px-6 text-xs text-slate-600">
        <div class="font-semibold text-primary">${p.duration}</div>
        <span class="text-secondary font-medium">${p.displayExtra}</span>
      </td>
      <td class="py-4 px-6">
        <span class="font-headline font-black text-secondary text-sm block">${p.price}</span>
      </td>
      <td class="py-4 px-6 text-center">
        <button onclick="toggleProgramStatus('${p.id}', '${p.itemType}')" class="px-3 py-1 rounded-full text-xs font-bold transition-colors ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}">
          ${p.status === 'active' ? 'Activo' : 'Oculto'}
        </button>
      </td>
      <td class="py-4 px-6 text-right space-x-1.5">
        <button onclick="openCardSheet('${p.id}', '${p.itemType}')" class="p-2 rounded-lg bg-orange-50 text-secondary hover:bg-orange-100 transition-colors" title="Ver Ficha">
          <span class="material-symbols-outlined text-base">visibility</span>
        </button>
        <button onclick="openCourseModal('${p.id}', '${p.itemType}')" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Editar">
          <span class="material-symbols-outlined text-base">edit</span>
        </button>
        <button onclick="deleteProgram('${p.id}', '${p.itemType}')" class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Eliminar">
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

async function toggleProgramStatus(id, itemType) {
  const isCombo = (itemType === 'combo');
  const list = isCombo ? allCombos : allCourses;
  const item = list.find(c => c.id === id);
  if (!item) return;

  const nextStatus = item.status === 'active' ? 'inactive' : 'active';
  item.status = nextStatus;

  try {
    await updateCourseInDB(id, { ...item, status: nextStatus }, isCombo);
    const data = await fetchCoursesFromDB();
    allCourses = data.courses;
    allCombos = data.combos;
  } catch (err) {
    console.warn('Error al actualizar estado en Supabase:', err);
    if (isCombo) saveBusinessCombos(allCombos);
    else saveCourses(allCourses);
  }
  filterCoursesTable();
  updateDashboardMetrics();
}

async function deleteProgram(id, itemType) {
  const isCombo = (itemType === 'combo');
  if (confirm(`¿Estás seguro de que deseas eliminar este ${isCombo ? 'combo empresarial' : 'curso'} de Supabase?`)) {
    try {
      await deleteCourseInDB(id);
      const data = await fetchCoursesFromDB();
      allCourses = data.courses;
      allCombos = data.combos;
      closeCardSheet();
    } catch (err) {
      alert('Error al eliminar en Supabase: ' + err.message);
      if (isCombo) {
        allCombos = allCombos.filter(c => c.id !== id);
        saveBusinessCombos(allCombos);
      } else {
        allCourses = allCourses.filter(c => c.id !== id);
        saveCourses(allCourses);
      }
    }
    filterCoursesTable();
    updateDashboardMetrics();
  }
}

function handleImageFileUpload(e, targetType) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const rawDataUrl = event.target.result;
    const img = new Image();
    img.onload = function() {
      const maxDim = 1000;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else { width = Math.round((width * maxDim) / height); height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      if (targetType === 'course') {
        document.getElementById('input-course-image').value = optimizedDataUrl;
        document.getElementById('course-img-preview-tag').src = optimizedDataUrl;
        document.getElementById('course-img-preview-box').classList.remove('hidden');
      } else if (targetType === 'product') {
        document.getElementById('input-prod-image').value = optimizedDataUrl;
        document.getElementById('prod-img-preview-tag').src = optimizedDataUrl;
        document.getElementById('prod-img-preview-box').classList.remove('hidden');
      } else if (targetType === 'article') {
        document.getElementById('input-article-image').value = optimizedDataUrl;
        document.getElementById('article-img-preview-tag').src = optimizedDataUrl;
        document.getElementById('article-img-preview-box').classList.remove('hidden');
      }
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

function removeSelectedImage(targetType) {
  if (targetType === 'course') {
    document.getElementById('input-course-image').value = '';
    document.getElementById('course-img-preview-tag').src = '';
    document.getElementById('course-img-preview-box').classList.add('hidden');
  } else if (targetType === 'product') {
    document.getElementById('input-prod-image').value = '';
    document.getElementById('prod-img-preview-tag').src = '';
    document.getElementById('prod-img-preview-box').classList.add('hidden');
  } else if (targetType === 'article') {
    document.getElementById('input-article-image').value = '';
    document.getElementById('article-img-preview-tag').src = '';
    document.getElementById('article-img-preview-box').classList.add('hidden');
  }
}

function openCourseModal(itemId = null, itemType = 'course') {
  const modal = document.getElementById('course-modal');
  document.getElementById('course-form').reset();
  removeSelectedImage('course');
  
  const isCombo = (itemType === 'combo');
  document.getElementById('course-item-type').value = itemType;
  document.getElementById('course-modal-type-tag').innerText = isCombo ? 'Combo Empresarial (B2B)' : 'Curso Individual (General)';

  const comboIncludesBox = document.getElementById('combo-includes-container');
  if (comboIncludesBox) {
    if (isCombo) comboIncludesBox.classList.remove('hidden');
    else comboIncludesBox.classList.add('hidden');
  }

  if (itemId) {
    if (isCombo) {
      const cb = allCombos.find(item => item.id === itemId);
      if (cb) {
        document.getElementById('course-modal-title').innerText = 'Editar Combo Empresarial en Supabase';
        document.getElementById('course-id').value = cb.id;
        document.getElementById('input-course-title').value = cb.title || '';
        document.getElementById('input-course-desc').value = cb.description || '';
        document.getElementById('input-course-price').value = cb.price || '';
        document.getElementById('input-course-duration').value = cb.duration || '80 Horas Prácticas';
        if (document.getElementById('input-course-category')) document.getElementById('input-course-category').value = cb.category || 'empresarial';
        if (document.getElementById('input-course-badge')) document.getElementById('input-course-badge').value = cb.badge || 'Plan Corporativo';
        if (document.getElementById('input-course-extra')) document.getElementById('input-course-extra').value = cb.groupSize || 'Grupos de 3 a 5 personas';
        if (document.getElementById('input-combo-includes')) document.getElementById('input-combo-includes').value = (cb.includes || []).join(', ');
        document.getElementById('input-course-image').value = cb.image || '';
        if (cb.image) {
          document.getElementById('course-img-preview-tag').src = cb.image;
          document.getElementById('course-img-preview-box').classList.remove('hidden');
        }
      }
    } else {
      const c = allCourses.find(item => item.id === itemId);
      if (c) {
        document.getElementById('course-modal-title').innerText = 'Editar Curso Técnico en Supabase';
        document.getElementById('course-id').value = c.id;
        document.getElementById('input-course-title').value = c.title || '';
        document.getElementById('input-course-desc').value = c.description || '';
        document.getElementById('input-course-price').value = c.price || '';
        document.getElementById('input-course-duration').value = c.duration || '40 Horas Presenciales';
        if (document.getElementById('input-course-category')) document.getElementById('input-course-category').value = c.category || 'ofimatica';
        if (document.getElementById('input-course-badge')) document.getElementById('input-course-badge').value = c.badge || 'Presencial';
        if (document.getElementById('input-course-extra')) document.getElementById('input-course-extra').value = c.spots || '6 Cupos Disponibles';
        document.getElementById('input-course-image').value = c.image || '';
        if (c.image) {
          document.getElementById('course-img-preview-tag').src = c.image;
          document.getElementById('course-img-preview-box').classList.remove('hidden');
        }
      }
    }
  } else {
    document.getElementById('course-id').value = '';
    document.getElementById('course-modal-title').innerText = isCombo ? 'Agregar Nuevo Combo Empresarial en Supabase' : 'Agregar Nuevo Curso Técnico en Supabase';
    document.getElementById('input-course-duration').value = isCombo ? '80 Horas Prácticas' : '40 Horas Presenciales';
    if (document.getElementById('input-course-extra')) document.getElementById('input-course-extra').value = isCombo ? 'Grupos de 3 a 5 personas' : '6 Cupos Disponibles';
    if (document.getElementById('input-course-badge')) document.getElementById('input-course-badge').value = isCombo ? 'Plan Corporativo' : 'Presencial Especializado';
  }
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeCourseModal() {
  const modal = document.getElementById('course-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function handleSaveCourse(e) {
  e.preventDefault();
  const id = document.getElementById('course-id').value;
  const itemType = document.getElementById('course-item-type').value;
  const isCombo = (itemType === 'combo');

  let courseImg = document.getElementById('input-course-image').value;
  if (!courseImg) {
    courseImg = isCombo 
      ? 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const origHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span> Guardando en Supabase...`;
  }

  try {
    if (isCombo) {
      const rawIncludes = document.getElementById('input-combo-includes')?.value || '';
      const includesArr = rawIncludes ? rawIncludes.split(',').map(s => s.trim()).filter(Boolean) : ['Capacitación Práctica', 'Asesoría'];

      const comboData = {
        id: id || undefined,
        title: document.getElementById('input-course-title').value,
        category: document.getElementById('input-course-category')?.value || 'empresarial',
        badge: document.getElementById('input-course-badge')?.value || 'Plan Corporativo',
        description: document.getElementById('input-course-desc').value,
        duration: document.getElementById('input-course-duration').value || '80 Horas Prácticas',
        price: document.getElementById('input-course-price').value,
        groupSize: document.getElementById('input-course-extra')?.value || 'Grupos de 3 a 5 personas',
        includes: includesArr,
        image: courseImg,
        status: document.getElementById('input-course-status')?.checked ? 'active' : 'inactive'
      };

      if (id) await updateCourseInDB(id, comboData, true);
      else await createCourseInDB(comboData, true);
    } else {
      const courseData = {
        id: id || undefined,
        title: document.getElementById('input-course-title').value,
        category: document.getElementById('input-course-category')?.value || 'ofimatica',
        badge: document.getElementById('input-course-badge')?.value || 'Presencial Especializado',
        description: document.getElementById('input-course-desc').value,
        duration: document.getElementById('input-course-duration').value || '40 Horas Presenciales',
        price: document.getElementById('input-course-price').value,
        spots: document.getElementById('input-course-extra')?.value || '6 Cupos Disponibles',
        image: courseImg,
        status: document.getElementById('input-course-status')?.checked ? 'active' : 'inactive'
      };

      if (id) await updateCourseInDB(id, courseData, false);
      else await createCourseInDB(courseData, false);
    }

    const data = await fetchCoursesFromDB();
    allCourses = data.courses;
    allCombos = data.combos;

    closeCourseModal();
    filterCoursesTable();
    updateDashboardMetrics();
  } catch (err) {
    alert('Error al guardar curso en Supabase: ' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHtml;
    }
  }
}

function renderProductsCards(products) {
  const container = document.getElementById('products-cards-container');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `<div class="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm"><span class="material-symbols-outlined text-4xl text-slate-300 mb-2">inventory_2</span><p class="font-headline font-bold">No se encontraron productos registrados.</p></div>`;
    return;
  }

  container.innerHTML = products.map(p => `
    <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-luxury flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
      <div>
        <div class="relative h-48 overflow-hidden bg-slate-100 cursor-pointer" onclick="openCardSheet('${p.id}', 'product')">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          <span class="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-primary font-headline font-bold text-[11px] py-1 px-3 rounded-full shadow-sm">
            ${p.brand || 'Instrumental'}
          </span>
          <button onclick="event.stopPropagation(); cycleProductStock('${p.id}')" class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md transition-colors ${p.stock?.includes('Disponible') || p.stock?.includes('Alta') ? 'bg-emerald-500 text-white' : (p.stock?.includes('Agotado') ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white')}" title="Clic para alternar stock">
            ${p.stock || 'Disponible'}
          </button>
        </div>
        <div class="p-5 space-y-2.5">
          <span class="text-[11px] uppercase font-bold text-secondary tracking-wider block">${p.category}</span>
          <h3 onclick="openCardSheet('${p.id}', 'product')" class="font-headline font-bold text-base text-primary group-hover:text-secondary transition-colors cursor-pointer leading-snug line-clamp-2">
            ${p.name}
          </h3>
          <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
            ${p.description}
          </p>
        </div>
      </div>
      <div class="p-5 pt-0 space-y-3">
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-400 font-semibold uppercase">Precio</span>
            <p class="font-headline font-black text-secondary text-lg">${p.price}</p>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="openCardSheet('${p.id}', 'product')" class="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-secondary transition-colors" title="Ver Ficha">
              <span class="material-symbols-outlined text-lg">visibility</span>
            </button>
            <button onclick="openProductModal('${p.id}')" class="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Editar">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button onclick="deleteProduct('${p.id}')" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors" title="Eliminar">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderProductsTable(products) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400 font-medium">No se encontraron productos en el inventario.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr class="hover:bg-slate-50/80 transition-colors">
      <td class="py-4 px-6 flex items-center gap-4">
        <img src="${p.image}" alt="${p.name}" class="w-14 h-12 rounded-xl object-cover shadow-sm shrink-0 bg-slate-100 cursor-pointer" onclick="openCardSheet('${p.id}', 'product')"/>
        <div>
          <span onclick="openCardSheet('${p.id}', 'product')" class="font-headline font-bold text-slate-800 hover:text-secondary cursor-pointer transition-colors block">${p.name}</span>
          <p class="text-xs text-slate-400 line-clamp-1">${p.description}</p>
        </div>
      </td>
      <td class="py-4 px-6 text-xs text-slate-600">
        <strong class="text-primary block font-bold">${p.brand || 'Marca Oficial'}</strong>
        <span class="px-2 py-0.5 rounded bg-slate-100 text-[11px] uppercase font-semibold text-slate-500">${p.category}</span>
      </td>
      <td class="py-4 px-6 text-xs">
        <button onclick="cycleProductStock('${p.id}')" class="px-3 py-1 rounded-lg font-bold transition-all text-left flex items-center gap-1.5 ${p.stock.includes('Disponible') || p.stock.includes('Alta') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : (p.stock.includes('Agotado') ? 'bg-rose-50 text-rose-700 border border-rose-200/60' : 'bg-amber-50 text-amber-700 border border-amber-200/60')}">
          <span class="w-1.5 h-1.5 rounded-full ${p.stock.includes('Disponible') || p.stock.includes('Alta') ? 'bg-emerald-500' : (p.stock.includes('Agotado') ? 'bg-rose-500' : 'bg-amber-500')}"></span>
          <span>${p.stock}</span>
        </button>
      </td>
      <td class="py-4 px-6 font-headline font-black text-secondary text-sm">${p.price}</td>
      <td class="py-4 px-6 text-center">
        <span class="px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
          ${p.badge || 'Stock'}
        </span>
      </td>
      <td class="py-4 px-6 text-right space-x-1.5">
        <button onclick="openCardSheet('${p.id}', 'product')" class="p-2 rounded-lg bg-orange-50 text-secondary hover:bg-orange-100 transition-colors" title="Ver Ficha Técnica">
          <span class="material-symbols-outlined text-base">visibility</span>
        </button>
        <button onclick="openProductModal('${p.id}')" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Editar Producto">
          <span class="material-symbols-outlined text-base">edit</span>
        </button>
        <button onclick="deleteProduct('${p.id}')" class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Eliminar Producto">
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function filterProductsTable() {
  const search = (document.getElementById('product-search-input')?.value || '').toLowerCase();
  const cat = document.getElementById('product-category-filter')?.value || 'all';

  const filtered = allProducts.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(search) || (p.description || '').toLowerCase().includes(search) || (p.brand || '').toLowerCase().includes(search);
    const matchesCat = cat === 'all' || p.category === cat;
    return matchesSearch && matchesCat;
  });

  renderProductsCards(filtered);
  renderProductsTable(filtered);
}

async function cycleProductStock(id) {
  const states = ["Disponible en Sede", "Últimas 4 unidades", "Alta Disponibilidad", "Bajo Pedido / Entrega 48h", "Agotado Temporalmente"];
  const p = allProducts.find(item => item.id === id);
  if (!p) return;

  const currentIndex = states.indexOf(p.stock);
  const nextIndex = (currentIndex + 1) % states.length;
  const nextStock = states[nextIndex >= 0 ? nextIndex : 0];
  p.stock = nextStock;

  try {
    await updateProductInDB(id, { ...p, stock: nextStock });
    allProducts = await fetchProductsFromDB();
  } catch (err) {
    console.warn('Error al actualizar stock en Supabase:', err);
    saveProducts(allProducts);
  }
  filterProductsTable();
  updateDashboardMetrics();
}

async function deleteProduct(id) {
  if (confirm('¿Estás seguro de que deseas eliminar permanentemente este producto de la base de datos Supabase?')) {
    try {
      await deleteProductInDB(id);
      allProducts = await fetchProductsFromDB();
      filterProductsTable();
      updateDashboardMetrics();
      closeCardSheet();
    } catch (err) {
      alert('Error al eliminar producto en Supabase: ' + err.message);
    }
  }
}

function openProductModal(productId = null) {
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');
  form.reset();
  removeSelectedImage('product');

  if (productId) {
    const p = allProducts.find(item => item.id === productId);
    if (p) {
      document.getElementById('product-modal-title').innerText = 'Editar Producto & Stock en Supabase';
      document.getElementById('product-id').value = p.id;
      document.getElementById('input-prod-name').value = p.name || '';
      document.getElementById('input-prod-brand').value = p.brand || 'Oficial';
      document.getElementById('input-prod-category').value = p.category || 'herramientas';
      document.getElementById('input-prod-price').value = p.price || '';
      document.getElementById('input-prod-stock').value = p.stock || 'Disponible en Sede';
      document.getElementById('input-prod-badge').value = p.badge || 'Stock';
      document.getElementById('input-prod-image').value = p.image || '';
      if (p.image) {
        document.getElementById('prod-img-preview-tag').src = p.image;
        document.getElementById('prod-img-preview-box').classList.remove('hidden');
      }
      document.getElementById('input-prod-desc').value = p.description || '';
      document.getElementById('input-prod-specs').value = (p.specs || []).join(', ');
    }
  } else {
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal-title').innerText = 'Agregar Nuevo Producto en Supabase';
    document.getElementById('input-prod-stock').value = 'Disponible en Sede';
    document.getElementById('input-prod-badge').value = 'Recomendado';
    document.getElementById('input-prod-brand').value = 'TecnoPro Tools';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function handleSaveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  let prodImg = document.getElementById('input-prod-image').value;

  if (!prodImg) {
    prodImg = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  }
  const specsRaw = document.getElementById('input-prod-specs').value;
  const specsArray = specsRaw ? specsRaw.split(',').map(s => s.trim()).filter(Boolean) : ['Garantía oficial', 'Uso profesional en taller'];

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const origHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span> Guardando en Supabase...`;
  }

  const productData = {
    id: id || undefined,
    name: document.getElementById('input-prod-name').value,
    brand: document.getElementById('input-prod-brand').value || 'Oficial',
    category: document.getElementById('input-prod-category').value,
    price: document.getElementById('input-prod-price').value,
    stock: document.getElementById('input-prod-stock').value,
    badge: document.getElementById('input-prod-badge').value || 'Recomendado',
    image: prodImg,
    description: document.getElementById('input-prod-desc').value,
    specs: specsArray
  };

  try {
    if (id) {
      await updateProductInDB(id, productData);
    } else {
      await createProductInDB(productData);
    }
    allProducts = await fetchProductsFromDB();
    closeProductModal();
    filterProductsTable();
    updateDashboardMetrics();
  } catch (err) {
    alert('Error al guardar producto en Supabase: ' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHtml;
    }
  }
}

// ==========================================
// MÓDULO DE ARTÍCULOS & BLOG TÉCNICO
// ==========================================
function renderArticlesCards(articles) {
  const container = document.getElementById('articles-cards-container');
  if (!container) return;

  if (articles.length === 0) {
    container.innerHTML = `<div class="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm"><span class="material-symbols-outlined text-4xl text-slate-300 mb-2">article</span><p class="font-headline font-bold">No se encontraron artículos registrados en Supabase.</p></div>`;
    return;
  }

  container.innerHTML = articles.map(a => `
    <article class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-luxury flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300">
      <div>
        <div class="relative h-48 overflow-hidden bg-slate-100 cursor-pointer" onclick="openArticleModal('${a.id}')">
          <img src="${a.imagen}" alt="${a.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          <span class="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-purple-800 font-headline font-bold text-[11px] py-1 px-3 rounded-full shadow-sm">
            ${a.category}
          </span>
          <button onclick="event.stopPropagation(); toggleArticleStatus('${a.id}', '${a.status}')" class="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md transition-colors ${a.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-slate-700/80 text-slate-200'}" title="Alternar publicación">
            ${a.status === 'published' ? '● Publicado' : '○ Borrador'}
          </button>
        </div>
        <div class="p-5 space-y-2.5">
          <div class="flex items-center justify-between text-[11px] text-slate-400">
            <span class="font-semibold text-slate-700">${a.autor}</span>
            <span class="flex items-center gap-1 text-secondary font-bold"><span class="material-symbols-outlined text-xs">visibility</span> ${a.vistas || 0}</span>
          </div>
          <h3 onclick="openArticleModal('${a.id}')" class="font-headline font-bold text-base text-primary group-hover:text-purple-700 transition-colors cursor-pointer leading-snug line-clamp-2">
            ${a.title}
          </h3>
          <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">
            ${a.resumen}
          </p>
        </div>
      </div>
      <div class="p-5 pt-0 space-y-3">
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span class="text-[11px] text-slate-400 font-medium">${a.created_at ? new Date(a.created_at).toLocaleDateString() : 'Reciente'}</span>
          <div class="flex items-center gap-1.5">
            <button onclick="openArticleModal('${a.id}')" class="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Editar en Supabase">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button onclick="deleteArticle('${a.id}')" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors" title="Eliminar de Supabase">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

function renderArticlesTable(articles) {
  const tbody = document.getElementById('articles-tbody');
  if (!tbody) return;

  if (articles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-slate-400 font-medium">No se encontraron artículos registrados en Supabase.</td></tr>`;
    return;
  }

  tbody.innerHTML = articles.map(a => `
    <tr class="hover:bg-slate-50/80 transition-colors">
      <td class="py-4 px-6 flex items-center gap-4">
        <img src="${a.imagen}" alt="${a.title}" class="w-14 h-12 rounded-xl object-cover shadow-sm shrink-0 bg-slate-100"/>
        <div>
          <h4 class="font-headline font-bold text-slate-800 text-sm leading-snug line-clamp-1">${a.title}</h4>
          <p class="text-xs text-slate-400 line-clamp-1 mt-0.5">${a.resumen}</p>
        </div>
      </td>
      <td class="py-4 px-6 text-xs text-slate-600">
        <span class="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold block w-fit mb-1">${a.category}</span>
        <span class="text-slate-500 font-medium">${a.autor}</span>
      </td>
      <td class="py-4 px-6 text-center font-headline font-bold text-slate-700 text-xs">
        ${a.vistas || 0} lecturas
      </td>
      <td class="py-4 px-6 text-center">
        <button onclick="toggleArticleStatus('${a.id}', '${a.status}')" class="px-3 py-1 rounded-full text-xs font-bold transition-colors ${a.status === 'published' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}" title="Alternar publicación en Supabase">
          ${a.status === 'published' ? 'Publicado' : 'Borrador'}
        </button>
      </td>
      <td class="py-4 px-6 text-right space-x-1.5">
        <button onclick="openArticleModal('${a.id}')" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Editar en Supabase">
          <span class="material-symbols-outlined text-base">edit</span>
        </button>
        <button onclick="deleteArticle('${a.id}')" class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Eliminar de Supabase">
          <span class="material-symbols-outlined text-base">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function filterArticlesTable() {
  const search = (document.getElementById('article-search-input')?.value || '').toLowerCase();
  const status = document.getElementById('article-status-filter')?.value || 'all';

  const filtered = allArticles.filter(a => {
    const matchesSearch = (a.title || '').toLowerCase().includes(search) ||
                          (a.resumen || '').toLowerCase().includes(search) ||
                          (a.category || '').toLowerCase().includes(search) ||
                          (a.autor || '').toLowerCase().includes(search);
    const matchesStatus = (status === 'all') || (a.status === status);
    return matchesSearch && matchesStatus;
  });

  renderArticlesCards(filtered);
  renderArticlesTable(filtered);
}

async function toggleArticleStatus(id, currentStatus) {
  try {
    await toggleArticleStatusInDB(id, currentStatus);
    allArticles = await fetchArticlesFromDB();
    filterArticlesTable();
    updateDashboardMetrics();
  } catch (err) {
    alert('Error al alternar estado del artículo en Supabase: ' + err.message);
  }
}

async function deleteArticle(id) {
  if (confirm('¿Estás seguro de que deseas eliminar permanentemente este artículo de la base de datos Supabase?')) {
    try {
      await deleteArticleInDB(id);
      allArticles = await fetchArticlesFromDB();
      filterArticlesTable();
      updateDashboardMetrics();
    } catch (err) {
      alert('Error al eliminar artículo en Supabase: ' + err.message);
    }
  }
}

function openArticleModal(id = null) {
  const modal = document.getElementById('article-modal');
  const form = document.getElementById('article-form');
  form.reset();

  if (id) {
    const a = allArticles.find(item => item.id === id);
    if (a) {
      document.getElementById('article-modal-title').innerText = 'Editar Artículo / Guía en Supabase';
      document.getElementById('article-id').value = a.id;
      document.getElementById('input-article-title').value = a.title;
      document.getElementById('input-article-category').value = a.category;
      document.getElementById('input-article-author').value = a.autor;
      document.getElementById('input-article-status').value = a.status || 'published';
      document.getElementById('input-article-image').value = a.imagen || '';
      if (a.imagen) {
        document.getElementById('article-img-preview-tag').src = a.imagen;
        document.getElementById('article-img-preview-box').classList.remove('hidden');
      } else {
        removeSelectedImage('article');
      }
      document.getElementById('input-article-resumen').value = a.resumen;
      document.getElementById('input-article-content').value = a.contenido || '';
    }
  } else {
    removeSelectedImage('article');
    document.getElementById('article-modal-title').innerText = 'Agregar Nuevo Artículo en Supabase';
    document.getElementById('article-id').value = '';
    document.getElementById('input-article-author').value = 'Equipo Docente 123AcademiaTech';
    document.getElementById('input-article-status').value = 'published';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeArticleModal() {
  const modal = document.getElementById('article-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function handleSaveArticle(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span> Guardando en Supabase...`;
  }

  const id = document.getElementById('article-id').value;
  const img = document.getElementById('input-article-image').value || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  const title = document.getElementById('input-article-title').value;

  const articleData = {
    id: id || undefined,
    title: title,
    category: document.getElementById('input-article-category').value,
    autor: document.getElementById('input-article-author').value,
    status: document.getElementById('input-article-status').value,
    imagen: img,
    resumen: document.getElementById('input-article-resumen').value,
    contenido: document.getElementById('input-article-content').value || document.getElementById('input-article-resumen').value
  };

  try {
    if (id) {
      await updateArticleInDB(id, articleData);
    } else {
      await createArticleInDB(articleData);
    }
    allArticles = await fetchArticlesFromDB();
    closeArticleModal();
    filterArticlesTable();
    updateDashboardMetrics();
  } catch (err) {
    alert('Error al guardar artículo en Supabase: ' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;
    }
  }
}

// =======================================================
// MÓDULO DE USUARIOS & ROLES CON 4 NIVELES
// =======================================================
async function refreshUsersFromDB() {
  const indicator = document.getElementById('supabase-status-indicator');
  if (indicator) {
    indicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span><span>Conectando a Supabase...</span>`;
  }

  try {
    allUsers = await fetchUsersFromDB();
    if (indicator) {
      indicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Supabase Cloud DB Conectada (${allUsers.length} Usuarios)</span>`;
    }
  } catch (err) {
    console.warn('Error al sincronizar con Supabase:', err);
    allUsers = getCachedUsers();
    if (indicator) {
      indicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-400"></span><span>Modo Local / Offline (${allUsers.length} Usuarios)</span>`;
    }
  }

  filterUsersTable();
  updateDashboardMetrics();
}

function renderUsersCards(users) {
  const container = document.getElementById('users-cards-container');
  if (!container) return;

  if (users.length === 0) {
    container.innerHTML = `<div class="col-span-full bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm"><span class="material-symbols-outlined text-4xl text-slate-300 mb-2">manage_accounts</span><p class="font-headline font-bold">No se encontraron usuarios en esta categoría en Supabase.</p></div>`;
    return;
  }

  container.innerHTML = users.map(u => {
    const lvl = USER_LEVELS[u.nivel] || USER_LEVELS[1];
    return `
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-luxury flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 space-y-4">
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}" alt="${u.name}" class="w-12 h-12 rounded-2xl object-cover shadow-sm shrink-0 border border-slate-200"/>
              <div>
                <h4 class="font-headline font-bold text-sm text-primary line-clamp-1">${u.name}</h4>
                <span class="inline-flex items-center gap-1 text-[10px] font-headline font-bold py-0.5 px-2 rounded-md ${lvl.badgeClass}">
                  <span class="material-symbols-outlined text-xs">${lvl.icon}</span>
                  Nivel ${u.nivel}: ${lvl.name}
                </span>
              </div>
            </div>
            <button onclick="toggleUserStatus('${u.id}', '${u.status}')" class="px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}" title="Alternar estado en Supabase">
              ${u.status === 'active' ? 'Activo' : 'Inactivo'}
            </button>
          </div>

          <div class="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div class="flex items-center gap-2 text-slate-700">
              <span class="material-symbols-outlined text-sm text-slate-400">mail</span>
              <span class="truncate font-medium">${u.email}</span>
            </div>
            <div class="flex items-center gap-2 text-slate-500">
              <span class="material-symbols-outlined text-sm text-slate-400">call</span>
              <span>${u.phone || 'Sin teléfono'}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button onclick="quickCycleUserLevel('${u.id}', ${u.nivel})" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-headline font-bold text-[11px] flex items-center gap-1 transition-colors" title="Cambiar rol al siguiente nivel en Supabase">
            <span class="material-symbols-outlined text-xs">swap_vert</span>
            Cambiar Nivel
          </button>
          <div class="flex items-center gap-1.5">
            <button onclick="openUserModal('${u.id}')" class="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Editar en Supabase">
              <span class="material-symbols-outlined text-lg">edit</span>
            </button>
            <button onclick="deleteUser('${u.id}')" class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors" title="Eliminar de Supabase">
              <span class="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderUsersTable(users) {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-slate-400 font-medium">No se encontraron usuarios registrados en esta categoría en Supabase.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const lvl = USER_LEVELS[u.nivel] || USER_LEVELS[1];
    return `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="py-4 px-6 flex items-center gap-3.5">
          <img src="${u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}" alt="${u.name}" class="w-10 h-10 rounded-full object-cover shadow-sm shrink-0 border border-slate-200"/>
          <div>
            <h4 class="font-headline font-bold text-slate-800 text-sm leading-snug">${u.name}</h4>
            <span class="text-[11px] text-slate-400">ID: ${u.id.substring(0, 8)}... | ${u.created_at || 'Reciente'}</span>
          </div>
        </td>
        <td class="py-4 px-6 text-xs text-slate-600">
          <strong class="text-primary block font-semibold">${u.email}</strong>
          <span class="text-slate-400 font-medium">${u.phone || 'Sin teléfono'}</span>
        </td>
        <td class="py-4 px-6">
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${lvl.badgeClass}">
              <span class="material-symbols-outlined text-sm">${lvl.icon}</span>
              <span>Nivel ${u.nivel}: ${lvl.name}</span>
            </span>
            <button onclick="quickCycleUserLevel('${u.id}', ${u.nivel})" class="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-secondary transition-colors" title="Cambiar nivel jerárquico en Supabase">
              <span class="material-symbols-outlined text-sm">swap_vert</span>
            </button>
          </div>
        </td>
        <td class="py-4 px-6 text-center">
          <button onclick="toggleUserStatus('${u.id}', '${u.status}')" class="px-3 py-1 rounded-full text-xs font-bold transition-colors ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}" title="Haga clic para alternar estado en Supabase">
            ${u.status === 'active' ? 'Activo' : 'Inactivo'}
          </button>
        </td>
        <td class="py-4 px-6 text-right space-x-1.5">
          <button onclick="openUserModal('${u.id}')" class="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Editar en Supabase">
            <span class="material-symbols-outlined text-base">edit</span>
          </button>
          <button onclick="deleteUser('${u.id}')" class="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Eliminar de Supabase">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function setUserLevelFilter(lvl) {
  currentUserLevelFilter = lvl;
  document.querySelectorAll('.user-level-pill').forEach(el => {
    el.className = "user-level-pill px-4 py-2 rounded-xl font-headline font-bold text-xs bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shrink-0 transition-all";
  });
  const activeEl = document.getElementById(`user-filter-${lvl}`);
  if (activeEl) {
    activeEl.className = "user-level-pill px-4 py-2 rounded-xl font-headline font-bold text-xs bg-secondary text-white shadow-sm shrink-0 transition-all";
  }
  filterUsersTable();
}

function filterUsersTable() {
  const search = (document.getElementById('user-search-input')?.value || '').toLowerCase();
  const status = document.getElementById('user-status-filter')?.value || 'all';

  const filtered = allUsers.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(search) ||
                          (u.email || '').toLowerCase().includes(search) ||
                          (u.phone || '').toLowerCase().includes(search);
    const matchesLevel = (currentUserLevelFilter === 'all') || (String(u.nivel) === String(currentUserLevelFilter));
    const matchesStatus = (status === 'all') || (u.status === status);
    return matchesSearch && matchesLevel && matchesStatus;
  });

  renderUsersCards(filtered);
  renderUsersTable(filtered);
}

async function quickCycleUserLevel(id, currentLevel) {
  try {
    await cycleUserLevelInDB(id, currentLevel);
    await refreshUsersFromDB();
  } catch (err) {
    alert('Error al actualizar nivel en Supabase: ' + err.message);
  }
}

async function toggleUserStatus(id, currentStatus) {
  try {
    await toggleUserStatusInDB(id, currentStatus);
    await refreshUsersFromDB();
  } catch (err) {
    alert('Error al alternar estado en Supabase: ' + err.message);
  }
}

async function deleteUser(id) {
  if (confirm('¿Estás seguro de que deseas eliminar permanentemente este usuario de la base de datos Supabase?')) {
    try {
      await deleteUserInDB(id);
      await refreshUsersFromDB();
    } catch (err) {
      alert('Error al eliminar usuario en Supabase: ' + err.message);
    }
  }
}

function openUserModal(id = null) {
  const modal = document.getElementById('user-modal');
  const form = document.getElementById('user-form');
  form.reset();

  if (id) {
    const u = allUsers.find(item => item.id === id);
    if (u) {
      document.getElementById('user-modal-title').innerText = 'Editar Datos de Usuario en Supabase';
      document.getElementById('user-id').value = u.id;
      document.getElementById('input-user-name').value = u.name;
      document.getElementById('input-user-email').value = u.email;
      document.getElementById('input-user-phone').value = u.phone || '';
      document.getElementById('input-user-level').value = String(u.nivel);
      document.getElementById('input-user-status').value = u.status || 'active';
      document.getElementById('input-user-avatar').value = u.avatar || '';
      const pwdInput = document.getElementById('input-user-password');
      if (pwdInput) pwdInput.value = '';
    }
  } else {
    document.getElementById('user-modal-title').innerText = 'Registrar Nuevo Usuario en Supabase';
    document.getElementById('user-id').value = '';
    document.getElementById('input-user-level').value = '1';
    document.getElementById('input-user-status').value = 'active';
    const pwdInput = document.getElementById('input-user-password');
    if (pwdInput) pwdInput.value = '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeUserModal() {
  const modal = document.getElementById('user-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function handleSaveUser(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span> Guardando...`;
  }

  const id = document.getElementById('user-id').value;
  const lvlNum = Number(document.getElementById('input-user-level').value);
  const pwdVal = document.getElementById('input-user-password')?.value;

  const userData = {
    id: id || undefined,
    name: document.getElementById('input-user-name').value,
    email: document.getElementById('input-user-email').value,
    phone: document.getElementById('input-user-phone').value,
    nivel: lvlNum,
    rol_nombre: USER_LEVELS[lvlNum]?.name || 'Visitante',
    avatar: document.getElementById('input-user-avatar').value || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    status: document.getElementById('input-user-status').value,
    password: pwdVal || undefined
  };

  try {
    if (id) {
      await updateUserInDB(id, userData);
    } else {
      await createUserInDB(userData);
    }
    closeUserModal();
    await refreshUsersFromDB();
  } catch (err) {
    alert('Error al guardar en Supabase: ' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
}

// =======================================================
// GESTIÓN DE LA FICHA DETALLADA (CARD DETAILS SHEET)
// =======================================================
function openCardSheet(id, itemType) {
  const drawer = document.getElementById('card-sheet-drawer');
  let item = null;
  let badgeType = '';
  let badgeColor = '';

  if (itemType === 'combo') {
    item = allCombos.find(c => c.id === id);
    badgeType = '🏢 Combo Empresarial (B2B)';
    badgeColor = 'bg-orange-100 text-secondary border border-orange-200';
  } else if (itemType === 'product') {
    item = allProducts.find(p => p.id === id);
    badgeType = '🛠️ Producto / Instrumental de Taller';
    badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
  } else {
    item = allCourses.find(c => c.id === id);
    badgeType = '🎓 Curso Técnico Presencial';
    badgeColor = 'bg-blue-100 text-primary border border-blue-200';
  }

  if (!item) return;

  const typeBadge = document.getElementById('sheet-item-type-badge');
  typeBadge.className = `px-2.5 py-0.5 rounded-md text-[10.5px] font-headline font-bold uppercase tracking-wider ${badgeColor}`;
  typeBadge.innerText = badgeType;

  document.getElementById('sheet-title').innerText = item.title || item.name;
  document.getElementById('sheet-image').src = item.image;
  document.getElementById('sheet-badge').innerText = item.badge || (item.brand ? `Marca: ${item.brand}` : 'Oficial');
  document.getElementById('sheet-price').innerText = item.price;
  document.getElementById('sheet-desc').innerText = item.description;

  const statusTag = document.getElementById('sheet-status-tag');
  if (itemType === 'product') {
    statusTag.innerText = item.stock;
  } else {
    statusTag.innerText = item.status === 'active' ? 'Publicado en Web' : 'Oculto';
  }

  const lblDuration = document.getElementById('sheet-lbl-duration');
  const valDuration = document.getElementById('sheet-duration');
  const lblExtra = document.getElementById('sheet-lbl-extra');
  const valExtra = document.getElementById('sheet-extra');

  if (itemType === 'combo') {
    lblDuration.innerText = 'Formato / Horas';
    valDuration.innerText = item.duration;
    lblExtra.innerText = 'Grupo';
    valExtra.innerText = item.groupSize || 'Grupal';
  } else if (itemType === 'product') {
    lblDuration.innerText = 'Marca / Línea';
    valDuration.innerText = item.brand || 'Profesional';
    lblExtra.innerText = 'Stock Sede';
    valExtra.innerText = item.stock;
  } else {
    lblDuration.innerText = 'Duración';
    valDuration.innerText = item.duration;
    lblExtra.innerText = 'Cupos';
    valExtra.innerText = item.spots;
  }

  const listTitle = document.getElementById('sheet-items-list-title');
  const listUl = document.getElementById('sheet-items-list');

  let itemsArray = [];
  if (itemType === 'combo') {
    listTitle.innerText = 'Módulos y Temarios Incluidos en el Combo:';
    itemsArray = item.includes || [];
  } else if (itemType === 'product') {
    listTitle.innerText = 'Especificaciones Técnicas & Características:';
    itemsArray = item.specs || [];
  } else {
    listTitle.innerText = 'Temario y Enfoque Práctico:';
    itemsArray = [
      'Talleres 100% presenciales en laboratorios equipados',
      'Banco de trabajo individual asignado',
      'Prácticas directas con equipos y componentes reales',
      'Certificación avalada curricularmente'
    ];
  }

  listUl.innerHTML = itemsArray.map(line => `
    <li class="flex items-center gap-2">
      <span class="material-symbols-outlined text-secondary text-sm shrink-0">check_circle</span>
      <span>${line}</span>
    </li>
  `).join('');

  document.getElementById('sheet-btn-edit').onclick = () => {
    closeCardSheet();
    if (itemType === 'product') openProductModal(item.id);
    else openCourseModal(item.id, itemType);
  };

  document.getElementById('sheet-btn-delete').onclick = () => {
    if (itemType === 'product') deleteProduct(item.id);
    else deleteProgram(item.id, itemType);
  };

  document.getElementById('sheet-btn-add-cart').onclick = () => {
    if (typeof addToCart === 'function') {
      addToCart({
        id: item.id,
        title: item.title || item.name,
        price: item.price,
        type: itemType === 'combo' ? 'combo' : (itemType === 'product' ? 'producto' : 'curso'),
        image: item.image,
        badge: item.badge
      });
    }
  };

  drawer.classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('card-sheet-panel').classList.remove('translate-x-full');
  }, 10);
}

function closeCardSheet() {
  const panel = document.getElementById('card-sheet-panel');
  if (panel) panel.classList.add('translate-x-full');
  setTimeout(() => {
    const drawer = document.getElementById('card-sheet-drawer');
    if (drawer) drawer.classList.add('hidden');
  }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
