/**
 * ============================================
 * PRODUCT DETAIL PAGE
 * ============================================
 * Página de detalle de un producto individual
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import carritoService from '../services/carritoService';
import reviewService from '../services/reviewService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/helpers';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [producto, setProducto] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const checkFavorite = useCallback(async (productoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/cliente/favoritos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const existe = data.data.favoritos.some((fav) => fav.producto.id === productoId);
        setIsFavorite(existe);
      }
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    }
  }, []);

  const loadProducto = useCallback(async () => {
    setLoading(true);
    try {
      const [productoResponse, resenasResponse] = await Promise.all([
        catalogoService.getProductoById(id),
        reviewService.getResenasPorProducto(id),
      ]);

      const productoData = productoResponse.data.producto || productoResponse.data;
      setProducto(productoData);
      setResenas(resenasResponse || []);

      if (isAuthenticated && productoData) {
        await checkFavorite(productoData.id);
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setMensaje({ tipo: 'danger', texto: 'Producto no encontrado' });
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, checkFavorite]);

  useEffect(() => {
    loadProducto();
  }, [loadProducto]);

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

  const handleToggleFavorito = async () => {
    if (!isAuthenticated) {
      setMensaje({ tipo: 'warning', texto: 'Debes iniciar sesión para agregar a favoritos' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/cliente/favoritos${isFavorite ? `/${producto.id}` : ''}`;
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: isFavorite ? null : JSON.stringify({ productoId: producto.id }),
      });

      const data = await response.json();
      if (data.success) {
        setIsFavorite(!isFavorite);
        setMensaje({ tipo: 'success', texto: isFavorite ? 'Producto eliminado de favoritos' : 'Producto agregado a favoritos' });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 2000);
      } else {
        setMensaje({ tipo: 'danger', texto: data.message || 'Error al actualizar favoritos' });
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error de conexión' });
    }
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

  const normalizeImages = (images) => {
    if (Array.isArray(images)) return images.filter(Boolean);
    if (typeof images === 'string') return [images];
    if (images && typeof images === 'object') return Object.values(images).filter(Boolean);
    return [];
  };

  const productImages = normalizeImages(producto.imagenes);
  if (productImages.length === 0 && producto?.imagen) {
    productImages.push(producto.imagen);
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
              src={getImageUrl(productImages[selectedImageIndex] || producto.imagen)}
              alt={producto.nombre}
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Card>

          {productImages.length > 1 && (
            <div className="d-flex flex-wrap gap-2 mt-3">
              {productImages.map((imagen, index) => (
                <Card
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`border rounded-3 overflow-hidden ${index === selectedImageIndex ? 'border-primary' : 'border-light'}`}
                  style={{ width: '80px', height: '80px', cursor: 'pointer' }}
                >
                  <Card.Img
                    src={getImageUrl(imagen)}
                    alt={`${producto.nombre} ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Card>
              ))}
            </div>
          )}
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

          {producto.modelos3D && producto.modelos3D.length > 0 && (
            <div className="mb-4 p-3 border rounded-4 bg-light">
              <h5>Modelos 3D disponibles</h5>
              <div className="d-flex flex-wrap gap-2 mt-3">
                {producto.modelos3D.map((modelo, index) => (
                  <Badge key={index} bg="dark" className="text-uppercase small py-2 px-3">
                    {modelo.nombre || modelo.label || `Opción ${index + 1}`}
                  </Badge>
                ))}
              </div>
              <p className="text-muted small mt-2">
                Selecciona la personalización 3D para ver detalles de color, acabado y opciones especiales.
              </p>
            </div>
          )}

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
                  onChange={(e) => setCantidad(Number.parseInt(e.target.value))}
                  style={{ maxWidth: '100px' }}
                />
              </Form.Group>

              <div className="d-grid gap-3">
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

                <div className="d-flex gap-2">
                  <Button
                    variant={isFavorite ? 'danger' : 'outline-danger'}
                    size="lg"
                    onClick={handleToggleFavorito}
                    style={{
                      borderRadius: '0.75rem',
                      fontWeight: '600',
                      padding: '0.75rem',
                      borderColor: '#ff0080',
                      color: isFavorite ? '#fff' : '#ff0080',
                      width: '100%',
                    }}
                  >
                    <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} me-2`} />
                    {isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="lg"
                    onClick={() => navigate('/personalizacion')}
                    style={{ borderRadius: '0.75rem', fontWeight: '600', padding: '0.75rem', width: '100%' }}
                  >
                    <i className="bi bi-brush me-2" />
                    Personalizar 3D
                  </Button>
                </div>
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
            {resenas.length === 0 ? (
              <Card className="mb-3 border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">Aún no hay reseñas</h5>
                  <p className="mb-3 text-muted">Sé el primero en dejar una opinión sobre este producto.</p>
                </Card.Body>
              </Card>
            ) : (
              resenas.slice(0, 3).map((resena) => (
                <Card key={resena.id || `${resena.usuarioId}-${resena.createdAt}`} className="mb-3 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6>{resena.nombre || 'Cliente satisfecho'}</h6>
                        <small className="text-muted">{new Date(resena.createdAt).toLocaleDateString('es-CO')}</small>
                      </div>
                      <div>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <i
                            key={index}
                            className={`bi ${index < Number(resena.calificacion || 0) ? 'bi-star-fill text-warning' : 'bi-star text-warning'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted small">{resena.comentario}</p>
                  </Card.Body>
                </Card>
              ))
            )}
          </div>

          <Button
            variant="outline-primary"
            onClick={() => navigate(`/producto/${id}/escribir-resena`)}
          >
            Escribir Reseña
          </Button>

          <Button variant="link" className="ms-2" onClick={() => navigate(`/producto/${id}/resenas`)}>
            Ver Todas las Reseñas
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailPage;