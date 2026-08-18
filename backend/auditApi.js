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

  await request(frontendUrl);

  const adminLogin = await request(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@yesa.com', password: 'admin1234' }),
  });
  const adminToken = adminLogin.body?.data?.token;

  await request(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  const catalog = await request(`${baseUrl}/api/catalogo/productos?categoriaId=1&pagina=1&limite=5`);

  const productoId = catalog.body?.data?.productos?.[0]?.id || 1;
  await request(`${baseUrl}/api/catalogo/productos/${productoId}`);

  const categorias = await request(`${baseUrl}/api/catalogo/categorias`);
  const categoriaId = categorias.body?.data?.categorias?.[0]?.id;

  if (categoriaId) {
    await request(`${baseUrl}/api/catalogo/categorias/${categoriaId}/subcategorias`);
  }

  await request(`${baseUrl}/api/catalogo/destacados`);

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
  }

  const clientLogin = await request(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cliente1@yesa.com', password: 'cliente1' }),
  });
  const clientToken = clientLogin.body?.data?.token;

  await request(`${baseUrl}/api/cliente/carrito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
    body: JSON.stringify({ productoId, cantidad: 1 }),
  });

  const cartGet = await request(`${baseUrl}/api/cliente/carrito`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const cartItems = Array.isArray(cartGet.body?.data?.carrito) ? cartGet.body.data.carrito : [];

  if (cartItems.length > 0) {
    const itemId = cartItems[0].id;
    await request(`${baseUrl}/api/cliente/carrito/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ cantidad: 2 }),
    });

    await request(`${baseUrl}/api/cliente/carrito/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${clientToken}` },
    });
  }

  const order = await request(`${baseUrl}/api/cliente/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
    body: JSON.stringify({ direccionEnvio: 'Calle Prueba 123', telefono: '3001112233', notas: 'Pedido de prueba' }),
  });
  const orderId = order.body?.data?.pedido?.id || order.body?.data?.id;

  await request(`${baseUrl}/api/cliente/pedidos`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });

  if (orderId) {
    await request(`${baseUrl}/api/cliente/pedidos/${orderId}`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });

    await request(`${baseUrl}/api/cliente/pedidos/${orderId}/cancelar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
    });
  }

};

main().catch(() => {
  process.exit(1);
});
