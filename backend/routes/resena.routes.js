/** Rutas de reseñas */
const express = require('express');
const router = express.Router();
const { verificarAuthOpcional } = require('../middleware/auth');
const { crearResena, obtenerResenasPorProducto } = require('../controllers/resena.controller');

// Public: crear reseña (permite token opcional para adjuntar usuario)
router.post('/', verificarAuthOpcional, crearResena);

// Public: obtener reseñas de un producto
router.get('/producto/:id', obtenerResenasPorProducto);

module.exports = router;
