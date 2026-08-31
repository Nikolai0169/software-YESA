/**
 * ============================================
 * ADMIN DASHBOARD PAGE - REDISEÑO ELEGANTE YESA
 * ============================================
 * Panel principal de administración con paleta Yesa.
 * Incluye todas las funcionalidades: KPIs, gráficos, actividad reciente,
 * acciones rápidas y vista general con sidebar de navegación.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Paleta de colores Yesa
const YESA_COLORS = {
  primary: '#7d2181',
  primaryDark: '#ff0080',
  primaryLight: '#c72f9f',
  secondary: '#ffd700',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: 'var(--dashboard-background)',
  surface: 'var(--dashboard-surface)',
  text: 'var(--dashboard-text)',
  textMuted: 'var(--dashboard-text-muted)',
  border: 'var(--dashboard-border)',
};

const AdminDashboardPage = () => {
  const { isAdmin, isAuxiliar, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    categorias: 0,
    subcategorias: 0,
    productos: 0,
    productosActivos: 0,
    stockBajo: 0,
    usuarios: 0,
    usuariosActivos: 0,
    pedidos: 0,
    pedidosPendientes: 0,
    pedidosPagados: 0,
    pedidosEnviados: 0,
    pedidosEntregados: 0,
    pedidosCancelados: 0,
    ventasTotales: 0,
    cotizaciones: 0,
    cotizacionesPendientes: 0,
    mensajesPendientes: 0,
  });

  const [ultimosPedidos, setUltimosPedidos] = useState([]);
  const [ultimosUsuarios, setUltimosUsuarios] = useState([]);
  const [ultimasCotizaciones, setUltimasCotizaciones] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const parseNumber = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    const s = String(v).trim();
    const cleaned = s.replace(/[^0-9.,-]/g, '');
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    try {
      if (lastComma > lastDot) {
        return Number.parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
      }
      return Number.parseFloat(cleaned.replace(/,/g, '')) || 0;
    } catch (e) {
      return 0;
    }
  };

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [categorias, subcategorias, productos, usuarios, pedidos, cotizaciones, contactos] = await Promise.all([
        api.get('/admin/categorias'),
        api.get('/admin/subcategorias'),
        api.get('/admin/productos?limite=1000'),
        api.get('/admin/usuarios'),
        api.get('/admin/pedidos?limite=10'),
        isAdmin ? api.get('/admin/cotizaciones').catch(() => ({ data: { cotizaciones: [] } })) : Promise.resolve({ data: { cotizaciones: [] } }),
        isAdmin ? api.get('/support/contactos').catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
      ]);

      const categoriasData = categorias.data?.data?.categorias || categorias.data?.categorias || categorias.data?.data || [];
      const subcategoriasData = subcategorias.data?.data?.subcategorias || subcategorias.data?.subcategorias || subcategorias.data?.data || [];
      const productosData = productos.data?.data?.productos || productos.data?.productos || productos.data?.data || [];
      const usuariosData = usuarios.data?.data?.usuarios || usuarios.data?.usuarios || [];
      const pedidosData = pedidos.data?.data?.pedidos || pedidos.data?.pedidos || [];
      const cotizacionesData = cotizaciones.data?.cotizaciones || cotizaciones.data?.data?.cotizaciones || cotizaciones.data?.data || [];
      const contactosData = contactos.data?.data || [];

      const pedidosArray = Array.isArray(pedidosData) ? pedidosData : [];
      const productosArray = Array.isArray(productosData) ? productosData : [];
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];

      const pedidosPendientes = pedidosArray.filter(p => p.estado === 'pendiente').length;
      const pedidosPagados = pedidosArray.filter(p => ['pagado', 'en_proceso'].includes(p.estado)).length;
      const pedidosEnviados = pedidosArray.filter(p => p.estado === 'enviado').length;
      const pedidosEntregados = pedidosArray.filter(p => p.estado === 'entregado').length;
      const pedidosCancelados = pedidosArray.filter(p => p.estado === 'cancelado').length;

      const ventasTotales = pedidosArray
        .filter(p => ['entregado', 'pagado', 'en_proceso'].includes(p.estado))
        .reduce((acc, p) => acc + parseNumber(p.total), 0);

      const ultimos = [...pedidosArray]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setUltimosPedidos(ultimos);

      const ultimosUsers = [...usuariosArray]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);
      setUltimosUsuarios(ultimosUsers);

      const ultimasCotiz = Array.isArray(cotizacionesData)
        ? [...cotizacionesData]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
        : [];
      setUltimasCotizaciones(ultimasCotiz);

      const mensajesPendientes = Array.isArray(contactosData)
        ? contactosData.filter(c => c.estado === 'pendiente').length
        : 0;

      const cotizacionesPendientes = Array.isArray(cotizacionesData)
        ? cotizacionesData.filter(c => c.estado === 'pendiente' || !c.precio).length
        : 0;

      setStats({
        categorias: Array.isArray(categoriasData) ? categoriasData.length : 0,
        subcategorias: Array.isArray(subcategoriasData) ? subcategoriasData.length : 0,
        productos: productosArray.length,
        productosActivos: productosArray.filter(p => p.activo).length,
        stockBajo: productosArray.filter(p => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length,
        usuarios: usuariosArray.length,
        usuariosActivos: usuariosArray.filter(u => u.activo).length,
        pedidos: pedidosArray.length,
        pedidosPendientes,
        pedidosPagados,
        pedidosEnviados,
        pedidosEntregados,
        pedidosCancelados,
        ventasTotales,
        cotizaciones: Array.isArray(cotizacionesData) ? cotizacionesData.length : 0,
        cotizacionesPendientes,
        mensajesPendientes,
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatearPrecio = (precio) => {
    const n = (precio === null || precio === undefined) ? 0 : Number(precio);
    const safe = Number.isNaN(n) ? 0 : n;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(safe);
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
      cancelado: 'danger',
      en_proceso: 'info'
    };
    return badges[estado] || 'secondary';
  };

  const obtenerColorEstado = (estado) => {
    const colors = {
      pendiente: '#f59e0b',
      pagado: '#06b6d4',
      enviado: '#3b82f6',
      entregado: '#10b981',
      cancelado: '#ef4444',
      en_proceso: '#06b6d4'
    };
    return colors[estado] || '#6b7280';
  };

  const pedidosPorEstado = [
    { label: 'Pendientes', value: stats.pedidosPendientes, color: '#f59e0b', icon: 'bi-clock-history' },
    { label: 'Pagados', value: stats.pedidosPagados, color: '#06b6d4', icon: 'bi-cash-coin' },
    { label: 'Enviados', value: stats.pedidosEnviados, color: '#3b82f6', icon: 'bi-truck' },
    { label: 'Entregados', value: stats.pedidosEntregados, color: '#10b981', icon: 'bi-check-circle' },
    { label: 'Cancelados', value: stats.pedidosCancelados, color: '#ef4444', icon: 'bi-x-circle' }
  ].filter(item => item.value > 0);

  const totalPedidos = stats.pedidos;
  const calcularPorcentaje = (valor) => totalPedidos ? (valor / totalPedidos) * 100 : 0;

  // Estilos en línea con la paleta Yesa
  const styles = {
    pageBackground: {
      background: `linear-gradient(135deg, ${YESA_COLORS.background} 0%, #ffffff 100%)`,
      minHeight: '100vh',
    },
    headerCard: {
      background: `linear-gradient(135deg, ${YESA_COLORS.primary} 0%, ${YESA_COLORS.primaryDark} 100%)`,
      color: '#fff',
      borderRadius: '20px',
      border: 'none',
      boxShadow: '0 10px 30px rgba(125, 33, 129, 0.25)',
    },
    kpiCard: {
      borderRadius: '18px',
      border: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      overflow: 'hidden',
      position: 'relative',
      background: '#fff',
    },
    kpiAccent: (color) => ({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '5px',
      height: '100%',
      background: color,
    }),
    iconCircle: (color) => ({
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color,
      fontSize: '24px',
    }),
    sectionCard: {
      borderRadius: '18px',
      border: 'none',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      background: '#fff',
    },
  };

  return (
    <div style={styles.pageBackground}>
      <Container className="py-4 dashboard-page">
        {/* Estilos CSS personalizados */}
        <style>{`
          .kpi-card-yesa:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.12) !important;
          }
          .yesa-gradient-text {
            background: linear-gradient(135deg, ${YESA_COLORS.primary} 0%, ${YESA_COLORS.primaryDark} 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 800;
          }
          .yesa-action-card {
            display: flex;
            align-items: center;
            padding: 14px 16px;
            border-radius: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s ease;
            height: 100%;
          }
          .yesa-action-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.08);
          }
          .activity-item {
            transition: all 0.2s ease;
            border-radius: 12px;
            padding: 12px;
          }
          .activity-item:hover {
            background: ${YESA_COLORS.background};
          }
        `}</style>

        {/* Encabezado principal */}
        <Card style={styles.headerCard} className="mb-4 dashboard-header-card">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex align-items-center mb-2">
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '18px',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '16px',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <i className="bi bi-shield-lock-fill" style={{ fontSize: '32px', color: '#fff' }}></i>
                  </div>
                  <div>
                    <h1 className="mb-1 fw-bold" style={{ fontSize: '28px' }}>
                      Bienvenido, {user?.nombre || 'Administrador'}
                    </h1>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <Badge bg="light" text="dark" className="px-3 py-2" style={{ fontWeight: 600 }}>
                        <i className={`bi ${isAdmin ? 'bi-person-badge-fill' : 'bi-person-workspace'} me-1`}></i>
                        {isAdmin ? 'Administrador' : isAuxiliar ? 'Auxiliar' : 'Usuario'}
                      </Badge>
                      <span style={{ opacity: 0.9, fontSize: '14px' }}>
                        <i className="bi bi-clock me-1"></i>
                        {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                <div className="d-flex flex-column align-items-md-end gap-2">
                  <Button
                    variant="light"
                    onClick={() => loadStats(true)}
                    disabled={refreshing}
                    style={{ borderRadius: '12px', fontWeight: 600, padding: '10px 20px' }}
                  >
                    {refreshing ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Actualizando...</>
                    ) : (
                      <><i className="bi bi-arrow-clockwise me-2"></i>Actualizar datos</>
                    )}
                  </Button>
                  <small style={{ opacity: 0.85 }}>
                    <i className="bi bi-shield-check me-1"></i>
                    Última actualización: {lastUpdate.toLocaleTimeString('es-CO')}
                  </small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tarjetas de KPIs principales */}
        <Row className="g-4 mb-4">
          <Col xl={3} lg={6} md={6}>
            <Card
              style={styles.kpiCard}
              className="kpi-card-yesa h-100"
              onClick={() => navigate('/admin/productos')}
            >
              <div style={styles.kpiAccent(YESA_COLORS.primary)}></div>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Productos
                    </p>
                    <h2 className="mb-0 fw-bold" style={{ color: YESA_COLORS.text, fontSize: '32px' }}>
                      {stats.productos}
                    </h2>
                  </div>
                  <div style={styles.iconCircle(YESA_COLORS.primary)}>
                    <i className="bi bi-box-seam-fill"></i>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-check-circle text-success me-1"></i>
                    {stats.productosActivos} activos
                  </small>
                  {stats.stockBajo > 0 && (
                    <Badge bg="warning" text="dark" className="px-2 py-1">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {stats.stockBajo} stock bajo
                    </Badge>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6}>
            <Card
              style={styles.kpiCard}
              className="kpi-card-yesa h-100"
              onClick={() => navigate('/admin/pedidos')}
            >
              <div style={styles.kpiAccent(YESA_COLORS.success)}></div>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Pedidos
                    </p>
                    <h2 className="mb-0 fw-bold" style={{ color: YESA_COLORS.text, fontSize: '32px' }}>
                      {stats.pedidos}
                    </h2>
                  </div>
                  <div style={styles.iconCircle(YESA_COLORS.success)}>
                    <i className="bi bi-cart-check-fill"></i>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-clock-history text-warning me-1"></i>
                    {stats.pedidosPendientes} pendientes
                  </small>
                  <Badge bg="success" className="px-2 py-1">
                    Ver
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6}>
            <Card
              style={styles.kpiCard}
              className="kpi-card-yesa h-100"
              onClick={() => isAdmin && navigate('/admin/usuarios')}
            >
              <div style={styles.kpiAccent(YESA_COLORS.warning)}></div>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Usuarios
                    </p>
                    <h2 className="mb-0 fw-bold" style={{ color: YESA_COLORS.text, fontSize: '32px' }}>
                      {stats.usuarios}
                    </h2>
                  </div>
                  <div style={styles.iconCircle(YESA_COLORS.warning)}>
                    <i className="bi bi-people-fill"></i>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-person-check text-success me-1"></i>
                    {stats.usuariosActivos} activos
                  </small>
                  {isAdmin ? (
                    <Badge bg="warning" text="dark" className="px-2 py-1">Gestionar</Badge>
                  ) : (
                    <Badge bg="secondary" className="px-2 py-1">Solo admin</Badge>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={3} lg={6} md={6}>
            <Card
              style={styles.kpiCard}
              className="kpi-card-yesa h-100"
            >
              <div style={styles.kpiAccent(YESA_COLORS.secondary)}></div>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-muted mb-1" style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Ventas Totales
                    </p>
                    <h2 className="mb-0 fw-bold yesa-gradient-text" style={{ fontSize: '24px' }}>
                      {formatearPrecio(stats.ventasTotales)}
                    </h2>
                  </div>
                  <div style={{ ...styles.iconCircle(YESA_COLORS.secondary), background: `${YESA_COLORS.secondary}30` }}>
                    <i className="bi bi-currency-dollar" style={{ color: '#b8860b' }}></i>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-graph-up-arrow text-success me-1"></i>
                    Pedidos completados
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tarjetas de categorías y subcategorías */}
        <Row className="g-4 mb-4">
          <Col md={6} lg={3}>
            <Card
              style={styles.kpiCard}
              className="kpi-card-yesa h-100"
              onClick={() => navigate('/admin/categorias')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div style={{ ...styles.iconCircle('#8b5cf6'), marginRight: '16px' }}>
                    <i className="bi bi-folder-fill"></i>
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-muted mb-0" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                      Categorías
                    </p>
                    <h3 className="mb-0 fw-bold">{stats.categorias}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card
              style={styles.kpiCard}
              className="kpi-card-yesa h-100"
              onClick={() => navigate('/admin/subcategorias')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div style={{ ...styles.iconCircle('#06b6d4'), marginRight: '16px' }}>
                    <i className="bi bi-diagram-3-fill"></i>
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-muted mb-0" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                      Subcategorías
                    </p>
                    <h3 className="mb-0 fw-bold">{stats.subcategorias}</h3>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card
              style={styles.kpiCard}
              className="kpi-card-yesa h-100"
              onClick={() => isAdmin && navigate('/admin/cotizaciones')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div style={{ ...styles.iconCircle(YESA_COLORS.primaryLight), marginRight: '16px' }}>
                    <i className="bi bi-receipt-cutoff"></i>
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-muted mb-0" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                      Cotizaciones
                    </p>
                    <h3 className="mb-0 fw-bold">{stats.cotizaciones}</h3>
                    {stats.cotizacionesPendientes > 0 && (
                      <Badge bg="warning" text="dark" className="mt-1">
                        {stats.cotizacionesPendientes} pendientes
                      </Badge>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card
              style={styles.kpiCard}
              className="kpi-card-yesa h-100"
              onClick={() => isAdmin && navigate('/admin/soporte')}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div style={{ ...styles.iconCircle(YESA_COLORS.danger), marginRight: '16px' }}>
                    <i className="bi bi-chat-left-text-fill"></i>
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-muted mb-0" style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                      Soporte
                    </p>
                    <h3 className="mb-0 fw-bold">{stats.mensajesPendientes}</h3>
                    <small className="text-muted">Mensajes pendientes</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sección principal: distribución y actividad reciente */}
        <Row className="g-4 mb-4">
          <Col lg={5}>
            <Card style={styles.sectionCard} className="h-100">
              <Card.Header style={{
                background: 'transparent',
                borderBottom: `1px solid ${YESA_COLORS.border}`,
                padding: '20px 24px 16px',
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: YESA_COLORS.text }}>
                      <i className="bi bi-pie-chart-fill me-2" style={{ color: YESA_COLORS.primary }}></i>
                      Distribución de Pedidos
                    </h5>
                    <small className="text-muted">Resumen de estados</small>
                  </div>
                  <Badge bg="light" text="dark" className="px-3 py-2 fw-bold">
                    {totalPedidos} total
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                {totalPedidos === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '48px', color: YESA_COLORS.textMuted }}></i>
                    <p className="text-muted mt-3 mb-0">No hay pedidos aún</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {pedidosPorEstado.map((item, idx) => (
                      <div key={idx}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center">
                            <i className={`bi ${item.icon} me-2`} style={{ color: item.color }}></i>
                            <span className="fw-semibold">{item.label}</span>
                          </div>
                          <div>
                            <span className="fw-bold me-2" style={{ color: item.color }}>{item.value}</span>
                            <small className="text-muted">({calcularPorcentaje(item.value).toFixed(1)}%)</small>
                          </div>
                        </div>
                        <div
                          style={{
                            height: '10px',
                            borderRadius: '6px',
                            backgroundColor: `${item.color}15`,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${calcularPorcentaje(item.value)}%`,
                              backgroundColor: item.color,
                              borderRadius: '6px',
                              height: '100%',
                              transition: 'width 0.6s ease',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <Card style={styles.sectionCard} className="h-100">
              <Card.Header style={{
                background: 'transparent',
                borderBottom: `1px solid ${YESA_COLORS.border}`,
                padding: '20px 24px 16px',
              }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold" style={{ color: YESA_COLORS.text }}>
                      <i className="bi bi-clock-history me-2" style={{ color: YESA_COLORS.primary }}></i>
                      Actividad Reciente
                    </h5>
                    <small className="text-muted">Últimos pedidos en el sistema</small>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate('/admin/pedidos')}
                    style={{ color: YESA_COLORS.primary, textDecoration: 'none', fontWeight: 600 }}
                  >
                    Ver todos <i className="bi bi-arrow-right ms-1"></i>
                  </Button>
                </div>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                {ultimosPedidos.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '48px', color: YESA_COLORS.textMuted }}></i>
                    <p className="text-muted mt-3 mb-0">No hay actividad reciente</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {ultimosPedidos.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="activity-item d-flex justify-content-between align-items-center"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              background: `${obtenerColorEstado(pedido.estado)}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: obtenerColorEstado(pedido.estado),
                            }}
                          >
                            <i className="bi bi-receipt"></i>
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="fw-bold" style={{ color: YESA_COLORS.text }}>
                                Pedido #{pedido.id}
                              </span>
                              <Badge
                                bg={obtenerBadgeEstado(pedido.estado)}
                                className="text-capitalize"
                                style={{ fontSize: '10px' }}
                              >
                                {pedido.estado}
                              </Badge>
                            </div>
                            <small className="text-muted">
                              <i className="bi bi-person me-1"></i>
                              {pedido.usuario?.nombre || 'Cliente'} • {formatearFecha(pedido.createdAt)}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold yesa-gradient-text">{formatearPrecio(pedido.total)}</div>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0"
                            onClick={() => navigate('/admin/pedidos')}
                            style={{ color: YESA_COLORS.primary, textDecoration: 'none', fontSize: '12px' }}
                          >
                            Ver detalle <i className="bi bi-arrow-right"></i>
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

        {/* Sección: Acciones rápidas y atajos */}
        <Row className="g-4 mb-4">
          <Col lg={12}>
            <Card style={styles.sectionCard}>
              <Card.Header style={{
                background: `linear-gradient(135deg, ${YESA_COLORS.primary} 0%, ${YESA_COLORS.primaryDark} 100%)`,
                color: '#fff',
                border: 'none',
                borderRadius: '18px 18px 0 0',
                padding: '20px 24px',
              }}>
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-lightning-charge-fill me-2"></i>
                  Acciones Rápidas
                </h5>
                <small style={{ opacity: 0.9 }}>Accede a las funciones más usadas del panel</small>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col md={6} lg={3}>
                    <div
                      className="yesa-action-card"
                      onClick={() => navigate('/admin/productos')}
                      style={{
                        background: `${YESA_COLORS.primary}08`,
                        border: `1px solid ${YESA_COLORS.primary}30`,
                        color: YESA_COLORS.text,
                      }}
                    >
                      <i className="bi bi-plus-circle-fill me-2" style={{ color: YESA_COLORS.primary, fontSize: '20px' }}></i>
                      <span>Nuevo Producto</span>
                    </div>
                  </Col>
                  <Col md={6} lg={3}>
                    <div
                      className="yesa-action-card"
                      onClick={() => navigate('/admin/categorias')}
                      style={{
                        background: `${YESA_COLORS.success}08`,
                        border: `1px solid ${YESA_COLORS.success}30`,
                        color: YESA_COLORS.text,
                      }}
                    >
                      <i className="bi bi-folder-plus me-2" style={{ color: YESA_COLORS.success, fontSize: '20px' }}></i>
                      <span>Nueva Categoría</span>
                    </div>
                  </Col>
                  <Col md={6} lg={3}>
                    <div
                      className="yesa-action-card"
                      onClick={() => navigate('/admin/subcategorias')}
                      style={{
                        background: '#06b6d408',
                        border: '1px solid #06b6d430',
                        color: YESA_COLORS.text,
                      }}
                    >
                      <i className="bi bi-diagram-3 me-2" style={{ color: '#06b6d4', fontSize: '20px' }}></i>
                      <span>Subcategorías</span>
                    </div>
                  </Col>
                  <Col md={6} lg={3}>
                    <div
                      className="yesa-action-card"
                      onClick={() => navigate('/admin/pedidos')}
                      style={{
                        background: `${YESA_COLORS.warning}08`,
                        border: `1px solid ${YESA_COLORS.warning}30`,
                        color: YESA_COLORS.text,
                      }}
                    >
                      <i className="bi bi-truck me-2" style={{ color: YESA_COLORS.warning, fontSize: '20px' }}></i>
                      <span>Gestionar Pedidos</span>
                    </div>
                  </Col>

                  {isAdmin && (
                    <>
                      <Col md={6} lg={3}>
                        <div
                          className="yesa-action-card"
                          onClick={() => navigate('/admin/usuarios')}
                          style={{
                            background: `${YESA_COLORS.primaryDark}08`,
                            border: `1px solid ${YESA_COLORS.primaryDark}30`,
                            color: YESA_COLORS.text,
                          }}
                        >
                          <i className="bi bi-person-plus-fill me-2" style={{ color: YESA_COLORS.primaryDark, fontSize: '20px' }}></i>
                          <span>Nuevo Usuario</span>
                        </div>
                      </Col>
                      <Col md={6} lg={3}>
                        <div
                          className="yesa-action-card"
                          onClick={() => navigate('/admin/cotizaciones')}
                          style={{
                            background: `${YESA_COLORS.primaryLight}08`,
                            border: `1px solid ${YESA_COLORS.primaryLight}30`,
                            color: YESA_COLORS.text,
                          }}
                        >
                          <i className="bi bi-receipt-cutoff me-2" style={{ color: YESA_COLORS.primaryLight, fontSize: '20px' }}></i>
                          <span>Cotizaciones</span>
                        </div>
                      </Col>
                      <Col md={6} lg={3}>
                        <div
                          className="yesa-action-card"
                          onClick={() => navigate('/admin/soporte')}
                          style={{
                            background: `${YESA_COLORS.danger}08`,
                            border: `1px solid ${YESA_COLORS.danger}30`,
                            color: YESA_COLORS.text,
                          }}
                        >
                          <i className="bi bi-chat-left-text-fill me-2" style={{ color: YESA_COLORS.danger, fontSize: '20px' }}></i>
                          <span>Gestionar Soporte</span>
                        </div>
                      </Col>
                      <Col md={6} lg={3}>
                        <div
                          className="yesa-action-card"
                          onClick={() => navigate('/catalogo')}
                          style={{
                            background: '#6b728008',
                            border: '1px solid #6b728030',
                            color: YESA_COLORS.text,
                          }}
                        >
                          <i className="bi bi-shop me-2" style={{ color: '#6b7280', fontSize: '20px' }}></i>
                          <span>Ver Tienda</span>
                        </div>
                      </Col>
                    </>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sección inferior: últimos usuarios y cotizaciones (solo admin) */}
        {isAdmin && (
          <Row className="g-4 mb-4">
            <Col lg={6}>
              <Card style={styles.sectionCard}>
                <Card.Header style={{
                  background: 'transparent',
                  borderBottom: `1px solid ${YESA_COLORS.border}`,
                  padding: '20px 24px 16px',
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0 fw-bold" style={{ color: YESA_COLORS.text }}>
                        <i className="bi bi-person-plus-fill me-2" style={{ color: YESA_COLORS.primary }}></i>
                        Últimos Usuarios
                      </h5>
                      <small className="text-muted">Registros recientes en la plataforma</small>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate('/admin/usuarios')}
                      style={{ color: YESA_COLORS.primary, textDecoration: 'none', fontWeight: 600 }}
                    >
                      Ver todos
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  {ultimosUsuarios.length === 0 ? (
                    <p className="text-muted text-center py-4 mb-0">No hay usuarios recientes</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {ultimosUsuarios.map((u) => (
                        <div
                          key={u.id}
                          className="activity-item d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${YESA_COLORS.primary} 0%, ${YESA_COLORS.primaryDark} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 'bold',
                              }}
                            >
                              {(u.nombre || u.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ color: YESA_COLORS.text }}>{u.nombre || 'Sin nombre'}</div>
                              <small className="text-muted">{u.email}</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <Badge bg={u.activo ? 'success' : 'secondary'} className="mb-1">
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <div>
                              <Badge bg="light" text="dark" className="text-capitalize">
                                {u.rol || 'cliente'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card style={styles.sectionCard}>
                <Card.Header style={{
                  background: 'transparent',
                  borderBottom: `1px solid ${YESA_COLORS.border}`,
                  padding: '20px 24px 16px',
                }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0 fw-bold" style={{ color: YESA_COLORS.text }}>
                        <i className="bi bi-receipt-cutoff me-2" style={{ color: YESA_COLORS.primary }}></i>
                        Cotizaciones Recientes
                      </h5>
                      <small className="text-muted">Solicitudes recientes de cotización</small>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate('/admin/cotizaciones')}
                      style={{ color: YESA_COLORS.primary, textDecoration: 'none', fontWeight: 600 }}
                    >
                      Ver todas
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  {ultimasCotizaciones.length === 0 ? (
                    <p className="text-muted text-center py-4 mb-0">No hay cotizaciones recientes</p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {ultimasCotizaciones.map((c) => (
                        <div
                          key={c.id}
                          className="activity-item d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-3">
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                background: `${YESA_COLORS.primaryLight}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: YESA_COLORS.primaryLight,
                              }}
                            >
                              <i className="bi bi-palette-fill"></i>
                            </div>
                            <div>
                              <div className="fw-semibold" style={{ color: YESA_COLORS.text }}>
                                {c.nombre || `Cotización #${c.id}`}
                              </div>
                              <small className="text-muted">
                                {c.usuario?.nombre || c.usuario?.email || 'Anónimo'}
                              </small>
                            </div>
                          </div>
                          <div className="text-end">
                            <Badge bg={c.estado === 'aceptado' ? 'success' : c.estado === 'pendiente' ? 'warning' : 'info'} className="text-capitalize">
                              {c.estado || 'pendiente'}
                            </Badge>
                            <div>
                              <small className="text-muted">{formatearFecha(c.createdAt)}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Footer */}
        <div className="text-center text-muted py-4 mt-3" style={{ borderTop: `1px solid ${YESA_COLORS.border}` }}>
          <small>
            <i className="bi bi-shield-check me-1" style={{ color: YESA_COLORS.primary }}></i>
            <strong style={{ color: YESA_COLORS.primary }}>Panel de Administración YESA</strong> • Sistema interno de gestión
            <span className="mx-2">•</span>
            <i className="bi bi-clock me-1"></i>
            Última sincronización: {lastUpdate.toLocaleString('es-CO')}
          </small>
        </div>
      </Container>
    </div>
  );
};

export default AdminDashboardPage;
