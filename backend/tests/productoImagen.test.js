const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const {
  resolverImagenProducto,
  descargarImagenRemota,
} = require('../utils/productoImagen');

describe('resolverImagenProducto', () => {
  it('prioriza el archivo subido cuando se envía un archivo y una URL', async () => {
    const resultado = await resolverImagenProducto(
      { imagenUrl: 'https://cdn.ejemplo.com/producto.png' },
      { imagen: [{ filename: 'archivo-subido.jpg' }] }
    );

    expect(resultado).toEqual({
      imagen: 'archivo-subido.jpg',
      imagenes: ['archivo-subido.jpg']
    });
  });

  it('descarga la URL cuando no hay archivo subido', async () => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(Buffer.from('fake-png'));
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'producto-imagen-'));

    try {
      const resultado = await resolverImagenProducto(
        { imagenUrl: `http://127.0.0.1:${port}/imagen.png` },
        {},
        { uploadDir }
      );

      expect(resultado.imagen).toMatch(/\.png$/i);
      expect(resultado.imagenes).toEqual([resultado.imagen]);
    } finally {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      await fs.rm(uploadDir, { recursive: true, force: true });
    }
  });

  it('sigue una redirección HTTP válida y genera nombres diferentes', async () => {
    const server = http.createServer((req, res) => {
      if (req.url === '/redirect') {
        res.writeHead(302, { Location: '/imagen.png' });
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(Buffer.from('fake-png'));
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();
    const uploadDir = await fs.mkdtemp(path.join(os.tmpdir(), 'producto-imagen-'));

    try {
      const primeraImagen = await descargarImagenRemota(
        `http://127.0.0.1:${port}/redirect`,
        uploadDir
      );
      const segundaImagen = await descargarImagenRemota(
        `http://127.0.0.1:${port}/redirect`,
        uploadDir
      );

      expect(primeraImagen).toMatch(/\.png$/i);
      expect(segundaImagen).toMatch(/\.png$/i);
      expect(segundaImagen).not.toBe(primeraImagen);
    } finally {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
      await fs.rm(uploadDir, { recursive: true, force: true });
    }
  });

  it('rechaza protocolos inválidos y bucles de redirección', async () => {
    await expect(descargarImagenRemota('ftp://example.com/imagen.png')).rejects.toThrow(
      'La URL de imagen debe ser http o https'
    );

    const server = http.createServer((req, res) => {
      res.writeHead(302, { Location: '/loop' });
      res.end();
    });

    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();

    try {
      await expect(
        descargarImagenRemota(`http://127.0.0.1:${port}/loop`)
      ).rejects.toThrow('Se excedió el límite de redirecciones de la imagen');
    } finally {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });
});
