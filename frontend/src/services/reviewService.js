import api from './api';

const reviewService = {
  getResenasPorProducto: async (productoId) => {
    try {
      const response = await api.get(`/resena/producto/${productoId}`);
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  crearResena: async (reviewData) => {
    try {
      const response = await api.post('/resena', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },
};

export default reviewService;
