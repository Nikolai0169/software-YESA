import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const API_TIMEOUT_MS = 15000; //15s

// Android emulador accede al localhost de mi PC mediante 10.0.2.2.
// En navegador web la URL correcta es localhost.
const expoApiBaseUrl = Platform.OS === 'web'
  ? null
  : Constants.expoConfig?.extra?.apiBaseUrl;
const fallbackApiBaseUrl = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : 'http://10.0.2.2:5000/api';

export const API_BASE_URL =
  expoApiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_API_BASE_URL || fallbackApiBaseUrl;

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const STORAGE_KEYS = {
    token: 'token',
    user: 'user',
    carritoLocal: 'carritoLocal',
};