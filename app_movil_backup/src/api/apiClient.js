//este artchivo centraliza axios para todas las peticiones http al backend
//configura la url base y el tiempo maximo de espera desde las constantes
//interceptor de peticiones: adjunta automaticamente el token JWT si existe
//interceptor de respuesta: normaliza los errores para que el codigo reciba siempre un objeto error con un mensaje legible

import axios from 'axios';
import {API_BASE_URL, API_TIMEOUT_MS, STORAGE_KEYS} from '../utils/constants';
import {storageGetItem} from '../utils/storage';

//instancias de axios
const apiClient= axios.create({
    baseURL: API_BASE_URL,//la baso de url que se conecta con el backend con puerto
    timeout: API_TIMEOUT_MS, //tiempo maximo si se cancela si el server dura mas
});

//interceptor de peticion
//se ejecuta antes de enviar cada request 
//si hay token JWT lo valida
//autorizacion para que el backend pueda autenticar el usuario

apiClient.interceptors.request.use(
    async(config) => {
        const token = await storageGetItem(STORAGE_KEYS.token);

        if(token){
            //formato estandar Bearer Authorization: Bearer <token>
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config; 
    },

    //si el interceptor mismo falla (error de configuracion) rechaza la peticion 
    (error) => Promise.reject(error)
);

//interceptor de respuesta 

//se ejecuta despues de recibir la respuesta del backend 
//respuestas 2xx se devuelven sin modificar
//respuestas con error 4xx o 5xx /red extrae el mensaje del backend
// si existe si no usa el mensaje de axios o un mensaje generico

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const backendData = error.response?.data;
        const backendMessage = backendData?.message; // mensaje del servidor
        const message = backendMessage || error.message || 'Error de conexion';
        const err = new Error(message);
        // Adjunta los datos crudos del backend para que los catch puedan analizarlos (errores por campo, array de errores, etc.)
        err.responseData = backendData;
        return Promise.reject(err);
    }
);

export default apiClient;