import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, Badge } from 'react-bootstrap';
import Personalizacion3D from '../components/Personalizacion3D';
import {
  getSavedDesigns,
  deleteSavedDesign,
  clearSavedDesigns,
  setDesignToEdit,
} from '../services/personalizationService';
import { cotizarProducto } from '../services/api';

const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

const SavedDesignsPage = () => {
  const [designs, setDesigns] = useState([]);
  const [selectedDesignIds, setSelectedDesignIds] = useState([]);

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
    if (selectedDesignIds.length === 0) return;

    const selectedDesigns = designs.filter((design) => selectedDesignIds.includes(design.id));
    try {
      const results = await Promise.all(
        selectedDesigns.map(async (design) => {
          const quote = await cotizarProducto({
            modelo: design.modelo,
            colorInterior: design.colorInterior,
            colorBase: design.colorBase,
            colorExterior: design.colorExterior,
            colorAsa: design.colorAsa,
            textInterior: design.textInterior,
            textExterior: design.textExterior,
            textureUrl: design.textureUrl || design.texture || null,
            overlayText: design.overlayText || '',
            overlayTextFontFamily: design.overlayTextFontFamily || 'sans-serif',
            overlayTextFontSize: design.overlayTextFontSize || 24,
            overlayTextColor: design.overlayTextColor || '#ffffff',
            zoom: design.zoom || 1,
          });
          return { design, quote };
        })
      );

      const total = results.reduce((sum, item) => sum + (Number(item.quote.precio) || 0), 0);
      const details = results
        .map(
          (item) =>
            `${item.design.nombre || 'Diseño'}: ${item.quote.precio ? `$${item.quote.precio}` : 'Precio no disponible'}`
        )
        .join('\n');

      alert(`Cotización total: $${total}\n\n${details}`);
    } catch (error) {
      console.error('Error cotizando diseños seleccionados:', error);
      alert('Error al cotizar los diseños seleccionados. Intenta nuevamente.');
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
                <Button variant="outline-success" onClick={handleQuoteSelected}>
                  Cotizar seleccionados ({selectedDesignIds.length})
                </Button>
              )}
            </div>
          </div>

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
                const previewZoom = Math.min(design.zoom || 1, 0.8);
                return (
                  <Col key={design.id} xs={12} md={6} lg={4}>
                    <Card className="h-100 shadow-sm saved-design-card">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <Card.Title>{design.nombre || 'Diseño personalizado'}</Card.Title>
                            <Badge bg="secondary" className="saved-designs-badge">
                              {design.modelo || 'Modelo 3D'}
                            </Badge>
                          </div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
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
                              className="px-3"
                              onClick={() => handleEdit(design)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="px-2"
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
                          <p className="mb-1"><strong>Texto:</strong></p>
                          <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-light text-dark">Interior: {design.textInterior || '---'}</span>
                            <span className="badge bg-light text-dark">Exterior: {design.textExterior || '---'}</span>
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
