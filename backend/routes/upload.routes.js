const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { upload, uploadPersonalizacion } = require('../config/multer');
const { verificarAuth } = require('../middleware/auth');
const { esAdminOAuxiliar } = require('../middleware/checkRole');

// POST /api/uploads/texture
router.post('/texture', upload.single('texture'), uploadController.uploadTexture);
router.post('/texture-personalizacion', uploadPersonalizacion.single('texture'), uploadController.uploadTexture);

// GET /api/uploads/imagenes
router.get('/imagenes', uploadController.listarImagenesSubidas);
router.delete('/imagenes/:nombre', verificarAuth, esAdminOAuxiliar, uploadController.eliminarImagenSubida);
router.delete('/imagenes', verificarAuth, esAdminOAuxiliar, uploadController.vaciarGaleria);

module.exports = router;
