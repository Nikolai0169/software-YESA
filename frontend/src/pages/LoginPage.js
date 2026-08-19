/**
 * ============================================
 * LOGIN PAGE
 * ============================================
 * Página de inicio de sesión
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStorageJson } from '../utils/storage';

const LoginPage = () => {
  const location = useLocation();
  const from = location.state?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tieneCarrito, setTieneCarrito] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const buildRedirectPath = (path, shouldOpenSupport) => {
    if (!path) {
      return shouldOpenSupport ? '/catalogo?support=1' : '/catalogo';
    }

    const normalizedPath = typeof path === 'string' ? path : path.pathname + (path.search || '');
    const url = new URL(normalizedPath, window.location.origin);

    if (shouldOpenSupport) {
      url.searchParams.set('support', '1');
    }

    return `${url.pathname}${url.search}`;
  };

  useEffect(() => {
    // Verificar si hay items en el carrito local
    const carritoLocal = getStorageJson('carrito_local', []);
    setTieneCarrito(carritoLocal.length > 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      
      const shouldReturnToSupport = location.state?.returnToSupport;
      const redirectPath = buildRedirectPath(from, shouldReturnToSupport);

      // Redirigir según el rol y ruta de origen
      if (response.usuario.rol === 'cliente') {
        navigate(redirectPath || '/catalogo', { replace: true });
      } else {
        navigate(shouldReturnToSupport ? redirectPath : '/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  {' '}Iniciar Sesión
                </h2>
                <p className="text-muted">Accede a tu cuenta YESA</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              {tieneCarrito && (
                <Alert variant="success" className="mb-3">
                  <i className="bi bi-cart-check me-2" />{' '}
                  Tu carrito se sincronizará automáticamente al iniciar sesión
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-envelope me-2" />{' '}
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-lock me-2" />{' '}
                    Contraseña
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />{' '}
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2" />{' '}
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </Form>

              <hr />

              <div className="text-center">
                <p className="mb-2">¿No tienes cuenta?</p>
                <Link to="/register" state={from ? { from } : undefined} className="btn btn-outline-primary w-100">
                  <i className="bi bi-person-plus me-2" />{' '}
                  Crear cuenta nueva
                </Link>
              </div>

              <div className="mt-4">
                <Alert variant="info" className="mb-0">
                  <strong>Cuentas de prueba YESA:</strong>
                  <br />
                  <small>Admin: admin@yesa.com / admin1234</small>
                  <br />
                  <small>Cliente: cliente1@yesa.com / cliente1</small>
                </Alert>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
