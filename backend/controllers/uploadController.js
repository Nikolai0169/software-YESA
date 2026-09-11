const fs = require('node:fs/promises');
const path = require('node:path');
const { construirBaseUrl } = require('../utils/imagenUrl');
const { productUploadPath } = require('../config/multer');

const extensionesImagen = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

const quitarBarrasFinales = (url) => {
  let resultado = url;
  while (resultado.endsWith('/')) resultado = resultado.slice(0, -1);
  return resultado;
};

exports.uploadTexture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió archivo' });
    }

    const backendOrigin = construirBaseUrl(req);
    const uploadRoot = path.resolve(path.join(__dirname, '../uploads'));
    const relativeDirectory = path.relative(uploadRoot, path.resolve(req.file.destination))
      .split(path.sep)
      .filter(Boolean)
      .join('/');
    const relativePath = [relativeDirectory, req.file.filename].filter(Boolean).join('/');
    const fileUrl = `${quitarBarrasFinales(backendOrigin)}/uploads/${relativePath}`;
    return res.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error al subir textura:', error);
    return res.status(500).json({ success: false, message: 'Error subiendo textura' });
  }
};

exports.listarImagenesSubidas = async (req, res) => {
  try {
    const directorioUploads = productUploadPath;
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
            url: `${quitarBarrasFinales(backendOrigin)}/uploads/productos/${encodeURIComponent(entrada.name)}`,
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

exports.eliminarImagenSubida = async (req, res) => {
  try {
    const { nombre } = req.params;
    if (!nombre || path.basename(nombre) !== nombre || !extensionesImagen.has(path.extname(nombre).toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Nombre de imagen no válido' });
    }

    const rutaImagen = path.join(productUploadPath, nombre);
    await fs.unlink(rutaImagen);
    return res.json({ success: true, message: 'Imagen eliminada de la galería' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, message: 'Imagen no encontrada' });
    }
    console.error('Error al eliminar imagen:', error);
    return res.status(500).json({ success: false, message: 'Error eliminando imagen' });
  }
};

exports.vaciarGaleria = async (req, res) => {
  try {
    const archivos = await fs.readdir(productUploadPath, { withFileTypes: true });
    const imagenes = archivos.filter((entrada) => (
      entrada.isFile() && extensionesImagen.has(path.extname(entrada.name).toLowerCase())
    ));

    await Promise.all(imagenes.map((imagen) => fs.unlink(path.join(productUploadPath, imagen.name))));
    return res.json({
      success: true,
      message: 'Galería vaciada correctamente',
      data: { eliminadas: imagenes.length },
    });
  } catch (error) {
    console.error('Error al vaciar la galería:', error);
    return res.status(500).json({ success: false, message: 'Error vaciando la galería' });
  }
};
