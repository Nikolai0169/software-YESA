/**
 * ============================================
 * PERSONALIZATION 3D MODAL
 * ============================================
 * Modal para seleccionar opciones de personalización relacionadas
 * con modelos 3D y acabados del producto.
 */

import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';

const modelOptions = [
  { id: 'modelo-1', label: 'Modelo clásico', description: 'Diseño estándar con acabado elegante.' },
  { id: 'modelo-2', label: 'Modelo premium', description: 'Mejor detalle y acabados especiales.' },
  { id: 'modelo-3', label: 'Modelo deportivo', description: 'Estilo moderno y formas dinámicas.' }
];

const colorOptions = [
  { id: 'negro', label: 'Negro' },
  { id: 'blanco', label: 'Blanco' },
  { id: 'azul', label: 'Azul' },
  { id: 'rojo', label: 'Rojo' }
];

const finishOptions = [
  { id: 'mate', label: 'Mate' },
  { id: 'brillante', label: 'Brillante' },
  { id: 'texturizado', label: 'Texturizado' }
];

const Personalization3DModal = ({ show, onHide, producto, onPersonalizationComplete }) => {
  const [selectedModel, setSelectedModel] = useState(modelOptions[0].id);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].id);
  const [selectedFinish, setSelectedFinish] = useState(finishOptions[0].id);

  const handleSubmit = () => {
    const personalizationData = {
      productoId: producto.id,
      modelo: selectedModel,
      color: selectedColor,
      acabado: selectedFinish,
    };
    onPersonalizationComplete(personalizationData);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-box-seam me-2"></i>
          Personaliza tu producto
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-4">
          Selecciona el modelo 3D y las opciones de color o acabado antes de agregar el producto al carrito.
        </p>

        <Row className="g-4">
          <Col md={6}>
            <div className="border rounded-4 p-3 h-100">
              <h6>Modelos 3D</h6>
              <Form.Group>
                {modelOptions.map((option) => (
                  <Form.Check
                    key={option.id}
                    type="radio"
                    name="modelo3d"
                    id={option.id}
                    label={<><strong>{option.label}</strong><div className="text-muted small">{option.description}</div></>}
                    checked={selectedModel === option.id}
                    onChange={() => setSelectedModel(option.id)}
                    className="mb-3"
                  />
                ))}
              </Form.Group>
            </div>
          </Col>

          <Col md={6}>
            <div className="border rounded-4 p-3 h-100">
              <h6>Colores y acabados</h6>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Color</Form.Label>
                {colorOptions.map((option) => (
                  <Form.Check
                    key={option.id}
                    type="radio"
                    name="color"
                    id={`color-${option.id}`}
                    label={option.label}
                    checked={selectedColor === option.id}
                    onChange={() => setSelectedColor(option.id)}
                    className="mb-2"
                  />
                ))}
              </Form.Group>

              <Form.Group>
                <Form.Label className="fw-semibold">Acabado</Form.Label>
                {finishOptions.map((option) => (
                  <Form.Check
                    key={option.id}
                    type="radio"
                    name="acabado"
                    id={`acabado-${option.id}`}
                    label={option.label}
                    checked={selectedFinish === option.id}
                    onChange={() => setSelectedFinish(option.id)}
                    className="mb-2"
                  />
                ))}
              </Form.Group>
            </div>
          </Col>
        </Row>

        <div className="mt-4 border rounded-4 p-3 bg-light">
          <h6>Vista previa</h6>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Badge bg="secondary">{modelOptions.find((opt) => opt.id === selectedModel)?.label}</Badge>
            <Badge bg="info">Color: {selectedColor}</Badge>
            <Badge bg="primary">Acabado: {selectedFinish}</Badge>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Aplicar personalización
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Personalization3DModal;
