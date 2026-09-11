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

-- ------------------------------------------------------------------------------
-- 6.1. TABLA: SOLICITUDES_CONTACTO (FORMULARIO PÚBLICO & LEADS DE COTIZACIÓN)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.solicitudes_contacto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    telefono TEXT,
    curso_interes TEXT,
    mensaje TEXT,
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6.2. TABLA: REGISTRO_RATE_LIMIT (AUDITORÍA & PROTECCIÓN ANTI-BOT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registro_rate_limit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_registro_rate_limit_ip_created 
ON public.registro_rate_limit (ip_address, created_at DESC);

-- ==============================================================================
-- 7. SEGURIDAD Y POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ==============================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registro_rate_limit ENABLE ROW LEVEL SECURITY;

-- 7.1. FUNCIONES DE SEGURIDAD (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE (
      id = auth.uid() 
      OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
    )
    AND nivel = 4
    AND activo = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_docente_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE (
      id = auth.uid() 
      OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
    )
    AND nivel IN (3, 4)
    AND activo = true
  );
$$;

-- 7.2. PROCEDIMIENTO RPC PARA INCREMENTO SEGURO DE VISTAS EN ARTÍCULOS
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.articulos
  SET vistas = vistas + 1
  WHERE id = article_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_article_views(UUID) TO anon, authenticated;

-- 7.3. TRIGGER: SINCRONIZACIÓN AUTOMÁTICA DE NUEVOS USUARIOS DESDE AUTH.USERS
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email, nivel, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'nivel')::integer, 1),
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET id = EXCLUDED.id,
      nombre = EXCLUDED.nombre;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
  END IF;
END $$;

-- 7.3.1. FUNCIONES RPC ADMINISTRATIVAS PARA SUPABASE AUTH
CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email TEXT,
  p_password TEXT,
  p_nombre TEXT,
  p_nivel INTEGER,
  p_telefono TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id UUID := gen_random_uuid();
  v_encrypted_pw TEXT;
  v_rol TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: Se requieren permisos de Administrador para registrar usuarios';
  END IF;

  IF length(p_password) < 6 THEN
    RAISE EXCEPTION 'La contraseña debe tener al menos 6 caracteres';
  END IF;

  v_rol := CASE p_nivel 
    WHEN 4 THEN 'Administrador'
    WHEN 3 THEN 'Docente'
    WHEN 2 THEN 'Alumno'
    ELSE 'Visitante'
  END;

  v_encrypted_pw := crypt(p_password, gen_salt('bf'));

  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    p_email,
    v_encrypted_pw,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nombre', p_nombre, 'full_name', p_nombre, 'nivel', p_nivel, 'rol_nombre', v_rol),
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  INSERT INTO public.usuarios (id, nombre, email, telefono, nivel, activo)
  VALUES (
    v_user_id,
    p_nombre,
    p_email,
    p_telefono,
    p_nivel,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    nombre = EXCLUDED.nombre,
    nivel = EXCLUDED.nivel,
    telefono = EXCLUDED.telefono;

  RETURN jsonb_build_object('id', v_user_id, 'email', p_email, 'success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_user(TEXT, TEXT, TEXT, INTEGER, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_reset_user_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acceso denegado: Se requieren permisos de Administrador para cambiar contraseñas';
  END IF;

  IF length(p_new_password) < 6 THEN
    RAISE EXCEPTION 'La contraseña debe tener al menos 6 caracteres';
  END IF;

  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_reset_user_password(UUID, TEXT) TO authenticated;

-- 7.4. POLÍTICAS USUARIOS (Protección contra fuga de datos y auto-escalada)
DROP POLICY IF EXISTS "Public Read Usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Public Write Usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Admin Write Usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios Read Policy" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios Insert Policy" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios Update Policy" ON public.usuarios;
DROP POLICY IF EXISTS "Usuarios Delete Policy" ON public.usuarios;

CREATE POLICY "Usuarios Read Policy" ON public.usuarios
  FOR SELECT
  USING (
    public.is_admin()
    OR (auth.uid() = id)
    OR (LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  );

CREATE POLICY "Usuarios Insert Policy" ON public.usuarios
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      (auth.uid() = id OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
      AND nivel = 1
    )
  );

CREATE POLICY "Usuarios Update Policy" ON public.usuarios
  FOR UPDATE
  USING (
    public.is_admin()
    OR (auth.uid() = id)
    OR (LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  )
  WITH CHECK (
    public.is_admin()
    OR (
      (auth.uid() = id OR LOWER(email) = LOWER(auth.jwt() ->> 'email'))
      AND nivel = (SELECT u.nivel FROM public.usuarios u WHERE u.id = usuarios.id)
    )
  );

CREATE POLICY "Usuarios Delete Policy" ON public.usuarios
  FOR DELETE
  USING (public.is_admin());

-- 7.5. POLÍTICAS CURSOS
DROP POLICY IF EXISTS "Public Read Cursos" ON public.cursos;
DROP POLICY IF EXISTS "Public Write Cursos" ON public.cursos;
DROP POLICY IF EXISTS "Admin Write Cursos" ON public.cursos;
DROP POLICY IF EXISTS "Cursos Read Policy" ON public.cursos;
DROP POLICY IF EXISTS "Cursos Admin Write Policy" ON public.cursos;

CREATE POLICY "Cursos Read Policy" ON public.cursos
  FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "Cursos Admin Write Policy" ON public.cursos
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7.6. POLÍTICAS COMBOS
DROP POLICY IF EXISTS "Public Read Combos" ON public.combos;
DROP POLICY IF EXISTS "Public Write Combos" ON public.combos;
DROP POLICY IF EXISTS "Admin Write Combos" ON public.combos;
DROP POLICY IF EXISTS "Combos Read Policy" ON public.combos;
DROP POLICY IF EXISTS "Combos Admin Write Policy" ON public.combos;

CREATE POLICY "Combos Read Policy" ON public.combos
  FOR SELECT
  USING (status = 'active' OR public.is_admin());

CREATE POLICY "Combos Admin Write Policy" ON public.combos
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7.7. POLÍTICAS PRODUCTOS
DROP POLICY IF EXISTS "Public Read Productos" ON public.productos;
DROP POLICY IF EXISTS "Public Write Productos" ON public.productos;
DROP POLICY IF EXISTS "Admin Write Productos" ON public.productos;
DROP POLICY IF EXISTS "Productos Read Policy" ON public.productos;
DROP POLICY IF EXISTS "Productos Admin Write Policy" ON public.productos;

CREATE POLICY "Productos Read Policy" ON public.productos
  FOR SELECT
  USING (true);

CREATE POLICY "Productos Admin Write Policy" ON public.productos
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7.8. POLÍTICAS ARTÍCULOS
DROP POLICY IF EXISTS "Public Read Articulos" ON public.articulos;
DROP POLICY IF EXISTS "Public Write Articulos" ON public.articulos;
DROP POLICY IF EXISTS "Admin Write Articulos" ON public.articulos;
DROP POLICY IF EXISTS "Articulos Read Policy" ON public.articulos;
DROP POLICY IF EXISTS "Articulos Write Policy" ON public.articulos;

CREATE POLICY "Articulos Read Policy" ON public.articulos
  FOR SELECT
  USING (status = 'published' OR public.is_docente_or_admin());

CREATE POLICY "Articulos Write Policy" ON public.articulos
  FOR ALL
  USING (public.is_docente_or_admin())
  WITH CHECK (public.is_docente_or_admin());

-- 7.9. POLÍTICAS SOLICITUDES_CONTACTO
-- Función de validación de Rate Limiting para solicitudes de contacto (60s por teléfono)
CREATE OR REPLACE FUNCTION public.can_insert_solicitud(p_telefono TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF p_telefono IS NULL OR trim(p_telefono) = '' THEN
    RETURN true;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.solicitudes_contacto
    WHERE telefono = trim(p_telefono)
      AND created_at > (now() - interval '60 seconds')
  ) THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

DROP POLICY IF EXISTS "Public Insert Solicitudes" ON public.solicitudes_contacto;
DROP POLICY IF EXISTS "Admin Read Solicitudes" ON public.solicitudes_contacto;
DROP POLICY IF EXISTS "Admin Update Solicitudes" ON public.solicitudes_contacto;
DROP POLICY IF EXISTS "Admin Delete Solicitudes" ON public.solicitudes_contacto;

CREATE POLICY "Public Insert Solicitudes" ON public.solicitudes_contacto
  FOR INSERT
  WITH CHECK (
    length(trim(nombre)) >= 2
    AND public.can_insert_solicitud(telefono)
  );

CREATE POLICY "Admin Read Solicitudes" ON public.solicitudes_contacto
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admin Update Solicitudes" ON public.solicitudes_contacto
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin Delete Solicitudes" ON public.solicitudes_contacto
  FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- 8. DATOS INICIALES (SEED DATA)
-- ==============================================================================

-- 8.1. Usuarios de los 4 niveles
INSERT INTO public.usuarios (id, nombre, email, nivel, rol_nombre, activo, avatar_url)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Admin Principal', 'admin@123academiatech.com', 4, 'Administrador', true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'),
    ('22222222-2222-2222-2222-222222222222', 'Prof. Carlos Mendoza', 'carlos.mendoza@123academiatech.com', 3, 'Docente', true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'),
    ('33333333-3333-3333-3333-333333333333', 'David Ramos', 'david.ramos@alumno.tech', 2, 'Alumno', true, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'),
    ('44444444-4444-4444-4444-444444444444', 'Visitante General', 'contacto@visitante.com', 1, 'Visitante', true, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80')
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
