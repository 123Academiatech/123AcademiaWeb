// Gestor de Artículos y Publicaciones Técnicas para 123AcademiaTech
const DEFAULT_ARTICLES = [
  {
    id: "art-1",
    title: "Guía Práctica: Cómo detectar un cortocircuito en placa madre con cámara térmica",
    slug: "detectar-cortocircuito-placa-madre",
    category: "Reparación & Diagnóstico",
    resumen: "Aprende los métodos profesionales de inyección de voltaje y termografía para ubicar capacitores y MOSFETs en corto.",
    contenido: "En este artículo revisamos el protocolo paso a paso utilizado en los talleres de 123AcademiaTech para aislar líneas de alimentación principales (VTT, 3.3V ALWAYS, 5V ALWAYS y VCORE). Aprenderás a utilizar fuentes reguladas con límite de corriente y cómo interpretar los puntos calientes en cámaras térmicas.",
    autor: "Prof. Carlos Mendoza",
    imagen: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    vistas: 485,
    status: "published",
    created_at: "2026-08-15"
  },
  {
    id: "art-2",
    title: "Top 5 Fórmulas y Macros que todo Analista de Datos debe dominar en Excel 2026",
    slug: "formulas-macros-excel-2026",
    category: "Ofimática & Productividad",
    resumen: "Descubre cómo automatizar reportes financieros y dashboards dinámicos reduciendo horas de trabajo manual.",
    contenido: "El dominio de funciones avanzadas como BUSCARX, FILTRAR, LET, LAMBDA y la creación de macros en VBA marca la diferencia en el mercado corporativo actual. Te mostramos cómo estructurar tablas relacionales y crear botones interactivos con un solo clic.",
    autor: "Ing. Sofía Valenzuela",
    imagen: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    vistas: 620,
    status: "published",
    created_at: "2026-08-20"
  },
  {
    id: "art-3",
    title: "Configuración de VLANs y Segmentación de Redes con MikroTik RouterOS v7",
    slug: "configuracion-vlans-mikrotik-routeros-v7",
    category: "Redes & Telecomunicaciones",
    resumen: "Estrategias de aislamiento de tráfico para empresas, configurando switches administrables y cortafuegos perimetrales.",
    contenido: "Segmentar la red de una empresa no solo optimiza el ancho de banda y la estabilidad del tráfico local, sino que previene intrusiones no deseadas. En esta guía configuramos bridge VLAN filtering en RouterOS v7 con trunking hacia switches Cisco.",
    autor: "Equipo Docente Redes",
    imagen: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    vistas: 390,
    status: "published",
    created_at: "2026-08-28"
  }
];

function getArticles() {
  const stored = localStorage.getItem('academia_articles');
  if (!stored) {
    localStorage.setItem('academia_articles', JSON.stringify(DEFAULT_ARTICLES));
    return DEFAULT_ARTICLES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_ARTICLES;
  }
}

function saveArticles(articles) {
  localStorage.setItem('academia_articles', JSON.stringify(articles));
}
