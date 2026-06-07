import Constants from 'expo-constants';

export const API_TIMEOUT_MS = 15000; //15s

// Android emulador accede al localhost de mi PC mediante 10.0.2.2.
// Para dispositivo físico cambia por la IP local o la dirección del servidor.
const expoApiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
export const API_BASE_URL =
  expoApiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_API_BASE_URL || 'http://10.0.2.2:5000/api';

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const STORAGE_KEYS = {
    token: 'token',
    user: 'user',
    carritoLocal: 'carritoLocal',
};