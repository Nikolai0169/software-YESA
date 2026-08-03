const fs = require('fs/promises');
const path = require('path');
const { construirBaseUrl } = require('../utils/imagenUrl');

const extensionesImagen = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

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

exports.listarImagenesSubidas = async (req, res) => {
  try {
    const directorioUploads = path.join(__dirname, '../uploads');
    const archivos = await fs.readdir(directorioUploads, { withFileTypes: true });

    const imagenes = await Promise.all(
      archivos
        .filter((entrada) => entrada.isFile() && extensionesImagen.has(path.extname(entrada.name).toLowerCase()))
        .map(async (entrada) => {
          const rutaCompleta = path.join(directorioUploads, entrada.name);
          const estadisticas = await fs.stat(rutaCompleta);
          const backendOrigin = construirBaseUrl(req);

          return {
            name: entrada.name,
            url: `${backendOrigin.replace(/\/+$/, '')}/uploads/${encodeURIComponent(entrada.name)}`,
            size: estadisticas.size,
            modifiedAt: estadisticas.mtime.toISOString(),
          };
        })
    );

    imagenes.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));

    return res.json({
      success: true,
      data: {
        imagenes,
      },
    });
  } catch (error) {
    console.error('Error al listar imágenes:', error);
    return res.status(500).json({ success: false, message: 'Error listando imágenes' });
  }
};
