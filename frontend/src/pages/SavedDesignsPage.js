import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Row, Col, Badge } from 'react-bootstrap';
import Personalizacion3D from '../components/Personalizacion3D';
import {
  getSavedDesigns,
  deleteSavedDesign,
  clearSavedDesigns,
} from '../services/personalizationService';

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

  useEffect(() => {
    setDesigns(getSavedDesigns());
  }, []);

  const reloadDesigns = () => {
    setDesigns(getSavedDesigns());
  };

  const handleDelete = (id) => {
    deleteSavedDesign(id);
    reloadDesigns();
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
                Aquí encontrarás los diseños 3D que guardaste desde la pantalla de personalización.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button as={Link} to="/personalizacion" variant="outline-primary">
                Crear nuevo diseño
              </Button>
              <Button variant="outline-danger" onClick={handleClearAll} disabled={designs.length === 0}>
                Eliminar todo
              </Button>
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
                    <Card className="h-100 shadow-sm">
                      <Card.Body className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <Card.Title>{design.nombre || 'Diseño personalizado'}</Card.Title>
                            <Badge bg="secondary" className="saved-designs-badge">
                              {design.modelo || 'Modelo 3D'}
                            </Badge>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(design.id)}
                          >
                            Eliminar
                          </Button>
                        </div>

                        <div className="mb-3 saved-design-preview">
                          <div className="saved-design-preview-frame">
                            <Personalizacion3D
                              modelo={design.modelo || 'taza'}
                              colorInterior={design.colorInterior || '#ffffff'}
                              colorBase={design.colorBase || '#ffffff'}
                              colorExterior={design.colorExterior || '#ffffff'}
                              colorAsa={design.colorAsa || '#ffffff'}
                              texture={design.textureUrl || null}
                              textInterior={design.textInterior || ''}
                              textExterior={design.textExterior || ''}
                              zoom={previewZoom}
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                        <p className="mb-1"><strong>Colores:</strong></p>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <span className="badge bg-light text-dark">Interior: {design.colorInterior}</span>
                          <span className="badge bg-light text-dark">Base: {design.colorBase}</span>
                          <span className="badge bg-light text-dark">Exterior: {design.colorExterior}</span>
                          <span className="badge bg-light text-dark">Asa: {design.colorAsa}</span>
                        </div>
                        <p className="mb-1"><strong>Texto:</strong></p>
                        <div className="d-flex flex-wrap gap-2">
                          <span className="badge bg-light text-dark">Interior: {design.textInterior || '---'}</span>
                          <span className="badge bg-light text-dark">Exterior: {design.textExterior || '---'}</span>
                        </div>
                      </div>

                      <div className="mt-auto">
                        <p className="text-muted small mb-1">Guardado: {formatDate(design.savedAt)}</p>
                        <p className="text-muted small mb-0">Zoom: {Math.round(previewZoom * 100)}%</p>
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
