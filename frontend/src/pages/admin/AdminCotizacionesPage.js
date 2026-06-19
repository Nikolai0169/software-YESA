import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Row, Col, Badge, Spinner, Alert, Form, InputGroup, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { obtenerCotizaciones, actualizarCotizacion, eliminarCotizaciones, eliminarCotizacion } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

// Pantalla de administración para revisar cotizaciones, asignar precios y cambiar su estado.
const AdminCotizacionesPage = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [priceInputs, setPriceInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [statusInputs, setStatusInputs] = useState({});
  const [savingPriceIds, setSavingPriceIds] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [deletingRejected, setDeletingRejected] = useState(false);
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
        setStatusInputs(
          lista.reduce((acc, cotizacion) => {
            acc[cotizacion.id] = cotizacion.estado || 'pendiente';
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
    const precio = inputValue === '' || inputValue === null || inputValue === undefined ? undefined : parseFloat(inputValue);
    const estadoSeleccionado = statusInputs[cotizacionId] || 'pendiente';

    if (precio !== undefined && (Number.isNaN(precio) || precio <= 0)) {
      setError('Ingresa un precio válido mayor a 0.');
      return;
    }

    setSavingPriceIds((prev) => [...prev, cotizacionId]);

    try {
      const payload = { estado: estadoSeleccionado };
      if (precio !== undefined) {
        payload.precio = precio;
      }

      const response = await actualizarCotizacion(cotizacionId, payload);
      setCotizaciones((prev) => prev.map((item) => (item.id === cotizacionId ? response.cotizacion : item)));
      setSuccessMessage(`Cotización actualizada correctamente. Estado: ${estadoSeleccionado}.`);
    } catch (err) {
      console.error('Error guardando precio:', err);
      setError('No se pudo actualizar la cotización. Intenta nuevamente.');
    } finally {
      setSavingPriceIds((prev) => prev.filter((id) => id !== cotizacionId));
    }
  };

  const handleDeleteRejectedQuotes = async () => {
    const rechazadas = cotizaciones.filter((item) => item.estado === 'rechazado');
    if (rechazadas.length === 0) {
      setError('No hay cotizaciones rechazadas para eliminar.');
      return;
    }

    if (!window.confirm(`¿Eliminar ${rechazadas.length} cotización(es) rechazada(s)?`)) {
      return;
    }

    setDeletingRejected(true);
    try {
      const response = await eliminarCotizaciones({ ids: rechazadas.map((item) => item.id) });
      setCotizaciones((prev) => prev.filter((item) => item.estado !== 'rechazado'));
      setSuccessMessage(response.message || 'Cotizaciones rechazadas eliminadas correctamente.');
    } catch (err) {
      console.error('Error eliminando cotizaciones rechazadas:', err);
      setError('No se pudieron eliminar las cotizaciones rechazadas.');
    } finally {
      setDeletingRejected(false);
    }
  };

  const handleDeleteQuote = async (cotizacionId) => {
    const cotizacion = cotizaciones.find((item) => item.id === cotizacionId);
    if (!cotizacion) return;

    if (cotizacion.estado !== 'rechazado') {
      setError('Solo se pueden eliminar cotizaciones con estado rechazado.');
      return;
    }

    if (!window.confirm('¿Eliminar esta cotización rechazada?')) {
      return;
    }

    setDeletingIds((prev) => [...prev, cotizacionId]);
    try {
      const response = await eliminarCotizacion(cotizacionId);
      setCotizaciones((prev) => prev.filter((item) => item.id !== cotizacionId));
      setSuccessMessage(response.message || 'Cotización eliminada correctamente.');
    } catch (err) {
      console.error('Error eliminando cotización:', err);
      setError('No se pudo eliminar la cotización.');
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== cotizacionId));
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  const cotizacionesFiltradas = cotizaciones.filter((cotizacion) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;

    const camposTexto = [
      cotizacion.id,
      cotizacion.nombre,
      cotizacion.modelo,
      cotizacion.estado,
      cotizacion.usuario?.nombre,
      cotizacion.usuario?.email,
      cotizacion.usuarioEmail,
      cotizacion.notas,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return camposTexto.includes(texto);
  });

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(cotizacionesFiltradas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleCotizaciones = cotizacionesFiltradas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
      case 'aprobado':
        return 'success';
      case 'rechazado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="py-4">
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
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="outline-danger" onClick={handleDeleteRejectedQuotes} disabled={deletingRejected || !cotizaciones.some((item) => item.estado === 'rechazado')}>
            {deletingRejected ? 'Eliminando...' : 'Eliminar rechazadas'}
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-2"></i>Volver al dashboard
          </Button>
        </div>
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
          ) : cotizacionesFiltradas.length === 0 ? (
            <Alert variant="secondary">
              No se encontraron cotizaciones para la búsqueda "{busqueda}".
            </Alert>
          ) : (
            <>
              <Row className="g-3 mb-4 align-items-end">
                <Col md={8}>
                  <Form.Label className="small mb-1">Buscar</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                    <Form.Control
                      placeholder="ID, nombre, usuario, estado..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4} className="text-md-end">
                  <small className="text-muted">
                    {busqueda.trim()
                      ? `Mostrando ${cotizacionesFiltradas.length} resultado(s)`
                      : `Mostrando ${cotizacionesFiltradas.length} cotización(es)`}
                  </small>
                </Col>
              </Row>

              <Row className="g-4 mt-2">
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
                        <div>{cotizacion.usuario ? cotizacion.usuario.nombre || cotizacion.usuario.email : cotizacion.usuarioEmail || 'Anónimo'}</div>
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
                        <span className="d-block text-muted small mb-1">Estado</span>
                        <Form.Select
                          value={statusInputs[cotizacion.id] || cotizacion.estado || 'pendiente'}
                          onChange={(e) => setStatusInputs((prev) => ({
                            ...prev,
                            [cotizacion.id]: e.target.value,
                          }))}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="cotizado">Cotizado</option>
                          <option value="aprobado">Aprobado</option>
                          <option value="rechazado">Rechazado</option>
                        </Form.Select>
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
                            {savingPriceIds.includes(cotizacion.id) ? 'Asignando...' : 'Guardar'}
                          </Button>
                        </InputGroup>
                      </div>

                      <div className="mb-3 d-flex gap-2 flex-wrap">
                        <Button variant="outline-info" size="sm" onClick={() => navigate(`/admin/cotizaciones/${cotizacion.id}`)}>
                          Ver detalle
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteQuote(cotizacion.id)}
                          disabled={deletingIds.includes(cotizacion.id) || cotizacion.estado !== 'rechazado'}
                        >
                          {deletingIds.includes(cotizacion.id) ? 'Eliminando...' : 'Eliminar'}
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
            <Alert variant="success" className="mt-4">
              {successMessage}
            </Alert>
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
