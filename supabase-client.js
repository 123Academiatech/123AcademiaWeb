// Configuración del Cliente Supabase para 123AcademiaTech
const SUPABASE_URL = 'https://pbswarzkotjznmasniax.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic3dhcnprb3Rqem5tYXNuaWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODUyMzcsImV4cCI6MjEwMzc2MTIzN30.6IWirJzDAU5wAQHyyZgyI9JpG2PhaQXfvtC806uVKN0';

// Instancia Supabase si el CDN está cargado en el navegador
let db = null;
if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Helper REST y Supabase Auth
const SupabaseAPI = {
  getAuthToken() {
    try {
      const sessionStr = localStorage.getItem('sb-pbswarzkotjznmasniax-auth-token');
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        if (parsed && parsed.access_token) {
          return parsed.access_token;
        }
      }
    } catch (e) {}
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
      localStorage.setItem('123_is_admin', 'true');
      localStorage.setItem('123_user_nivel', '4');
      localStorage.setItem('123_user_email', email);
      return data;
  async register(name, email, password, birthDate = '') {
    try {
      // 1. Sign up user in Supabase Auth
      const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const signupData = await signupRes.json();
      if (!signupRes.ok && signupData.error_description) {
        throw new Error(signupData.error_description || signupData.msg || 'Error al registrar usuario en Supabase Auth');
      }

      // 2. Insert record in 'usuarios' table with Nivel 1 (Visitante)
      const userPayload = {
        nombre: name,
        email: email,
        fecha_nacimiento: birthDate || null,
        nivel: 1,
        rol_nombre: 'Visitante',
        activo: true
      };

      try {
        await this.insert('usuarios', userPayload);
      } catch (e) {
        console.warn('[SupabaseAPI] No se pudo guardar en la tabla usuarios:', e);
      }

      // 3. Set initial session in localStorage (Nivel 1 Visitante)
      localStorage.setItem('123_user_email', email);
      localStorage.setItem('123_user_name', name);
      localStorage.setItem('123_user_nivel', '1');
      localStorage.setItem('123_user_rol', 'Visitante');
      localStorage.setItem('123_is_admin', 'false');
      if (signupData && signupData.access_token) {
        localStorage.setItem('sb-pbswarzkotjznmasniax-auth-token', JSON.stringify(signupData));
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
    window.location.href = 'index.html';
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

      const token = this.getAuthToken();
      const res = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[SupabaseAPI] Fallback en lectura de ${table}:`, e);
      return null;
    }
  },

  async insert(table, data) {
    try {
      const token = this.getAuthToken();
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
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
        throw new Error(errBody);
      }
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
        throw new Error(errBody);
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
        throw new Error(errBody);
      }
      return true;
    } catch (e) {
      console.error(`[SupabaseAPI] Error en delete de ${table}:`, e);
      throw e;
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SupabaseAPI, SUPABASE_URL, SUPABASE_ANON_KEY };
}
