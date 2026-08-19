/**
 * ============================================
 * PÁGINA DE FAVORITOS
 * ============================================
 * Página que muestra los productos favoritos del usuario autenticado.
 */

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, getImageUrl } from '../utils/helpers';
import { getStorageString } from '../utils/storage';

// Página de favoritos donde el usuario puede ver, abrir o eliminar productos guardados.
const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    if (isAuthenticated) {
      loadFavoritos();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFavoritos = async () => {
    try {
      const token = getStorageString('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/cliente/favoritos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFavoritos(data.data.favoritos);
      } else {
        setMensaje({ tipo: 'danger', texto: data.message || 'Error al cargar favoritos' });
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const eliminarFavorito = async (productoId) => {
    try {
      const token = getStorageString('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/cliente/favoritos/${productoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFavoritos(favoritos.filter(fav => fav.producto.id !== productoId));
        setMensaje({ tipo: 'success', texto: 'Producto eliminado de favoritos' });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 2000);
      } else {
        setMensaje({ tipo: 'danger', texto: data.message || 'Error al eliminar favorito' });
      }
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      setMensaje({ tipo: 'danger', texto: 'Error de conexión' });
    }
  };

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <i className="bi bi-heart-fill display-1 text-danger mb-4"></i>
          <h2>Acceso requerido</h2>
          <p className="text-muted">Debes iniciar sesión para ver tus favoritos</p>
          <Button as={Link} to="/login" variant="primary">
            Iniciar Sesión
          </Button>
        </div>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Cargando favoritos..." />;
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          <i className="bi bi-heart-fill text-danger me-2"></i>
          {' '}Mis Favoritos
        </h1>
        <Badge bg="secondary" className="fs-6">
          {favoritos.length} productos
        </Badge>
      </div>

      {mensaje.texto && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })} className="mb-4">
          {mensaje.texto}
        </Alert>
      )}

      {favoritos.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4">
          <i className="bi bi-heart display-1 text-muted mb-4"></i>
          <h4>No tienes productos favoritos</h4>
          <p className="text-muted">Agrega productos a tus favoritos desde el catálogo</p>
          <Button as={Link} to="/catalogo" variant="primary" className="rounded-pill">
            <i className="bi bi-grid-3x3-gap-fill me-1"></i> Explorar Catálogo
          </Button>
        </div>
      ) : (
        <Row>
          {favoritos.map((favorito) => (
            <Col key={favorito.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Link to={`/producto/${favorito.producto.id}`} className="text-decoration-none">
                  <div style={{ overflow: 'hidden', height: '200px', borderRadius: '0.75rem 0.75rem 0 0' }}>
                    <Card.Img
                      variant="top"
                      src={getImageUrl(favorito.producto.imagen)}
                      alt={favorito.producto.nombre}
                      style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                    />
                  </div>
                </Link>

                <Card.Body className="d-flex flex-column">
                  <Link to={`/producto/${favorito.producto.id}`} className="text-decoration-none text-dark">
                    <Card.Title className="h6 mb-2" style={{ fontWeight: '600' }}>
                      {favorito.producto.nombre}
                    </Card.Title>
                  </Link>

                  <Card.Text className="text-muted small flex-grow-1" style={{ lineHeight: '1.5' }}>
                    {favorito.producto.descripcion?.substring(0, 80)}
                    {favorito.producto.descripcion?.length > 80 && '...'}
                  </Card.Text>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0" style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '700'
                    }}>
                      {formatCurrency(favorito.producto.precio)}
                    </h5>
                    {favorito.producto.stock > 0 ? (
                      <Badge bg="success" style={{ padding: '0.5rem 0.75rem' }}>
                        Stock: {favorito.producto.stock}
                      </Badge>
                    ) : (
                      <Badge bg="danger" style={{ padding: '0.5rem 0.75rem' }}>Sin stock</Badge>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      as={Link}
                      to={`/producto/${favorito.producto.id}`}
                      variant="outline-primary"
                      className="flex-grow-1"
                      style={{ borderRadius: '0.75rem' }}
                    >
                      <i className="bi bi-eye me-1"></i> Ver Detalles
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => eliminarFavorito(favorito.producto.id)}
                      style={{ borderRadius: '0.75rem' }}
                    >
                      <i className="bi bi-heart-fill"></i>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default FavoritesPage;
