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
const { esAdministrador, esAdminOAuxiliar, soloAdministrador } = require('../middleware/checkRole');

// El formulario de soporte puede enviarse con o sin autenticación.
// Si hay usuario logueado, se usa su id; si no, el mensaje queda anónimo.
router.post('/contact', verificarAuthOpcional, enviarContacto);

router.get('/mis-consultas', verificarAuth, misConsultas); // ← agregado

// Permitir que administradores y auxiliares vean y respondan consultas
router.get('/contactos', verificarAuth, esAdminOAuxiliar, obtenerContactos);
router.get('/contactos/:id', verificarAuth, esAdminOAuxiliar, obtenerContactoPorId);
router.put('/contactos/:id/responder', verificarAuth, esAdminOAuxiliar, responderContacto);
// Solo el administrador puede eliminar
router.delete('/contactos/:id', verificarAuth, soloAdministrador, eliminarContacto);

module.exports = router;
