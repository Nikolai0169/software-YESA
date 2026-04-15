const baseUrl = 'http://localhost:5000';
const frontendUrl = 'http://localhost:3000';

const fetch = globalThis.fetch || require('node-fetch');

const log = console.log;
const error = console.error;

const request = async (url, options = {}) => {
  const res = await fetch(url, options);
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

  const frontend = await request(frontendUrl);
  log('FRONTEND', frontendUrl, 'status=', frontend.status);

  const adminLogin = await request(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@yesa.com', password: 'admin1234' }),
  });
  log('ADMIN LOGIN', 'status=', adminLogin.status, 'success=', adminLogin.body?.success);
  const adminToken = adminLogin.body?.data?.token;

  const authMe = await request(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  log('AUTH ME', 'status=', authMe.status, 'email=', authMe.body?.data?.usuario?.email);

  const catalog = await request(`${baseUrl}/api/catalogo/productos?categoriaId=1&pagina=1&limite=5`);
  log('CATALOG', 'status=', catalog.status, 'products=', Array.isArray(catalog.body?.data?.productos) ? catalog.body.data.productos.length : 0);

  const productoId = catalog.body?.data?.productos?.[0]?.id || 1;
  const productoDetalle = await request(`${baseUrl}/api/catalogo/productos/${productoId}`);
  log('PRODUCT DETAIL', 'status=', productoDetalle.status, 'id=', productoDetalle.body?.data?.producto?.id);

  const categorias = await request(`${baseUrl}/api/catalogo/categorias`);
  const categoriaId = categorias.body?.data?.categorias?.[0]?.id;
  log('CATEGORIES', 'status=', categorias.status, 'count=', Array.isArray(categorias.body?.data?.categorias) ? categorias.body.data.categorias.length : 0);

  if (categoriaId) {
    const subcategorias = await request(`${baseUrl}/api/catalogo/categorias/${categoriaId}/subcategorias`);
    log('SUBCATEGORIES', 'status=', subcategorias.status, 'count=', Array.isArray(subcategorias.body?.data?.subcategorias) ? subcategorias.body.data.subcategorias.length : 0);
  }

  const destacados = await request(`${baseUrl}/api/catalogo/destacados`);
  log('HIGHLIGHTED PRODUCTS', 'status=', destacados.status, 'count=', Array.isArray(destacados.body?.data?.productos) ? destacados.body.data.productos.length : 0);

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
  log('REGISTER USER', 'status=', register.status, 'success=', register.body?.success, 'email=', registerEmail);
  const newUserToken = register.body?.data?.token;

  if (newUserToken) {
    const updateProfile = await request(`${baseUrl}/api/auth/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${newUserToken}` },
      body: JSON.stringify({
        nombre: 'María',
        apellido: 'García Prueba',
        telefono: '3009876543',
        direccion: 'Nueva Dirección 456',
      }),
    });
    log('UPDATE PROFILE', 'status=', updateProfile.status, 'success=', updateProfile.body?.success);
  }

  const clientLogin = await request(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cliente1@yesa.com', password: 'cliente1' }),
  });
  log('CLIENT LOGIN', 'status=', clientLogin.status, 'success=', clientLogin.body?.success);
  const clientToken = clientLogin.body?.data?.token;

  const cartAdd = await request(`${baseUrl}/api/cliente/carrito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
    body: JSON.stringify({ productoId, cantidad: 1 }),
  });
  log('CART ADD', 'status=', cartAdd.status, 'success=', cartAdd.body?.success);

  const cartGet = await request(`${baseUrl}/api/cliente/carrito`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const cartItems = Array.isArray(cartGet.body?.data?.carrito) ? cartGet.body.data.carrito : [];
  log('CART GET', 'status=', cartGet.status, 'items=', cartItems.length);

  if (cartItems.length > 0) {
    const itemId = cartItems[0].id;
    const cartUpdate = await request(`${baseUrl}/api/cliente/carrito/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
      body: JSON.stringify({ cantidad: 2 }),
    });
    log('CART UPDATE', 'status=', cartUpdate.status, 'success=', cartUpdate.body?.success);

    const cartDelete = await request(`${baseUrl}/api/cliente/carrito/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    log('CART DELETE ITEM', 'status=', cartDelete.status, 'success=', cartDelete.body?.success);
  }

  const order = await request(`${baseUrl}/api/cliente/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientToken}` },
    body: JSON.stringify({ direccionEnvio: 'Calle Prueba 123', telefono: '3001112233', notas: 'Pedido de prueba' }),
  });
  log('ORDER POST', 'status=', order.status, 'success=', order.body?.success);
  const orderId = order.body?.data?.pedido?.id || order.body?.data?.id;

  const ordersGet = await request(`${baseUrl}/api/cliente/pedidos`, {
    headers: { Authorization: `Bearer ${clientToken}` },
  });
  const orders = Array.isArray(ordersGet.body?.data?.pedidos) ? ordersGet.body.data.pedidos : [];
  log('ORDERS GET', 'status=', ordersGet.status, 'orders=', orders.length);

  if (orderId) {
    const orderDetail = await request(`${baseUrl}/api/cliente/pedidos/${orderId}`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    log('ORDER DETAIL', 'status=', orderDetail.status, 'id=', orderDetail.body?.data?.pedido?.id);

    const orderCancel = await request(`${baseUrl}/api/cliente/pedidos/${orderId}/cancelar`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    log('ORDER CANCEL', 'status=', orderCancel.status, 'success=', orderCancel.body?.success);
  }

  log('=== AUDITORÍA COMPLETA ===');
};

main().catch((err) => {
  error('ERROR DURANTE AUDITORÍA', err);
  process.exit(1);
});
