import React, { useEffect, useMemo, useState } from 'react';
import { Container, Card, Button, Row, Col, Badge, Spinner, Alert, Form, InputGroup, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerCotizaciones, actualizarCotizacion } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import SuccessBanner from '../../components/SuccessBanner';

const AdminCotizacionesPage = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [priceInputs, setPriceInputs] = useState({});
  const [savingPriceIds, setSavingPriceIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtros, setFiltros] = useState({ nombre: '', estado: 'todos', orden: 'fecha-desc' });
  const navigate = useNavigate();

  useEffect(() => {
    const loadCotizaciones = async () => {
      try {
        setLoading(true);
        const response = await obtenerCotizaciones();
        const lista = response.cotizaciones || [];
        setCotizaciones(lista);
        setPriceInputs(
          lista.reduce((acc, cotizacion) => {
            acc[cotizacion.id] = cotizacion.precio !== null && cotizacion.precio !== undefined
              ? String(cotizacion.precio)
              : '';
            return acc;
          }, {})
        );
      } catch (err) {
        console.error('Error cargando cotizaciones:', err);
        setError('No se pudieron cargar las cotizaciones. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadCotizaciones();
  }, []);

  const handleSavePrice = async (cotizacionId) => {
    setError(null);
    setSuccessMessage(null);
    const inputValue = priceInputs[cotizacionId];
    const precio = Number.parseFloat(inputValue);

    if (Number.isNaN(precio) || precio <= 0) {
      setError('Ingresa un precio válido mayor a 0.');
      return;
    }

    setSavingPriceIds((prev) => [...prev, cotizacionId]);

    try {
      const response = await actualizarCotizacion(cotizacionId, { precio, estado: 'cotizado' });
      setCotizaciones((prev) => prev.map((item) => (item.id === cotizacionId ? response.cotizacion : item)));
      setSuccessMessage('Precio guardado correctamente. El estado se actualizó a cotizado.');
    } catch (err) {
      console.error('Error guardando precio:', err);
      setError('No se pudo guardar el precio. Intenta nuevamente.');
    } finally {
      setSavingPriceIds((prev) => prev.filter((id) => id !== cotizacionId));
    }
  };

  const ITEMS_PER_PAGE = 6;
  const estadisticas = useMemo(() => ({
    total: cotizaciones.length,
    pendiente: cotizaciones.filter((cotizacion) => cotizacion.estado === 'pendiente').length,
    cotizado: cotizaciones.filter((cotizacion) => cotizacion.estado === 'cotizado').length,
    convertido: cotizaciones.filter((cotizacion) => ['convertida', 'convertido'].includes(cotizacion.estado)).length,
  }), [cotizaciones]);

  const cotizacionesFiltradas = useMemo(() => {
    const nombreBuscado = filtros.nombre.trim().toLowerCase();
    const resultado = cotizaciones.filter((cotizacion) => {
      const nombre = String(cotizacion.nombre || '').toLowerCase();
      const coincideNombre = !nombreBuscado || nombre.includes(nombreBuscado);
      const coincideEstado = filtros.estado === 'todos' || cotizacion.estado === filtros.estado;
      return coincideNombre && coincideEstado;
    });

    return resultado.sort((a, b) => {
      if (filtros.orden === 'nombre-asc' || filtros.orden === 'nombre-desc') {
        const comparacion = String(a.nombre || 'Cotización pendiente').localeCompare(
          String(b.nombre || 'Cotización pendiente'),
          'es',
          { sensitivity: 'base' }
        );
        return filtros.orden === 'nombre-asc' ? comparacion : -comparacion;
      }

      const fechaA = new Date(a.createdAt).getTime();
      const fechaB = new Date(b.createdAt).getTime();
      return filtros.orden === 'fecha-asc' ? fechaA - fechaB : fechaB - fechaA;
    });
  }, [cotizaciones, filtros]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtros]);

  const totalPages = Math.ceil(cotizacionesFiltradas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleCotizaciones = cotizacionesFiltradas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'cotizado':
        return 'info';
      case 'convertida':
      case 'convertido':
        return 'success';
      case 'aceptado':
        return 'success';
      case 'rechazado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="py-4 admin-management-page">
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <div>
          <h1 className="display-5 fw-bold mb-2">
            <i className="bi bi-receipt-cutoff me-3 text-success"></i>
            Cotizaciones
          </h1>
          <p className="text-muted lead mb-0">
            Gestión de presupuestos y revisión de cotizaciones generadas desde el módulo de personalización.
          </p>
        </div>
        <Button
          variant="outline-primary"
          onClick={() => navigate('/admin/dashboard')}
          aria-label="Volver al dashboard"
          title="Volver al dashboard"
        >
          <i className="bi bi-arrow-left" aria-hidden="true" />
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <h5 className="fw-semibold">Acceso exclusivo para administradores</h5>
          <p className="text-muted">
            Aquí puedes revisar los diseños por cotizar y ver los detalles de cada diseño.
          </p>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : cotizaciones.length === 0 ? (
            <Alert variant="secondary">
              No hay cotizaciones cargadas. Las solicitudes de cotización desde personalización y diseños guardados deberían aparecer aquí.
            </Alert>
          ) : (
            <>
              <Row className="mb-4 g-3">
                <Col xs={6} lg={3}>
                  <Card className="text-white bg-primary shadow-sm h-100">
                    <Card.Body>
                      <Card.Title>Total Cotizaciones</Card.Title>
                      <p className="display-6">{estadisticas.total}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6} lg={3}>
                  <Card className="text-white bg-warning shadow-sm h-100">
                    <Card.Body>
                      <Card.Title>Pendientes</Card.Title>
                      <p className="display-6">{estadisticas.pendiente}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6} lg={3}>
                  <Card className="text-white bg-info shadow-sm h-100">
                    <Card.Body>
                      <Card.Title>Cotizados</Card.Title>
                      <p className="display-6">{estadisticas.cotizado}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6} lg={3}>
                  <Card className="text-white bg-success shadow-sm h-100">
                    <Card.Body>
                      <Card.Title>Convertidos</Card.Title>
                      <p className="display-6">{estadisticas.convertido}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="border rounded p-3 mt-4 bg-light">
                <Row className="g-3 align-items-end">
                  <Col xs={12} md={5}>
                    <Form.Label htmlFor="filtro-nombre">Buscar por nombre</Form.Label>
                    <Form.Control
                      id="filtro-nombre"
                      type="search"
                      value={filtros.nombre}
                      onChange={(event) => setFiltros((prev) => ({ ...prev, nombre: event.target.value }))}
                      placeholder="Nombre de la cotización"
                    />
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Label htmlFor="filtro-estado">Estado</Form.Label>
                    <Form.Select
                      id="filtro-estado"
                      value={filtros.estado}
                      onChange={(event) => setFiltros((prev) => ({ ...prev, estado: event.target.value }))}
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="cotizado">Cotizado</option>
                      <option value="convertida">Convertido</option>
                      <option value="aceptado">Aceptado</option>
                      <option value="rechazado">Rechazado</option>
                    </Form.Select>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Label htmlFor="orden-cotizaciones">Ordenar por</Form.Label>
                    <Form.Select
                      id="orden-cotizaciones"
                      value={filtros.orden}
                      onChange={(event) => setFiltros((prev) => ({ ...prev, orden: event.target.value }))}
                    >
                      <option value="fecha-desc">Más recientes</option>
                      <option value="fecha-asc">Más antiguas</option>
                      <option value="nombre-asc">Nombre A-Z</option>
                      <option value="nombre-desc">Nombre Z-A</option>
                    </Form.Select>
                  </Col>
                </Row>
              </div>

              {cotizacionesFiltradas.length === 0 && (
                <Alert variant="secondary" className="mt-4">
                  No hay cotizaciones que coincidan con los filtros seleccionados.
                </Alert>
              )}

              <Row className="g-4 mt-4">
                {visibleCotizaciones.map((cotizacion) => (
                <Col key={cotizacion.id} xs={12} md={6} lg={4}>
                  <Card className="h-100 shadow-sm border border-2 border-dark">
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                        <div>
                          <Card.Title className="mb-1">{cotizacion.nombre || 'Cotización pendiente'}</Card.Title>
                          <Card.Subtitle className="text-muted">ID #{cotizacion.id}</Card.Subtitle>
                        </div>
                        <Badge bg={getEstadoBadge(cotizacion.estado)} className="text-capitalize">
                          {cotizacion.estado}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <span className="d-block text-muted small mb-1">Modelo</span>
                        <strong>{cotizacion.items?.length > 1 ? `${cotizacion.items.length} diseños` : cotizacion.modelo || 'N/A'}</strong>
                      </div>

                      <div className="mb-3">
                        <span className="d-block text-muted small mb-1">Usuario</span>
                        <div>{cotizacion.usuario ? cotizacion.usuario.nombre || cotizacion.usuario.email : 'Anónimo'}</div>
                      </div>

                      <div className="mb-3">
                        <span className="d-block text-muted small mb-1">Precio estimado</span>
                        {cotizacion.precio && Number(cotizacion.precio) > 0 ? (
                          <strong>{formatCurrency(cotizacion.precio)}</strong>
                        ) : (
                          <div className="text-warning">Pendiente</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <span className="d-block text-muted small mb-1">Asignar precio</span>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min="0"
                            step="0.01"
                            value={priceInputs[cotizacion.id] || ''}
                            onChange={(e) => setPriceInputs((prev) => ({
                              ...prev,
                              [cotizacion.id]: e.target.value,
                            }))}
                            placeholder="Ej: 120000"
                          />
                          <Button
                            variant="success"
                            onClick={() => handleSavePrice(cotizacion.id)}
                            disabled={savingPriceIds.includes(cotizacion.id)}
                          >
                            {savingPriceIds.includes(cotizacion.id) ? 'Asignando...' : 'Asignar'}
                          </Button>
                        </InputGroup>
                      </div>

                      <div className="mb-3 d-flex gap-2">
                        <Button variant="outline-info" size="sm" onClick={() => navigate(`/admin/cotizaciones/${cotizacion.id}`)}>
                          Ver detalle
                        </Button>
                      </div>

                      <div className="mt-auto text-muted small">
                        <div>Fecha: {new Date(cotizacion.createdAt).toLocaleString()}</div>
                        {cotizacion.notas && <div>Notas: {cotizacion.notas}</div>}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
                  {Array.from({ length: totalPages }, (_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={currentPage === index + 1}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
                </Pagination>
              </div>
            )}
          </>
          )}

          {successMessage && (
            <SuccessBanner
              message={successMessage}
              onClose={() => setSuccessMessage(null)}
              className="mt-4"
            />
          )}

          <div className="d-flex flex-wrap gap-2 mt-4">
            <Button variant="primary" onClick={() => navigate('/admin/productos')}>
              Ver productos
            </Button>
            <Button variant="outline-primary" onClick={() => navigate('/admin/usuarios')}>
              Ver usuarios
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminCotizacionesPage;
