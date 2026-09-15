//este artchivo centraliza axios para todas las peticiones http al backend
//configura la url base y el tiempo maximo de espera desde las constantes
//interceptor de peticiones: adjunta automaticamente el token JWT si existe
//interceptor de respuesta: normaliza los errores para que el codigo reciba siempre un objeto error con un mensaje legible

import axios from 'axios';
import {API_BASE_URL, API_BASE_URL_CANDIDATES, API_TIMEOUT_MS, STORAGE_KEYS} from '../utils/constants';
import {storageGetItem, storageMultiRemove, storageSetItem} from '../utils/storage';

let refreshPromise = null;

const isRetryableNetworkError = (error) => {
    const message = String(error?.message || '').toLowerCase();
    return message.includes('network error') || message.includes('failed to fetch')
        || message.includes('socket hang up') || message.includes('timeout')
        || message.includes('econnrefused') || message.includes('etimedout');
};

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
    async (error) => {
        const config = error?.config;
        const retryCount = config?._retryCount || 0;
        const canRetry = retryCount < API_BASE_URL_CANDIDATES.length - 1 && isRetryableNetworkError(error);

        if (canRetry) {
            const nextBaseUrl = API_BASE_URL_CANDIDATES[retryCount + 1];
            config._retryCount = retryCount + 1;
            config.baseURL = nextBaseUrl;
            return apiClient.request(config);
        }

        if (error.response?.status === 401 && config && !config._authRetry && !config._skipRefresh) {
            const refreshToken = await storageGetItem(STORAGE_KEYS.refreshToken);
            if (refreshToken) {
                config._authRetry = true;
                refreshPromise ||= apiClient.post('/auth/refresh', { refreshToken }, { _skipRefresh: true })
                    .then(async (response) => {
                        const tokens = response.data?.data || response.data;
                        await storageSetItem(STORAGE_KEYS.token, tokens.token);
                        if (tokens.refreshToken) {
                            await storageSetItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
                        }
                        return tokens.token;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });

                try {
                    const token = await refreshPromise;
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                    return apiClient.request(config);
                } catch {
                    await storageMultiRemove([STORAGE_KEYS.token, STORAGE_KEYS.refreshToken, STORAGE_KEYS.user]);
                }
            }
        }

        const backendData = error.response?.data;
        const backendMessage = backendData?.message; // mensaje del servidor
        const message = backendMessage || error.message || 'Error de conexion';
        const err = new Error(message);
        err.status = error.response?.status;
        // Adjunta los datos crudos del backend para que los catch puedan analizarlos (errores por campo, array de errores, etc.)
        err.responseData = backendData;
        throw err;
    }
);

export default apiClient;