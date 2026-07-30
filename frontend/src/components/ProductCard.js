/**
 * ============================================
 * PRODUCT CARD COMPONENT
 * ============================================
 * Tarjeta de producto para mostrar en catálogo
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getImageUrl } from '../utils/helpers';

const ProductCard = memo(({ producto, onAddToCart, showActions = true, onFavoriteFeedback }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const showFavoriteFeedback = useCallback((tipo, texto) => {
    if (onFavoriteFeedback) {
      onFavoriteFeedback(tipo, texto);
    } else {
      window.alert(texto);
    }
  }, [onFavoriteFeedback]);

  const checkIfFavorite = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/cliente/favoritos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        const isFav = data.data.favoritos.some((fav) => fav.producto.id === producto.id);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Error al verificar favorito:', error);
    }
  }, [producto.id]);

  useEffect(() => {
    if (isAuthenticated) {
      checkIfFavorite();
    }
  }, [isAuthenticated, checkIfFavorite]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showFavoriteFeedback('warning', 'Debes iniciar sesión para agregar a favoritos.');
      return;
    }

    setLoadingFavorite(true);
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
        if (!isFavorite) {
          showFavoriteFeedback('success', 'Producto agregado a favoritos');
        } else {
          showFavoriteFeedback('success', 'Producto eliminado de favoritos');
        }
      } else {
        showFavoriteFeedback('danger', data.message || 'Ocurrió un error al actualizar favoritos.');
      }
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      showFavoriteFeedback('danger', 'Error de conexión.');
    } finally {
      setLoadingFavorite(false);
    }
  };

  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault();
      if (onAddToCart) {
        onAddToCart(producto);
      }
    },
    [onAddToCart, producto]
  );

  return (
    <>
      <Card className="h-100 product-card shadow-sm">
        <Link to={`/producto/${producto.id}`} className="text-decoration-none position-relative">
          <div style={{ overflow: 'hidden', height: '200px', borderRadius: '0.75rem 0.75rem 0 0' }}>
            <Card.Img
              variant="top"
              src={getImageUrl(producto.imagen)}
              alt={producto.nombre}
              style={{ height: '200px', objectFit: 'cover', width: '100%' }}
            />
          </div>
          {producto.stock > 0 && producto.stock < 10 && (
            <Badge
              bg="warning"
              className="position-absolute"
              style={{ top: '10px', right: '10px', fontSize: '0.75rem' }}
            >
              ¡Últimas unidades!
            </Badge>
          )}

          <Button
            variant="light"
            size="sm"
            className="position-absolute"
            style={{
              top: '10px',
              left: '10px',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              padding: '0',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
            }}
            onClick={toggleFavorite}
            disabled={loadingFavorite}
          >
            <i className={`bi ${isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart text-muted'}`} />
          </Button>
        </Link>

        <Card.Body className="d-flex flex-column p-3">
          <Link to={`/producto/${producto.id}`} className="text-decoration-none text-dark">
            <Card.Title className="h6 mb-2" style={{ fontWeight: '600' }}>
              {producto.nombre}
            </Card.Title>
          </Link>

          <Card.Text className="text-muted small flex-grow-1" style={{ lineHeight: '1.5' }}>
            {producto.descripcion?.substring(0, 80)}
            {producto.descripcion?.length > 80 && '...'}
          </Card.Text>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5
              className="mb-0"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '700',
              }}
            >
              {formatCurrency(producto.precio)}
            </h5>
            {producto.stock > 0 ? (
              <Badge bg="success" style={{ padding: '0.5rem 0.75rem' }}>
                Stock: {producto.stock}
              </Badge>
            ) : (
              <Badge bg="danger" style={{ padding: '0.5rem 0.75rem' }}>Sin stock</Badge>
            )}
          </div>

          {showActions && (
            <div className="d-flex gap-2">
              <Button
                as={Link}
                to={`/producto/${producto.id}`}
                variant="outline-primary"
                className="flex-grow-1"
                style={{ borderRadius: '0.75rem' }}
              >
                <i className="bi bi-eye me-1" /> Ver
              </Button>
              <Button
                as={Link}
                to="/personalizacion"
                variant="outline-secondary"
                style={{ borderRadius: '0.75rem' }}
                title="Personalizar 3D"
              >
                <i className="bi bi-brush" />
              </Button>
              <Button
                variant="primary"
                onClick={handleAddToCart}
                disabled={producto.stock === 0}
                style={{ borderRadius: '0.75rem' }}
              >
                <i className="bi bi-cart-plus" />
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

