/**
 * ============================================
 * PRODUCT DETAIL PAGE
 * ============================================
 * Página de detalle de un producto individual
 */

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import carritoService from '../services/carritoService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    loadProducto();
  }, [id]);

  const loadProducto = async () => {
    setLoading(true);
    try {
      const response = await catalogoService.getProductoById(id);
      setProducto(response.data.producto);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setMensaje({ tipo: 'danger', texto: 'Producto no encontrado' });
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarAlCarrito = async () => {
    if (!isAuthenticated) {
      setMensaje({ tipo: 'warning', texto: 'Debes iniciar sesión para agregar al carrito' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      await carritoService.agregarAlCarrito(producto.id, cantidad);
      setMensaje({ tipo: 'success', texto: `${producto.nombre} agregado al carrito` });
      setCantidad(1);
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 2000);
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.message || 'Error al agregar al carrito' });
    }
  };

  const handleAgregarAFavoritos = async () => {
  setMensaje({ tipo: 'info', texto: 'Función de agregar a favoritos proximamente' });
  setTimeout(() => setMensaje({ tipo: '', texto: '' }), 2000);
};

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  if (loading) {
    return <LoadingSpinner message="Cargando producto..." />;
  }

  if (!producto) {
    return (
      <Container className="py-4">
        <Alert variant="danger">Producto no encontrado</Alert>
        <Button onClick={() => navigate('/catalogo')}>Volver al catálogo</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {mensaje.texto && (
        <Alert variant={mensaje.tipo} className="mb-4">
          {mensaje.texto}
        </Alert>
      )}

      <Row>
        {/* Imagen del producto */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Img
              variant="top"
              src={producto.imagen || 'https://via.placeholder.com/400'}
              alt={producto.nombre}
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Card>
        </Col>

        {/* Información del producto */}
        <Col md={6}>
          <h1 className="mb-3">{producto.nombre}</h1>

          {/* Precio */}
          <div className="mb-4">
            <h3 style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '700'
            }}>
              {formatearPrecio(producto.precio)}
            </h3>
            {producto.stock > 0 && producto.stock < 10 && (
              <Badge bg="warning" className="mt-2">¡Últimas {producto.stock} unidades!</Badge>
            )}
          </div>

          {/* Disponibilidad */}
          <div className="mb-4">
            {producto.stock > 0 ? (
              <Badge bg="success" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                ✓ En Stock
              </Badge>
            ) : (
              <Badge bg="danger" style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}>
                ✗ Sin Stock
              </Badge>
            )}
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <h5>Descripción</h5>
            <p className="text-muted">{producto.descripcion}</p>
          </div>

          {/* Especificaciones */}
          {producto.especificaciones && (
            <div className="mb-4">
              <h5>Especificaciones</h5>
              <ul className="text-muted small">
                <li>Material: Cerámica de alta calidad</li>
                <li>Dimensiones: 15cm x 12cm x 10cm</li>
                <li>Peso: 450 gramos</li>
                <li>Acabado: Esmaltado brillante</li>
                <li>Ranura para monedas en la parte superior</li>
                <li>Tapón removible en la base</li>
              </ul>
            </div>
          )}

          {/* Categoría */}
          <div className="mb-4">
            <p className="text-muted small">
              <strong>Categoría:</strong> {producto.categoria?.nombre} → {producto.subcategoria?.nombre}
            </p>
          </div>

          {/* Cantidad y botones */}
          {producto.stock > 0 && (
            <div className="mb-4">
              <Form.Group className="mb-3">
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={producto.stock}
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value))}
                  style={{ maxWidth: '100px' }}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAgregarAlCarrito}
                  style={{
                    background: 'linear-gradient(135deg, #7d2181 0%, #ff0080 100%)',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    padding: '0.75rem'
                  }}
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Agregar al Carrito
                </Button>

                <Button
                  variant="outline-danger"
                  size="lg"
                  onClick={handleAgregarAFavoritos}
                  style={{
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    padding: '0.75rem',
                    borderColor: '#ff0080',
                    color: '#ff0080'
                  }}
                >
                  <i className="bi bi-heart me-2"></i>
                  Agregar a Favoritos
                </Button>
              </div>
            </div>
          )}

          {producto.stock === 0 && (
            <Button variant="secondary" size="lg" disabled className="w-100">
              No disponible
            </Button>
          )}
        </Col>
      </Row>

      {/* Reseñas */}
      <Row className="mt-5">
        <Col>
          <h3 className="mb-4">Opiniones de Clientes</h3>
          
          <div className="mb-4">
            <Card className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6>María González</h6>
                  <small className="text-muted">15 de marzo, 2024</small>
                </div>
                <div className="mb-2">
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                </div>
                <p className="text-muted small">Hermosa alcancia, la calidad es excelente y llegó muy bien empacada. Perfecta para mi hija.</p>
              </Card.Body>
            </Card>

            <Card className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6>Carlos Rodríguez</h6>
                  <small className="text-muted">8 de marzo, 2024</small>
                </div>
                <div className="mb-2">
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <span className="text-muted">☆</span>
                </div>
                <p className="text-muted small">Muy bonita y bien hecha. El color es exactamente como en las fotos. Recomendada.</p>
              </Card.Body>
            </Card>

            <Card className="mb-3 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6>Ana Martínez</h6>
                  <small className="text-muted">2 de marzo, 2024</small>
                </div>
                <div className="mb-2">
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                  <i className="bi bi-star-fill text-warning"></i>
                </div>
                <p className="text-muted small">Artesanía de primera calidad. Se nota el trabajo manual y el cuidado en los detalles.</p>
              </Card.Body>
            </Card>
          </div>

          <Button
            variant="outline-primary"
            onClick={() => setMensaje({ tipo: 'info', texto: 'Función de escribir reseña proximamente' })}
          >
            Escribir Reseña
          </Button>

          <Button variant="link" className="ms-2">
            Ver Todas las Reseñas
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;