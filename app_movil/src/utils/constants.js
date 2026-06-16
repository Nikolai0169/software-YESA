import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Detección robusta del entorno:
 * - Web: typeof window !== 'undefined'
 * - Native: Platform.OS === 'ios' | 'android'
 */
const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
const platformOS = Platform?.OS;

export const API_TIMEOUT_MS = isWeb ? 30000 : 15000; //30s para web, 15s para mobile

// Priority order:
// 1. Expo config extra `apiBaseUrl` (app.json/app.config)
// 2. Environment variable `EXPO_PUBLIC_API_BASE_URL` o `EXPO_API_BASE_URL`
// 3. Si está en web: usa el hostname actual de la página (ej: localhost, 192.168.1.81)
// 4. Si está en mobile: detecta el host del debuggerHost de Expo
// 5. Fallbacks: localhost para iOS, 10.0.2.2 para Android emulador

const expoApiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
const envApi = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_API_BASE_URL;

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

function resolveApiBaseUrl() {
  // 1) Explicit overrides
  if (expoApiBaseUrl) return expoApiBaseUrl;
  if (envApi) return envApi;

  // 2) WEB: use current page hostname
  if (isWeb) {
    const host = getWebHostname() || 'localhost';
    return `http://${host}:5000/api`;
  }

  // 3) NATIVE (Expo Go on physical device or simulator)
  const host = hostFromDebuggerHost();
  if (host) {
    return `http://${host}:5000/api`;
  }

  // 4) Fallback
  if (platformOS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // iOS simulator o unknown device
  return 'http://localhost:5000/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

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
