// Gestor de Usuarios con 4 Niveles para 123AcademiaTech
// Nivel 1: Visitante
// Nivel 2: Alumno
// Nivel 3: Docente
// Nivel 4: Administrador

const USER_LEVELS = {
  1: { name: "Visitante", badgeClass: "bg-slate-100 text-slate-700 border-slate-200", icon: "visibility" },
  2: { name: "Alumno", badgeClass: "bg-blue-100 text-primary border-blue-200", icon: "school" },
  3: { name: "Docente", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "engineering" },
  4: { name: "Administrador", badgeClass: "bg-orange-100 text-secondary border-orange-200 font-bold", icon: "admin_panel_settings" }
};

const DEFAULT_USERS = [
  {
    id: "usr-1",
    name: "Super Administrador",
    email: "admin@123academiatech.com",
    phone: "+1 (800) 123-8324",
    nivel: 4,
    rol_nombre: "Administrador",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    status: "active",
    created_at: "2026-08-01"
  },
  {
    id: "usr-2",
    name: "Prof. Carlos Mendoza",
    email: "carlos.mendoza@123academiatech.com",
    phone: "+1 (800) 123-0001",
    nivel: 3,
    rol_nombre: "Docente",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    status: "active",
    created_at: "2026-08-05"
  },
  {
    id: "usr-3",
    name: "Ing. Sofía Valenzuela",
    email: "sofia.valenzuela@123academiatech.com",
    phone: "+1 (800) 123-0002",
    nivel: 3,
    rol_nombre: "Docente",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    status: "active",
    created_at: "2026-08-08"
  },
  {
    id: "usr-4",
    name: "David Ramos",
    email: "david.ramos@alumno.tech",
    phone: "+1 (800) 123-0003",
    nivel: 2,
    rol_nombre: "Alumno",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    status: "active",
    created_at: "2026-08-12"
  },
  {
    id: "usr-5",
    name: "Andrea Morales",
    email: "andrea.morales@alumno.tech",
    phone: "+1 (800) 123-0004",
    nivel: 2,
    rol_nombre: "Alumno",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    status: "active",
    created_at: "2026-08-18"
  },
  {
    id: "usr-6",
    name: "Visitante Demo",
    email: "contacto@visitante.com",
    phone: "+1 (800) 123-0005",
    nivel: 1,
    rol_nombre: "Visitante",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    status: "active",
    created_at: "2026-08-25"
  }
];

function getUsers() {
  const stored = localStorage.getItem('academia_users');
  if (!stored) {
    localStorage.setItem('academia_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem('academia_users', JSON.stringify(users));
}
