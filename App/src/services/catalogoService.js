/**
 * gestiona las consultas publicas del catalogo 
 * obtener categorias, productos con filtros
 * construir la url validas para imagener del backend 
 */

import apiClient from '../api/apiClient';
import { API_ORIGIN, API_BASE_URL, API_BASE_URL_CANDIDATES } from '../utils/constants';

const catalogoService = {
    //consulta la lista del categorias disponibles para filtrar productos de navegacion
    getCategorias: async () => {
        const response = await apiClient.get('catalogo/categorias');
        const payload = response.data?.data || response.data || {};
        return payload.categorias || [];
    },

    //consulta subcategorias activas de una categoría específica
    getSubcategorias: async (categoriaId) => {
        if (!categoriaId) return [];
        const response = await apiClient.get(`catalogo/categorias/${categoriaId}/subcategorias`);
        const payload = response.data?.data || response.data || {};
        return payload.subcategorias || [];
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

    getResenasPorProducto: async (productoId) => {
        const response = await apiClient.get(`resena/producto/${productoId}`);
        const payload = response.data?.data || response.data || {};
        if (Array.isArray(payload)) {
            return payload;
        }
        return payload.resenas || [];
    },

    //convierte una ruta relativa del backend a una o varias urls candidatas para imagen
    buildImageCandidates: function (path) {
        if (!path) {
            return ['https://via.placeholder.com/300/200.png?text=Producto'];
        }

        // si ya es URL absoluta, devolverla como único candidato
        if (/^https?:\/\//i.test(path)) {
            return [path];
        }

        const normalized = String(path).replace(/^\//, '').replace(/^api\//, '');

        const candidates = [];

        // API_ORIGIN preferido
        if (API_ORIGIN) {
            candidates.push(`${String(API_ORIGIN).replace(/\/$/, '')}/${normalized}`);
        }

        // candidatos configurados en constantes (API_BASE_URL_CANDIDATES)
        if (Array.isArray(API_BASE_URL_CANDIDATES)) {
            API_BASE_URL_CANDIDATES.forEach((base) => {
                if (!base) return;
                const b = String(base).replace(/\/$/, '');
                // si base final incluye /api, quitar para concatenar uploads
                candidates.push(`${b.replace(/\/api\/?$/, '')}/${normalized}`);
            });
        }

        // fallback: derivar de API_BASE_URL
        if (API_BASE_URL) {
            candidates.push(`${String(API_BASE_URL).replace(/\/$/, '').replace(/\/api\/?$/, '')}/${normalized}`);
        }

        // eliminar duplicados y vacíos
        return Array.from(new Set(candidates.filter(Boolean)));
    },

    // mantenemos compatibilidad: devuelve la primera candidata o placeholder
    buildImageUrl: function (path) {
        const c = this.buildImageCandidates ? this.buildImageCandidates(path) : [];
        return (c && c.length > 0) ? c[0] : 'https://via.placeholder.com/300/200.png?text=Producto';
    }
};

export default catalogoService;