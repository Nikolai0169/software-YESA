import apiClient from '../api/apiClient';
import { storageGetItem, storageSetItem } from '../utils/storage';

const STORAGE_KEY = 'admin_cotizaciones_v1';

const cotizacionesService = {
  // Intenta obtener cotizaciones desde el backend; si falla usa almacenamiento local
  getCotizaciones: async () => {
    try {
      const resp = await apiClient.get('/admin/cotizaciones');
      const payload = resp.data?.data || resp.data || {};
      return payload.cotizaciones || [];
    } catch (err) {
      // fallback a local
      const local = await storageGetItem(STORAGE_KEY);
      try {
        return local ? JSON.parse(local) : [];
      } catch (e) {
        return [];
      }
    }
  },

  // Actualiza precios de una cotizacion; intenta backend y si falla, actualiza localmente
  updateCotizacion: async (cotizacionId, update) => {
    try {
      const resp = await apiClient.put(`/admin/cotizaciones/${cotizacionId}`, update);
      return resp.data?.data || resp.data || {};
    } catch (err) {
      // actualizar en local storage
      const local = await storageGetItem(STORAGE_KEY);
      let list = [];
      try {
        list = local ? JSON.parse(local) : [];
      } catch (e) {
        list = [];
      }
      const updated = list.map((c) => (String(c.id) === String(cotizacionId) ? { ...c, ...update } : c));
      await storageSetItem(STORAGE_KEY, JSON.stringify(updated));
      return update;
    }
  },

  // Guarda (solo local) una nueva cotizacion — utilidad para pruebas
  saveLocalCotizaciones: async (cotizaciones) => {
    await storageSetItem(STORAGE_KEY, JSON.stringify(cotizaciones || []));
  }
};

export default cotizacionesService;
