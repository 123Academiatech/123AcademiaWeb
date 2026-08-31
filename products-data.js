// Catálogo de Productos y Herramientas Técnicas para 123AcademiaTech
const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "Kit de Destornilladores de Precisión Pro 128 en 1",
    category: "herramientas",
    description: "Puntas de acero S2 templado magnético para reparación de smartphones, laptops, consolas y placas electrónicas. Incluye magnetizador y pinzas antiestáticas ESD.",
    price: "$35 USD",
    stock: "Disponible en Sede",
    brand: "TecnoPro Tools",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    badge: "Más Vendido",
    specs: ["128 Puntas de acero S2", "Eje flexible para esquinas", "Estuche magnético compacto", "Garantía de 6 meses"]
  },
  {
    id: "prod-2",
    name: "Estación de Calor y Cautín SMD 2 en 1 Pro 750W",
    category: "estaciones",
    description: "Estación dual digital de temperatura regulable (100°C - 480°C) para micro-soldadura SMD, desoldado de chips, reballing y reparación de circuitos integrados.",
    price: "$120 USD",
    stock: "Últimas 4 unidades",
    brand: "QuickTech / Yihua",
    image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80",
    badge: "Uso Profesional",
    specs: ["Potencia 750W", "Flujo de aire regulable hasta 120L/min", "Display LED dual", "Auto-enfriamiento inteligente"]
  },
  {
    id: "prod-3",
    name: "Microscopio Trinocular con Cámara HDMI 4K & Luz LED",
    category: "instrumental",
    description: "Microscopio estereoscópico para taller de microelectrónica. Zoom continuo 7X a 45X con lente Barlow 0.5X y salida de video simultánea para monitor externo.",
    price: "$380 USD",
    stock: "Bajo Pedido / Entrega 48h",
    brand: "OptiMicro Pro",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    badge: "Laboratorio Pro",
    specs: ["Zoom óptico 7X-45X", "Cámara 4K Ultra HD", "Brazo articulado de 360°", "Anillo de 56 LEDs regulables"]
  },
  {
    id: "prod-4",
    name: "Multímetro Digital Automático True RMS con Probador",
    category: "instrumental",
    description: "Medición precisa de voltaje DC/AC, corriente, resistencia, capacitancia, continuidad con zumbador y detector de voltaje sin contacto (NCV).",
    price: "$55 USD",
    stock: "Disponible en Sede",
    brand: "ProVolt Master",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    badge: "Recomendado",
    specs: ["True RMS 6000 cuentas", "Protección contra sobrecargas", "Luz de fondo y linterna LED", "Puntas de prueba pro"]
  },
  {
    id: "prod-5",
    name: "Fuente de Poder Regulable DC 30V / 5A para Diagnóstico",
    category: "instrumental",
    description: "Fuente con display digital de 4 dígitos para inyección de voltaje y detección rápida de componentes en cortocircuito en placas madre y smartphones.",
    price: "$95 USD",
    stock: "Disponible en Sede",
    brand: "PowerLab Digital",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    badge: "Detección de Cortos",
    specs: ["Salida 0-30V y 0-5A", "Protección contra cortocircuitos OCP", "Cables con conectores cocodrilo", "Bajo nivel de ruido"]
  },
  {
    id: "prod-6",
    name: "Tester de Redes RJ45 / RJ11 con Generador de Tonos",
    category: "redes",
    description: "Verificador de continuidad, mapeo de pares trenzados y rastreador acústico de cables en racks, paneles de parcheo y ductos.",
    price: "$40 USD",
    stock: "Disponible en Sede",
    brand: "NetCheck Pro",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    badge: "Redes & Cableado",
    specs: ["Rastreo por tono audible", "Prueba de continuidad y polaridad", "Conectores RJ45, RJ11 y caimán", "Incluye auriculares"]
  },
  {
    id: "prod-7",
    name: "Tina de Limpieza Ultrasónica Digital 0.8L de Acero",
    category: "insumos",
    description: "Limpieza profunda por cavitación de placas sulfatadas, inyectores de tinta de impresoras y componentes mecánicos de precisión.",
    price: "$65 USD",
    stock: "Disponible en Sede",
    brand: "UltraSonic Tech",
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80",
    badge: "Impresoras & Placas",
    specs: ["Capacidad 800 ml", "Frecuencia ultrasónica 40kHz", "Temporizador digital", "Cesta de acero inoxidable"]
  },
  {
    id: "prod-8",
    name: "Kit de Insumos: Pasta Térmica Plata + Flux UV + Estaño",
    category: "insumos",
    description: "Paquete completo de consumibles para mantenimiento térmico de laptops y soldadura SMD: Pasta térmica de plata (30g), Flux en jeringa, Malla de cobre y Carrete de Estaño 0.5mm.",
    price: "$28 USD",
    stock: "Alta Disponibilidad",
    brand: "ProGrade Insumos",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    badge: "Combo Taller",
    specs: ["Pasta térmica >4.5 W/m-k", "Flux no-clean libre de halógenos", "Malla desoldante de cobre", "Estaño con resina"]
  }
];

function getProducts() {
  const stored = localStorage.getItem('academia_products');
  if (!stored) {
    localStorage.setItem('academia_products', JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
}

function saveProducts(products) {
  localStorage.setItem('academia_products', JSON.stringify(products));
}
