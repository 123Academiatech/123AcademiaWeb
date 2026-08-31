-- ==============================================================================
-- SCHEMA SUPABASE POSTGRESQL PARA 123ACADEMIATECH WEB
-- ==============================================================================
-- Tablas: usuarios, cursos, combos, productos, articulos
-- RLS: Habilitado con políticas de lectura pública y operaciones de gestión CRUD
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. TABLA: USUARIOS (4 NIVELES DE JERARQUÍA)
-- Nivel 1: Visitante | Nivel 2: Alumno | Nivel 3: Docente | Nivel 4: Administrador
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    telefono TEXT,
    nivel INTEGER NOT NULL DEFAULT 1 CHECK (nivel IN (1, 2, 3, 4)),
    rol_nombre TEXT,
    avatar_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. TABLA: CURSOS (CURSOS INDIVIDUALES PARA PÚBLICO GENERAL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cursos (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descripcion TEXT,
    duracion TEXT,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cupos TEXT DEFAULT 'Cupos Disponibles',
    imagen TEXT,
    badge TEXT DEFAULT 'Presencial',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    es_combo BOOLEAN NOT NULL DEFAULT false,
    temario JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. TABLA: COMBOS (PAQUETES EMPRESARIALES B2B & EMPRENDIMIENTOS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.combos (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descripcion TEXT,
    duracion TEXT,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    cupos TEXT DEFAULT 'Grupos de 3 a 5 personas',
    imagen TEXT,
    badge TEXT DEFAULT 'Plan Corporativo',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    temario JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. TABLA: PRODUCTOS (STOCK DE HERRAMIENTAS & INSTRUMENTAL TÉCNICO)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.productos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    marca TEXT DEFAULT 'Oficial',
    categoria TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock TEXT NOT NULL DEFAULT 'Disponible en Sede',
    badge TEXT DEFAULT 'Recomendado',
    imagen TEXT,
    specs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. TABLA: ARTICULOS (BLOG TÉCNICO & GUÍAS DE REPARACIÓN)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'General',
    resumen TEXT NOT NULL,
    contenido TEXT NOT NULL,
    autor TEXT NOT NULL DEFAULT 'Equipo Docente 123AcademiaTech',
    autor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    imagen TEXT,
    vistas INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. SEGURIDAD Y POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ==============================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articulos ENABLE ROW LEVEL SECURITY;

-- Políticas USUARIOS
DROP POLICY IF EXISTS "Public Read Usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Public Write Usuarios" ON public.usuarios;
CREATE POLICY "Public Read Usuarios" ON public.usuarios FOR SELECT USING (true);
CREATE POLICY "Public Write Usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

-- Políticas CURSOS
DROP POLICY IF EXISTS "Public Read Cursos" ON public.cursos;
DROP POLICY IF EXISTS "Public Write Cursos" ON public.cursos;
CREATE POLICY "Public Read Cursos" ON public.cursos FOR SELECT USING (true);
CREATE POLICY "Public Write Cursos" ON public.cursos FOR ALL USING (true) WITH CHECK (true);

-- Políticas COMBOS
DROP POLICY IF EXISTS "Public Read Combos" ON public.combos;
DROP POLICY IF EXISTS "Public Write Combos" ON public.combos;
CREATE POLICY "Public Read Combos" ON public.combos FOR SELECT USING (true);
CREATE POLICY "Public Write Combos" ON public.combos FOR ALL USING (true) WITH CHECK (true);

-- Políticas PRODUCTOS
DROP POLICY IF EXISTS "Public Read Productos" ON public.productos;
DROP POLICY IF EXISTS "Public Write Productos" ON public.productos;
CREATE POLICY "Public Read Productos" ON public.productos FOR SELECT USING (true);
CREATE POLICY "Public Write Productos" ON public.productos FOR ALL USING (true) WITH CHECK (true);

-- Políticas ARTÍCULOS
DROP POLICY IF EXISTS "Public Read Articulos" ON public.articulos;
DROP POLICY IF EXISTS "Public Write Articulos" ON public.articulos;
CREATE POLICY "Public Read Articulos" ON public.articulos FOR SELECT USING (true);
CREATE POLICY "Public Write Articulos" ON public.articulos FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. DATOS INICIALES (SEED DATA)
-- ==============================================================================

-- 8.1. Usuarios de los 4 niveles
INSERT INTO public.usuarios (id, nombre, email, password_hash, nivel, rol_nombre, activo, avatar_url)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Admin Principal', 'admin@123academiatech.com', 'admin123', 4, 'Administrador', true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
    ('22222222-2222-2222-2222-222222222222', 'Prof. Carlos Mendoza', 'carlos.mendoza@123academiatech.com', 'docente123', 3, 'Docente', true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
    ('33333333-3333-3333-3333-333333333333', 'David Ramos', 'david.ramos@alumno.tech', 'alumno123', 2, 'Alumno', true, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'),
    ('44444444-4444-4444-4444-444444444444', 'Visitante General', 'contacto@visitante.com', 'visitante123', 1, 'Visitante', true, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80')
ON CONFLICT (email) DO NOTHING;

-- 8.2. Cursos Individuales
INSERT INTO public.cursos (id, titulo, categoria, descripcion, duracion, precio, cupos, imagen, badge, status, es_combo, temario)
VALUES
    ('1', 'Ofimática Ejecutiva & Avanzada', 'ofimatica', 'Dominio integral de Excel Avanzado (Macros, Tablas Dinámicas, Dashboards), Word corporativo y herramientas digitales de productividad.', '40 Horas Presenciales', 120.00, '6 Cupos Disponibles', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80', 'Certificación Ejecutiva', 'active', false, '["Excel Avanzado", "Word Corporativo", "PowerPoint Ejecutivo", "Dashboards"]'::jsonb),
    ('2', 'Reparación & Mantenimiento de Computadoras y Laptops', 'computadoras', 'Diagnóstico a nivel de componentes, fuentes conmutadas, detección de cortos con osciloscopio, mantenimiento térmico y actualización de BIOS.', '60 Horas Presenciales', 180.00, '4 Cupos Disponibles', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', 'Banco de Trabajo Individual', 'active', false, '["Diagnóstico de Hardware", "Fuentes Conmutadas", "Reparación de Placas", "Repaste Térmico"]'::jsonb),
    ('3', 'Reparación Profesional de Celulares y Tablets', 'celulares', 'Cambio de módulos de pantalla, micro-soldadura SMD, reballing de circuitos integrados, puertos de carga y recuperación de software Android/iOS.', '50 Horas Presenciales', 195.00, '5 Cupos Disponibles', 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80', 'Microscopios y Estaciones', 'active', false, '["Módulos OLED/LCD", "Micro-soldadura SMD", "Reballing IC", "Software Android/iOS"]'::jsonb),
    ('4', 'Redes, Servidores y Cableado Estructurado', 'redes', 'Configuración práctica de routers y switches MikroTik/Cisco, segmentación de redes VLAN, montaje de racks y certificación de fibra óptica.', '45 Horas Presenciales', 160.00, '8 Cupos Disponibles', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80', 'Racks de Servidores Reales', 'active', false, '["MikroTik RouterOS", "Switches Cisco", "VLANs", "Cableado Cat6 y Fibra"]'::jsonb),
    ('5', 'Mantenimiento y Reparación de Impresoras', 'impresoras', 'Mantenimiento correctivo y preventivo de impresoras de tinta continua y láser. Desatascos mecánicos, limpieza de cabezales y sensores.', '35 Horas Presenciales', 130.00, '6 Cupos Disponibles', 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80', 'Laboratorio Mecánico', 'active', false, '["Sistemas de Tinta Continua", "Impresoras Láser", "Cabezales y Rodillos", "Placas Lógicas"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 8.3. Combos B2B y Emprendimientos
INSERT INTO public.combos (id, titulo, categoria, descripcion, duracion, precio, cupos, imagen, badge, status, temario)
VALUES
    ('combo-1', 'Combo Soporte Técnico & Redes Corporativas', 'empresarial', 'Capacitación integral para el departamento de TI de tu empresa. Abarca soporte de computadoras, ensamblaje, seguridad de redes y conectividad.', '80 Horas Prácticas', 390.00, 'Grupos de 3 a 5 personas', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 'Plan Corporativo TI', 'active', '["Reparación y Mantenimiento de Laptops & PC", "Redes, Servidores y Cableado Estructurado", "Seguridad de Redes con MikroTik"]'::jsonb),
    ('combo-2', 'Combo Taller Técnico Completo (Celulares + Laptops)', 'emprendedores', 'Diseñado para técnicos y emprendedores que desean abrir o potenciar su propio centro de servicio técnico multimarca.', '110 Horas Presenciales', 490.00, 'Cupo Limitado en Laboratorio', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', 'Máxima Salida Laboral', 'active', '["Reparación Profesional de Celulares & Tablets", "Micro-soldadura y Reballing SMD", "Reparación a nivel componentes de Laptops"]'::jsonb),
    ('combo-3', 'Combo Ofimática, Macros y Gestión Administrativa', 'oficinas', 'Optimización de procesos para equipos de administración, finanzas y operaciones. Domina hojas de cálculo avanzadas y automatización.', '50 Horas Presenciales', 280.00, 'Empresas & Negocios', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', 'Productividad Digital', 'active', '["Excel Avanzado y Tablas Dinámicas", "Automatización con Macros y VBA", "Diseño de Reportes y Dashboards Financieros"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 8.4. Productos e Instrumental
INSERT INTO public.productos (id, nombre, marca, categoria, descripcion, precio, stock, badge, imagen, specs)
VALUES
    ('prod-1', 'Kit de Destornilladores de Precisión Pro 128 en 1', 'TecnoPro Tools', 'herramientas', 'Juego completo con puntas de acero S2 magnéticas, extensión flexible y pinzas antiestáticas ESD para celulares, laptops y consolas.', 35.00, 'Disponible en Sede', 'Más Vendido', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', '["128 Puntas de precisión en acero S2 de alta dureza", "Puntas Torx, Pentalobe, Tri-wing", "Mango ergonómico de aleación de aluminio", "Magnetizador/Desmagnetizador integrado"]'::jsonb),
    ('prod-2', 'Estación de Calor y Cautín SMD 2 en 1 Pro 750W', 'QuickTech / Yihua', 'estaciones', 'Control digital de temperatura PID dual, pistola de aire caliente con apagado automático y cautín cerámico con punta anti-óxido.', 120.00, 'Últimas 4 unidades', 'Uso en Taller', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80', '["Potencia 750W con flujo de aire regulable", "Rango de temperatura: 100°C a 480°C con LED dual", "Sensor de reposo automático al colocar pistola", "Incluye 3 boquillas y soporte para cautín"]'::jsonb),
    ('prod-3', 'Microscopio Trinocular con Cámara HDMI 4K & Luz LED', 'OptiMicro Pro', 'instrumental', 'Zoom continuo de 7X a 45X, óptica acromática de alta resolución y soporte metálico reforzado para micro-soldadura electrónica.', 380.00, 'Bajo Pedido / Entrega 48h', 'Nivel Profesional', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', '["Cabezal trinocular inclinado 45° rotación 360°", "Cámara HDMI/USB de 48MP directa a monitor", "Lámpara anular LED regulable", "Distancia de trabajo 100mm ampliable"]'::jsonb),
    ('prod-4', 'Multímetro Digital Automático True RMS con Probador', 'ProVolt Master', 'instrumental', 'Medición precisa de voltaje DC/AC, resistencia, capacitancia, continuidad con buzzer rápido, prueba de diodos y detección NCV.', 55.00, 'Disponible en Sede', 'Imprescindible', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', '["Rango automático de 6000 cuentas True RMS", "Protección contra sobrecargas en todos los rangos", "Linterna integrada y LCD retroiluminada", "Puntas de silicona ultrafinas para micro-pistas"]'::jsonb),
    ('prod-5', 'Fuente de Poder Regulable DC 30V / 5A para Diagnóstico', 'PowerLab Digital', 'instrumental', 'Pantalla digital cuádruple (Voltaje, Amperaje, Potencia, Consumo mAh), protección contra cortocircuitos OCP con corte automático.', 95.00, 'Disponible en Sede', 'Laboratorio', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', '["Salida regulable de 0 a 30V y de 0 a 5A", "Función de alarma y corte por sobrecorriente OCP", "Puerto de carga rápida USB 5V/2A independiente", "Ventilador inteligente silencioso"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 8.5. Artículos del Blog
INSERT INTO public.articulos (id, titulo, slug, categoria, resumen, contenido, autor, imagen, vistas, status)
VALUES
    ('06f1c7e4-4e01-4131-89bd-a47ce2539da4', 'Guía Práctica: Cómo detectar un cortocircuito en placa madre con cámara térmica', 'detectar-cortocircuito-placa-madre', 'Reparación & Diagnóstico', 'Aprende los métodos profesionales de inyección de voltaje y termografía para ubicar capacitores y MOSFETs en corto.', 'En este artículo revisamos el protocolo paso a paso utilizado en los talleres de 123AcademiaTech para aislar líneas de alimentación principales (VTT, 3.3V ALWAYS, 5V ALWAYS y VCORE). Aprenderás a utilizar fuentes reguladas con límite de corriente y cómo interpretar los puntos calientes en cámaras térmicas.', 'Prof. Carlos Mendoza', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', 485, 'published'),
    ('82bf0e75-e357-43cb-b1d3-530499ac734c', 'Top 5 Fórmulas y Macros que todo Analista de Datos debe dominar en Excel 2026', 'formulas-macros-excel-2026', 'Ofimática & Productividad', 'Descubre cómo automatizar reportes financieros y dashboards dinámicos reduciendo horas de trabajo manual.', 'El dominio de funciones avanzadas como BUSCARX, FILTRAR, LET, LAMBDA y la creación de macros en VBA marca la diferencia en el mercado corporativo actual. Te mostramos cómo estructurar tablas relacionales y crear botones interactivos con un solo clic.', 'Ing. Sofía Valenzuela', 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80', 620, 'published'),
    ('87c9fd54-9f20-4756-af70-82d02488ba16', 'Configuración de VLANs y Segmentación de Redes con MikroTik RouterOS v7', 'configuracion-vlans-mikrotik-routeros-v7', 'Redes & Telecomunicaciones', 'Estrategias de aislamiento de tráfico para empresas, configurando switches administrables y cortafuegos perimetrales.', 'Segmentar la red de una empresa no solo optimiza el ancho de banda y la estabilidad del tráfico local, sino que previene intrusiones no deseadas. En esta guía configuramos bridge VLAN filtering en RouterOS v7 con trunking hacia switches Cisco.', 'Equipo Docente Redes', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80', 390, 'published')
ON CONFLICT (slug) DO NOTHING;
