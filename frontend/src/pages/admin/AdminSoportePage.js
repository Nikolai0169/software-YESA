/**
 * ============================================
 * ADMIN SOPORTE PAGE
 * ============================================
 * Gestión de mensajes de contacto desde el formulario FAQ
 * Los administradores pueden ver, filtrar, responder y eliminar mensajes.
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminSoportePage = () => {
  useAuth();
  const navigate = useNavigate();
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [showModal, setShowModal] = useState(false);
  const [showRespuestaModal, setShowRespuestaModal] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);

  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos',
    asunto: 'todos'
  });

  // Opciones únicas de asuntos
  const [asuntos, setAsuntos] = useState([]);

  const contactosFiltrados = useMemo(() => {
    let resultado = contactos.filter(contacto => {
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const coincide =
          contacto.nombre.toLowerCase().includes(busqueda) ||
          contacto.email.toLowerCase().includes(busqueda) ||
          contacto.mensaje.toLowerCase().includes(busqueda);
        if (!coincide) return false;
      }

      if (filtros.estado !== 'todos' && contacto.estado !== filtros.estado) return false;
      if (filtros.asunto !== 'todos' && contacto.asunto !== filtros.asunto) return false;

      return true;
    });

    resultado.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return resultado;
  }, [contactos, filtros]);

  const loadContactos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/support/contactos');
      const data = response.data?.data || [];
      setContactos(Array.isArray(data) ? data : []);

      const asuntosUnicos = [...new Set(data.map(c => c.asunto))];
      setAsuntos(asuntosUnicos);
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los mensajes de contacto' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContactos();
  }, [loadContactos]);

  const handleVerDetalle = (contacto) => {
    setContactoSeleccionado(contacto);
    setShowModal(true);
  };

  const handleResponder = (contacto) => {
    setContactoSeleccionado(contacto);
    setRespuesta(contacto.respuesta || '');
    setShowRespuestaModal(true);
  };

const handleEnviarRespuesta = async () => {
  if (!respuesta.trim()) {
    setMensaje({ tipo: 'warning', texto: 'Por favor escribe una respuesta' });
    return;
  }

  setEnviandoRespuesta(true);
  try {
    await api.put(`/support/contactos/${contactoSeleccionado.id}/responder`, {
      respuesta: respuesta
    });

    setMensaje({ tipo: 'success', texto: 'Respuesta enviada exitosamente' });
    setShowRespuestaModal(false);
    setRespuesta('');
    await loadContactos();
  } catch (error) {
    console.error('Error al enviar respuesta:', error);
    setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al enviar la respuesta' });
  } finally {
    setEnviandoRespuesta(false);
  }
};

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este mensaje?')) return;

    try {
      await api.delete(`/support/contactos/${id}`);
      setMensaje({ tipo: 'success', texto: 'Mensaje eliminado exitosamente' });
      await loadContactos();
    } catch (error) {
      console.error('Error al eliminar:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar el mensaje' });
    }
  };

  const getEstadoBadge = (estado) => {
    const variants = {
      pendiente: 'warning',
      revisado: 'info',
      respondido: 'success',
      cerrado: 'secondary'
    };
    const textos = {
      pendiente: 'Pendiente',
      revisado: 'Revisado',
      respondido: 'Respondido',
      cerrado: 'Cerrado'
    };
    return <Badge bg={variants[estado] || 'secondary'}>{textos[estado] || estado}</Badge>;
  };

  const getAsuntoBadge = (asunto) => {
    const colores = {
      pedido: '#0dcaf0',
      producto: '#0d6efd',
      devolucion: '#d32f2f',
      pago: '#198754',
      envio: '#ff9800',
      otro: '#6c757d'
    };
    return <Badge style={{ backgroundColor: colores[asunto] || '#6c757d' }}>{asunto}</Badge>;
  };

  const totalContactos = contactos.length;
  const pendientes = contactos.filter(c => c.estado === 'pendiente').length;
  const respondidos = contactos.filter(c => c.estado === 'respondido').length;
  const cerrados = contactos.filter(c => c.estado === 'cerrado').length;

  if (loading) {
    return <LoadingSpinner message="Cargando mensajes de soporte..." />;
  }

  return (
    <Container className="py-4">
      <style>
        {`
          .tabla-contactos-scroll {
            overflow-y: auto;
            max-height: 600px;
          }
          .tabla-contactos-scroll thead th {
            position: sticky;
            top: 0;
            background-color: #f8f9fa;
            z-index: 10;
            box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);
          }
          .mensaje-preview {
            max-width: 300px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}
      </style>

      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1><i className="bi bi-chat-left-text me-2"></i>Gestión de Soporte</h1>
          <p className="text-muted mb-0">Mensajes de contacto desde el formulario FAQ</p>
        </div>
        <div>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')} className="me-2">
            <i className="bi bi-arrow-left me-1"></i> Volver
          </Button>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-white bg-primary shadow-sm">
            <Card.Body>
              <Card.Title>Total de Mensajes</Card.Title>
              <p className="display-6">{totalContactos}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-warning shadow-sm">
            <Card.Body>
              <Card.Title>Pendientes</Card.Title>
              <p className="display-6">{pendientes}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-success shadow-sm">
            <Card.Body>
              <Card.Title>Respondidos</Card.Title>
              <p className="display-6">{respondidos}</p>
            </Card.Body>
          </Card>
        </Col>
                <Col md={4}>
                  <Card className="text-white bg-secondary shadow-sm">
                    <Card.Body>
                      <Card.Title>Cerrados</Card.Title>
                      <p className="display-6">{cerrados}</p>
                    </Card.Body>
                  </Card>
                </Col>
              <Form.Label className="small mb-1">Buscar</Form.Label>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Nombre, email o mensaje..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Label className="small mb-1">Estado</Form.Label>
              <Form.Select
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="revisado">Revisado</option>
                <option value="respondido">Respondido</option>
                <option value="cerrado">Cerrado</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="small mb-1">Asunto</Form.Label>
              <Form.Select
                value={filtros.asunto}
                onChange={(e) => setFiltros({ ...filtros, asunto: e.target.value })}
              >
                <option value="todos">Todos</option>
                {asuntos.map(asunto => (
                  <option key={asunto} value={asunto}>{asunto}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={() => setFiltros({ busqueda: '', estado: 'todos', asunto: 'todos' })}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Limpiar
              </Button>
            </Col>
          </Row>
          <div className="mt-3">
            <Badge bg="secondary" className="p-2">
              <i className="bi bi-chat-left-text me-1"></i> {contactosFiltrados.length} mensaje(s) encontrado(s)
            </Badge>
          </div>
        </Card.Body>
      </Card>

      {/* Tabla de contactos */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <div className="tabla-contactos-scroll">
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Asunto</th>
                  <th style={{ width: '150px' }}>Mensaje</th>
                  <th style={{ width: '90px' }}>Estado</th>
                  <th style={{ width: '100px' }}>Fecha</th>
                  <th style={{ width: '200px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {contactosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No hay mensajes para mostrar
                    </td>
                  </tr>
                ) : (
                  contactosFiltrados.map((contacto) => (
                    <tr key={contacto.id}>
                      <td className="align-middle fw-bold">{contacto.id}</td>
                      <td className="align-middle">{contacto.nombre}</td>
                      <td className="align-middle">{contacto.email}</td>
                      <td className="align-middle">{getAsuntoBadge(contacto.asunto)}</td>
                      <td className="align-middle">
                        <div className="mensaje-preview" title={contacto.mensaje}>
                          {contacto.mensaje}
                        </div>
                      </td>
                      <td className="align-middle">{getEstadoBadge(contacto.estado)}</td>
                      <td className="align-middle">
                        <small>{new Date(contacto.createdAt).toLocaleDateString('es-CO')}</small>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleVerDetalle(contacto)}
                            title="Ver detalle"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleResponder(contacto)}
                            title="Responder"
                          >
                            <i className="bi bi-reply"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminar(contacto.id)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="text-light">
          <small><i className="bi bi-file-text me-1"></i> Mostrando <strong>{contactosFiltrados.length}</strong> de <strong>{totalContactos}</strong> mensaje(s)</small>
        </Card.Footer>
      </Card>

      {/* Modal - Ver Detalle */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="bi bi-chat-left-text me-2"></i>
            Detalle del Mensaje
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {contactoSeleccionado && (
            <>
              <div className="mb-3">
                <strong>Nombre:</strong> {contactoSeleccionado.nombre}
              </div>
              <div className="mb-3">
                <strong>Email:</strong> <a href={`mailto:${contactoSeleccionado.email}`}>{contactoSeleccionado.email}</a>
              </div>
              <div className="mb-3">
                <strong>Asunto:</strong> {getAsuntoBadge(contactoSeleccionado.asunto)}
              </div>
              <div className="mb-3">
                <strong>Estado:</strong> {getEstadoBadge(contactoSeleccionado.estado)}
              </div>
              <div className="mb-3">
                <strong>Fecha:</strong> {new Date(contactoSeleccionado.createdAt).toLocaleString('es-CO')}
              </div>
              <div className="mb-3">
                <strong>Mensaje:</strong>
                <div className="bg-light p-3 mt-2 rounded" style={{ minHeight: '100px' }}>
                  {contactoSeleccionado.mensaje}
                </div>
              </div>
              {contactoSeleccionado.respuesta && (
                <div className="mb-3">
                  <strong>Respuesta:</strong>
                  <div className="bg-success bg-opacity-10 p-3 mt-2 rounded border border-success">
                    {contactoSeleccionado.respuesta}
                  </div>
                  <small className="text-muted">
                    Respondido el: {new Date(contactoSeleccionado.fechaRespuesta).toLocaleString('es-CO')}
                  </small>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal - Responder */}
      <Modal show={showRespuestaModal} onHide={() => setShowRespuestaModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <i className="bi bi-reply me-2"></i>
            Responder Mensaje
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {contactoSeleccionado && (
            <>
              <div className="mb-3">
                <strong>De:</strong> {contactoSeleccionado.nombre} ({contactoSeleccionado.email})
              </div>
              <div className="mb-3">
                <strong>Asunto original:</strong> {getAsuntoBadge(contactoSeleccionado.asunto)}
              </div>
              <div className="mb-3">
                <strong>Mensaje original:</strong>
                <div className="bg-light p-3 mt-2 rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {contactoSeleccionado.mensaje}
                </div>
              </div>
              <Form.Group>
                <Form.Label><strong>Tu Respuesta:</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  disabled={enviandoRespuesta}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRespuestaModal(false)} disabled={enviandoRespuesta}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleEnviarRespuesta}
            disabled={enviandoRespuesta || !respuesta.trim()}
          >
            {enviandoRespuesta ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Enviando...
              </>
            ) : (
              <>
                <i className="bi bi-send me-1"></i>
                Enviar Respuesta
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminSoportePage;