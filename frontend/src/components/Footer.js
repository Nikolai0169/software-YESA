/**
 * ============================================
 * FOOTER COMPONENT
 * ============================================
 * Pie de página del sitio
 */

import React, { memo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = memo(() => {
  return (
    <footer className="bg-black text-light mt-5 py-4">
      <Container>
        <Row>
          {/* Columna 1: Sobre Nosotros */}
          <Col md={3} className="mb-3">
            <h5 style={{ color: '#E91E63' }}>Sobre Nosotros</h5>
            <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
              Artesanos dedicados a crear piezas únicas de cerámica con tradición y calidad.
            </p>
          </Col>

          {/* Columna 2: Categorías */}
          <Col md={3} className="mb-3">
            <h5 style={{ color: '#E91E63' }}>Categorías</h5>
            <ul className="list-unstyled">
              {['Alcancías', 'Pocillos', 'Platos', 'Floreros', 'Vasijas'].map((item) => (
                <li key={item}>
                  <Link
                    to="/catalogo"
                    className="text-decoration-none"
                    style={{ color: '#ccc', fontSize: '0.9rem' }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Columna 3: Atención al Cliente */}
          <Col md={3} className="mb-3">
            <h5 style={{ color: '#E91E63' }}>Atención al Cliente</h5>
            <ul className="list-unstyled">
              {[
                { label: 'Contacto', to: '/contacto' },
                { label: 'Envíos', to: '/envios' },
                { label: 'Devoluciones', to: '/devoluciones' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-decoration-none"
                    style={{ color: '#ccc', fontSize: '0.9rem' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          <Col md={3} className="mb-3">
            <h5 style={{ color: '#E91E63' }}>Síguenos</h5>
            <div className="d-flex gap-3 mt-1">
              <a href="#" className="text-light">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-light">
                <i className="bi bi-twitter fs-5"></i>
              </a>
            </div>
          </Col>
        </Row>

        <hr style={{ borderColor: '#333' }} />

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