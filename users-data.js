// Gestor de Usuarios con Conexión a Base de Datos Supabase (4 Niveles)
// Nivel 1: Visitante | Nivel 2: Alumno | Nivel 3: Docente | Nivel 4: Administrador

const USER_LEVELS = {
  1: { name: "Visitante", badgeClass: "bg-slate-100 text-slate-700 border-slate-200", icon: "visibility" },
  2: { name: "Alumno", badgeClass: "bg-blue-100 text-primary border-blue-200", icon: "school" },
  3: { name: "Docente", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "engineering" },
  4: { name: "Administrador", badgeClass: "bg-orange-100 text-secondary border-orange-200 font-bold", icon: "admin_panel_settings" }
};

// Cargar usuarios desde Supabase con caché local
async function fetchUsersFromDB() {
  try {
    const data = await SupabaseAPI.query('usuarios', '*', 'nivel.desc,created_at.asc');
    if (data && Array.isArray(data) && data.length > 0) {
      const normalized = data.map(u => ({
        id: u.id,
        name: u.nombre,
        email: u.email,
        phone: u.telefono || '',
        nivel: Number(u.nivel) || 1,
        rol_nombre: u.rol_nombre || USER_LEVELS[Number(u.nivel) || 1].name,
        avatar: u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        status: u.activo ? 'active' : 'inactive',
        created_at: u.created_at ? u.created_at.split('T')[0] : '2026-08-31'
      }));
      localStorage.setItem('academia_users', JSON.stringify(normalized));
      return normalized;
    }
  } catch (e) {
    console.warn('[UsersDB] Error conectando con Supabase, usando caché local:', e);
  }
  return getCachedUsers();
}

function getCachedUsers() {
  const stored = localStorage.getItem('academia_users');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return [];
}

// Crear nuevo usuario en Supabase
async function createUserInDB(userData) {
  const payload = {
    nombre: userData.name,
    email: userData.email,
    password_hash: userData.password || null,
    telefono: userData.phone || null,
    nivel: Number(userData.nivel) || 1,
    avatar_url: userData.avatar || null,
    activo: (userData.status === 'active')
  };

  const res = await SupabaseAPI.insert('usuarios', payload);
  const created = res && res[0] ? res[0] : payload;
  
  const formatted = {
    id: created.id || `usr-${Date.now()}`,
    name: created.nombre,
    email: created.email,
    phone: created.telefono || '',
    nivel: Number(created.nivel) || 1,
    rol_nombre: created.rol_nombre || USER_LEVELS[Number(created.nivel) || 1].name,
    avatar: created.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    status: created.activo ? 'active' : 'inactive',
    created_at: created.created_at ? created.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
  };

  const current = getCachedUsers();
  current.unshift(formatted);
  localStorage.setItem('academia_users', JSON.stringify(current));
  return formatted;
}

// Actualizar usuario en Supabase
async function updateUserInDB(id, userData) {
  const payload = {
    nombre: userData.name,
    email: userData.email,
    telefono: userData.phone || null,
    nivel: Number(userData.nivel) || 1,
    avatar_url: userData.avatar || null,
    activo: (userData.status === 'active')
  };

  if (userData.password) {
    payload.password_hash = userData.password;
  }

  await SupabaseAPI.update('usuarios', id, payload);

  const current = getCachedUsers();
  const updatedList = current.map(u => {
    if (u.id === id) {
      return {
        ...u,
        name: payload.nombre,
        email: payload.email,
        phone: payload.telefono || '',
        nivel: payload.nivel,
        rol_nombre: USER_LEVELS[payload.nivel]?.name || 'Visitante',
        avatar: payload.avatar_url || u.avatar,
        status: payload.activo ? 'active' : 'inactive'
      };
    }
    return u;
  });
  localStorage.setItem('academia_users', JSON.stringify(updatedList));
  return updatedList;
}

// Eliminar usuario en Supabase
async function deleteUserInDB(id) {
  await SupabaseAPI.delete('usuarios', id);
  const current = getCachedUsers().filter(u => u.id !== id);
  localStorage.setItem('academia_users', JSON.stringify(current));
  return true;
}

// Cambiar nivel rápido en Supabase
async function cycleUserLevelInDB(id, currentLevel) {
  const nextLvl = (Number(currentLevel) % 4) + 1;
  await SupabaseAPI.update('usuarios', id, { nivel: nextLvl });

  const current = getCachedUsers().map(u => {
    if (u.id === id) {
      u.nivel = nextLvl;
      u.rol_nombre = USER_LEVELS[nextLvl]?.name || 'Visitante';
    }
    return u;
  });
  localStorage.setItem('academia_users', JSON.stringify(current));
  return nextLvl;
}

// Alternar estado activo / inactivo en Supabase
async function toggleUserStatusInDB(id, currentStatus) {
  const nextActive = (currentStatus !== 'active');
  await SupabaseAPI.update('usuarios', id, { activo: nextActive });

  const current = getCachedUsers().map(u => {
    if (u.id === id) {
      u.status = nextActive ? 'active' : 'inactive';
    }
    return u;
  });
  localStorage.setItem('academia_users', JSON.stringify(current));
  return nextActive;
}

// Para compatibilidad
function getUsers() {
  return getCachedUsers();
}
function saveUsers(users) {
  localStorage.setItem('academia_users', JSON.stringify(users));
}
