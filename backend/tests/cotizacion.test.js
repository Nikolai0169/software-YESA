process.env.NODE_ENV = 'test';
process.env.PORT = '0';

const request = require('supertest');
const app = require('../server');
const Cotizacion = require('../models/Cotizacion');

describe('PUT /api/admin/cotizaciones/:id', () => {
  beforeAll(async () => {
    await app.serverReadyPromise;
  });

  afterAll(async () => {
    if (app.server && typeof app.server.close === 'function') {
      await new Promise((resolve) => app.server.close(resolve));
    }
  });

  test('debe aceptar un body con precio, estado y notas para actualizar la cotización', async () => {
    const cotizacion = await Cotizacion.create({
      nombre: 'Cotización de prueba',
      modelo: 'taza',
      precio: 0,
      estado: 'pendiente',
      items: [{ nombre: 'Diseño A' }],
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@yesa.com', password: 'admin1234' });

    const token = loginRes.body?.data?.token;

    const response = await request(app)
      .put(`/api/admin/cotizaciones/${cotizacion.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ precio: 150000, estado: 'cotizado', notas: 'Precio asignado desde test' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const cotizacionActualizada = await Cotizacion.findByPk(cotizacion.id);
    expect(Number(cotizacionActualizada.precio)).toBe(150000);
    expect(cotizacionActualizada.estado).toBe('cotizado');
    expect(cotizacionActualizada.notas).toBe('Precio asignado desde test');
  });
});
