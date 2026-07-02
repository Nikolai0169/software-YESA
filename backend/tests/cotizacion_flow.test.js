process.env.NODE_ENV = 'test';
process.env.PORT = '0';

const request = require('supertest');
const app = require('../server');
const Cotizacion = require('../models/Cotizacion');
const Usuario = require('../models/Usuario');
const { sequelize } = require('../config/database');

describe('Flujo de cotizaciones: guest, cliente y admin', () => {
  let clientToken = null;
  let adminToken = null;
  let clientUser = null;

  beforeAll(async () => {
    await app.serverReadyPromise;
  });

  afterAll(async () => {
    if (app.server && typeof app.server.close === 'function') {
      await new Promise((resolve) => app.server.close(resolve));
    }
    if (sequelize && typeof sequelize.close === 'function') {
      await sequelize.close();
    }
  });

  test('guest no puede cotizar (401)', async () => {
    const res = await request(app)
      .post('/api/personalizacion/cotizar')
      .send({ nombre: 'Diseño Guest', modelo: 'taza', items: [{ nombre: 'A' }] });

    expect(res.status).toBe(401);
  });

  test('cliente puede registrarse, cotizar y ver sus cotizaciones', async () => {
    // registrar cliente
    const email = `cliente_test_${Date.now()}@example.com`;
    const register = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'ClienteTest', apellido: 'Prueba', email, password: 'test1234' });

    expect(register.status).toBe(201);
    clientToken = register.body?.data?.token;
    expect(clientToken).toBeTruthy();

    // obtener usuario creado
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${clientToken}`);
    expect(me.status).toBe(200);
    clientUser = me.body?.data?.usuario;

    // cotizar
    const cotRes = await request(app)
      .post('/api/personalizacion/cotizar')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ nombre: 'Mi Diseño', modelo: 'taza', disenos: [{ nombre: 'D1' }] });

    expect(cotRes.status).toBe(200);
    expect(cotRes.body.cotizacion).toBeTruthy();
    const cot = cotRes.body.cotizacion;
    expect(cot.usuarioId).toBe(clientUser.id);

    // listar mis cotizaciones
    const listRes = await request(app).get('/api/personalizacion/mis-cotizaciones').set('Authorization', `Bearer ${clientToken}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.cotizaciones)).toBe(true);
    const found = listRes.body.cotizaciones.find((c) => c.id === cot.id);
    expect(found).toBeTruthy();

    // obtener cotización por id (propietario)
    const getRes = await request(app).get(`/api/personalizacion/cotizaciones/${cot.id}`).set('Authorization', `Bearer ${clientToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.cotizacion.id).toBe(cot.id);
  });

  test('administrador puede ver y actualizar cotizaciones', async () => {
    // login admin (seeder crea admin@yesa.com / admin1234)
    const login = await request(app).post('/api/auth/login').send({ email: 'admin@yesa.com', password: 'admin1234' });
    expect(login.status).toBe(200);
    adminToken = login.body?.data?.token;
    expect(adminToken).toBeTruthy();

    // crear cotizacion por otro usuario para admin inspeccionar
    const otra = await Cotizacion.create({ nombre: 'Para admin', modelo: 'taza', precio: 0, estado: 'pendiente', items: [{ nombre: 'X' }], usuarioId: clientUser.id });

    const list = await request(app).get('/api/admin/cotizaciones').set('Authorization', `Bearer ${adminToken}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.cotizaciones)).toBe(true);
    const found = list.body.cotizaciones.find((c) => c.id === otra.id);
    expect(found).toBeTruthy();

    // actualizar cotizacion
    const upd = await request(app)
      .put(`/api/admin/cotizaciones/${otra.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ precio: 99999, estado: 'cotizado', notas: 'Asignado por admin' });

    expect(upd.status).toBe(200);
    const reloaded = await Cotizacion.findByPk(otra.id);
    expect(Number(reloaded.precio)).toBe(99999);
    expect(reloaded.estado).toBe('cotizado');
    expect(reloaded.notas).toBe('Asignado por admin');
  });
});
