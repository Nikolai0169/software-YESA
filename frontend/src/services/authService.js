/**
 * ============================================
 * SERVICIO DE AUTENTICACIÓN
 * ============================================
 * Funciones para registro, login y gestión de perfil
 */

import api from './api';
import {
  getStorageJson,
  getStorageString,
  setSanitizedStorageItem,
  setSanitizedStorageString,
} from '../utils/storage';

const authService = {
  /**
   * Registrar nuevo usuario
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const authData = response.data.data || response.data;

      // Guardar token y usuario en localStorage
      if (response.data.success && authData) {
        if (authData.token) {
          setSanitizedStorageString('token', authData.token);
        }
        if (authData.usuario) {
          setSanitizedStorageItem('user', authData.usuario);
        }
      }
      
      return authData;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Iniciar sesión
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const authData = response.data.data || response.data;
      
      // Guardar token y usuario en localStorage
      if (response.data.success && authData) {
        if (authData.token) {
          setSanitizedStorageString('token', authData.token);
        }
        if (authData.usuario) {
          setSanitizedStorageItem('user', authData.usuario);
        }
      }
      
      return authData;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Actualizar perfil
   */
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/me', userData);
      
      // Actualizar usuario en localStorage
      if (response.data.success) {
        setSanitizedStorageItem('user', response.data.data.usuario);
      }
      
      return response.data.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Cambiar contraseña
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        passwordActual: currentPassword,
        passwordNueva: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error de conexión' };
    }
  },

  /**
   * Obtener usuario actual del localStorage
   */
  getCurrentUser: () => {
    return getStorageJson('user');
  },

  /**
   * Verificar si hay token válido
   */
  isAuthenticated: () => {
    return !!getStorageString('token');
  },

  /**
   * Verificar si es administrador
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.rol === 'administrador';
  },

  /**
   * Verificar si es auxiliar
   */
  isAuxiliar: () => {
    const user = authService.getCurrentUser();
    return user?.rol === 'auxiliar';
  },

  /**
   * Verificar si es cliente
   */
  isCliente: () => {
    const user = authService.getCurrentUser();
    return user?.rol === 'cliente';
  },
};

export default authService;
