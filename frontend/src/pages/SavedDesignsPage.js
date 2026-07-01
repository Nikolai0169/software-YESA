import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, Badge } from 'react-bootstrap';
import Personalizacion3D from '../components/Personalizacion3D';
import { formatCurrency, normalizePersonalizacionDesign } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import {
  getSavedDesigns,
  deleteSavedDesign,
  clearSavedDesigns,
  setDesignToEdit,
} from '../services/personalizationService';
import { cotizarProducto } from '../services/api';

const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:');

const buildQuotePayload = (designs) =>
  designs.map((design) => {
    const payload = { ...design };

    if (isDataUrl(payload.textureUrl)) {
      delete payload.textureUrl;
    }

    delete payload.texture;
    delete payload.composedTextureUrl;

    return payload;
  });

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  } catch {
    return dateString;
  }
};

const capitalizeFirst = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const isDefaultDesignName = (name) =>
  name && name.toLowerCase().startsWith('diseño personalizado');

const SavedDesignsPage = () => {
  const [designs, setDesigns] = useState([]);
  const [selectedDesignIds, setSelectedDesignIds] = useState([]);
  const [quoteSummary, setQuoteSummary] = useState(null);
  const [quotedDesigns, setQuotedDesigns] = useState([]);
  const [quotingSelected, setQuotingSelected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setDesigns(getSavedDesigns());
  }, []);

  const navigate = useNavigate();

  const reloadDesigns = () => {
    const refreshed = getSavedDesigns();
    setDesigns(refreshed);
    setSelectedDesignIds((prev) => prev.filter((id) => refreshed.some((design) => design.id === id)));
  };

  const handleDelete = (id) => {
    deleteSavedDesign(id);
    setSelectedDesignIds((prev) => prev.filter((selectedId) => selectedId !== id));
    reloadDesigns();
  };

  const handleToggleSelect = (designId) => {
    setSelectedDesignIds((prev) =>
      prev.includes(designId)
        ? prev.filter((selectedId) => selectedId !== designId)
        : [...prev, designId]
    );
  };

  const handleQuoteSelected = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para cotizar tus diseños guardados.');
      navigate('/login');
      return;
    }

    if (selectedDesignIds.length === 0) return;

    const selectedDesigns = designs
      .filter((design) => selectedDesignIds.includes(design.id))
      .map((design) => normalizePersonalizacionDesign(design));
    const selectedItems = selectedDesigns.map((design, index) => ({
      nombre: design.nombre || `Diseño ${index + 1}`,
      modelo: design.modelo,
      colorInterior: design.colorInterior,
      colorBase: design.colorBase,
      colorExterior: design.colorExterior,
      colorAsa: design.colorAsa,
      textInterior: design.textInterior,
      textExterior: design.textExterior,
      hasTexture: Boolean(design.textureUrl || design.texture),
      textureUrl: design.textureUrl || design.texture || null,
      overlayText: design.overlayText || '',
      overlayTextFontFamily: design.overlayTextFontFamily || 'sans-serif',
      overlayTextFontSize: design.overlayTextFontSize,
      overlayTextColor: design.overlayTextColor || '#ffffff',
      textureOffsetX: design.textureOffsetX,
      textureOffsetY: design.textureOffsetY,
      textureScale: design.textureScale,
      zoom: design.zoom,
    }));

    setQuotingSelected(true);
    setQuoteSummary(null);
    setQuotedDesigns([]);

    try {
      const response = await cotizarProducto({ disenos: buildQuotePayload(selectedItems) });
      const quote = response.cotizacion;
      setQuoteSummary({
        cotizacion: quote,
        items: quote?.items || selectedItems,
        mensaje: response.mensaje || 'Cotización enviada y pendiente',
      });
      setQuotedDesigns(selectedDesigns);
        // Eliminar los diseños seleccionados que se enviaron a cotización
        selectedDesigns.forEach((d) => deleteSavedDesign(d.id));
        // Refrescar lista y limpiar selección
        reloadDesigns();
        setSelectedDesignIds([]);
    } catch (error) {
      console.error('Error cotizando diseños seleccionados:', error);
      const message = error.response?.data?.message || 'Error al cotizar los diseños seleccionados. Intenta nuevamente.';
      setQuoteSummary({ error: true, mensaje: message });
      setQuotedDesigns([]);
    } finally {
      setQuotingSelected(false);
    }
  };

  const handleEdit = (design) => {
    setDesignToEdit(design);
    navigate('/personalizacion');
  };

  const handleClearAll = () => {
    if (!window.confirm('¿Eliminar todos los diseños guardados?')) return;
    clearSavedDesigns();
    reloadDesigns();
  };

  return (
    <div className="container py-5 saved-designs-page">
      <div className="saved-designs-card mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="d-flex flex-column gap-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h1 className="display-5">Diseños guardados</h1>
              <p className="text-muted mb-0">
                Aquí encontrarás los diseños 3D que guardaste.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <Button as={Link} to="/personalizacion" variant="outline-primary">
                Crear nuevo diseño
              </Button>
              <Button variant="outline-danger" onClick={handleClearAll} disabled={designs.length === 0}>
                Eliminar todo
              </Button>
              {selectedDesignIds.length > 0 && (
                <Button
                    variant="outline-success"
                    onClick={handleQuoteSelected}
                    disabled={quotingSelected || !isAuthenticated}
                  >
                  {quotingSelected
                    ? `Cotizando... (${selectedDesignIds.length})`
                    : isAuthenticated
                      ? `Cotizar seleccionados (${selectedDesignIds.length})`
                      : 'Inicia sesión para cotizar'}
                </Button>
              )}
            </div>
          </div>

            {!isAuthenticated && selectedDesignIds.length > 0 && (
              <div className="alert alert-warning mt-4">
                Debes iniciar sesión para cotizar tus diseños guardados.
              </div>
            )}

          {quoteSummary && (
            <>
              <div className={`alert ${quoteSummary.error ? 'alert-danger' : 'alert-success'} mt-4`}>
                {quoteSummary.error ? (
                  <div>{quoteSummary.mensaje}</div>
                ) : (
                  <>
                    <div className="mb-2">
                      <strong>Cotización creada:</strong> {quoteSummary.cotizacion?.nombre || quoteSummary.mensaje}
                    </div>
                    <div className="mb-2">
                      <strong>Diseños:</strong> {quoteSummary.items.length}
                    </div>
                    <div className="mb-2">
                      <strong>Precio estimado:</strong>{' '}
                      {quoteSummary.cotizacion?.precio !== undefined
                        ? formatCurrency(quoteSummary.cotizacion.precio)
                        : 'Pendiente'}
                    </div>
                    {quoteSummary.items.map((item, index) => (
                      <div key={index} className="small">
                        • {item.nombre} ({item.modelo || 'Taza'})
                      </div>
                    ))}
                  </>
                )}
              </div>

              {!quoteSummary.error && quotedDesigns.length > 0 && (
                <div className="mb-4">
                  <h5 className="mb-3">Vista previa de los diseños cotizados</h5>
                  <Row className="g-3">
                    {quotedDesigns.map((design, index) => (
                      <Col key={`preview-${design.id || index}`} xs={12} md={6} lg={4}>
                        <Card className="h-100 shadow-sm">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <Card.Subtitle className="text-muted">Diseño {index + 1}</Card.Subtitle>
                                <div className="fw-bold">{design.nombre || `Diseño ${index + 1}`}</div>
                              </div>
                              <Badge bg="secondary" className="text-capitalize">
                                {capitalizeFirst(design.modelo || 'Taza')}
                              </Badge>
                            </div>

                            <div className="border rounded overflow-hidden" style={{ minHeight: '220px', backgroundColor: '#111' }}>
                              <Personalizacion3D
                                modelo={design.modelo || 'taza'}
                                colorInterior={design.colorInterior || '#ffffff'}
                                colorBase={design.colorBase || '#ffffff'}
                                colorExterior={design.colorExterior || '#ffffff'}
                                colorAsa={design.colorAsa || '#ffffff'}
                                texture={design.textureUrl || null}
                                overlayText={design.overlayText || ''}
                                overlayTextFontFamily={design.overlayTextFontFamily || 'sans-serif'}
                                overlayTextFontSize={design.overlayTextFontSize || 24}
                                overlayTextColor={design.overlayTextColor || '#ffffff'}
                                textInterior={design.textInterior || ''}
                                textExterior={design.textExterior || ''}
                                zoom={0.9}
                                autoRotate={false}
                                textureOffset={{
                                  x: design.textureOffsetX || 0,
                                  y: design.textureOffsetY || 0,
                                }}
                                textureScale={design.textureScale || 1}
                              />
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </>
          )}

          {designs.length === 0 ? (
            <div className="text-center py-5">
              <p className="lead text-muted">Aún no has guardado ningún diseño.</p>
              <Button as={Link} to="/personalizacion" variant="primary">
                Ir a personalización
              </Button>
            </div>
          ) : (
            <Row className="g-4">
              {designs.map((design) => {
                const previewZoom = 1.3;
                return (
                  <Col key={design.id} xs={12} md={6} lg={4}>
                    <Card className="h-100 shadow-sm saved-design-card">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
                          <div>
                            {!isDefaultDesignName(design.nombre) && (
                              <Card.Title>{design.nombre}</Card.Title>
                            )}
                            <Badge bg="secondary" className="saved-designs-badge">
                              {capitalizeFirst(design.modelo || 'Taza')}
                            </Badge>
                          </div>
                          <div className="d-flex align-items-center gap-2 justify-content-end flex-nowrap">
                            <div className="form-check mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`select-design-${design.id}`}
                                checked={selectedDesignIds.includes(design.id)}
                                onChange={() => handleToggleSelect(design.id)}
                              />
                              <label className="visually-hidden" htmlFor={`select-design-${design.id}`}>
                                Seleccionar diseño
                              </label>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="btn-icon"
                              onClick={() => handleEdit(design)}
                              aria-label="Editar diseño"
                            >
                              <i className="bi bi-pencil-square" />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="btn-icon"
                              onClick={() => handleDelete(design.id)}
                              aria-label="Eliminar diseño"
                            >
                              <i className="bi bi-trash" />
                            </Button>
                          </div>
                        </div>

                        <div className="mb-3 saved-design-preview">
                          <div className="saved-design-preview-frame">
                            <Personalizacion3D
                              modelo={design.modelo || 'taza'}
                              colorInterior={design.colorInterior || '#ffffff'}
                              colorBase={design.colorBase || '#ffffff'}
                              colorExterior={design.colorExterior || '#ffffff'}
                              colorAsa={design.colorAsa || '#ffffff'}
                              texture={design.textureUrl || design.texture || null}
                              overlayText={design.overlayText || ''}
                              overlayTextFontFamily={design.overlayTextFontFamily || 'sans-serif'}
                              overlayTextFontSize={design.overlayTextFontSize || 24}
                              overlayTextColor={design.overlayTextColor || '#ffffff'}
                              textInterior={design.textInterior || ''}
                              textExterior={design.textExterior || ''}
                              zoom={previewZoom}
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="mb-1"><strong>Colores:</strong></p>
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            {[
                              { label: 'Interior', color: design.colorInterior },
                              { label: 'Base', color: design.colorBase },
                              { label: 'Exterior', color: design.colorExterior },
                              { label: 'Asa', color: design.colorAsa },
                            ].map((item) => (
                              <div key={item.label} className="saved-designs-color-item" title={item.color}>
                                <span className="saved-designs-color-swatch" style={{ backgroundColor: item.color }} />
                                <span className="saved-designs-color-label">{item.label}</span>
                              </div>
                            ))}
                          </div>
                          <p className="mb-1"><strong>Texto aplicado:</strong></p>
                          <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
                            <span
                              className="badge bg-light text-dark text-wrap text-start"
                              style={{
                                maxWidth: '100%',
                                fontFamily: design.overlayTextFontFamily || 'sans-serif',
                                fontSize: '0.95rem',
                                lineHeight: '1.4',
                              }}
                            >
                              {design.overlayText || 'Sin texto aplicado'}
                            </span>
                            <div className="saved-designs-color-item" title={design.overlayTextColor || '#000000'}>
                              <span
                                className="saved-designs-color-swatch"
                                style={{ backgroundColor: design.overlayTextColor || '#000000' }}
                              />
                              <span className="saved-designs-color-label">Color</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <p className="text-muted small mb-0">Guardado: {formatDate(design.savedAt)}</p>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedDesignsPage;
