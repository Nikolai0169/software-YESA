/**
 * ============================================
 * HOME PAGE
 * ============================================
 * Página principal del sitio
 */

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isAdmin, isAuxiliar } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Eliminar redirección automática - permite que admins vean la página de inicio si quieren
    loadProductosDestacados();
  }, []);

  const loadProductosDestacados = async () => {
    try {
      const response = await catalogoService.getProductosDestacados();
      setProductos(response.data.productos.slice(0, 4)); // Solo 4 productos
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section yesa-hero text-white py-5">
        <Container>
          <Row className="align-items-center py-5">
            <Col md={6} className="fade-in">
              <span className="eyebrow text-gold">YESA</span>
              <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: '1.05' }}>
                Ecommerce de Orfebrería <br />y Cerámica Artesanal
              </h1>
              <p className="lead mb-4 hero-description">
                Descubre piezas únicas y personalizables que unen tradición e innovación. Compra, personaliza y recibe obras hechas a medida por expertos artesanales.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-3">
                <Link to="/catalogo" className="btn btn-yesa-primary btn-lg">
                  <i className="bi bi-grid me-2"></i>
                  Ver Catálogo
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn btn-yesa-outline btn-lg">
                    <i className="bi bi-person-plus me-2"></i>
                    Registrarse
                  </Link>
                )}
              </div>
              <div className="hero-pill-list d-flex flex-wrap gap-2 mt-4">
                <span className="hero-pill">Personalización digital</span>
                <span className="hero-pill">Diseño exclusivo</span>
                <span className="hero-pill">Venta segura</span>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <section className="yesa-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Nuestros Servicios</h2>
            <p>Una experiencia premium para clientes que buscan productos hechos a mano y únicos.</p>
          </div>
          <Row className="g-4">
            <Col md={4}>
              <Card className="yesa-hero text-white h-100 border-0">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <i className="bi bi-brush"></i>
                  </div>
                  <h5 className="mb-3">Personalización en línea</h5>
                  <p>Modifica materiales, acabados y estilos con una vista previa elegante.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="yesa-hero text-white h-100 border-0">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <i className="bi bi-grid-1x2-fill"></i>
                  </div>
                  <h5 className="mb-3">Catálogo estructurado</h5>
                  <p>Categorías claras y filtros que ayudan a encontrar las piezas perfectas rápidamente.</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="yesa-hero text-white h-100 border-0">
                <Card.Body>
                  <div className="feature-icon mb-3">
                    <i className="bi bi-award"></i>
                  </div>
                  <h5 className="mb-3">Asesoría especializada</h5>
                  <p>Atención personalizada para guiar tu compra y asegurar que el producto final sea único.</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <Container className="py-5">
        <Row className="g-4 mb-5">
          <Col md={4}>
            <Card className="feature-card text-center h-100 border-0 shadow">
              <Card.Body className="p-4">
                <div style={{ 
                  fontSize: '4rem',
                  background: 'linear-gradient(135deg, #7d2181 0%, #ff0080 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '1rem'
                }}>
                  <i className="bi bi-truck"></i>
                </div>
                <h5 style={{ fontWeight: '600', marginBottom: '1rem' }}>Envíos en Colombia</h5>
                <p className="text-muted">
                  Logística confiable para que tu producto llegue en perfectas condiciones.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card text-center h-100 border-0 shadow">
              <Card.Body className="p-4">
                <div style={{ 
                  fontSize: '4rem',
                  background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '1rem'
                }}>
                  <i className="bi bi-patch-check-fill"></i>
                </div>
                <h5 style={{ fontWeight: '600', marginBottom: '1rem' }}>Compra Garantizada</h5>
                <p className="text-muted">
                  Tu satisfacción es lo primero, con políticas claras y soporte atento.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="feature-card text-center h-100 border-0 shadow">
              <Card.Body className="p-4">
                <div style={{ 
                  fontSize: '4rem',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '1rem'
                }}>
                  <i className="bi bi-people-fill"></i>
                </div>
                <h5 style={{ fontWeight: '600', marginBottom: '1rem' }}>Soporte Premium</h5>
                <p className="text-muted">
                  Asesoría y atención para cada cliente, antes y después de la compra.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Productos Destacados */}
        <div className="mb-5">
          <div className="text-center mb-5">
            <h2 className="section-title display-5 fw-bold mb-3">Productos Destacados</h2>
            <p className="text-muted lead">Los productos más populares de nuestra tienda</p>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <Row className="g-4">
              {productos.length > 0 ? (
                productos.map((producto, index) => (
                  <Col key={producto.id} md={6} lg={3} style={{
                    animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`
                  }}>
                    <ProductCard producto={producto} showActions={false} />
                  </Col>
                ))
              ) : (
                <Col>
                  <p className="text-center text-muted">No hay productos disponibles</p>
                </Col>
              )}
            </Row>
          )}
          
          <div className="text-center mt-5">
            <Link 
              className='yesa-hero'
              to="/catalogo"
              style={{
                display: 'inline-block',
                color: 'white',
                borderRadius: '0.75rem',
                padding: '0.875rem 2.5rem',
                fontWeight: '600',
                boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)',
                textDecoration: 'none',
                fontSize: '1.125rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(79, 70, 229, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(79, 70, 229, 0.3)';
              }}
            >
              Ver Todos los Productos
              <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <Card className="border-0 shadow-lg" style={{ 
            borderRadius: '1.5rem',
            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
          }}>
            <Card.Body className="text-center py-5 px-4">
              <div style={{ 
                fontSize: '4rem',
                marginBottom: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <i className="bi bi-rocket-takeoff"></i>
              </div>
              <h3 className="mb-3 fw-bold">¿Listo para comenzar?</h3>
              <p className="text-muted mb-4 lead">
                Crea tu cuenta gratis y empieza a comprar hoy mismo
              </p>
              <Link 
                to="/register"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  padding: '0.875rem 2.5rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  fontSize: '1.125rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <i className="bi bi-person-plus me-2"></i>
                Crear Cuenta Gratis
              </Link>
            </Card.Body>
          </Card>
        )}
      </Container>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </>
  );
};

export default HomePage;
