/**
 * ============================================
 * FOOTER COMPONENT
 * ============================================
 * Pie de página del sitio
 */

import React, { memo } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = memo(({ onOpenFAQ }) => {
  return (
    <footer className="bg-black text-light mt-5 py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5 style={{ color: '#E91E63' }}>
              <i className="bi bi-shop me-2"></i>
              YESA
            </h5>
            <p className="" style={{ fontSize: '0.95rem' }}>
              YESA es un ecommerce de orfebrería y cerámica artesanal con productos hechos a mano y una experiencia de compra exclusiva.
            </p>
          </Col>

          <Col md={3} className="mb-3">
            <h5 style={{ color: '#E91E63' }}>Categorías</h5>
            <ul className="list-unstyled">
              {[
                { label: 'Alcancías', query: 'Alcancías' },
                { label: 'Pocillos', query: 'Pocillos' },
                { label: 'Platos', query: 'Platos' },
                { label: 'Floreros', query: 'Floreros' },
                { label: 'Vasijas', query: 'Vasijas' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={`/catalogo?buscar=${encodeURIComponent(item.query)}`}
                    className="text-decoration-none"
                    style={{ color: '#ccc', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          <Col md={3} className="mb-3">
            <h5 style={{ color: '#E91E63' }}>Atención al Cliente</h5>
            <ul className="list-unstyled">
              <li style={{ marginBottom: '8px' }}>
                <a href="mailto:yesa@gmail.com" className="text-decoration-none" style={{ color: '#ccc', fontSize: '0.9rem' }}>
                  📧 yesa@gmail.com
                </a>
              </li>
              <li style={{ marginBottom: '8px' }}>
                <Button
                  variant="link"
                  className="text-decoration-none p-0 m-0"
                  style={{ 
                    color: '#ccc', 
                    fontSize: '0.9rem', 
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (onOpenFAQ) {
                      onOpenFAQ('envios');
                    }
                  }}
                >
                  Envíos
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="text-decoration-none p-0 m-0"
                  style={{ 
                    color: '#ccc', 
                    fontSize: '0.9rem', 
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (onOpenFAQ) {
                      onOpenFAQ('devoluciones');
                    }
                  }}
                >
                  Devoluciones
                </Button>
              </li>
            </ul>
          </Col>

          <Col md={2} className="mb-3">
            <h5 style={{ color: '#E91E63' }}>Síguenos</h5>
            <div className="d-flex gap-3 mt-1">
              <a href="https://facebook.com/yesa" target="_blank" rel="noreferrer" className="text-light">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="https://www.instagram.com/yesa_ai/" target="_blank" rel="noreferrer" className="text-light">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="https://twitter.com/yesa" target="_blank" rel="noreferrer" className="text-light">
                <i className="bi bi-twitter fs-5"></i>
              </a>
            </div>
          </Col>
        </Row>

        <hr style={{ borderColor: '#ffffff' }} />

        <Row>
          <Col className="text-center">
            <small style={{ color: '#888' }}>
              © {new Date().getFullYear()} YESA. Todos los derechos reservados.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;