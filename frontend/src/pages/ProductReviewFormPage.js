import React, { useCallback, useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import reviewService from '../services/reviewService';
import catalogoService from '../services/catalogoService';
import { useAuth } from '../context/AuthContext';

const STAR_VALUES = [5.0, 4.5, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0, 0.5];

const ProductReviewFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [form, setForm] = useState({ nombre: '', calificacion: 5.0, comentario: '' });
  const [anonimo, setAnonimo] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        nombre: prev.nombre || user.nombre || '',
      }));
    }
  }, [user]);

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
        nombre: anonimo ? form.nombre.trim() || 'Anónimo' : form.nombre.trim() || user?.nombre || '',
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
      setMensaje({ tipo: 'danger', texto: error.response?.data?.message || error.message || 'Error de conexión al enviar reseña.' });
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
                <Form.Group className="mb-3" controlId="anonimo">
                  <Form.Check
                    type="checkbox"
                    label="Publicar como anónimo"
                    checked={anonimo}
                    onChange={(e) => setAnonimo(e.target.checked)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="nombre">
                  <Form.Label>Nombre / Alias</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Tu nombre o alias"
                    disabled={!anonimo && !!user?.nombre}
                  />
                  {!anonimo && user?.nombre && (
                    <Form.Text className="text-muted">Se usará tu nombre de usuario autenticado.</Form.Text>
                  )}
                </Form.Group>


                <Form.Group className="mb-3" controlId="calificacion">
                  <Form.Label>Calificación</Form.Label>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    {STAR_VALUES.map((value) => (
                      <Button
                        key={value}
                        type="button"
                        variant={Number(form.calificacion) === value ? 'warning' : 'outline-secondary'}
                        onClick={() => handleChange('calificacion', value)}
                        size="sm"
                      >
                        {value} ★
                      </Button>
                    ))}
                  </div>
                  <Form.Text className="text-muted">Puedes usar medias estrellas para mayor precisión.</Form.Text>
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
