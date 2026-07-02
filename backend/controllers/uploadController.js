const path = require('path');
const { construirBaseUrl } = require('../utils/imagenUrl');

exports.uploadTexture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió archivo' });
    }

    const backendOrigin = construirBaseUrl(req);
    const fileUrl = `${backendOrigin.replace(/\/+$/, '')}/uploads/${req.file.filename}`;
    return res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error al subir textura:', error);
    return res.status(500).json({ success: false, message: 'Error subiendo textura' });
  }
};
