const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { upload } = require('../config/multer');

// POST /api/uploads/texture
router.post('/texture', upload.single('texture'), uploadController.uploadTexture);

// GET /api/uploads/imagenes
router.get('/imagenes', uploadController.listarImagenesSubidas);

module.exports = router;
