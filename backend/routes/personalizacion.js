const express = require("express");
const router = express.Router();
const personalizacionController = require("../controllers/personalizacionController");

// Endpoints
router.post("/guardar", personalizacionController.guardarDiseno);
router.post("/cotizar", personalizacionController.cotizarProducto);
router.get("/modelos", personalizacionController.obtenerModelos);

module.exports = router;
