/**
 * ============================================
 * NAVBAR COMPONENT
 * ============================================
 * Barra de navegación principal con menú responsive
 */

import React, { memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const NavigationBar = memo(() => {
  const { user, isAuthenticated, isAdmin, isAuxiliar, isCliente, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <Navbar bg='black' variant="dark" expand="lg" sticky="top" className="navbar shadow-sm">
      <Container fluid className="px-4">

        {/* Brand */}
        <Navbar.Brand as={Link} to="/" style={{ fontWeight: '700', fontSize: '1.4rem', color: '#ffffff', letterSpacing: '1px' }}>
          YESA
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/" style={{ color: '#ffffff' }}>Inicio</Nav.Link>
            <Nav.Link as={Link} to="/catalogo" style={{ color: '#ffffff' }}>Crea tu propio producto</Nav.Link>

            {/* Menú Admin / Auxiliar (sin cambios) */}
            {(isAdmin || isAuxiliar) && (
              <NavDropdown title="Administración" id="admin-dropdown">
                <NavDropdown.Item as={Link} to="/admin/dashboard">
                  <i className="bi bi-speedometer2 me-2"></i>Dashboard
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin/categorias">Categorías</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/subcategorias">Subcategorías</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/admin/productos">Productos</NavDropdown.Item>
                {isAdmin && (
                  <>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/admin/usuarios">Usuarios</NavDropdown.Item>
                  </>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/admin/pedidos">Pedidos</NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>

          {/* Buscador */}
          <Form className="d-flex align-items-center me-3">
            <div className="position-relative">
              <FormControl
                type="search"
                placeholder="Buscar productos..."
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #E91E63',
                  borderRadius: '20px',
                  color: '#ffffff',
                  paddingRight: '2.2rem',
                  width: '220px',
                }}
              />
              <i
                className="bi bi-search"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#E91E63',
                  pointerEvents: 'none',
                }}
              ></i>
            </div>
          </Form>

          {/* Botón Filtros */}
          <NavDropdown
            title={<><i>Filtros</i></>}>
            <NavDropdown.Item as={Link} to="/">Pocillos</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/">Platos</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/">Alcancías</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/">Jarrones</NavDropdown.Item>
          </NavDropdown>

          {/* Botón cuadrado rosa (decorativo / carrito) */}
          <Nav.Link as={Link} to="/carrito" className="btn-carrito me-2">
            <div style={{
              backgroundColor: '#E91E63',
              borderColor: '#E91E63',
              borderRadius: '8px',
              fontWeight: '500',
              height: '28px',
              padding: '0 5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ffff',
            }}>
              Carrito
              <i className="bi bi-cart3 text-white fs-5"></i>
            </div>
          </Nav.Link>

          <Nav className="align-items-center">
            {isAuthenticated ? (
              <>
                {isCliente && (
                  <Button as={Link} to="/mis-pedidos" style={{ 
                    color: '#fff',
                    backgroundColor: 'transparent',
                    borderRadius: '8px',
                    fontWeight: '500',
                    }}>
                    <i className="bi bi-box-seam me-1"></i>Mis Pedidos
                  </Button>
                )}

                <NavDropdown
                  title={<><i className="bi bi-person-circle me-1"></i>{user?.nombre}</>}
                  id="user-dropdown"
                  align="end">
                  <NavDropdown.Item as={Link} to="/perfil">Mi Perfil</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/login"
                  className="me-2"
                  style={{
                    backgroundColor: 'transparent',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '500',
                  }}>
                  Iniciar Sesión
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  className="me-2"
                  style={{
                    background: '#E91E63',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '500',
                  }}>
                  Registro
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
});

NavigationBar.displayName = 'NavigationBar';

export default NavigationBar;