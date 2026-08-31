// Gestor de Datos de Productos e Instrumental con Conexión a Supabase
// Tabla: public.productos (id, nombre, categoria, descripcion, precio, stock, marca, imagen, badge, specs, status)

const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "Kit de Destornilladores de Precisión Pro 128 en 1",
    category: "herramientas",
    description: "Juego completo con puntas de acero S2 magnéticas, extensión flexible y pinzas antiestáticas ESD para celulares, laptops y consolas.",
    price: "$35 USD",
    stock: "Disponible en Sede",
    marca: "TecnoPro Tools",
    badge: "Más Vendido",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    specs: [
      "128 Puntas de precisión en acero S2 de alta dureza (60 HRC)",
      "Puntas Torx de seguridad, Pentalobe para iPhone/MacBook, Tri-wing",
      "Mango ergonómico de aleación de aluminio con rodamiento giratorio",
      "Magnetizador/Desmagnetizador integrado y estuche compacto"
    ]
  },
  {
    id: "prod-2",
    name: "Estación de Calor y Cautín SMD 2 en 1 Pro 750W",
    category: "estaciones",
    description: "Control digital de temperatura PID dual, pistola de aire caliente con apagado automático y cautín cerámico con punta anti-óxido.",
    price: "$120 USD",
    stock: "Últimas 4 unidades",
    marca: "QuickTech / Yihua",
    badge: "Uso en Taller",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    specs: [
      "Potencia 750W con flujo de aire regulable hasta 120 L/min",
      "Rango de temperatura: 100°C a 480°C con display LED independiente",
      "Sensor de reposo automático al colocar la pistola en el soporte",
      "Incluye 3 boquillas intercambiables y soporte para cautín"
    ]
  },
  {
    id: "prod-3",
    name: "Microscopio Trinocular con Cámara HDMI 4K & Luz LED",
    category: "instrumental",
    description: "Zoom continuo de 7X a 45X, óptica acromática de alta resolución y soporte metálico reforzado para micro-soldadura electrónica.",
    price: "$380 USD",
    stock: "Bajo Pedido / Entrega 48h",
    marca: "OptiMicro Pro",
    badge: "Nivel Profesional",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    specs: [
      "Cabezal trinocular inclinado a 45° con rotación de 360°",
      "Cámara HDMI/USB de 48MP con salida directa a monitor",
      "Lámpara anular LED con regulador de intensidad",
      "Distancia de trabajo de 100mm ampliable con lentes auxiliares"
    ]
  },
  {
    id: "prod-4",
    name: "Multímetro Digital Automático True RMS con Probador",
    category: "instrumental",
    description: "Medición precisa de voltaje DC/AC, resistencia, capacitancia, continuidad con buzzer rápido, prueba de diodos y detección NCV.",
    price: "$55 USD",
    stock: "Disponible en Sede",
    marca: "ProVolt Master",
    badge: "Imprescindible",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    specs: [
      "Rango automático de 6000 cuentas True RMS",
      "Protección contra sobrecargas en todos los rangos",
      "Linterna integrada y pantalla LCD retroiluminada de gran tamaño",
      "Incluye puntas de prueba de silicona de aguja fina para micro-pistas"
    ]
  },
  {
    id: "prod-5",
    name: "Fuente de Poder Regulable DC 30V / 5A para Diagnóstico",
    category: "instrumental",
    description: "Pantalla digital cuádruple (Voltaje, Amperaje, Potencia, Consumo mAh), protección contra cortocircuitos OCP con corte automático.",
    price: "$95 USD",
    stock: "Disponible en Sede",
    marca: "PowerLab Digital",
    badge: "Laboratorio",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    specs: [
      "Salida regulable de 0 a 30V y de 0 a 5A con perillas de ajuste fino",
      "Función de alarma sonora y corte por sobrecorriente (OCP)",
      "Puerto de carga rápida USB 5V/2A independiente",
      "Ventilador inteligente con control de temperatura silencioso"
    ]
  }
];

// Cargar productos desde Supabase
async function fetchProductsFromDB() {
  try {
    if (typeof SupabaseAPI !== 'undefined') {
      const data = await SupabaseAPI.query('productos', '*', 'created_at.asc');
      if (data && Array.isArray(data) && data.length > 0) {
        const normalized = data.map(p => ({
          id: String(p.id),
          name: p.nombre,
          brand: p.marca || 'Oficial',
          category: p.categoria,
          price: String(p.precio).includes('$') ? p.precio : `$${p.precio} USD`,
          stock: p.stock || 'Disponible en Sede',
          badge: p.badge || 'Stock',
          image: p.imagen,
          description: p.descripcion,
          specs: (p.specs && Array.isArray(p.specs)) ? p.specs : ['Garantía oficial', 'Uso en taller']
        }));
        localStorage.setItem('academia_products', JSON.stringify(normalized));
        return normalized;
      }
    }
  } catch (e) {
    console.warn('[ProductsDB] Error al conectar con Supabase:', e);
  }
  return getCachedProducts();
}

function getCachedProducts() {
  const stored = localStorage.getItem('academia_products');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_PRODUCTS;
}

function getProducts() {
  return getCachedProducts();
}

function saveProducts(products) {
  localStorage.setItem('academia_products', JSON.stringify(products));
}

async function createProductInDB(productData) {
  const priceClean = Number(String(productData.price).replace(/[^0-9.]/g, '')) || 0;
  const payload = {
    id: productData.id || `prod-${Date.now()}`,
    nombre: productData.name,
    marca: productData.brand || 'Oficial',
    categoria: productData.category,
    precio: priceClean,
    stock: productData.stock || 'Disponible en Sede',
    badge: productData.badge || 'Recomendado',
    imagen: productData.image,
    descripcion: productData.description,
    specs: productData.specs || []
  };

  await SupabaseAPI.insert('productos', payload);
  await fetchProductsFromDB();
}

async function updateProductInDB(id, productData) {
  const priceClean = Number(String(productData.price).replace(/[^0-9.]/g, '')) || 0;
  const payload = {
    nombre: productData.name,
    marca: productData.brand,
    categoria: productData.category,
    precio: priceClean,
    stock: productData.stock,
    badge: productData.badge,
    imagen: productData.image,
    descripcion: productData.description,
    specs: productData.specs || []
  };

  await SupabaseAPI.update('productos', id, payload);
  await fetchProductsFromDB();
}

async function deleteProductInDB(id) {
  await SupabaseAPI.delete('productos', id);
  await fetchProductsFromDB();
}
