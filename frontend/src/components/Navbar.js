/**
 * ============================================
 * NAVBAR COMPONENT
 * ============================================
 * Barra de navegación principal con menú responsive
 */
import React, { memo, useCallback, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Form, FormControl, Button, Offcanvas } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import catalogoService from '../services/catalogoService';
import FAQModal from './FAQModal';

const NavigationBar = memo(({ onOpenFAQ, theme = 'light', toggleTheme }) => {
  const { isAuthenticated, isAdmin, isAuxiliar, isCliente, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [buscarLocal, setBuscarLocal] = useState('');
  const [categoriaSeleccionadaId, setCategoriaSeleccionadaId] = useState('');
  const [subcategoriaSeleccionadaId, setSubcategoriaSeleccionadaId] = useState('');
  const [cargandoSubcategorias, setCargandoSubcategorias] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    setCategoriaSeleccionadaId(params.get('categoriaId') || '');
    setSubcategoriaSeleccionadaId(params.get('subcategoriaId') || '');
  }, [location.search]);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const cargarSubcategorias = async () => {
      if (!isCatalogo || !categoriaSeleccionadaId) {
        setSubcategorias([]);
        return;
      }

      try {
        setCargandoSubcategorias(true);
        const response = await catalogoService.getSubcategoriasPorCategoria(categoriaSeleccionadaId);
        setSubcategorias(response.data.subcategorias || []);
      } catch (error) {
        console.error('Error al cargar subcategorías:', error);
        setSubcategorias([]);
      } finally {
        setCargandoSubcategorias(false);
      }
    };

    cargarSubcategorias();
  }, [categoriaSeleccionadaId, isCatalogo]);

  const handleBuscarChange = useCallback((e) => {
    const valor = e.target.value;
    setBuscarLocal(valor);

    const params = new URLSearchParams(location.search);
    if (valor.trim()) {
      params.set('buscar', valor.trim());
    } else {
      params.delete('buscar');
    }
    params.set('pagina', '1');
    navigate(`/catalogo?${params.toString()}`);
  }, [location.search, navigate]);

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

  const handleFiltrarPorSubcategoria = useCallback((subcategoriaId) => {
    const params = new URLSearchParams(location.search);
    if (categoriaSeleccionadaId) {
      params.set('categoriaId', categoriaSeleccionadaId);
    }
    if (subcategoriaId) {
      params.set('subcategoriaId', subcategoriaId);
    } else {
      params.delete('subcategoriaId');
    }
    params.set('pagina', '1');
    navigate(`/catalogo?${params.toString()}`);
  }, [categoriaSeleccionadaId, location.search, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <>
      <FAQModal show={showFAQ} onHide={() => setShowFAQ(false)} openSection={null} setShowFAQ={setShowFAQ} />
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

        <Nav className="mobile-quick-links d-lg-none" aria-label="Navegación principal">
          <Nav.Link as={Link} to="/" className="mobile-quick-link">
            <i className="bi bi-house me-1"></i>Inicio
          </Nav.Link>
          <Nav.Link as={Link} to="/catalogo" className="mobile-quick-link">
            <i className="bi bi-grid me-1"></i>Catálogo
          </Nav.Link>
        </Nav>

        <Navbar.Toggle
          aria-controls="mobile-navigation"
          className="d-lg-none"
          onClick={() => setShowMobileMenu(true)}
        />
        <Navbar.Collapse id="basic-navbar-nav" className="desktop-navbar-collapse">
          <Nav className="me-auto align-items-center">
            <Nav.Link as={Link} to="/" style={{ color: '#ffffff' }}>Inicio</Nav.Link>
            {!isCatalogo && (
              <Nav.Link as={Link} to="/catalogo" style={{ color: '#ffffff' }}>Catálogo</Nav.Link>
            )}

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
                {isAdmin && (
                  <>
                    <NavDropdown.Item as={Link} to="/admin/cotizaciones">Cotizaciones</NavDropdown.Item>
                  </>
                )}
              </NavDropdown>
            )}
          </Nav>

          {isCatalogo && (
            <Form
              className="search-form d-flex align-items-center me-3 my-2 my-lg-0"
              style={{ minWidth: 0 }}
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="position-relative" style={{ width: 'clamp(180px, 18vw, 260px)', minWidth: 0 }}>
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
                    width: '100%',
                    minWidth: 0,
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

          {isCatalogo && categorias.length > 0 && (
            <NavDropdown 
              title={<><i className="bi bi-filter me-1"></i>Filtrar</>} 
              id="categorias-dropdown" 
              className="me-2"
              autoClose="outside"
            >
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {!categoriaSeleccionadaId ? (
                  <>
                    <NavDropdown.Item onClick={() => handleFiltrarPorCategoria('')}>
                      <i className="bi bi-grid-3x3-gap-fill me-2"></i>Todas las categorías
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    {categorias.map((cat) => (
                      <NavDropdown.Item key={cat.id} onClick={() => handleFiltrarPorCategoria(cat.id)}>
                        <i className="bi bi-tag me-2"></i>{cat.nombre}
                      </NavDropdown.Item>
                    ))}
                  </>
                ) : (
                  <>
                    <NavDropdown.Item onClick={() => handleFiltrarPorCategoria('')}>
                      <i className="bi bi-arrow-left me-2"></i>Volver a todas las categorías
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <div className="px-3 py-2">
                      <div className="fw-semibold mb-2">
                        <i className="bi bi-tag-fill me-2"></i>
                        {categorias.find((cat) => String(cat.id) === String(categoriaSeleccionadaId))?.nombre || 'Categoría seleccionada'}
                      </div>
                      <div className="small text-muted mb-2">Subcategorías</div>
                      {cargandoSubcategorias ? (
                        <div className="small text-muted">Cargando subcategorías...</div>
                      ) : subcategorias.length > 0 ? (
                        <div className="d-flex flex-column gap-1">
                          {subcategorias.map((subcategoria) => (
                            <NavDropdown.Item
                              key={subcategoria.id}
                              onClick={() => handleFiltrarPorSubcategoria(subcategoria.id)}
                              active={String(subcategoriaSeleccionadaId) === String(subcategoria.id)}
                              className="ps-4"
                            >
                              <i className="bi bi-subtract me-2"></i>{subcategoria.nombre}
                            </NavDropdown.Item>
                          ))}
                        </div>
                            ) : (
                        <div className="small text-muted">No hay subcategorías para esta categoría.</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </NavDropdown>
          )}

          <NavDropdown 
            title={<><i className="bi bi-three-dots-vertical"></i>Más</>} 
            id="more-options-dropdown" 
            className="me-2"
          >
            <NavDropdown.Item as={Link} to="/personalizacion">
              <i className="bi bi-pencil-square me-2" style={{ color: '#6f42c1' }}></i>Personalizar
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/disenos-guardados">
              <i className="bi bi-save2-fill me-2" style={{ color: '#0d6efd' }}></i>Diseños guardados
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/mis-cotizaciones">
              <i className="bi bi-receipt me-2" style={{ color: '#6c757d' }}></i>Mis Cotizaciones
            </NavDropdown.Item>
            {isAuthenticated && (
  <>
    <NavDropdown.Divider />
    <NavDropdown.Item as={Link} to="/favoritos">
      <i className="bi bi-heart-fill me-2" style={{ color: '#dc3545' }}></i>Favoritos
    </NavDropdown.Item>
    <NavDropdown.Item as={Link} to="/mis-consultas">
      <i className="bi bi-chat-dots-fill me-2" style={{ color: '#0dcaf0' }}></i>Mis consultas
    </NavDropdown.Item>
  </>
)}
          </NavDropdown>

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
              <span className="d-none d-sm-inline">Carrito</span> <i className="bi bi-cart3 text-white fs-5"></i>
            </div>
          </Nav.Link>

          <Nav className="align-items-center" style={{ gap: '0.5rem' }}>
            <Button variant="outline-light" size="sm" className="me-2" onClick={() => setShowFAQ(true)}>
              <i className="bi bi-question-circle-fill me-1"></i><span className="d-none d-sm-inline">FAQ</span>
            </Button>
            {isAuthenticated ? (
              <>
                {(isCliente || isAdmin) && (
                  <Button as={Link} to="/mis-pedidos" size="sm" style={{ 
                    color: '#fff',
                    backgroundColor: 'transparent',
                    borderRadius: '8px',
                    fontWeight: '500',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.85rem',
                  }}>
                    <i className="bi bi-box-seam me-1"></i>
                    <span className="d-none d-md-inline">Mis Pedidos</span>
                  </Button>
                )}
                <NavDropdown title={<><i className="bi bi-person-circle me-1"></i><span className="d-none d-lg-inline"></span></>} id="user-dropdown" align="end">
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

        <Offcanvas
          show={showMobileMenu}
          onHide={() => setShowMobileMenu(false)}
          placement="end"
          className="mobile-navigation"
          aria-labelledby="mobile-navigation-title"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="mobile-navigation-title">
              <i className="bi bi-shop me-2"></i>Menú YESA
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="mobile-navigation-list flex-column">
              <Nav.Link as={Link} to="/" onClick={() => setShowMobileMenu(false)}>
                <i className="bi bi-house me-2"></i>Inicio
              </Nav.Link>
              <Nav.Link as={Link} to="/catalogo" onClick={() => setShowMobileMenu(false)}>
                <i className="bi bi-grid me-2"></i>Catálogo
              </Nav.Link>

              {isCatalogo && (
                <Form className="mobile-search-form mt-2 mb-2" onSubmit={(e) => e.preventDefault()}>
                  <Form.Label htmlFor="mobile-product-search" className="small text-muted">
                    Buscar productos
                  </Form.Label>
                  <div className="position-relative">
                    <FormControl
                      id="mobile-product-search"
                      type="search"
                      placeholder="Buscar productos..."
                      value={buscarLocal}
                      onChange={handleBuscarChange}
                      autoComplete="off"
                    />
                    <i className="bi bi-search mobile-search-icon"></i>
                  </div>
                </Form>
              )}

              {isCatalogo && categorias.length > 0 && (
                <div className="mobile-filter-section">
                  <div className="mobile-section-label">
                    <i className="bi bi-filter me-2"></i>Filtrar catálogo
                  </div>
                  <Button
                    variant="link"
                    className="mobile-menu-action"
                    onClick={() => handleFiltrarPorCategoria('')}
                  >
                    <i className="bi bi-grid-3x3-gap-fill me-2"></i>Todas las categorías
                  </Button>
                  {!categoriaSeleccionadaId ? categorias.map((cat) => (
                    <Button
                      key={cat.id}
                      variant="link"
                      className="mobile-menu-action ps-4"
                      onClick={() => handleFiltrarPorCategoria(cat.id)}
                    >
                      <i className="bi bi-tag me-2"></i>{cat.nombre}
                    </Button>
                  )) : (
                    <>
                      <Button
                        variant="link"
                        className="mobile-menu-action"
                        onClick={() => handleFiltrarPorCategoria('')}
                      >
                        <i className="bi bi-arrow-left me-2"></i>Volver a categorías
                      </Button>
                      <div className="mobile-subcategory-label">
                        {categorias.find((cat) => String(cat.id) === String(categoriaSeleccionadaId))?.nombre || 'Subcategorías'}
                      </div>
                      {cargandoSubcategorias ? (
                        <div className="small text-muted px-3 py-2">Cargando subcategorías...</div>
                      ) : subcategorias.map((subcategoria) => (
                        <Button
                          key={subcategoria.id}
                          variant="link"
                          className="mobile-menu-action ps-4"
                          onClick={() => handleFiltrarPorSubcategoria(subcategoria.id)}
                        >
                          <i className="bi bi-subtract me-2"></i>{subcategoria.nombre}
                        </Button>
                      ))}
                    </>
                  )}
                </div>
              )}

              <div className="mobile-menu-divider"></div>
              <div className="mobile-section-label">Más opciones</div>
              <Nav.Link as={Link} to="/personalizacion" onClick={() => setShowMobileMenu(false)}>
                <i className="bi bi-pencil-square me-2"></i>Personalizar
              </Nav.Link>
              <Nav.Link as={Link} to="/disenos-guardados" onClick={() => setShowMobileMenu(false)}>
                <i className="bi bi-save2-fill me-2"></i>Diseños guardados
              </Nav.Link>
              <Nav.Link as={Link} to="/mis-cotizaciones" onClick={() => setShowMobileMenu(false)}>
                <i className="bi bi-receipt me-2"></i>Mis cotizaciones
              </Nav.Link>
              {isAuthenticated && (
                <>
                  <Nav.Link as={Link} to="/favoritos" onClick={() => setShowMobileMenu(false)}>
                    <i className="bi bi-heart-fill me-2"></i>Favoritos
                  </Nav.Link>
                  <Nav.Link as={Link} to="/mis-consultas" onClick={() => setShowMobileMenu(false)}>
                    <i className="bi bi-chat-dots-fill me-2"></i>Mis consultas
                  </Nav.Link>
                </>
              )}

              {(isAdmin || isAuxiliar) && (
                <div className="mobile-admin-section">
                  <div className="mobile-section-label">Administración</div>
                  <Nav.Link as={Link} to="/admin/dashboard" onClick={() => setShowMobileMenu(false)}>
                    <i className="bi bi-speedometer2 me-2"></i>Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/admin/categorias" onClick={() => setShowMobileMenu(false)}>Categorías</Nav.Link>
                  <Nav.Link as={Link} to="/admin/subcategorias" onClick={() => setShowMobileMenu(false)}>Subcategorías</Nav.Link>
                  <Nav.Link as={Link} to="/admin/productos" onClick={() => setShowMobileMenu(false)}>Productos</Nav.Link>
                  {isAdmin && <Nav.Link as={Link} to="/admin/usuarios" onClick={() => setShowMobileMenu(false)}>Usuarios</Nav.Link>}
                  <Nav.Link as={Link} to="/admin/pedidos" onClick={() => setShowMobileMenu(false)}>Pedidos</Nav.Link>
                  {isAdmin && <Nav.Link as={Link} to="/admin/cotizaciones" onClick={() => setShowMobileMenu(false)}>Cotizaciones</Nav.Link>}
                </div>
              )}

              <div className="mobile-menu-divider"></div>
              <Nav.Link as={Link} to="/carrito" onClick={() => setShowMobileMenu(false)}>
                <i className="bi bi-cart3 me-2"></i>Carrito
              </Nav.Link>
              <Button variant="link" className="mobile-menu-action" onClick={() => { setShowMobileMenu(false); setShowFAQ(true); }}>
                <i className="bi bi-question-circle-fill me-2"></i>Preguntas frecuentes
              </Button>
              {isAuthenticated ? (
                <>
                  {(isCliente || isAdmin) && (
                    <Nav.Link as={Link} to="/mis-pedidos" onClick={() => setShowMobileMenu(false)}>
                      <i className="bi bi-box-seam me-2"></i>Mis pedidos
                    </Nav.Link>
                  )}
                  <Nav.Link as={Link} to="/perfil" onClick={() => setShowMobileMenu(false)}>
                    <i className="bi bi-person-circle me-2"></i>Mi perfil
                  </Nav.Link>
                  <Button variant="link" className="mobile-menu-action mobile-logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" onClick={() => setShowMobileMenu(false)}>
                    <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión
                  </Nav.Link>
                  <Nav.Link as={Link} to="/register" onClick={() => setShowMobileMenu(false)}>
                    <i className="bi bi-person-plus me-2"></i>Registro
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </Navbar>
    </>
  );
});

NavigationBar.displayName = 'NavigationBar';
export default NavigationBar;