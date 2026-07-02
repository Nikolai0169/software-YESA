const { normalizarRutaImagen } = require('../utils/imagenUrl');

describe('normalizarRutaImagen', () => {
  it('usa el host de la solicitud cuando no hay una URL base configurada', () => {
    const req = {
      protocol: 'http',
      get: (header) => (header === 'host' ? '192.168.1.20:5000' : undefined),
    };

    expect(normalizarRutaImagen('producto.jpg', req)).toBe('http://192.168.1.20:5000/uploads/producto.jpg');
  });

  it('prioriza el host de la solicitud aunque BACKEND_URL sea localhost', () => {
    const original = process.env.BACKEND_URL;
    process.env.BACKEND_URL = 'http://localhost:5000';

    const req = {
      protocol: 'http',
      get: (header) => (header === 'host' ? '192.168.1.81:5000' : undefined),
    };

    expect(normalizarRutaImagen('producto.jpg', req)).toBe('http://192.168.1.81:5000/uploads/producto.jpg');

    if (original === undefined) {
      delete process.env.BACKEND_URL;
    } else {
      process.env.BACKEND_URL = original;
    }
  });

  it('preserva URLs absolutas ya completas', () => {
    const req = {
      protocol: 'http',
      get: () => undefined,
    };

    expect(normalizarRutaImagen('https://cdn.example.com/imagen.png', req)).toBe('https://cdn.example.com/imagen.png');
  });
});
