/**
 * agrupa todas las operaciones del cliente sobre pedidos
 * crear, consultar, consultar detalle de un pedido y cancelar pedido
 */

import apiClient from '../api/apiClient';

const pedidoService = {
    //crea un pedido nuevo con los datos capturados en checkout
    crearPedido: async({direccionEnvio, telefono, metodoPago = 'efectivo', notasAdicionales = '', items = []}) => {
        const response = await apiClient.post('/cliente/pedidos', {
            direccionEnvio,
            telefono,
            metodoPago,
            notasAdicionales,
            items,
        });
        // backend responde { data: { pedido } }
        const pedido = response.data?.data?.pedido || response.data?.pedido || null;
        console.log('[pedidoService] crearPedido response', { pedido, itemsLength: items?.length });
        return pedido;
    },

    //devuelve el historial de pedidos el usuario autenticado
    getMisPedidos: async() => {
        const response = await apiClient.get('/cliente/pedidos');
        // backend responde { data: { pedidos, paginacion } }
        const pedidos = response.data?.data?.pedidos || response.data?.pedidos || [];
        return pedidos;
    },

    //obtiene el detalle completo de un pedido por id
    getPedidoById: async(id) => {
        const response = await apiClient.get(`/cliente/pedidos/${id}`);
        return response.data?.data?.pedido || response.data?.pedido || response.data
    },

    //cancela un pedido siempre que el backend permita el cambio de estado
    cancelarPedido: async(id) => {
        const response = await apiClient.put(`/cliente/pedidos/${id}/cancelar`)
        return response.data;
    }
};

export default pedidoService;