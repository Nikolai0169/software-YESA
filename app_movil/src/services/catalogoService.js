/**
 * gestiona las consultas publicas del catalogo 
 * obtener categorias, productos con filtros
 * construir la url validas para imagener del backend 
 */

import apiClient from '../api/apiClient';
import { API_ORIGIN } from '../utils/constants';

const catalogoService = {
    //consulta la lista del categorias disponibles para filtrar productos de navegacion
    getCategorias: async () => {
        const response = await apiClient.get('catalogo/categorias');
        const payload = response.data?.data || response.data || {};
        return payload.categorias || [];
    },

    //consulta productos del catalogo y acepta filtros de busqueda
    getProductos: async (params = {}) => {
        const response = await apiClient.get('catalogo/productos', { params });
        const payload = response.data?.data || response.data || {};
        const productos = payload.productos || [];
        // Defensa en cliente: filtrar productos que vengan como inactivos o sin stock
        const filtrados = (productos || []).filter((p) => (p.activo !== false) && (Number(p.stock || 0) > 0));
        return filtrados;
    },

    getProductoById: async (id) => {
        const response = await apiClient.get(`catalogo/productos/${id}`);
        const payload = response.data?.data || response.data || {};
        return payload.producto || payload;
    },

    //convierte una ruta relativa del backend a una url completa usable para imagen
    buildImageUrl: (path) => {
        if (!path) {
            return 'https://via.placeholder.com/300/200.png?text=Producto';
        }

        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        return `${API_ORIGIN}/${path.replace(/^\//, '')}`;
    }
};

export default catalogoService;