/**
 * ============================================
 * SERVICIO DE CARRITO
 * ============================================
 * Funciones para gestionar el carrito de compras
 * Soporta carrito local (sin autenticación) y carrito de servidor (con autenticación)
 */

import api from './api';
import { getStorageJson, setSanitizedStorageItem } from '../utils/storage';

const CARRITO_LOCAL_KEY = 'carrito_local';

const carritoService = {
  /**
   * Obtener carrito (local o del servidor)
   */
  getCarrito: async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Usuario autenticado: obtener del servidor
      try {
        const response = await api.get('/cliente/carrito');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error de conexión');
      }
    } else {
      // Usuario no autenticado: obtener del localStorage
      const carritoLocal = getStorageJson(CARRITO_LOCAL_KEY, []);
      return {
        success: true,
        carrito: {
          items: carritoLocal,
          total: carritoLocal.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
        }
      };
    }
  },

  /**
   * Agregar producto al carrito
   */
  agregarAlCarrito: async (productoId, cantidad = 1, productoInfo = null) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Usuario autenticado: agregar en servidor
      try {
        const response = await api.post('/cliente/carrito', {
          productoId,
          cantidad,
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error de conexión');
      }
    } else {
      // Usuario no autenticado: agregar en localStorage
      if (!productoInfo) {
        throw new Error('Se requiere información del producto');
      }

      const carritoLocal = getStorageJson(CARRITO_LOCAL_KEY, []);
      
      // Buscar si el producto ya existe
      const existente = carritoLocal.find(item => item.productoId === productoId);
      
      if (existente) {
        existente.cantidad += cantidad;
      } else {
        carritoLocal.push({
          id: Date.now(), // ID temporal para el carrito local
          productoId,
          cantidad,
          precio: productoInfo.precio || 0,
          nombre: productoInfo.nombre,
          imagen: productoInfo.imagen || null,
          producto: productoInfo
        });
      }
      
      setSanitizedStorageItem(CARRITO_LOCAL_KEY, carritoLocal);
      
      return {
        success: true,
        message: 'Producto agregado al carrito'
      };
    }
  },

  /**
   * Actualizar cantidad de un item
   */
  actualizarItem: async (itemId, cantidad) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Usuario autenticado: actualizar en servidor
      try {
        const response = await api.put(`/cliente/carrito/${itemId}`, {
          cantidad,
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error de conexión');
      }
    } else {
      // Usuario no autenticado: actualizar en localStorage
      const carritoLocal = getStorageJson(CARRITO_LOCAL_KEY, []);
      const item = carritoLocal.find(i => i.id === itemId);
      
      if (item) {
        item.cantidad = cantidad;
        setSanitizedStorageItem(CARRITO_LOCAL_KEY, carritoLocal);
        return { success: true, message: 'Cantidad actualizada' };
      }
      
      throw new Error('Producto no encontrado');
    }
  },

  /**
   * Eliminar item del carrito
   */
  eliminarItem: async (itemId) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Usuario autenticado: eliminar del servidor
      try {
        const response = await api.delete(`/cliente/carrito/${itemId}`);
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error de conexión');
      }
    } else {
      // Usuario no autenticado: eliminar del localStorage
      let carritoLocal = getStorageJson(CARRITO_LOCAL_KEY, []);
      carritoLocal = carritoLocal.filter(item => item.id !== itemId);
      setSanitizedStorageItem(CARRITO_LOCAL_KEY, carritoLocal);
      
      return { success: true, message: 'Producto eliminado' };
    }
  },

  /**
   * Vaciar NOTE el carrito
   */
  vaciarCarrito: async () => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Usuario autenticado: vaciar en servidor
      try {
        const response = await api.delete('/cliente/carrito');
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Error de conexión');
      }
    } else {
      // Usuario no autenticado: vaciar localStorage
      localStorage.removeItem(CARRITO_LOCAL_KEY);
      return { success: true, message: 'Carrito vaciado' };
    }
  },

  /**
   * Sincronizar carrito local con el servidor al iniciar sesión
   */
  sincronizarCarritoLocal: async () => {
    const carritoLocal = getStorageJson(CARRITO_LOCAL_KEY, []);
    
    if (carritoLocal.length === 0) {
      return { success: true, sincronizados: 0 };
    }

    console.log(`🔄 Sincronizando ${carritoLocal.length} items del carrito local...`);
    
    let sincronizados = 0;
    let errores = 0;
    
    // Agregar cada producto del carrito local al servidor
    for (const item of carritoLocal) {
      try {
        await api.post('/cliente/carrito', {
          productoId: item.productoId,
          cantidad: item.cantidad,
        });
        sincronizados++;
        console.log(`✅ Sincronizado: ${item.nombre || item.productoId}`);
      } catch (error) {
        errores++;
        console.error(`❌ Error sincronizando producto ${item.productoId}:`, error.response?.data || error.message);
      }
    }
    
    // Solo limpiar carrito local si al menos algunos se sincronizaron exitosamente
    if (sincronizados > 0) {
      localStorage.removeItem(CARRITO_LOCAL_KEY);
      console.log(`✅ Carrito local limpiado. Sincronizados: ${sincronizados}, Errores: ${errores}`);
    }
    
    return {
      success: sincronizados > 0,
      sincronizados,
      errores,
      total: carritoLocal.length
    };
  },

  /**
   * Obtener cantidad total de items en el carrito
   */
  getCantidadItems: () => {
    const carritoLocal = getStorageJson(CARRITO_LOCAL_KEY, []);
    return carritoLocal.reduce((sum, item) => sum + item.cantidad, 0);
  }
};

export default carritoService;
