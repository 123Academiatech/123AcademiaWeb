// Configuración del Cliente Supabase para 123AcademiaTech
var SUPABASE_URL = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : 'https://pbswarzkotjznmasniax.supabase.co';
var SUPABASE_ANON_KEY = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic3dhcnprb3Rqem5tYXNuaWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODUyMzcsImV4cCI6MjEwMzc2MTIzN30.6IWirJzDAU5wAQHyyZgyI9JpG2PhaQXfvtC806uVKN0';

// Instancia Supabase si el CDN está cargado en el navegador
var db = typeof db !== 'undefined' ? db : null;
if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Helper REST y Supabase Auth
var SupabaseAPI = (typeof SupabaseAPI !== 'undefined') ? SupabaseAPI : {
  getAuthToken() {
    const sessionObj = this.getValidSessionToken();
    if (sessionObj && sessionObj.token) {
      return sessionObj.token;
    }
    return SUPABASE_ANON_KEY;
  },

  async login(email, password) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error_description || errData.msg || 'Credenciales inválidas');
      }
      const data = await res.json();
      localStorage.setItem('sb-pbswarzkotjznmasniax-auth-token', JSON.stringify(data));
      
      const user = data.user || {};
      const userMeta = user.user_metadata || {};
      const userEmail = user.email || email;
      let userName = userMeta.full_name || userMeta.nombre || userMeta.name || '';
      let nivel = Number(userMeta.nivel) || (email === 'admin@123academiatech.com' ? 4 : 1);
      let rolName = userMeta.rol_nombre || (nivel === 4 ? 'Administrador' : (nivel === 3 ? 'Docente' : (nivel === 2 ? 'Alumno' : 'Visitante')));

      // Si falta el nombre completo, consultar la tabla 'usuarios' de Supabase
      if (!userName) {
        try {
          const userRecords = await this.query('usuarios', 'nombre,nivel,rol_nombre', '', `email=eq.${encodeURIComponent(userEmail)}`);
          if (userRecords && userRecords.length > 0) {
            userName = userRecords[0].nombre;
            if (userRecords[0].nivel) nivel = Number(userRecords[0].nivel);
            if (userRecords[0].rol_nombre) rolName = userRecords[0].rol_nombre;
          }
        } catch (dbErr) {
          console.warn('[SupabaseAPI] No se pudo obtener el perfil de usuarios:', dbErr);
        }
      }

      if (!userName) {
        userName = email.split('@')[0];
      }

      const isAdvAdmin = (nivel === 4 || email === 'admin@123academiatech.com');

      localStorage.setItem('123_is_admin', isAdvAdmin ? 'true' : 'false');
      localStorage.setItem('123_user_nivel', String(nivel));
      localStorage.setItem('123_user_email', userEmail);
      localStorage.setItem('123_user_name', userName);
      localStorage.setItem('123_user_rol', rolName);
      localStorage.removeItem('123_user_avatar');

      // Programar silent refresh tras login exitoso
      this.scheduleTokenRefresh(data);

      return data;
    } catch (e) {
      console.error('[SupabaseAPI] Error en login:', e);
      throw e;
    }
  },

  _refreshTimer: null,
  _isRefreshing: false,
  _refreshPromise: null,

  // Programa el refresco automático de credenciales antes de la expiración (a los 50 minutos de un token de 60 min)
  scheduleTokenRefresh(session) {
    if (!session || !session.access_token) return;
    const payload = this.parseJwtToken(session.access_token);
    if (!payload || !payload.exp) return;

    if (this._refreshTimer) {
      clearTimeout(this._refreshTimer);
      this._refreshTimer = null;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const secondsRemaining = payload.exp - currentTime;

    // Supabase emite JWTs con 3600 segundos (60 minutos) de duración.
    // Renovamos cuando falten 10 minutos (600s), es decir, a los 50 minutos de vida del token.
    const refreshThresholdSeconds = 600; 
    const delaySeconds = secondsRemaining - refreshThresholdSeconds;

    // Si ya pasaron los 50 minutos, refrescar de inmediato (mínimo 1s de margen)
    const delayMs = delaySeconds > 0 ? delaySeconds * 1000 : 1000;

    console.log(`[SupabaseAPI] Silent Refresh programado en ${Math.round(delayMs / 1000)}s (expira en ${secondsRemaining}s).`);
    this._refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, delayMs);
  },

  async refreshToken() {
    if (this._isRefreshing) {
      return this._refreshPromise;
    }

    const sessionStr = (typeof localStorage !== 'undefined') ? localStorage.getItem('sb-pbswarzkotjznmasniax-auth-token') : null;
    if (!sessionStr) return null;

    let session = null;
    try {
      session = JSON.parse(sessionStr);
    } catch (e) {
      return null;
    }

    if (!session || !session.refresh_token) return null;

    this._isRefreshing = true;
    this._refreshPromise = (async () => {
      try {
        console.log('[SupabaseAPI] Renovando token de sesión automáticamente (Silent Refresh)...');
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refresh_token: session.refresh_token })
        });

        if (!res.ok) {
          const errText = await res.text();
          console.warn('[SupabaseAPI] Fallo al renovar token:', errText);
          return null;
        }

        const newSession = await res.json();
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sb-pbswarzkotjznmasniax-auth-token', JSON.stringify(newSession));
        }

        this.scheduleTokenRefresh(newSession);
        console.log('[SupabaseAPI] Sesión renovada con éxito. Administrador protegido contra pérdidas de sesión.');
        return newSession;
      } catch (err) {
        console.error('[SupabaseAPI] Error durante silent refresh:', err);
        return null;
      } finally {
        this._isRefreshing = false;
        this._refreshPromise = null;
      }
    })();

    return this._refreshPromise;
  },

  checkAndScheduleRefresh() {
    try {
      if (typeof localStorage === 'undefined') return;
      const sessionStr = localStorage.getItem('sb-pbswarzkotjznmasniax-auth-token');
      if (!sessionStr) return;
      const parsed = JSON.parse(sessionStr);
      if (parsed && parsed.access_token && parsed.refresh_token) {
        const payload = this.parseJwtToken(parsed.access_token);
        if (payload && payload.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          const secondsRemaining = payload.exp - currentTime;
          // Si le quedan 10 minutos o menos de vigencia (superó los 50 min), renovar de inmediato
          if (secondsRemaining <= 600) {
            this.refreshToken();
          } else {
            this.scheduleTokenRefresh(parsed);
          }
        }
      }
    } catch (e) {}
  },

  parseJwtToken(token) {
    if (!token || typeof token !== 'string') return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  },

  getValidSessionToken() {
    try {
      const sessionStr = localStorage.getItem('sb-pbswarzkotjznmasniax-auth-token');
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        if (parsed && parsed.access_token) {
          const payload = this.parseJwtToken(parsed.access_token);
          if (payload && payload.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp > currentTime) {
              // Si le quedan menos de 10 minutos (50 min transcurridos), refrescar de forma transparente
              if (payload.exp - currentTime <= 600) {
                this.refreshToken();
              }
              return { token: parsed.access_token, payload, session: parsed };
            }
          }
        }
      }
    } catch (e) {}
    return null;
  },

  async register(name, email, password, birthDate = '') {
    try {
      // 1. Sign up user in Supabase Auth con metadatos de nombre
      const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            full_name: name,
            nombre: name,
            nivel: 1
          }
        })
      });
      
      const signupData = await signupRes.json();
      if (!signupRes.ok && signupData.error_description) {
        throw new Error(signupData.error_description || signupData.msg || 'Error al registrar usuario en Supabase Auth');
      }

      // 2. Establecer sesión inicial en localStorage (Nivel 1 Visitante)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('123_user_email', email);
        localStorage.setItem('123_user_name', name);
        localStorage.setItem('123_user_nivel', '1');
        localStorage.setItem('123_user_rol', 'Visitante');
        localStorage.setItem('123_is_admin', 'false');
        localStorage.removeItem('123_user_avatar');
        if (signupData && signupData.access_token) {
          localStorage.setItem('sb-pbswarzkotjznmasniax-auth-token', JSON.stringify(signupData));
        }
      }

      // 3. Insertar registro en tabla 'usuarios' con Nivel 1 (Visitante)
      const userPayload = {
        nombre: name,
        email: email,
        fecha_nacimiento: birthDate || null,
        nivel: 1,
        activo: true,
        avatar_url: null
      };

      if (signupData && signupData.user && signupData.user.id) {
        userPayload.id = signupData.user.id;
      }

      try {
        await this.insert('usuarios', userPayload);
      } catch (e) {
        console.warn('[SupabaseAPI] No se pudo guardar en la tabla usuarios:', e);
      }

      return { success: true, name, email, nivel: 1 };
    } catch (e) {
      console.error('[SupabaseAPI] Error en registro:', e);
      throw e;
    }
  },

  logout() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('123_') || key.startsWith('sb-') || key.startsWith('academia_') || key.includes('user') || key.includes('admin')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
    window.location.href = 'login.html';
  },

  async query(table, select = '*', order = 'created_at.desc', filter = '') {
    try {
      let url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}`;
      if (order && !order.includes('=')) {
        url += `&order=${order}`;
      }
      if (filter) {
        url += `&${filter}`;
      } else if (order && order.includes('=')) {
        url += `&${order}`;
      }

      const sessionObj = this.getValidSessionToken();
      const token = sessionObj ? sessionObj.token : SUPABASE_ANON_KEY;
      const res = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error de lectura HTTP ${res.status}: ${this.formatError(errText)}`);
      }
      return await res.json();
    } catch (e) {
      console.error(`[SupabaseAPI] Error en lectura de ${table}:`, e);
      throw e;
    }
  },

  formatError(errBody) {
    try {
      const parsed = JSON.parse(errBody);
      if (parsed && (parsed.message || parsed.msg || parsed.error_description)) {
        let msg = parsed.message || parsed.msg || parsed.error_description;
        if (parsed.hint) msg += ` (${parsed.hint})`;
        return msg;
      }
    } catch (e) {}
    return errBody;
  },

  async rpc(fnName, params = {}) {
    try {
      const sessionObj = this.getValidSessionToken();
      const token = sessionObj ? sessionObj.token : SUPABASE_ANON_KEY;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(this.formatError(errBody));
      }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (e) {
      console.error(`[SupabaseAPI] Error en rpc ${fnName}:`, e);
      throw e;
    }
  },

  async insert(table, data, options = {}) {
    try {
      const sessionObj = this.getValidSessionToken();
      const token = sessionObj ? sessionObj.token : this.getAuthToken();
      const isMinimal = (table === 'solicitudes_contacto') || (table === 'usuarios' && !sessionObj) || (options && options.minimal);
      const preferHeader = isMinimal ? 'return=minimal' : 'return=representation';
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': preferHeader
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(this.formatError(errBody));
      }
      if (preferHeader === 'return=minimal') return true;
      return await res.json();
    } catch (e) {
      console.error(`[SupabaseAPI] Error en insert de ${table}:`, e);
      throw e;
    }
  },

  async update(table, id, data) {
    try {
      const token = this.getAuthToken();
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(this.formatError(errBody));
      }
      return await res.json();
    } catch (e) {
      console.error(`[SupabaseAPI] Error en update de ${table}:`, e);
      throw e;
    }
  },

  async delete(table, id) {
    try {
      const token = this.getAuthToken();
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(this.formatError(errBody));
      }
      return true;
    } catch (e) {
      console.error(`[SupabaseAPI] Error en delete de ${table}:`, e);
      throw e;
    }
  }
};

// Asegurar disponibilidad global explícita en window
if (typeof window !== 'undefined') {
  window.SupabaseAPI = SupabaseAPI;
}

// Inicialización de Silent Refresh en entornos de navegador
if (typeof window !== 'undefined') {
  try {
    SupabaseAPI.checkAndScheduleRefresh();

    window.addEventListener('focus', () => {
      SupabaseAPI.checkAndScheduleRefresh();
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          SupabaseAPI.checkAndScheduleRefresh();
        }
      });
    }
  } catch (e) {
    console.warn('[SupabaseAPI] No se pudo inicializar listener de Silent Refresh:', e);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SupabaseAPI, SUPABASE_URL, SUPABASE_ANON_KEY };
}
