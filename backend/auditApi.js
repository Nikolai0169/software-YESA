const baseUrl = 'http://localhost:5000';
const frontendUrl = 'http://localhost:3000';

const fetch = globalThis.fetch || require('node-fetch');
const allowedRequestOrigins = new Set([
  new URL(baseUrl).origin,
  new URL(frontendUrl).origin,
]);

const validateRequestUrl = (value) => {
  const rawPath = String(value).split(/[?#]/, 1)[0];
  const requestUrl = new URL(value);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const hasTraversal = /(?:^|\/)(?:\.\.|%2e%2e)(?:\/|$)/i.test(rawPath)
    || decodedPath.split('/').includes('..');

  if (!allowedRequestOrigins.has(requestUrl.origin) || hasTraversal) {
    throw new Error('URL de auditoría no permitida');
  }

  return requestUrl;
};

const sanitizeLogValue = (value) => {
  const text = value instanceof Error ? value.message : String(value);
  return text.replace(/[\r\n]/g, ' ');
};

const log = (...args) => {
  process.stdout.write(`${args.map(sanitizeLogValue).join(' ')}\n`);
};

const error = (...args) => {
  process.stderr.write(`${args.map(sanitizeLogValue).join(' ')}\n`);
};

const request = async (url, options = {}) => {
  const requestUrl = validateRequestUrl(url);
  const res = await fetch(requestUrl, options);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
};

const main = async () => {
  log('=== AUDITORÍA DE CONEXIÓN ===');

  await request(frontendUrl);
  log('FRONTEND CHECK COMPLETED');

  const adminLogin = await request(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@yesa.com', password: 'admin1234' }),
  });
  log('ADMIN LOGIN CHECK COMPLETED');
  const adminToken = adminLogin.body?.data?.token;

  await request(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  log('AUTH ME CHECK COMPLETED');

  const catalog = await request(`${baseUrl}/api/catalogo/productos?categoriaId=1&pagina=1&limite=5`);
  log('CATALOG CHECK COMPLETED');

  const productoId = catalog.body?.data?.productos?.[0]?.id || 1;
  await request(`${baseUrl}/api/catalogo/productos/${productoId}`);
  log('PRODUCT DETAIL CHECK COMPLETED');

  const categorias = await request(`${baseUrl}/api/catalogo/categorias`);
  const categoriaId = categorias.body?.data?.categorias?.[0]?.id;
  log('CATEGORIES CHECK COMPLETED');

  if (categoriaId) {
    await request(`${baseUrl}/api/catalogo/categorias/${categoriaId}/subcategorias`);
    log('SUBCATEGORIES CHECK COMPLETED');
  }

  await request(`${baseUrl}/api/catalogo/destacados`);
  log('HIGHLIGHTED PRODUCTS CHECK COMPLETED');

  const registerEmail = `maria.garcia.${Date.now()}@yesa.com`;
  const register = await request(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'María',
      apellido: 'García',
      email: registerEmail,
      password: 'password123',
      telefono: '3001234567',
      direccion: 'Calle 123 #45-67',
    }),
  });
  log('REGISTER USER CHECK COMPLETED');
  const newUserToken = register.body?.data?.token;

  if (newUserToken) {
    await request(`${baseUrl}/api/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newUserToken}` },
      body: JSON.stringify({
        nombre: 'María',
        apellido: 'García Prueba',
        telefono: '3009876543',
        direccion: 'Nueva Dirección 456',
      }),
    });
    log('UPDATE PROFILE CHECK COMPLETED');
  }

  const clientLogin = await request(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cliente1@yesa.com', password: 'cliente1' }),
  });
  log('CLIENT LOGIN CHECK COMPLETED');
  const clientToken = clientLogin.body?.data?.token;

  await request(`${baseUrl}/api/cliente/carrito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
    body: JSON.stringify({ productoId, cantidad: 1 }),
  });
  log('CART ADD CHECK COMPLETED');

  const cartGet = await request(`${baseUrl}/api/cliente/carrito`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const cartItems = Array.isArray(cartGet.body?.data?.carrito) ? cartGet.body.data.carrito : [];
  log('CART GET CHECK COMPLETED');

  if (cartItems.length > 0) {
    const itemId = cartItems[0].id;
    await request(`${baseUrl}/api/cliente/carrito/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ cantidad: 2 }),
    });
    log('CART UPDATE CHECK COMPLETED');

    await request(`${baseUrl}/api/cliente/carrito/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    log('CART DELETE ITEM CHECK COMPLETED');
  }

  const order = await request(`${baseUrl}/api/cliente/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
    body: JSON.stringify({ direccionEnvio: 'Calle Prueba 123', telefono: '3001112233', notas: 'Pedido de prueba' }),
  });
  log('ORDER POST CHECK COMPLETED');
  const orderId = order.body?.data?.pedido?.id || order.body?.data?.id;

  await request(`${baseUrl}/api/cliente/pedidos`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  log('ORDERS GET CHECK COMPLETED');

  if (orderId) {
    await request(`${baseUrl}/api/cliente/pedidos/${orderId}`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    log('ORDER DETAIL CHECK COMPLETED');

    await request(`${baseUrl}/api/cliente/pedidos/${orderId}/cancelar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    log('ORDER CANCEL CHECK COMPLETED');
  }

  log('=== AUDITORÍA COMPLETA ===');
};

main().catch((err) => {
  error('ERROR DURANTE AUDITORÍA', err);
  process.exit(1);
});
