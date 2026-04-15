/**
 * ============================================
 * NAVBAR COMPONENT
 * ============================================
 * Barra de navegación principal con menú responsive
 */
import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import catalogoService from '../services/catalogoService';

const NavigationBar = memo(() => {
  const { user, isAuthenticated, isAdmin, isAuxiliar, isCliente, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [categorias, setCategorias] = useState([]);
  const [buscarLocal, setBuscarLocal] = useState('');
  const abortControllerRef = useRef(null); // Para cancelar peticiones anteriores

  const isCatalogo = location.pathname === '/catalogo';

  useEffect(() => {
    if (isCatalogo) {
      const loadCategorias = async () => {
        try {
          const response = await catalogoService.getCategorias();
          setCategorias(response.data.categorias);
        } catch (error) {
          console.error('Error al cargar categorías:', error);
        }
      };
      loadCategorias();
    }
  }, [isCatalogo]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setBuscarLocal(params.get('buscar') || '');
  }, [location.search]);

  // BÚSQUEDA INSTANTÁNEA (sin debounce)
  const handleBuscarChange = useCallback((e) => {
    const valor = e.target.value;
    setBuscarLocal(valor);
    
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Actualizar URL inmediatamente
    const params = new URLSearchParams(location.search);
    if (valor.trim()) {
      params.set('buscar', valor.trim());
    } else {
      params.delete('buscar');
    }
    params.set('pagina', '1');
    navigate(`/catalogo?${params.toString()}`);
  }, [location.search, navigate]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFiltrarPorCategoria = useCallback((categoriaId) => {
    const params = new URLSearchParams(location.search);
    if (categoriaId) {
      params.set('categoriaId', categoriaId);
    } else {
      params.delete('categoriaId');
    }
    params.delete('subcategoriaId');
    params.set('pagina', '1');
    navigate(`/catalogo?${params.toString()}`);
  }, [location.search, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="navbar shadow-sm">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/" style={{ fontWeight: '700', fontSize: '1.4rem', letterSpacing: '1px' }}>
          <i className="bi bi-shop me-2" style={{
            background: 'linear-gradient(135deg, #7d2181 0%, #ff0080 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }} />
          <span style={{
            background: 'linear-gradient(135deg, #7d2181 0%, #ff0080 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>YESA</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/" style={{ color: '#ffffff' }}>Inicio</Nav.Link>
            <Nav.Link as={Link} to="/catalogo" style={{ color: '#ffffff' }}>Catálogo</Nav.Link>

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

          {/* Buscador - filtrado instantáneo */}
          {isCatalogo && (
            <Form className="d-flex align-items-center me-3" onSubmit={(e) => e.preventDefault()}>
              <div className="position-relative">
                <FormControl
                  type="search"
                  placeholder="Buscar productos..."
                  value={buscarLocal}
                  onChange={handleBuscarChange}
                  autoComplete="off"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #E91E63',
                    borderRadius: '20px',
                    color: '#000000',
                    paddingRight: '2.2rem',
                    width: '220px',
                  }}
                />
                <i className="bi bi-search" style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#E91E63',
                  pointerEvents: 'none',
                }}></i>
              </div>
            </Form>
          )}

          {/* Dropdown con scroll */}
          {isCatalogo && categorias.length > 0 && (
            <NavDropdown 
              title={<><i className="bi bi-filter me-1"></i>Categorías</>} 
              id="categorias-dropdown" 
              className="me-2"
            >
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <NavDropdown.Item onClick={() => handleFiltrarPorCategoria('')}>
                  <i className="bi bi-grid-3x3-gap-fill me-2"></i>Todas las categorías
                </NavDropdown.Item>
                <NavDropdown.Divider />
                {categorias.map((cat) => (
                  <NavDropdown.Item key={cat.id} onClick={() => handleFiltrarPorCategoria(cat.id)}>
                    <i className="bi bi-tag me-2"></i>{cat.nombre}
                  </NavDropdown.Item>
                ))}
              </div>
            </NavDropdown>
          )}

          <Nav.Link as={Link} to="/carrito" className="btn-carrito me-2">
            <div style={{
              backgroundColor: '#E91E63',
              borderRadius: '8px',
              fontWeight: '500',
              height: '28px',
              padding: '0 5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ffff',
            }}>
              Carrito <i className="bi bi-cart3 text-white fs-5"></i>
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
                <NavDropdown title={<><i className="bi bi-person-circle me-1"></i>{user?.nombre}</>} id="user-dropdown" align="end">
                  <NavDropdown.Item as={Link} to="/perfil">Mi Perfil</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" className="me-2" style={{
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '500',
                }}>Iniciar Sesión</Button>
                <Button as={Link} to="/register" className="me-2" style={{
                  background: '#E91E63',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '500',
                }}>Registro</Button>
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