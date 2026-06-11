import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import Personalizacion3D from '../components/Personalizacion3D';
import { obtenerCotizacionUsuario } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const MyCotizacionDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await obtenerCotizacionUsuario(id);
        setCotizacion(res.cotizacion);
      } catch (err) {
        console.error('Error cargando cotización:', err);
        setError('No se pudo cargar la cotización.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const designItems = Array.isArray(cotizacion?.items) ? cotizacion.items : [cotizacion];
  const previewSource = designItems[0] || {};
  const multipleDesigns = designItems.length > 1;

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="display-6">Detalle de cotización</h1>
          <p className="text-muted mb-0">Revisa el diseño asociado y todas las características aplicadas.</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate('/mis-cotizaciones')}>
          Volver
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : !cotizacion ? (
        <Alert variant="warning">Cotización no encontrada.</Alert>
      ) : (
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3 gap-3">
                  <div>
                    <Card.Title className="mb-1">{cotizacion.nombre || (multipleDesigns ? `Cotización múltiple (${designItems.length} diseños)` : 'Diseño cotizado')}</Card.Title>
                    <Card.Subtitle className="text-muted">ID #{cotizacion.id}</Card.Subtitle>
                    {multipleDesigns && <div className="text-muted small mt-1">Incluye {designItems.length} diseños</div>}
                  </div>
                  <Badge bg={cotizacion.estado ? (cotizacion.estado === 'pendiente' ? 'warning' : cotizacion.estado === 'cotizado' ? 'info' : 'secondary') : 'secondary'} className="text-capitalize">{cotizacion.estado}</Badge>
                </div>

                <div className="d-flex justify-content-end mb-3">
                  <Button variant="primary" onClick={() => navigate('/checkout')}>
                    Realizar pedido
                  </Button>
                </div>

                <div className="border rounded overflow-hidden mb-4" style={{ minHeight: '380px', backgroundColor: '#111' }}>
                  <Personalizacion3D
                    modelo={previewSource.modelo || 'taza'}
                    colorInterior={previewSource.colorInterior || '#ffffff'}
                    colorBase={previewSource.colorBase || '#ffffff'}
                    colorExterior={previewSource.colorExterior || '#ffffff'}
                    colorAsa={previewSource.colorAsa || '#ffffff'}
                    texture={previewSource.textureUrl || null}
                    overlayText={previewSource.overlayText || ''}
                    overlayTextFontFamily={previewSource.overlayTextFontFamily || 'sans-serif'}
                    overlayTextFontSize={previewSource.overlayTextFontSize || 24}
                    overlayTextColor={previewSource.overlayTextColor || '#ffffff'}
                    textInterior={previewSource.textInterior || ''}
                    textExterior={previewSource.textExterior || ''}
                    zoom={1.1}
                    autoRotate={false}
                    textureOffset={{ x: previewSource.textureOffsetX || 0, y: previewSource.textureOffsetY || 0 }}
                    textureScale={previewSource.textureScale || 1}
                  />
                </div>

                <div className="mb-3">
                  <span className="d-block text-muted small mb-2">Precio estimado</span>
                  <div>{cotizacion.precio !== undefined && cotizacion.precio !== null ? (<strong>{formatCurrency(cotizacion.precio)}</strong>) : (<div className="text-warning">Pendiente</div>)}</div>
                </div>

                {multipleDesigns && (
                  <div className="mb-4">
                    <h6 className="mb-2">Diseños incluidos</h6>
                    <ul className="small">
                      {designItems.map((item, index) => (
                        <li key={index}><strong>{item.nombre}</strong> - {item.modelo || 'taza'}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Diseños relacionados</h5>
                <Row className="g-3 mb-4">
                  {designItems.map((item, index) => (
                    <Col xs={12} md={6} key={`item-preview-${index}`}>
                      <Card className="h-100 shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <Card.Subtitle className="text-muted">Diseño {index + 1}</Card.Subtitle>
                              <div className="fw-bold">{item.nombre || `Diseño ${index + 1}`}</div>
                            </div>
                            <Badge bg="secondary" className="text-capitalize">{item.modelo || 'taza'}</Badge>
                          </div>

                          <div className="border rounded overflow-hidden" style={{ minHeight: '220px', backgroundColor: '#111' }}>
                            <Personalizacion3D
                              modelo={item.modelo || 'taza'}
                              colorInterior={item.colorInterior || '#ffffff'}
                              colorBase={item.colorBase || '#ffffff'}
                              colorExterior={item.colorExterior || '#ffffff'}
                              colorAsa={item.colorAsa || '#ffffff'}
                              texture={item.textureUrl || null}
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

                          <div className="mt-3 text-muted small">
                            <div>Overlay: {item.overlayText || 'No aplica'}</div>
                            <div>Color exterior: {item.colorExterior || 'N/A'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                <h5 className="mb-3">Detalles</h5>
                <div className="mb-2">
                  <p className="mb-1"><strong>Usuario:</strong> {cotizacion.usuario?.email || cotizacion.usuarioEmail || 'Anónimo'}</p>
                  <p className="mb-1"><strong>Notas:</strong> {cotizacion.notas || 'Sin notas'}</p>
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default MyCotizacionDetallePage;
