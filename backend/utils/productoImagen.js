const fs = require('fs/promises');
const path = require('path');
const http = require('http');
const https = require('https');

const mapearExtensionPorTipo = (contentType) => {
  if (!contentType) return '.jpg';
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
  return '.jpg';
};

const descargarImagenRemota = async (imagenUrl, uploadDir = path.join(__dirname, '../uploads')) => {
  const url = new URL(imagenUrl);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('La URL de imagen debe ser http o https');
  }

  await fs.mkdir(uploadDir, { recursive: true });

  const extension = path.extname(url.pathname) || mapearExtensionPorTipo(url.searchParams.get('type'));
  const nombreArchivo = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension || '.jpg'}`;
  const rutaDestino = path.join(uploadDir, nombreArchivo);

  const cliente = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = cliente.get(url, (response) => {
      const statusCode = response.statusCode ?? 0;

      if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
        response.resume();
        resolve(descargarImagenRemota(response.headers.location, uploadDir));
        return;
      }

      if (statusCode !== 200) {
        response.resume();
        reject(new Error(`No se pudo descargar la imagen. Código HTTP: ${statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks);
          await fs.writeFile(rutaDestino, buffer);
          resolve(nombreArchivo);
        } catch (error) {
          reject(error);
        }
      });
      response.on('error', reject);
    });

    request.on('error', reject);
  });
};

const resolverImagenProducto = async (body = {}, files = {}, options = {}) => {
  const uploadDir = options.uploadDir || path.join(__dirname, '../uploads');
  const imagenes = (files && files.imagenes && files.imagenes.length)
    ? files.imagenes.map(file => file.filename)
    : (files && files.imagen && files.imagen.length)
      ? [files.imagen[0].filename]
      : null;

  const imagenUrl = body?.imagenUrl?.trim();
  const tieneArchivo = Boolean(imagenes && imagenes.length);

  if (tieneArchivo) {
    return {
      imagen: imagenes[0],
      imagenes
    };
  }

  if (imagenUrl) {
    const nombreArchivo = await descargarImagenRemota(imagenUrl, uploadDir);
    return {
      imagen: nombreArchivo,
      imagenes: [nombreArchivo]
    };
  }

  return {
    imagen: null,
    imagenes: null
  };
};

module.exports = {
  resolverImagenProducto,
  descargarImagenRemota,
};
