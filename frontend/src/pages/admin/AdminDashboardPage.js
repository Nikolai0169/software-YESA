/**
 * ============================================
 * ADMIN DASHBOARD PAGE - REDISEÑO MODERNO
 * ============================================
 * Panel principal de administración con estadísticas visuales.
 * Todas las acciones rápidas redirigen a las páginas de listado existentes.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminDashboardPage = () => {
  const { isAdmin, isAuxiliar } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    categorias: 0,
    subcategorias: 0,
    productos: 0,
    usuarios: 0,
    pedidos: 0,
    pedidosPendientes: 0,
    pedidosPagados: 0,
    pedidosEnviados: 0,
    pedidosEntregados: 0,
    pedidosCancelados: 0,
    ventasTotales: 0,
  });

  const [ultimosPedidos, setUltimosPedidos] = useState([]);

  const loadStats = useCallback(async () => {
    try {
      const [categorias, subcategorias, productos, usuarios, pedidos] = await Promise.all([
        api.get('/admin/categorias'),
        api.get('/admin/subcategorias'),
        api.get('/admin/productos'),
        api.get('/admin/usuarios'),
        api.get('/admin/pedidos?limite=10')
      ]);

      const categoriasData = categorias.data?.data?.categorias || categorias.data?.categorias || categorias.data?.data || [];
      const subcategoriasData = subcategorias.data?.data?.subcategorias || subcategorias.data?.subcategorias || subcategorias.data?.data || [];
      const productosData = productos.data?.data?.productos || productos.data?.productos || productos.data?.data || [];
      const usuariosData = usuarios.data.data?.usuarios || usuarios.data.usuarios || [];
      const pedidosData = pedidos.data.data?.pedidos || pedidos.data.pedidos || [];

      const pedidosArray = Array.isArray(pedidosData) ? pedidosData : [];
      
      const pedidosPendientes = pedidosArray.filter(p => p.estado === 'pendiente').length;
      const pedidosPagados = pedidosArray.filter(p => p.estado === 'pagado').length;
      const pedidosEnviados = pedidosArray.filter(p => p.estado === 'enviado').length;
      const pedidosEntregados = pedidosArray.filter(p => p.estado === 'entregado').length;
      const pedidosCancelados = pedidosArray.filter(p => p.estado === 'cancelado').length;

      const ventasTotales = pedidosArray
        .filter(p => p.estado === 'entregado' || p.estado === 'pagado')
        .reduce((acc, p) => acc + (p.total || 0), 0);

      const ultimos = [...pedidosArray]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setUltimosPedidos(ultimos);

      setStats({
        categorias: Array.isArray(categoriasData) ? categoriasData.length : 0,
        subcategorias: Array.isArray(subcategoriasData) ? subcategoriasData.length : 0,
        productos: Array.isArray(productosData) ? productosData.length : 0,
        usuarios: usuariosData.length || 0,
        pedidos: pedidosArray.length,
        pedidosPendientes,
        pedidosPagados,
        pedidosEnviados,
        pedidosEntregados,
        pedidosCancelados,
        ventasTotales
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerBadgeEstado = (estado) => {
    const badges = {
      pendiente: 'warning',
      pagado: 'info',
      enviado: 'primary',
      entregado: 'success',
      cancelado: 'danger'
    };
    return badges[estado] || 'secondary';
  };

  const pedidosPorEstado = [
    { label: 'Pendientes', value: stats.pedidosPendientes, color: '#f59e0b' },
    { label: 'Pagados', value: stats.pedidosPagados, color: '#06b6d4' },
    { label: 'Enviados', value: stats.pedidosEnviados, color: '#3b82f6' },
    { label: 'Entregados', value: stats.pedidosEntregados, color: '#10b981' },
    { label: 'Cancelados', value: stats.pedidosCancelados, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const totalPedidos = stats.pedidos;
  const calcularPorcentaje = (valor) => totalPedidos ? (valor / totalPedidos) * 100 : 0;

  return (
    <Container className="py-4">
      {/* Encabezado */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h1 className="display-5 fw-bold mb-2">
              <i className="bi bi-grid-1x2-fill me-3 text-primary"></i>
              Panel de Control
            </h1>
            <p className="text-muted lead">
              Resumen general de tu negocio YESA
            </p>
          </div>
          <div>
            <Button variant="outline-secondary" onClick={() => navigate('/catalogo')}>
              <i className="bi bi-shop me-2"></i>Ver tienda
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjetas de KPIs */}
      <Row className="g-4 mb-5">
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Productos</h6>
                  <h2 className="mb-0 fw-bold">{stats.productos}</h2>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-box-seam fs-4 text-primary"></i>
                </div>
              </div>
              <div className="mt-3">
                <Button variant="link" className="p-0 text-decoration-none" onClick={() => navigate('/admin/productos')}>
                  Gestionar <i className="bi bi-arrow-right-short"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Pedidos</h6>
                  <h2 className="mb-0 fw-bold">{stats.pedidos}</h2>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-cart-check fs-4 text-success"></i>
                </div>
              </div>
              <div className="mt-3">
                <Button variant="link" className="p-0 text-decoration-none" onClick={() => navigate('/admin/pedidos')}>
                  Ver pedidos <i className="bi bi-arrow-right-short"></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Usuarios</h6>
                  <h2 className="mb-0 fw-bold">{stats.usuarios}</h2>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-people fs-4 text-info"></i>
                </div>
              </div>
              {isAdmin && (
                <div className="mt-3">
                  <Button variant="link" className="p-0 text-decoration-none" onClick={() => navigate('/admin/usuarios')}>
                    Administrar <i className="bi bi-arrow-right-short"></i>
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="text-muted mb-1">Ventas Totales</h6>
                  <h2 className="mb-0 fw-bold">{formatearPrecio(stats.ventasTotales)}</h2>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <i className="bi bi-currency-dollar fs-4 text-warning"></i>
                </div>
              </div>
              <div className="mt-3 text-muted small">
                <i className="bi bi-graph-up"></i> Pedidos completados
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfico de distribución y actividad reciente */}
      <Row className="g-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-pie-chart me-2"></i>
                Distribución de Pedidos
              </h5>
            </Card.Header>
            <Card.Body>
              {totalPedidos === 0 ? (
                <p className="text-muted text-center py-4">No hay pedidos aún</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {pedidosPorEstado.map((item, idx) => (
                    <div key={idx}>
                      <div className="d-flex justify-content-between mb-1">
                        <span>{item.label}</span>
                        <span className="fw-bold">{item.value}</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: `${calcularPorcentaje(item.value)}%`, backgroundColor: item.color }}
                          aria-valuenow={calcularPorcentaje(item.value)}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 text-center">
                    <Badge bg="light" text="dark" className="px-3 py-2">
                      Total pedidos: {totalPedidos}
                    </Badge>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-semibold">
                  <i className="bi bi-clock-history me-2"></i>
                  Actividad Reciente
                </h5>
                <Button variant="link" size="sm" onClick={() => navigate('/admin/pedidos')}>
                  Ver todos
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {ultimosPedidos.length === 0 ? (
                <p className="text-muted text-center py-4">No hay actividad reciente</p>
              ) : (
                <div className="list-group list-group-flush">
                  {ultimosPedidos.map((pedido) => (
                    <div key={pedido.id} className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <Badge bg={obtenerBadgeEstado(pedido.estado)}>
                            {pedido.estado}
                          </Badge>
                          <strong className="text-dark">Pedido #{pedido.id}</strong>
                        </div>
                        <small className="text-muted">
                          {pedido.Usuario?.nombre || 'Cliente'} • {formatearFecha(pedido.createdAt)}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatearPrecio(pedido.total)}</div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate('/admin/pedidos')}
                          className="mt-1"
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Acciones rápidas - TODAS LAS RUTAS CORREGIDAS */}
      <Row className="mt-5 g-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3 fw-semibold">
                <i className="bi bi-lightning-charge me-2"></i>
                Acciones Rápidas
              </h5>
              <div className="d-flex flex-wrap gap-3">
                <Button variant="outline-primary" onClick={() => navigate('/admin/productos')}>
                  <i className="bi bi-plus-circle me-2"></i>Nuevo Producto
                </Button>
                <Button variant="outline-success" onClick={() => navigate('/admin/categorias')}>
                  <i className="bi bi-plus-circle me-2"></i>Nueva Categoría
                </Button>
                <Button variant="outline-info" onClick={() => navigate('/admin/pedidos')}>
                  <i className="bi bi-truck me-2"></i>Gestionar Pedidos
                </Button>
                {isAdmin && (
                  <Button variant="outline-secondary" onClick={() => navigate('/admin/usuarios')}>
                    <i className="bi bi-person-plus me-2"></i>Nuevo Usuario
                  </Button>
                )}
                <Button variant="outline-warning" onClick={loadStats}>
                  <i className="bi bi-arrow-repeat me-2"></i>Refrescar Datos
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pie de página */}
      <footer className="text-center text-muted mt-5 pt-3 small border-top">
        <i className="bi bi-shield-check me-1"></i> Panel de Administración YESA • 
        Última actualización: {new Date().toLocaleString('es-CO')}
      </footer>
    </Container>
  );
};

export default AdminDashboardPage;