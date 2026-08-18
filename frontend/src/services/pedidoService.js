/**
 * ============================================
 * SERVICIO DE PEDIDOS
 * ============================================
 * Funciones para gestionar pedidos del cliente
 */

import api from './api';

const validatePedidoId = (id) => {
  const rawId = String(id);
  if (!/^\d+$/.test(rawId)) {
    throw new Error('Identificador de pedido inválido');
  }
  const pedidoId = Number.parseInt(rawId, 10);
  if (!Number.isSafeInteger(pedidoId) || pedidoId < 1) {
    throw new Error('Identificador de pedido inválido');
  }
  return String(pedidoId);
};

const pedidoService = {
  /**
   * Crear pedido (checkout)
   */
  crearPedido: async (direccionEnvio, telefono, options = {}) => {
    try {
      const body = {
        direccionEnvio,
        telefono,
        ...options,
      };
      const response = await api.post('/cliente/pedidos', body);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener pedidos del usuario
   */
  getMisPedidos: async () => {
    try {
      const response = await api.get('/cliente/pedidos');
      return response.data.data?.pedidos || response.data.pedidos || response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener un pedido específico
   */
  getPedidoById: async (id) => {
    try {
      const response = await api.get(`/cliente/pedidos/${validatePedidoId(id)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Cancelar pedido
   */
  cancelarPedido: async (id) => {
    try {
      const response = await api.put(`/cliente/pedidos/${validatePedidoId(id)}/cancelar`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * MÉTODOS ADMIN - Obtener todos los pedidos
   */
  obtenerTodosPedidos: async (params = {}) => {
    try {
      const response = await api.get('/admin/pedidos', { params });
      return response.data.data?.pedidos || response.data.pedidos || [];
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * MÉTODOS ADMIN - Obtener pedido por ID
   */
  obtenerPedidoPorId: async (id) => {
    try {
      const response = await api.get(`/admin/pedidos/${validatePedidoId(id)}`);
      return response.data.data?.pedido || response.data.pedido || response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * MÉTODOS ADMIN - Actualizar estado del pedido
   */
  actualizarEstadoPedido: async (id, estado) => {
    try {
      const response = await api.put(`/admin/pedidos/${validatePedidoId(id)}/estado`, { estado });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },
};

export default pedidoService;
