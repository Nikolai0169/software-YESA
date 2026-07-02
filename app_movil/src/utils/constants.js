import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Detección robusta del entorno:
 * - Web: typeof window !== 'undefined'
 * - Native: Platform.OS === 'ios' | 'android'
 */
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
const platformOS = Platform?.OS;
const isNative = platformOS === 'ios' || platformOS === 'android';
const isPhysicalDevice = isNative && Constants?.isDevice === true;

export const API_TIMEOUT_MS = isWeb ? 30000 : 15000; //30s para web, 15s para mobile

// Prioridad de resolución:
// 1) Expo config extra `apiBaseUrl` (app.json/app.config)
// 2) Variable de entorno `EXPO_PUBLIC_API_BASE_URL` o `EXPO_API_BASE_URL`
// 3) Bloque específico según el entorno de ejecución
// 4) Fallback general

const expoApiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
const envApi = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_API_BASE_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL;

function getWebHostname() {
  try {
    if (typeof window === 'undefined') return null;
    const h = window.location?.hostname;
    if (!h) return null;
    return h;
  } catch (e) {
    return null;
  }
}

function hostFromDebuggerHost() {
  // debuggerHost is typically like "192.168.1.81:19000" when running with LAN
  try {
    const dbg = Constants?.manifest?.debuggerHost
      || Constants?.manifest2?.debuggerHost
      || Constants?.expoConfig?.hostUri
      || Constants?.debuggerHost
      || Constants?.expoConfig?.extra?.host
      || Constants?.experienceUrl;
    if (!dbg) return null;
    const host = String(dbg).split(':')[0];
    if (!host || host === '::1' || host === '127.0.0.1' || host === 'localhost') return null;
    return host;
  } catch (e) {
    return null;
  }
}

function isLocalHostUrl(value) {
  if (!value) return false;
  const host = String(value)
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .split('/')[0]
    .split(':')[0];
  return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(host);
}

function resolveApiBaseUrl() {
  // [Vista web de la app móvil]
  // Se usa cuando se ejecuta con `expo start --web` o en un navegador.
  // Aquí el backend se resuelve con el host actual del navegador.
  if (isWeb) {
    const host = getWebHostname() || 'localhost';
    return `http://${host}:5000/api`;
  }

  // [Dispositivo físico]
  // Se usa cuando la app se prueba en un celular real con Expo Go.
  // En este caso, el backend debe estar accesible desde la red local del PC.
  if (isPhysicalDevice) {
    if (expoApiBaseUrl && !isLocalHostUrl(expoApiBaseUrl)) {
      return expoApiBaseUrl;
    }

    const host = hostFromDebuggerHost();
    if (host) {
      return `http://${host}:5000/api`;
    }

    if (envApi && !isLocalHostUrl(envApi)) {
      return envApi;
    }

    return 'http://localhost:5000/api';
  }

  // [Emulador de Expo Go]
  // Android emulator usa `10.0.2.2` para llegar al host del PC.
  // iOS simulator suele usar `localhost`.
  if (platformOS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  if (platformOS === 'ios') {
    return 'http://localhost:5000/api';
  }

  // [Fallback general]
  if (expoApiBaseUrl) {
    return expoApiBaseUrl;
  }

  if (envApi) {
    return envApi;
  }

  return 'http://localhost:5000/api';
}

function buildApiBaseUrlCandidates(primaryUrl) {
  const candidates = [];
  const add = (value) => {
    if (!value) return;
    const normalized = String(value).trim();
    if (!normalized) return;
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };

  add(primaryUrl);
  add(envApi);
  add(expoApiBaseUrl);
  add('http://10.0.2.2:5000/api');
  add('http://127.0.0.1:5000/api');
  add('http://localhost:5000/api');

  return candidates;
}

export const API_BASE_URL = resolveApiBaseUrl();
export const API_BASE_URL_CANDIDATES = buildApiBaseUrlCandidates(API_BASE_URL);

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  carritoLocal: 'carritoLocal',
};

// Log resolved values to help debugging network issues on physical devices
try {
  // eslint-disable-next-line no-console
  console.info('[constants] API_BASE_URL resolved to', API_BASE_URL);
  // eslint-disable-next-line no-console
  console.info('[constants] isWeb ->', isWeb);
  // eslint-disable-next-line no-console
  console.info('[constants] platformOS ->', platformOS);
  // eslint-disable-next-line no-console
  console.info('[constants] hostFromDebuggerHost() ->', hostFromDebuggerHost());
  // eslint-disable-next-line no-console
  console.info('[constants] getWebHostname() ->', getWebHostname());
} catch (e) {
  // ignore logging errors
}
