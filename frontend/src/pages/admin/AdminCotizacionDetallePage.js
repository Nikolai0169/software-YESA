import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import Personalizacion3D from '../../components/Personalizacion3D';
import { obtenerCotizacion } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

const AdminCotizacionDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCotizacion = async () => {
      try {
        setLoading(true);
        const response = await obtenerCotizacion(id);
        setCotizacion(response.cotizacion);
      } catch (err) {
        console.error('Error cargando cotización:', err);
        setError('No se pudo cargar la cotización. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    loadCotizacion();
  }, [id]);

  const designItems = Array.isArray(cotizacion?.items) ? cotizacion.items : [cotizacion];
  const previewSource = designItems[0] || {};
  const multipleDesigns = designItems.length > 1;

  const getCotizacionEstadoBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'cotizado':
        return 'info';
      case 'aceptado':
        return 'success';
      case 'rechazado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const renderDesignPreviewCard = (item, index) => (
    <Col xs={12} md={6} key={`item-preview-${index}`}>
      <Card className="h-100 shadow-sm saved-design-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <Card.Subtitle className="text-muted">Diseño {index + 1}</Card.Subtitle>
              <div className="fw-bold">{item.nombre || `Diseño ${index + 1}`}</div>
            </div>
            <Badge bg="secondary" className="text-capitalize">{item.modelo || 'taza'}</Badge>
          </div>

          <div className="saved-design-preview">
            <div className="saved-design-preview-frame">
              <Personalizacion3D
                modelo={item.modelo || 'taza'}
                colorInterior={item.colorInterior || '#ffffff'}
                colorBase={item.colorBase || '#ffffff'}
                colorExterior={item.colorExterior || '#ffffff'}
                colorAsa={item.colorAsa || '#ffffff'}
                texture={item.textureUrl || item.texture || null}
                overlayText={item.overlayText || ''}
                overlayTextFontFamily={item.overlayTextFontFamily || 'sans-serif'}
                overlayTextFontSize={item.overlayTextFontSize || 24}
                overlayTextColor={item.overlayTextColor || '#ffffff'}
                textInterior={item.textInterior || ''}
                textExterior={item.textExterior || ''}
                zoom={0.9}
                autoRotate={false}
                textureOffset={{ x: item.textureOffsetX || 0, y: item.textureOffsetY || 0 }}
                textureScale={item.textureScale || 1}
              />
            </div>
          </div>

          <div className="mt-3 text-muted small">
            <div>Overlay: {item.overlayText || 'No aplica'}</div>
            <div>Color exterior: {item.colorExterior || 'N/A'}</div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container className="py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="display-6">Detalle de cotización</h1>
          <p className="text-muted mb-0">Revisa el diseño asociado y todas las características aplicadas.</p>
        </div>
        <Button
          variant="outline-secondary"
          onClick={() => navigate('/admin/cotizaciones')}
          aria-label="Volver"
          title="Volver"
        >
          <i className="bi bi-arrow-left" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : !cotizacion ? (
        <Alert variant="warning">Cotización no encontrada.</Alert>
      ) : (
        <div className="mx-auto" style={{ maxWidth: '1200px' }}>
          <Card className="shadow-sm saved-design-card mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3 gap-3">
                <div>
                  <Card.Title className="mb-1">
                    {cotizacion.nombre || (multipleDesigns ? `Cotización múltiple (${designItems.length} diseños)` : 'Diseño cotizado')}
                  </Card.Title>
                  <Card.Subtitle className="text-muted">ID #{cotizacion.id}</Card.Subtitle>
                  {multipleDesigns && (
                    <div className="text-muted small mt-1">Incluye {designItems.length} diseños</div>
                  )}
                </div>
                <Badge bg={getCotizacionEstadoBadge(cotizacion.estado)} className="text-capitalize">
                  {cotizacion.estado}
                </Badge>
              </div>
              <div className="text-muted small">
                <span>Precio: <strong>{cotizacion.precio !== undefined && cotizacion.precio !== null ? formatCurrency(cotizacion.precio) : 'Pendiente'}</strong></span>
                {cotizacion.usuario?.nombre || cotizacion.usuario?.email ? (
                  <span className="ms-3">Usuario: <strong>{cotizacion.usuario?.nombre || cotizacion.usuario?.email}</strong></span>
                ) : null}
                <div className="mt-2">Fecha: {new Date(cotizacion.createdAt).toLocaleString('es-CO')}</div>
                {cotizacion.notas && <div className="mt-2">Notas: {cotizacion.notas}</div>}
              </div>
            </Card.Body>
          </Card>

          <div>
            <h5 className="mb-3">Diseños</h5>
            <Row className="g-3">
              {designItems.map((item, index) => (
                <Col key={`item-preview-${index}`} xs={12} md={6} lg={4}>
                  <Card className="h-100 shadow-sm saved-design-card">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <Card.Subtitle className="text-muted">Diseño {index + 1}</Card.Subtitle>
                          <div className="fw-bold">{item.nombre || `Diseño ${index + 1}`}</div>
                        </div>
                        <Badge bg="secondary" className="text-capitalize">{item.modelo || 'taza'}</Badge>
                      </div>

                      <div className="saved-design-preview">
                        <div className="saved-design-preview-frame">
                          <Personalizacion3D
                            modelo={item.modelo || 'taza'}
                            colorInterior={item.colorInterior || '#ffffff'}
                            colorBase={item.colorBase || '#ffffff'}
                            colorExterior={item.colorExterior || '#ffffff'}
                            colorAsa={item.colorAsa || '#ffffff'}
                            texture={item.textureUrl || item.texture || null}
                            overlayText={item.overlayText || ''}
                            overlayTextFontFamily={item.overlayTextFontFamily || 'sans-serif'}
                            overlayTextFontSize={item.overlayTextFontSize || 24}
                            overlayTextColor={item.overlayTextColor || '#ffffff'}
                            textInterior={item.textInterior || ''}
                            textExterior={item.textExterior || ''}
                            zoom={0.9}
                            autoRotate={false}
                            textureOffset={{ x: item.textureOffsetX || 0, y: item.textureOffsetY || 0 }}
                            textureScale={item.textureScale || 1}
                          />
                        </div>
                      </div>

                      <div className="mt-3 text-muted small">
                        <div>Overlay: {item.overlayText || 'No aplica'}</div>
                        <div>Color exterior: {item.colorExterior || 'N/A'}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      )}
    </Container>
  );
};

export default AdminCotizacionDetallePage;
