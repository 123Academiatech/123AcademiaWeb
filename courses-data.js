// Gestor de Datos de Cursos y Combos con Conexión a Supabase
// Tabla: public.cursos (id, titulo, categoria, descripcion, duracion, precio, cupos, imagen, badge, status, es_combo, temario)

const DEFAULT_COURSES = [
  {
    id: "1",
    title: "Ofimática Ejecutiva & Avanzada",
    category: "ofimatica",
    description: "Dominio integral de Excel Avanzado (Macros, Tablas Dinámicas, Dashboards), Word corporativo y herramientas digitales de productividad.",
    duration: "40 Horas Presenciales",
    price: "$120 USD",
    spots: "6 Cupos Disponibles",
    status: "active",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    badge: "Certificación Ejecutiva"
  },
  {
    id: "2",
    title: "Reparación & Mantenimiento de Computadoras y Laptops",
    category: "computadoras",
    description: "Diagnóstico a nivel de componentes, fuentes conmutadas, detección de cortos con osciloscopio, mantenimiento térmico y actualización de BIOS.",
    duration: "60 Horas Presenciales",
    price: "$180 USD",
    spots: "4 Cupos Disponibles",
    status: "active",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    badge: "Banco de Trabajo Individual"
  },
  {
    id: "3",
    title: "Reparación Profesional de Celulares y Tablets",
    category: "celulares",
    description: "Cambio de módulos de pantalla, micro-soldadura SMD, reballing de circuitos integrados, puertos de carga y recuperación de software Android/iOS.",
    duration: "50 Horas Presenciales",
    price: "$195 USD",
    spots: "5 Cupos Disponibles",
    status: "active",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80",
    badge: "Microscopios y Estaciones"
  },
  {
    id: "4",
    title: "Redes, Servidores y Cableado Estructurado",
    category: "redes",
    description: "Configuración práctica de routers y switches MikroTik/Cisco, segmentación de redes VLAN, montaje de racks y certificación de fibra óptica.",
    duration: "45 Horas Presenciales",
    price: "$160 USD",
    spots: "8 Cupos Disponibles",
    status: "active",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    badge: "Racks de Servidores Reales"
  },
  {
    id: "5",
    title: "Mantenimiento y Reparación de Impresoras",
    category: "impresoras",
    description: "Mantenimiento correctivo y preventivo de impresoras de tinta continua y láser. Desatascos mecánicos, limpieza de cabezales y sensores.",
    duration: "35 Horas Presenciales",
    price: "$130 USD",
    spots: "6 Cupos Disponibles",
    status: "active",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80",
    badge: "Laboratorio Mecánico"
  }
];

const DEFAULT_BUSINESS_COMBOS = [
  {
    id: "combo-1",
    title: "Combo Soporte Técnico & Redes Corporativas",
    category: "empresarial",
    description: "Capacitación integral para el departamento de TI de tu empresa. Abarca soporte de computadoras, ensamblaje, seguridad de redes y conectividad.",
    duration: "80 Horas Prácticas",
    price: "$390 USD",
    groupSize: "Grupos de 3 a 5 personas",
    status: "active",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    badge: "Plan Corporativo TI",
    includes: [
      "Reparación y Mantenimiento de Laptops & PC",
      "Redes, Servidores y Cableado Estructurado",
      "Seguridad de Redes con MikroTik"
    ],
    unitPriceDetail: "Ahorro del 25% frente a matrícula individual"
  },
  {
    id: "combo-2",
    title: "Combo Taller Técnico Completo (Celulares + Laptops)",
    category: "emprendedores",
    description: "Diseñado para técnicos y emprendedores que desean abrir o potenciar su propio centro de servicio técnico multimarca.",
    duration: "110 Horas Presenciales",
    price: "$490 USD",
    groupSize: "Cupo Limitado en Laboratorio",
    status: "active",
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    badge: "Máxima Salida Laboral",
    includes: [
      "Reparación Profesional de Celulares & Tablets",
      "Micro-soldadura y Reballing SMD",
      "Reparación a nivel componentes de Laptops"
    ],
    unitPriceDetail: "Incluye kit de inicio e instrumental para prácticas"
  },
  {
    id: "combo-3",
    title: "Combo Ofimática, Macros y Gestión Administrativa",
    category: "oficinas",
    description: "Optimización de procesos para equipos de administración, finanzas y operaciones. Domina hojas de cálculo avanzadas y automatización.",
    duration: "50 Horas Presenciales",
    price: "$280 USD",
    groupSize: "Empresas & Negocios",
    status: "active",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80",
    badge: "Productividad Digital",
    includes: [
      "Excel Avanzado y Tablas Dinámicas",
      "Automatización con Macros y VBA",
      "Diseño de Reportes y Dashboards Financieros"
    ],
    unitPriceDetail: "Evaluación de competencias y certificación curricular"
  }
];

// Cargar cursos desde Supabase
async function fetchCoursesFromDB() {
  try {
    if (typeof SupabaseAPI !== 'undefined') {
      const data = await SupabaseAPI.query('cursos', '*', 'created_at.asc');
      if (data && Array.isArray(data) && data.length > 0) {
        const courses = [];
        const combos = [];

        data.forEach(c => {
          const item = {
            id: String(c.id),
            title: c.titulo,
            category: c.categoria,
            description: c.descripcion,
            duration: c.duracion,
            price: String(c.precio).includes('$') ? c.precio : `$${c.precio} USD`,
            spots: c.cupos || 'Cupos Disponibles',
            groupSize: c.cupos || 'Grupal',
            status: c.status || 'active',
            image: c.imagen,
            badge: c.badge || 'Presencial',
            includes: (c.temario && Array.isArray(c.temario)) ? c.temario : (c.es_combo ? ['Capacitación Práctica', 'Asesoría'] : []),
            unitPriceDetail: c.es_combo ? 'Tarifa corporativa' : 'Tarifa individual'
          };

          if (c.es_combo) combos.push(item);
          else courses.push(item);
        });

        if (courses.length > 0) localStorage.setItem('academia_courses', JSON.stringify(courses));
        if (combos.length > 0) localStorage.setItem('academia_business_combos', JSON.stringify(combos));
        return { courses, combos };
      }
    }
  } catch (e) {
    console.warn('[CoursesDB] Error al conectar con Supabase:', e);
  }
  return { courses: getCachedCourses(), combos: getCachedBusinessCombos() };
}

function getCachedCourses() {
  const stored = localStorage.getItem('academia_courses');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_COURSES;
}

function getCachedBusinessCombos() {
  const stored = localStorage.getItem('academia_business_combos');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_BUSINESS_COMBOS;
}

function getCourses() {
  return getCachedCourses();
}

function saveCourses(courses) {
  localStorage.setItem('academia_courses', JSON.stringify(courses));
}

function getBusinessCombos() {
  return getCachedBusinessCombos();
}

function saveBusinessCombos(combos) {
  localStorage.setItem('academia_business_combos', JSON.stringify(combos));
}

async function createCourseInDB(courseData, isCombo = false) {
  const priceClean = Number(String(courseData.price).replace(/[^0-9.]/g, '')) || 0;
  const payload = {
    id: courseData.id || `${isCombo ? 'combo' : 'c'}-${Date.now()}`,
    titulo: courseData.title,
    categoria: courseData.category,
    descripcion: courseData.description,
    duracion: courseData.duration,
    precio: priceClean,
    cupos: isCombo ? (courseData.groupSize || 'Grupal') : (courseData.spots || 'Cupos Disponibles'),
    imagen: courseData.image,
    badge: courseData.badge,
    status: courseData.status || 'active',
    es_combo: isCombo,
    temario: courseData.includes || []
  };

  await SupabaseAPI.insert('cursos', payload);
  await fetchCoursesFromDB();
}

async function updateCourseInDB(id, courseData, isCombo = false) {
  const priceClean = Number(String(courseData.price).replace(/[^0-9.]/g, '')) || 0;
  const payload = {
    titulo: courseData.title,
    categoria: courseData.category,
    descripcion: courseData.description,
    duracion: courseData.duration,
    precio: priceClean,
    cupos: isCombo ? (courseData.groupSize || 'Grupal') : (courseData.spots || 'Cupos Disponibles'),
    imagen: courseData.image,
    badge: courseData.badge,
    status: courseData.status || 'active',
    temario: courseData.includes || []
  };

  await SupabaseAPI.update('cursos', id, payload);
  await fetchCoursesFromDB();
}

async function deleteCourseInDB(id) {
  await SupabaseAPI.delete('cursos', id);
  await fetchCoursesFromDB();
}
