import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import reviewService from '../services/reviewService';
import catalogoService from '../services/catalogoService';
import LoadingSpinner from '../components/LoadingSpinner';

const ProductReviewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const [productoResponse, resenasResponse] = await Promise.all([
        catalogoService.getProductoById(id),
        reviewService.getResenasPorProducto(id),
      ]);

      setProducto(productoResponse.data.producto || productoResponse.data);
      setResenas(resenasResponse || []);
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
      setMensaje({ tipo: 'danger', texto: error.message || 'No se pudo cargar las reseñas.' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
        </Col>
      </Row>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Row className="mb-4">
            <Col md={8}>
              <h2 className="mb-1">Reseñas de clientes</h2>
              <p className="text-muted mb-0">
                {producto ? `Opiniones sobre ${producto.nombre || producto.titulo}` : 'Opiniones del producto'}
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Link to={`/producto/${id}/escribir-resena`} className="btn btn-primary">
                Escribir una reseña
              </Link>
            </Col>
          </Row>

          {mensaje.texto && (
            <Alert variant={mensaje.tipo || 'warning'}>{mensaje.texto}</Alert>
          )}

          {resenas.length === 0 ? (
            <Card className="border-0 shadow-sm p-4">
              <Card.Body>
                <h5 className="mb-3">Aún no hay reseñas</h5>
                <p className="mb-3 text-muted">Sé el primero en dejar una opinión sobre este producto.</p>
                <Link to={`/producto/${id}/escribir-resena`} className="btn btn-outline-primary">
                  Escribir reseña
                </Link>
              </Card.Body>
            </Card>
          ) : (
            resenas.map((resena) => (
              <Card key={resena.id || `${resena.usuarioId}-${resena.createdAt}`} className="mb-3 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1">{resena.nombre || 'Cliente satisfecho'}</h6>
                      <small className="text-muted">{new Date(resena.createdAt).toLocaleDateString('es-CO')}</small>
                    </div>
                    <div>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <i
                          key={index}
                          className={`bi ${index < (resena.calificacion || 0) ? 'bi-star-fill text-warning' : 'bi-star text-warning'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted small">{resena.comentario}</p>
                </Card.Body>
              </Card>
            ))
          )}
        </>
      )}
    </Container>
  );
};

export default ProductReviewsPage;
