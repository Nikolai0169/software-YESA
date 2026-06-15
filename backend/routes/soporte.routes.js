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
  misConsultas, // ← agregado
} = require('../controllers/soporte.controller');

const { verificarAuth, verificarAuthOpcional } = require('../middleware/auth');
const { esAdministrador } = require('../middleware/checkRole');

router.post('/contact', verificarAuthOpcional, enviarContacto);

router.get('/mis-consultas', verificarAuth, misConsultas); // ← agregado

router.get('/contactos', verificarAuth, esAdministrador, obtenerContactos);
router.get('/contactos/:id', verificarAuth, esAdministrador, obtenerContactoPorId);
router.put('/contactos/:id/responder', verificarAuth, esAdministrador, responderContacto);
router.delete('/contactos/:id', verificarAuth, esAdministrador, eliminarContacto);

module.exports = router;
