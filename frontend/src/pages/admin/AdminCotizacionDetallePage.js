import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import Personalizacion3D from '../../components/Personalizacion3D';
import { obtenerCotizacion } from '../../services/api';
import { formatCurrency, getEstadoBadge } from '../../utils/helpers';

const AdminCotizacionDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [composedPreviews, setComposedPreviews] = useState({});

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

  const composePreviewImage = (item) => {
    return new Promise((resolve) => {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Fill background with exterior color or white
      const bg = item.colorExterior || '#ffffff';
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, size, size);

      const drawAndResolve = (image) => {
        if (image) {
          const scale = item.textureScale || 1;
          const offsetX = item.textureOffsetX || 0;
          const offsetY = item.textureOffsetY || 0;
          const scaledSize = size * scale;
          const centerOffset = (size - scaledSize) / 2;
          ctx.drawImage(image, centerOffset + offsetX, centerOffset + offsetY, scaledSize, scaledSize);
        }

        // Draw overlay text
        if (item.overlayText) {
          ctx.fillStyle = item.overlayTextColor || '#ffffff';
          const fontSize = item.overlayTextFontSize || 24;
          const fontFamily = item.overlayTextFontFamily || 'sans-serif';
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const lines = (item.overlayText || '').split('\n');
          const lineHeight = fontSize + 10;
          lines.forEach((line, index) => {
            ctx.fillText(line, size / 2, size / 2 + (index - (lines.length - 1) / 2) * lineHeight);
          });
        }

        resolve(canvas.toDataURL('image/png'));
      };

      if (!item.textureUrl) {
        drawAndResolve(null);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => drawAndResolve(img);
      img.onerror = () => drawAndResolve(null);
      img.src = item.textureUrl;
    });
  };

  useEffect(() => {
    if (!cotizacion) return;
    const items = Array.isArray(cotizacion.items) ? cotizacion.items : [cotizacion];
    const promises = items.map((it) => composePreviewImage(it));
    Promise.all(promises).then((results) => {
      const map = {};
      results.forEach((res, idx) => (map[idx] = res));
      setComposedPreviews(map);
    });
  }, [cotizacion]);

  const designItems = Array.isArray(cotizacion?.items) ? cotizacion.items : [cotizacion];
  const previewSource = designItems[0] || {};
  const multipleDesigns = designItems.length > 1;

  return (
    <Container className="py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="display-6">Detalle de cotización</h1>
          <p className="text-muted mb-0">Revisa el diseño asociado y todas las características aplicadas.</p>
        </div>
        <Button variant="outline-secondary" onClick={() => navigate('/admin/cotizaciones')}>
          Volver a cotizaciones
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
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <Card className="shadow-sm">
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
                  <Badge bg={getEstadoBadge(cotizacion.estado)} className="text-capitalize">
                    {cotizacion.estado}
                  </Badge>
                </div>

                <div className="border rounded overflow-hidden mb-4" style={{ minHeight: '380px', backgroundColor: '#111' }}>
                  {composedPreviews[0] ? (
                    <div style={{ minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }}>
                      <img src={composedPreviews[0]} alt={previewSource.nombre || 'Preview'} style={{ maxHeight: '360px', objectFit: 'contain' }} />
                    </div>
                  ) : (
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
                      textureOffset={{
                        x: previewSource.textureOffsetX || 0,
                        y: previewSource.textureOffsetY || 0,
                      }}
                      textureScale={previewSource.textureScale || 1}
                    />
                  )}
                </div>

                {(composedPreviews[0] || previewSource.textureUrl) && (
                  <div className="mb-4">
                    <span className="d-block text-muted small mb-2">Textura aplicada</span>
                    <img
                      src={composedPreviews[0] || previewSource.textureUrl}
                      alt="Textura aplicada"
                      className="img-fluid rounded"
                      style={{ maxHeight: '260px', objectFit: 'contain' }}
                    />
                  </div>
                )}
                {multipleDesigns && (
                  <div className="mb-4">
                    <h6 className="mb-2">Diseños incluidos</h6>
                    <ul className="small">
                      {designItems.map((item, index) => (
                        <li key={index}>
                          <strong>{item.nombre}</strong> - {item.modelo || 'taza'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-3">
                  <div>
                    <span className="text-muted d-block small">Precio estimado</span>
                    <strong>{cotizacion.precio !== undefined && cotizacion.precio !== null ? formatCurrency(cotizacion.precio) : 'Pendiente'}</strong>
                  </div>
                  <div>
                    <span className="text-muted d-block small">Modelo</span>
                    <strong>{cotizacion.modelo || 'taza'}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={6}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Detalles del diseño</h5>
                <dl className="row">
                  <dt className="col-sm-5 text-muted">Nombre</dt>
                  <dd className="col-sm-7">{cotizacion.nombre || 'Sin nombre'}</dd>

                  <dt className="col-sm-5 text-muted">Usuario</dt>
                  <dd className="col-sm-7">{cotizacion.usuario?.email || cotizacion.usuarioEmail || 'Anónimo'}</dd>

                  <dt className="col-sm-5 text-muted">Fecha</dt>
                  <dd className="col-sm-7">{new Date(cotizacion.createdAt).toLocaleString('es-CO')}</dd>

                  <dt className="col-sm-5 text-muted">Notas</dt>
                  <dd className="col-sm-7">{cotizacion.notas || 'Sin notas'}</dd>
                </dl>

                {multipleDesigns && (
                  <>
                    <h5 className="mt-4 mb-3">Diseños incluidos</h5>
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
                                <Badge bg="secondary" className="text-capitalize">
                                  {item.modelo || 'taza'}
                                </Badge>
                              </div>

                              <div className="border rounded overflow-hidden" style={{ minHeight: '220px', backgroundColor: '#111' }}>
                                {composedPreviews[index] ? (
                                  <img src={composedPreviews[index]} alt={item.nombre || `Diseño ${index + 1}`} className="img-fluid w-100 h-100" style={{ objectFit: 'contain', maxHeight: '220px' }} />
                                ) : (
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
                                    textureOffset={{
                                      x: item.textureOffsetX || 0,
                                      y: item.textureOffsetY || 0,
                                    }}
                                    textureScale={item.textureScale || 1}
                                  />
                                )}
                              </div>

                              <div className="mt-3 text-muted small">
                                <div>Overlay: {item.overlayText || 'No aplica'}</div>
                                <div>Color interior: {item.colorInterior || 'N/A'}</div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}

                <h5 className="mt-4 mb-3">Colores aplicados</h5>
                <div className="d-flex flex-wrap gap-3 mb-4">
                  {[
                    { label: 'Interior', color: cotizacion.colorInterior },
                    { label: 'Base', color: cotizacion.colorBase },
                    { label: 'Exterior', color: cotizacion.colorExterior },
                    { label: 'Asa', color: cotizacion.colorAsa },
                  ].map((item) => (
                    <div key={item.label} className="text-center" style={{ minWidth: '95px' }}>
                      <div className="rounded-circle border" style={{ width: '40px', height: '40px', backgroundColor: item.color || '#ffffff' }} />
                      <small className="d-block mt-2">{item.label}</small>
                    </div>
                  ))}
                </div>

                <h5 className="mb-3">Texto aplicado</h5>
                <div className="mb-2">
                  <p className="mb-1"><strong>Overlay:</strong> {cotizacion.overlayText || 'No aplica'}</p>
                  <p className="mb-1"><strong>Fuente:</strong> {cotizacion.overlayTextFontFamily || 'sans-serif'}</p>
                  <p className="mb-1"><strong>Tamaño:</strong> {cotizacion.overlayTextFontSize || 24}</p>
                  <p className="mb-1">
                    <strong>Color:</strong>{' '}
                    <span className="badge bg-light text-dark" style={{ backgroundColor: cotizacion.overlayTextColor || '#000000' }}>
                      {cotizacion.overlayTextColor || '#000000'}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="mb-1"><strong>Texto interior:</strong> {cotizacion.textInterior || 'No aplica'}</p>
                  <p className="mb-1"><strong>Texto exterior:</strong> {cotizacion.textExterior || 'No aplica'}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AdminCotizacionDetallePage;
