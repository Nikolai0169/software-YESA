/**
 * Support Service
 * Maneja todas las peticiones relacionadas con soporte y contacto
 */

import apiClient from '../api/apiClient';

/**
 * Enviar un mensaje de contacto al soporte
 * @param {Object} data - Datos del formulario { nombre, email, asunto, mensaje }
 * @returns {Promise} Respuesta del backend
 */
export const sendContactMessage = async (data) => {
  try {
    const response = await apiClient.post('/support/contact', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener todos los mensajes de contacto (admin)
 * @param {Object} params - Parámetros de paginación y filtrado
 * @returns {Promise} Lista de contactos
 */
export const getContactMessages = async (params = {}) => {
  try {
    const response = await apiClient.get('/support/contactos', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtener un mensaje de contacto específico (admin)
 * @param {number} id - ID del mensaje
 * @returns {Promise} Datos del contacto
 */
export const getContactMessage = async (id) => {
  try {
    const response = await apiClient.get(`/support/contactos/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Responder a un mensaje de contacto (admin)
 * @param {number} id - ID del mensaje
 * @param {string} respuesta - Texto de la respuesta
 * @returns {Promise} Contacto actualizado
 */
export const respondToContact = async (id, respuesta) => {
  try {
    const response = await apiClient.put(`/support/contactos/${id}/responder`, {
      respuesta,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Eliminar un mensaje de contacto (admin)
 * @param {number} id - ID del mensaje
 * @returns {Promise} Respuesta del backend
 */
export const deleteContact = async (id) => {
  try {
    const response = await apiClient.delete(`/support/contactos/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  sendContactMessage,
  getContactMessages,
  getContactMessage,
  respondToContact,
  deleteContact,
};
