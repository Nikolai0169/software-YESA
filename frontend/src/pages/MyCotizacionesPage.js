import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Badge, Spinner, Alert, Button, Pagination } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { agregarCotizacionAlCarrito, obtenerMisCotizaciones } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';

const getEstadoBadge = (estado) => {
  switch (estado) {
    case 'pendiente': return 'warning';
    case 'cotizado': return 'info';
    case 'aprobado': return 'success';
    case 'rechazado': return 'danger';
    default: return 'secondary';
  }
};

const ITEMS_PER_PAGE = 6;

const MyCotizacionesPage = () => {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await obtenerMisCotizaciones();
        const lista = res.cotizaciones || [];
        setCotizaciones(lista);
      } catch (err) {
        console.error('Error al cargar cotizaciones del usuario:', err);
        // Si el servidor responde con 401, la sesión ya no es válida → cerrar sesión y redirigir
        const status = err.response?.status;
        const serverMessage = err.response?.data?.message || err.message;
        if (status === 401) {
          logout();
          navigate('/login');
          setError('Sesión inválida. Redirigiendo al login...');
        } else {
          setError(serverMessage || 'No se pudieron cargar tus cotizaciones. Intenta nuevamente.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [logout, navigate]);

  const totalPages = Math.ceil(cotizaciones.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleCotizaciones = cotizaciones.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-5">Mis Cotizaciones</h1>
          <p className="text-muted mb-0">Aquí aparecerán tus cotizaciones</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : cotizaciones.length === 0 ? (
        <Alert variant="secondary">No has realizado cotizaciones aún.</Alert>
      ) : (
        <>
          <Row className="g-4">
            {visibleCotizaciones.map((c) => (
              <Col key={c.id} xs={12} md={6} lg={4}>
                <Card className="h-100 shadow-sm border border-2 border-dark">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <Card.Title className="mb-0">{c.nombre || 'Cotización'}</Card.Title>
                        <Card.Subtitle className="text-muted">ID #{c.id}</Card.Subtitle>
                      </div>
                      <Badge bg={getEstadoBadge(c.estado)} className="text-capitalize">{c.estado}</Badge>
                    </div>

                    <div className="mb-3">
                      <span className="d-block text-muted small">Subtotal estimado</span>
                      <strong>{c.precio !== undefined && c.precio !== null ? formatCurrency(c.precio) : 'Pendiente'}</strong>
                    </div>

                    <div className="mb-3">
                      <span className="d-block text-muted small">Productos / Diseños</span>
                      <div>{c.items?.length || 1} diseño(s)</div>
                    </div>

                    <div className="mb-3 d-flex flex-column gap-2">
                      <Button variant="outline-primary" size="sm" onClick={() => navigate(`/mis-cotizaciones/${c.id}`)}>
                        Ver detalle
                      </Button>
                      <Button
                        variant={c.estado === 'cotizado' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        disabled={c.estado !== 'cotizado'}
                        onClick={async () => {
                          if (c.estado !== 'cotizado') {
                            alert('Tu cotización aún no ha sido aprobada para agregarse al carrito.');
                            return;
                          }

                          try {
                            await agregarCotizacionAlCarrito(c.id);
                            alert('Cotización agregada al carrito como paquete de productos.');
                            navigate('/carrito');
                          } catch (err) {
                            console.error('Error agregando cotización al carrito:', err);
                            alert(err.response?.data?.message || 'No se pudo agregar la cotización al carrito.');
                          }
                        }}
                      >
                        Agregar al carrito
                      </Button>
                    </div>

                    <div className="mt-auto text-muted small">
                      <div>Fecha: {c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}</div>
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
    </Container>
  );
};

export default MyCotizacionesPage;
