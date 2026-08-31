// Gestor de Datos de Cursos y Combos para 123AcademiaTech
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
    badge: "Prácticas con Equipos Reales"
  }
];

// Combos y Paquetes de Capacitación para Emprendimientos y Negocios (B2B)
const DEFAULT_BUSINESS_COMBOS = [
  {
    id: "combo-1",
    title: "Combo Soporte IT & Reparación de Equipos",
    category: "hardware-it",
    description: "Capacitación integral para el personal de soporte interno de tu empresa. Aprenderán a diagnosticar y reparar laptops, PCs de escritorio e impresoras de oficina sin depender de servicios técnicos externos.",
    duration: "50 Horas de Taller Práctico",
    price: "$450 USD",
    groupSize: "Grupo de 3 a 5 Colaboradores",
    unitPriceDetail: "Aprox. $90 - $150 USD por colaborador",
    status: "active",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    badge: "Combo Grupal 3 a 5 Personas",
    includes: ["Reparación de Computadoras & Laptops", "Mantenimiento Preventivo de Impresoras", "Diagnóstico Electrónico de Fuentes y Cortos"]
  },
  {
    id: "combo-2",
    title: "Combo Ofimática Ejecutiva & Automatización",
    category: "ofimatica-b2b",
    description: "Multiplica la velocidad y precisión del área administrativa de tu negocio. Creación de reportes automáticos en Excel con Dashboards, macros, tablas dinámicas y formatos corporativos de alto impacto.",
    duration: "40 Horas Presenciales",
    price: "$520 USD",
    groupSize: "Grupo de 5 a 10 Colaboradores",
    unitPriceDetail: "Aprox. $52 - $104 USD por colaborador",
    status: "active",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    badge: "Combo Grupal 5 a 10 Personas",
    includes: ["Excel Corporativo (Macros & Dashboards)", "Automatización de Reportes e Inventarios", "Word Ejecutivo y Seguridad de Documentos"]
  },
  {
    id: "combo-3",
    title: "Combo Infraestructura de Redes & Seguridad B2B",
    category: "redes-b2b",
    description: "Garantiza la continuidad operativa y ciberseguridad de tu red empresarial. Tu equipo aprenderá a diseñar, cablear y administrar switches, routers MikroTik/Cisco y servidores sin caídas de conexión.",
    duration: "45 Horas Presenciales",
    price: "$640 USD",
    groupSize: "Grupo de 3 a 6 Colaboradores",
    unitPriceDetail: "Aprox. $106 - $213 USD por colaborador",
    status: "active",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    badge: "Combo Grupal 3 a 6 Personas",
    includes: ["Configuración MikroTik / Cisco & VLANs", "Cableado Estructurado y Certificación", "Respaldos y Seguridad de Servidores"]
  },
  {
    id: "combo-4",
    title: "Combo Emprendedor: Montaje de Taller Técnico",
    category: "emprendimiento-taller",
    description: "Paquete todo-en-uno para socios y emprendedores que desean abrir o expandir un taller de servicio técnico profesional con alta rentabilidad desde el primer mes.",
    duration: "70 Horas Intensivas",
    price: "$580 USD",
    groupSize: "Combo Socios (2 a 4 Personas)",
    unitPriceDetail: "Aprox. $145 - $290 USD por persona",
    status: "active",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80",
    badge: "Combo Socios 2 a 4 Personas",
    includes: ["Reparación de Celulares y Micro-soldadura SMD", "Reparación de Laptops a Nivel Componente", "Asesoría en Compra de Herramientas y Presupuestos"]
  },
  {
    id: "combo-5",
    title: "Plan Corporativo In-Company Full Pass",
    category: "corporativo-custom",
    description: "Diseñado para empresas medianas y grandes con requerimientos específicos. Capacitación cerrada en las instalaciones de su empresa o en nuestros laboratorios privados con reportes de rendimiento.",
    duration: "Horarios e Intensidad a Medida",
    price: "A Cotizar",
    groupSize: "Equipos Grandes (+10 Colaboradores)",
    unitPriceDetail: "Descuento por volumen y deducción fiscal",
    status: "active",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    badge: "Plan Corporativo +10 Personas",
    includes: ["Auditoría previa y temario personalizado", "Clases in-company o en laboratorios VIP", "Informes de desempeño para Recursos Humanos"]
  }
];

function getCourses() {
  const stored = localStorage.getItem('academia_courses');
  if (!stored) {
    localStorage.setItem('academia_courses', JSON.stringify(DEFAULT_COURSES));
    return DEFAULT_COURSES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_COURSES;
  }
}

function saveCourses(courses) {
  localStorage.setItem('academia_courses', JSON.stringify(courses));
}

function getBusinessCombos() {
  const stored = localStorage.getItem('academia_business_combos');
  if (!stored) {
    localStorage.setItem('academia_business_combos', JSON.stringify(DEFAULT_BUSINESS_COMBOS));
    return DEFAULT_BUSINESS_COMBOS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_BUSINESS_COMBOS;
  }
}

function saveBusinessCombos(combos) {
  localStorage.setItem('academia_business_combos', JSON.stringify(combos));
}

