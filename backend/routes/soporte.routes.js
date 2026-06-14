/**
 * ============================================
 * RUTAS SOPORTE
 * ============================================
 * Rutas para gestionar los mensajes de contacto desde el formulario FAQ
 * - POST /api/support/contact → Enviar un mensaje (público)
 * - GET /api/support/contactos → Obtener todos los mensajes (admin)
 * - GET /api/support/contactos/:id → Obtener un mensaje (admin)
 * - PUT /api/support/contactos/:id/responder → Responder un mensaje (admin)
 * - DELETE /api/support/contactos/:id → Eliminar un mensaje (admin)
 */

const express = require('express');
const router = express.Router();

const {
  enviarContacto,
  obtenerContactos,
  obtenerContactoPorId,
  responderContacto,
  eliminarContacto,
} = require('../controllers/soporte.controller');

const { verificarAuth } = require('../middleware/auth');
const { esAdministrador } = require('../middleware/checkRole');

/**
 * POST /api/support/contact
 * Enviar un nuevo mensaje de contacto (PÚBLICO - sin autenticación)
 * Recibe: { nombre, email, asunto, mensaje }
 */
router.post('/contact', enviarContacto);

/**
 * GET /api/support/contactos
 * Obtener todos los mensajes de contacto (PROTEGIDO - solo admin)
 * Query: ?estado=pendiente&page=1&limit=20
 */
router.get('/contactos', verificarAuth, esAdministrador, obtenerContactos);

/**
 * GET /api/support/contactos/:id
 * Obtener un mensaje de contacto específico (PROTEGIDO - solo admin)
 */
router.get('/contactos/:id', verificarAuth, esAdministrador, obtenerContactoPorId);

/**
 * PUT /api/support/contactos/:id/responder
 * Responder a un mensaje (PROTEGIDO - solo admin)
 * Recibe: { respuesta }
 */
router.put('/contactos/:id/responder', verificarAuth, esAdministrador, responderContacto);

/**
 * DELETE /api/support/contactos/:id
 * Eliminar un mensaje (PROTEGIDO - solo admin)
 */
router.delete('/contactos/:id', verificarAuth, esAdministrador, eliminarContacto);

module.exports = router;
