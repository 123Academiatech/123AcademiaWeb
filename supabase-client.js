// Configuración del Cliente Supabase para 123AcademiaTech
const SUPABASE_URL = 'https://pbswarzkotjznmasniax.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic3dhcnprb3Rqem5tYXNuaWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODUyMzcsImV4cCI6MjEwMzc2MTIzN30.6IWirJzDAU5wAQHyyZgyI9JpG2PhaQXfvtC806uVKN0';

// Instancia Supabase si el CDN está cargado
let db = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Helper REST directo en caso de fallback sin librerías
const SupabaseAPI = {
  async query(table, select = '*', order = 'created_at.desc') {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&order=${order}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[SupabaseAPI] Fallback offline en lectura de ${table}:`, e);
      return null;
    }
  },

  async insert(table, data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
