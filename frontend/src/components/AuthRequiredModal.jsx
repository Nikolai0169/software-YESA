import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const AuthRequiredModal = ({ show, onClose, onLogin, title, message }) => {
  return (
    <Modal show={!!show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Se requiere sesión'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message || 'Para continuar con la cotización debes iniciar sesión en tu cuenta.'}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onLogin}>
          Iniciar sesión
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AuthRequiredModal;
