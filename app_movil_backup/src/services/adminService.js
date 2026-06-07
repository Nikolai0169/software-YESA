/**
 * encapsula las operaciones del panel administrativo sobre productos
 * crea, edita, elimina, activa/desactiva productos
 * todas las funciones usan el cliente http central para incluir el token y manejo de rrrores
 */

import api from '../api/apiClient';

//crea un producto en el backend usando el payload del formulario del admin
export async function createProduct(data) {
    const res = await api.post('/admin/productos', data);
    return res.data;
}

//actualizar un producto por su id con los datos del formulario del admin
export async function updateProduct (id, data) {
    const res = await api.put(`/admin/productos/${id}`, data);
    return res.data;
}

//eliminar un producto del backend por su id
export async function deleteProduct(id){
    const res = await api.delete(`/admin/productos/${id}`);
    return res.data;
}

//activar un producto del backend por id 
export async function activarProducto(id) {
    const res = await api.patch(`/admin/productos/${id}/toggle`);
    return res.data;
}

//desactiva un producto del backend por id
export async function desactivarProducto(id) {
    const res = await api.patch(`/admin/productos/${id}/toggle`);
    return res.data;
}