const express = require("express");
const router = express.Router();
const personalizacionController = require("../controllers/personalizacionController");
const { verificarAuth } = require('../middleware/auth');
const { esCliente } = require('../middleware/checkRole');

// Endpoints
router.post("/guardar", personalizacionController.guardarDiseno);
router.post("/cotizar", verificarAuth, esCliente, personalizacionController.cotizarProducto);
router.get("/modelos", personalizacionController.obtenerModelos);

module.exports = router;
