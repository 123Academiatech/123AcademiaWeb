// Gestor de Artículos y Blog Técnico con Conexión a Supabase
// Tabla: public.articulos (id, titulo, slug, categoria, resumen, contenido, autor, imagen, vistas, status, created_at)

const DEFAULT_ARTICLES = [
  {
    id: "06f1c7e4-4e01-4131-89bd-a47ce2539da4",
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
    id: "82bf0e75-e357-43cb-b1d3-530499ac734c",
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
    id: "87c9fd54-9f20-4756-af70-82d02488ba16",
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

// Obtener artículos en vivo desde Supabase
async function fetchArticlesFromDB() {
  try {
    if (typeof SupabaseAPI !== 'undefined') {
      const data = await SupabaseAPI.query('articulos', '*', 'created_at.desc');
      if (data && Array.isArray(data) && data.length > 0) {
        const normalized = data.map(a => ({
          id: a.id,
          title: a.titulo,
          slug: a.slug,
          category: a.categoria,
          resumen: a.resumen,
          contenido: a.contenido,
          autor: a.autor,
          imagen: a.imagen || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          vistas: Number(a.vistas) || 0,
          status: a.status || 'published',
          created_at: a.created_at ? a.created_at.split('T')[0] : '2026-08-31'
        }));
        localStorage.setItem('academia_articles', JSON.stringify(normalized));
        return normalized;
      }
    }
  } catch (e) {
    console.warn('[ArticlesDB] Error al conectar con Supabase, usando caché local:', e);
  }
  return getCachedArticles();
}

function getCachedArticles() {
  const stored = localStorage.getItem('academia_articles');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_ARTICLES;
}

// Crear nuevo artículo en Supabase
async function createArticleInDB(articleData) {
  const slug = (articleData.title || '')
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const payload = {
    titulo: articleData.title,
    slug: slug || `articulo-${Date.now()}`,
    categoria: articleData.category || 'General',
    resumen: articleData.resumen,
    contenido: articleData.contenido || articleData.resumen,
    autor: articleData.autor || 'Equipo Docente 123AcademiaTech',
    imagen: articleData.imagen || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    vistas: 0,
    status: articleData.status || 'published'
  };

  const res = await SupabaseAPI.insert('articulos', payload);
  const created = (res && res[0]) ? res[0] : payload;

  const formatted = {
    id: created.id || `art-${Date.now()}`,
    title: created.titulo,
    slug: created.slug,
    category: created.categoria,
    resumen: created.resumen,
    contenido: created.contenido,
    autor: created.autor,
    imagen: created.imagen,
    vistas: created.vistas || 0,
    status: created.status || 'published',
    created_at: created.created_at ? created.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
  };

  const current = getCachedArticles();
  current.unshift(formatted);
  localStorage.setItem('academia_articles', JSON.stringify(current));
  return formatted;
}

// Actualizar artículo existente en Supabase
async function updateArticleInDB(id, articleData) {
  const slug = (articleData.title || '')
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const payload = {
    titulo: articleData.title,
    slug: slug,
    categoria: articleData.category,
    resumen: articleData.resumen,
    contenido: articleData.contenido,
    autor: articleData.autor,
    imagen: articleData.imagen,
    status: articleData.status
  };

  await SupabaseAPI.update('articulos', id, payload);

  const current = getCachedArticles();
  const updatedList = current.map(a => {
    if (a.id === id) {
      return {
        ...a,
        title: payload.titulo,
        slug: payload.slug,
        category: payload.categoria,
        resumen: payload.resumen,
        contenido: payload.contenido,
        autor: payload.autor,
        imagen: payload.imagen,
        status: payload.status
      };
    }
    return a;
  });
  localStorage.setItem('academia_articles', JSON.stringify(updatedList));
  return updatedList;
}

// Eliminar artículo en Supabase
async function deleteArticleInDB(id) {
  await SupabaseAPI.delete('articulos', id);
  const current = getCachedArticles().filter(a => a.id !== id);
  localStorage.setItem('academia_articles', JSON.stringify(current));
  return true;
}

// Alternar estado publicado / borrador en Supabase
async function toggleArticleStatusInDB(id, currentStatus) {
  const nextStatus = (currentStatus === 'published') ? 'draft' : 'published';
  await SupabaseAPI.update('articulos', id, { status: nextStatus });

  const current = getCachedArticles().map(a => {
    if (a.id === id) {
      a.status = nextStatus;
    }
    return a;
  });
  localStorage.setItem('academia_articles', JSON.stringify(current));
  return nextStatus;
}

// Incrementar contador de lecturas en Supabase
async function incrementArticleViewsInDB(id) {
  try {
    const current = getCachedArticles();
    const item = current.find(a => a.id === id);
    const newViews = (item ? (item.vistas || 0) : 0) + 1;
    await SupabaseAPI.update('articulos', id, { vistas: newViews });
    if (item) {
      item.vistas = newViews;
      localStorage.setItem('academia_articles', JSON.stringify(current));
    }
  } catch (e) {}
}

// Helpers para compatibilidad sincrónica
function getArticles() {
  return getCachedArticles();
}
function saveArticles(articles) {
  localStorage.setItem('academia_articles', JSON.stringify(articles));
}
