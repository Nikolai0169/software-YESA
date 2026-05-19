/**
 * administra las funciones del usuario
 * activa y desactiva y elimina desde el panel de admin
 */

import api from '../api/apiClient';

//activa un usuario 
export async function activarUsuario(id) {
    const res = await api.patch(`/admin/usuarios/${id}/activat`);
    return res.data;
}


//desactiva un usuario 
export async function desactivarUsuario(id) {
    const res = await api.patch(`/admin/usuarios/${id}/desactivar`);
    return res.data;
}

//elimina un usuario
export async function deleteUsuario(id) {
    const res = await api.delete(`/admin/usuarios/${id}/eliminar`);
    return res.data;
}