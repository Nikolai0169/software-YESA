/**
 * ============================================
 * CONFIGURACIÓN DE AXIOS - API CLIENT
 * ============================================
 * Este archivo configura Axios para hacer peticiones HTTP al backend
 * Axios es una librería para hacer peticiones HTTP de forma sencilla
 */

// Importar axios
import axios from 'axios';
import { API_URL } from './config';

/**
 * URL base del backend API
 * Todas las peticiones se harán a esta URL base
 * Ejemplo: http://localhost:5000/api/productos
 */

/**
 * Crear instancia de axios con configuración base
 * Esta instancia se usará en todos los servicios de la aplicación
 */
const apiClient = axios.create({
  baseURL: API_URL,              // URL base del backend
  timeout: 30000,                // Timeout aumentado a 30 segundos
  headers: {
    'Content-Type': 'application/json', // Tipo de contenido por defecto
  },
  // Permitir cuerpos y respuestas muy grandes (Infinity admite transferencias grandes)
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

/**
 * INTERCEPTOR DE PETICIONES (Request Interceptor)
 * Se ejecuta ANTES de enviar cada petición al servidor
 * Útil para agregar el token JWT automáticamente a cada petición
 */
apiClient.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    // Si existe un token, agregarlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Manejar error antes de enviar la petición
    console.error('❌ Error en petición:', error);
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPUESTAS (Response Interceptor)
 * Se ejecuta DESPUÉS de recibir una respuesta del servidor
 * Útil para manejar errores globalmente (ej: token expirado)
 */
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (status 2xx), simplemente retornarla
    return response;
  },
  (error) => {
    // Manejar errores de respuesta (status 4xx, 5xx)
    
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response;
      
      // Token expirado o inválido (401 Unauthorized)
      if (status === 401) {
        console.error('⚠️ Sesión expirada. Redirigiendo al login...');
        
        // Eliminar token del localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirigir al login (se puede mejorar con React Router)
        window.location.href = '/login';
      }
      
      // Acceso denegado (403 Forbidden)
      if (status === 403) {
        console.error('⛔ Acceso denegado');
      }
      
      // Recurso no encontrado (404 Not Found)
      if (status === 404) {
        console.error('🔍 Recurso no encontrado');
      }
      
      // Error del servidor (500 Internal Server Error)
      if (status === 500) {
        console.error('💥 Error interno del servidor');
      }
      
      // Mostrar mensaje de error
      console.error('❌ Error:', data.message || 'Error desconocido');
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('📡 No se pudo conectar con el servidor');
      console.error('Verifica que el backend esté corriendo en', API_URL);
    } else {
      // Error al configurar la petición
      console.error('⚙️ Error al configurar la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Función helper para subir archivos (multipart/form-data)
 * Útil para subir imágenes de productos
 * 
 * @param {string} url - URL del endpoint
 * @param {FormData} formData - Datos del formulario con archivos
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const uploadFile = (url, formData) => {
  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
};

/**
 * Función helper para descargar archivos
 * 
 * @param {string} url - URL del archivo
 * @returns {Promise} - Promesa con los datos del archivo
 */
export const downloadFile = (url) => {
  return apiClient.get(url, {
    responseType: 'blob', // Tipo de respuesta para archivos
  });
};

/**
 * Guardar diseño personalizado
 * 
 * @param {Object} data - Datos del diseño (color, textura, etc.)
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const guardarDiseno = async (data) => {
  const response = await apiClient.post('/personalizacion/guardar', data);
  return response.data;
};

/**
 * Cotizar producto personalizado
 * 
 * @param {Object} data - Datos del producto para cotizar
 * @returns {Promise} - Promesa con la cotización del servidor
 */
// Envía un conjunto de diseños personalizados al backend para crear una cotización.
export const cotizarProducto = async (data) => {
  const response = await apiClient.post('/personalizacion/cotizar', data);
  return response.data;
};

/**
 * Obtener modelos disponibles para personalizar
 * 
 * @returns {Promise} - Promesa con la lista de modelos
 */
export const obtenerModelos = async () => {
  const response = await apiClient.get('/personalizacion/modelos');
  return response.data;
};

/**
 * Obtener cotizaciones registradas en el backend para administración
 * 
 * @returns {Promise} - Promesa con la lista de cotizaciones
 */
// Obtiene la lista de cotizaciones para la vista administrativa.
export const obtenerCotizaciones = async () => {
  const response = await apiClient.get('/admin/cotizaciones');
  return response.data;
};

export const obtenerCotizacion = async (id) => {
  const response = await apiClient.get(`/admin/cotizaciones/${id}`);
  return response.data;
};

export const actualizarCotizacion = async (id, data) => {
  const response = await apiClient.put(`/admin/cotizaciones/${id}`, data);
  return response.data;
};

export const eliminarCotizaciones = async (data = {}) => {
  const response = await apiClient.delete('/admin/cotizaciones', { data });
  return response.data;
};

export const eliminarCotizacion = async (id) => {
  const response = await apiClient.delete(`/admin/cotizaciones/${id}`);
  return response.data;
};

// Obtiene las cotizaciones asociadas al usuario autenticado.
export const obtenerMisCotizaciones = async () => {
  const response = await apiClient.get('/personalizacion/mis-cotizaciones');
  return response.data;
};

export const obtenerCotizacionUsuario = async (id) => {
  const response = await apiClient.get(`/personalizacion/cotizaciones/${id}`);
  return response.data;
};

// Exportar la instancia configurada de axios
export default apiClient;
