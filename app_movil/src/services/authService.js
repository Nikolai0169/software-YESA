/**
 * centraliza todas las opreaciones relacionadas con autenticación
 * inicia sesion guarda token/usuariuo en almacenamiento local 
 * cierra sesion eliminando los datos
 * restaura la sesion guardada
 * actualizar el perfil del usuario autenticado 
 */

import apiClient from '../api/apiClient';
import {STORAGE_KEY} from '../utils/constants';
import {storageGetItem, storageMultiRemove, storageSetItem} from '../utils/storage';

const authService = {
    //envia credenciales al backend y persiste token + usuario si son validos
    login: async (email,password) => {
        const response = await apiClient.post('/auth/login', {email, password});
        const payload = response.data?.data || response.data;

        if(payload?.token) {
            await storageSetItem(STORAGE_KEY.token, payload.token);
        }

        if(payload?.usuario) {
            await storageSetItem(STORAGE_KEY.usuario, payload.usuario);
        }

        return payload;

        
    },
    //registra un nuevo usuario en el backend con los datos del formulario de registro
    register: async (data) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },

    //cierra la sesion eliminando del storage las claves persistidas 
    logout: async () => {
        await storageMultiRemove([
            [STORAGE_KEY.token,STORAGE_KEY.user],
        ]);
    },

    //lee el almacenamiento local la sesion guardada y la restaura en el contexto de autenticacion
    getSession: async () => {
        const token = await storageGetItem(STORAGE_KEY.token);
        const userRaw = await storageGetItem(STORAGE_KEY.user);
        const user = userRaw ? JSON.parse(userRaw) : null;
        return {token, user};
    },

    updatePerfil: async(data) => {
        const response = await apiClient.put(`/auth/me`, data);
        const usuario = response.data?.data.usuario || response.data.usuario || null;
        if(usuario) {
            await storageSetItem(STORAGE_KEY.user, JSON.stringify(usuario));
        }
        return response.data;
    }
};

export default authService;

