/**
 * Admin service centraliza las llamadas a los endpoints de administrador.
 * Incluye categorías, subcategorías, productos, usuarios y pedidos.
 */

import api from '../api/apiClient';

const normalizeList = (response, fallback = []) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.categorias)) return data.data.categorias;
  if (Array.isArray(data?.data?.subcategorias)) return data.data.subcategorias;
  if (Array.isArray(data?.data?.productos)) return data.data.productos;
  if (Array.isArray(data?.data?.usuarios)) return data.data.usuarios;
  if (Array.isArray(data?.data?.pedidos)) return data.data.pedidos;
  return fallback;
};

const normalizeItem = (response) => response?.data?.data || response?.data || null;

export async function getCategorias() {
  const res = await api.get('/admin/categorias');
  return normalizeList(res);
}

export async function createCategoria(data) {
  const res = await api.post('/admin/categorias', data);
  return normalizeItem(res);
}

export async function updateCategoria(id, data) {
  const res = await api.put(`/admin/categorias/${id}`, data);
  return normalizeItem(res);
}

export async function toggleCategoria(id) {
  const res = await api.patch(`/admin/categorias/${id}/toggle`);
  return normalizeItem(res);
}

export async function getSubcategorias() {
  const res = await api.get('/admin/subcategorias');
  return normalizeList(res);
}

export async function createSubcategoria(data) {
  const res = await api.post('/admin/subcategorias', data);
  return normalizeItem(res);
}

export async function updateSubcategoria(id, data) {
  const res = await api.put(`/admin/subcategorias/${id}`, data);
  return normalizeItem(res);
}

export async function toggleSubcategoria(id) {
  const res = await api.patch(`/admin/subcategorias/${id}/toggle`);
  return normalizeItem(res);
}

export async function getProductos(params) {
  const res = await api.get('/admin/productos', { params });
  return normalizeList(res);
}

export async function getProducto(id) {
  const res = await api.get(`/admin/productos/${id}`);
  return normalizeItem(res);
}

export async function createProduct(data) {
  const res = await api.post('/admin/productos', data);
  return normalizeItem(res);
}

export async function updateProduct(id, data) {
  const res = await api.put(`/admin/productos/${id}`, data);
  return normalizeItem(res);
}

export async function deleteProduct(id) {
  const res = await api.delete(`/admin/productos/${id}`);
  return normalizeItem(res);
}

export async function toggleProduct(id) {
  const res = await api.patch(`/admin/productos/${id}/toggle`);
  return normalizeItem(res);
}

export async function getUsuarios() {
  const res = await api.get('/admin/usuarios');
  return normalizeList(res);
}

export async function getUsuario(id) {
  const res = await api.get(`/admin/usuarios/${id}`);
  return normalizeItem(res);
}

export async function updateUsuario(id, data) {
  const res = await api.put(`/admin/usuarios/${id}`, data);
  return normalizeItem(res);
}

export async function toggleUsuario(id) {
  const res = await api.patch(`/admin/usuarios/${id}/toggle`);
  return normalizeItem(res);
}

export async function deleteUsuario(id) {
  const res = await api.delete(`/admin/usuarios/${id}`);
  return normalizeItem(res);
}

export async function getPedidos(params) {
  const res = await api.get('/admin/pedidos', { params });
  return normalizeList(res);
}

export async function getPedido(id) {
  const res = await api.get(`/admin/pedidos/${id}`);
  return res?.data?.data?.pedido || res?.data?.pedido || normalizeItem(res);
}

export async function updatePedidoEstado(id, estado) {
  const res = await api.put(`/admin/pedidos/${id}/estado`, { estado });
  return normalizeItem(res);
}

export async function activarProducto(id) {
  const res = await api.patch(`/admin/productos/${id}/toggle`);
  return normalizeItem(res);
}

export async function desactivarProducto(id) {
  const res = await api.patch(`/admin/productos/${id}/toggle`);
  return normalizeItem(res);
}