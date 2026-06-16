import React, { useCallback, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import reviewService from '../services/reviewService';
import catalogoService from '../services/catalogoService';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const ProductReviewFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [form, setForm] = useState({ nombre: '', email: '', calificacion: 5, comentario: '' });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const loadProducto = useCallback(async () => {
    try {
      const response = await catalogoService.getProductoById(id);
      setProducto(response.data.producto || response.data);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setMensaje({ tipo: 'danger', texto: 'No se pudo cargar el producto para reseña.' });
    }
  }, [id]);

  React.useEffect(() => {
    loadProducto();
  }, [loadProducto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setMensaje({ tipo: 'warning', texto: 'Debes iniciar sesión para escribir una reseña.' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!form.comentario.trim()) {
      setMensaje({ tipo: 'warning', texto: 'Escribe tu opinión antes de enviar.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productoId: id,
        nombre: form.nombre || '',
        email: form.email || '',
        calificacion: Number(form.calificacion),
        comentario: form.comentario.trim(),
      };
      const response = await reviewService.crearResena(payload);
      if (response.success) {
        setMensaje({ tipo: 'success', texto: 'Reseña enviada correctamente.' });
        setTimeout(() => navigate(`/producto/${id}`), 2000);
      } else {
        setMensaje({ tipo: 'danger', texto: response.message || 'No se pudo enviar la reseña.' });
      }
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      setMensaje({ tipo: 'danger', texto: error.message || 'Error de conexión al enviar reseña.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
            ← Volver
          </Button>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h2 className="mb-3">Escribir reseña</h2>
              <p className="text-muted mb-4">
                Comparte tu opinión sobre {producto?.nombre || producto?.titulo || 'este producto'}.
              </p>

              {mensaje.texto && <Alert variant={mensaje.tipo || 'warning'}>{mensaje.texto}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="nombre">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Tu nombre o alias"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="tu@email.com"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="calificacion">
                  <Form.Label>Calificación</Form.Label>
                  <Form.Select
                    value={form.calificacion}
                    onChange={(e) => handleChange('calificacion', e.target.value)}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>{value} estrella{value > 1 ? 's' : ''}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4" controlId="comentario">
                  <Form.Label>Tu opinión</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={form.comentario}
                    onChange={(e) => handleChange('comentario', e.target.value)}
                    placeholder="Escribe tu reseña aquí..."
                  />
                </Form.Group>

                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar reseña'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductReviewFormPage;
