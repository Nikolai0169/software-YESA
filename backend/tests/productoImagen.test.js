const http = require('http');
const { resolverImagenProducto } = require('../utils/productoImagen');

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

    try {
      const resultado = await resolverImagenProducto(
        { imagenUrl: `http://127.0.0.1:${port}/imagen.png` },
        {}
      );

      expect(resultado.imagen).toMatch(/\.png$/i);
      expect(resultado.imagenes).toEqual([resultado.imagen]);
    } finally {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    }
  });
});
