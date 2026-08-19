const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');

const MAX_REDIRECTS = 5;

const mapearExtensionPorTipo = (contentType) => {
  if (!contentType) return '.jpg';
  if (contentType.includes('png')) return '.png';
  if (contentType.includes('gif')) return '.gif';
  if (contentType.includes('webp')) return '.webp';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
  return '.jpg';
};

const descargarImagenRemota = async (
  imagenUrl,
  uploadDir = path.join(__dirname, '../uploads'),
  redirectCount = 0
) => {
  const url = new URL(imagenUrl);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('La URL de imagen debe ser http o https');
  }

  if (redirectCount > MAX_REDIRECTS) {
    throw new Error('Se excedió el límite de redirecciones de la imagen');
  }

  await fs.mkdir(uploadDir, { recursive: true });

  const extension = path.extname(url.pathname) || mapearExtensionPorTipo(url.searchParams.get('type'));
  const identificador = crypto.randomBytes(16).toString('hex');
  const nombreArchivo = `${Date.now()}-${identificador}${extension || '.jpg'}`;
  const rutaDestino = path.join(uploadDir, nombreArchivo);

  const cliente = url.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const request = cliente.get(url, (response) => {
      const statusCode = response.statusCode ?? 0;

      if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
        response.resume();
        const redirectUrl = new URL(response.headers.location, url);
        if (!['http:', 'https:'].includes(redirectUrl.protocol)) {
          reject(new Error('La redirección de imagen debe ser http o https'));
          return;
        }
        resolve(descargarImagenRemota(redirectUrl.toString(), uploadDir, redirectCount + 1));
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
  const imagenesSubidas = files?.imagenes;
  const imagenSubida = files?.imagen;
  let imagenes = null;

  if (imagenesSubidas?.length) {
    imagenes = imagenesSubidas.map((file) => file.filename);
  } else if (imagenSubida?.length) {
    imagenes = [imagenSubida[0].filename];
  }

  const imagenUrl = typeof body?.imagenUrl === 'string' ? body.imagenUrl.trim() : '';
  const tieneArchivo = Boolean(imagenes?.length);

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
