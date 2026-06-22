const express = require("express");
const router = express.Router();
const personalizacionController = require("../controllers/personalizacionController");
// Nota: permitimos cotizaciones anónimas, pero si el cliente envía token se adjunta el usuario
const { verificarAuth, verificarAuthOpcional } = require('../middleware/auth');

// Endpoints
router.post("/guardar", personalizacionController.guardarDiseno);
router.post("/cotizar", verificarAuth, personalizacionController.cotizarProducto);
router.get("/modelos", personalizacionController.obtenerModelos);

// Rutas para que el usuario vea sus cotizaciones
router.get('/mis-cotizaciones', verificarAuth, personalizacionController.obtenerMisCotizaciones);
router.get('/cotizaciones/:id', verificarAuth, personalizacionController.obtenerCotizacionPorUsuario);

module.exports = router;
