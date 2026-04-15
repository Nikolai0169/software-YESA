/**
 * ============================================
 * CATALOGO PAGE
 * ============================================
 * Catálogo de productos con filtros
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import carritoService from '../services/carritoService';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const CatalogoPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [paginacion, setPaginacion] = useState({ total: 0, pagina: 1, totalPaginas: 1 });
  const timeoutRef = useRef(null);
  const isInitialMount = useRef(true);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isCliente } = useAuth();

  // Leer filtros desde URL (reemplaza el state 'filtros')
  const getFiltrosDesdeURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      categoriaId: params.get('categoriaId') || '',
      subcategoriaId: params.get('subcategoriaId') || '',
      buscar: params.get('buscar') || '',
      pagina: parseInt(params.get('pagina')) || 1,
    };
  }, [location.search]);

  // Función para actualizar URL (reemplaza setFiltros)
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    const params = new URLSearchParams(location.search);
    Object.entries(nuevosFiltros).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    navigate(`/catalogo?${params.toString()}`);
  }, [location.search, navigate]);

  const fetchProductos = useCallback(async (filtrosActuales) => {
    setLoading(true);
    try {
      const response = await catalogoService.getProductos(filtrosActuales);
      setProductos(response.data.productos);
      setPaginacion(response.data.paginacion);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar productos' });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCategorias = useCallback(async () => {
    try {
      const response = await catalogoService.getCategorias();
      setCategorias(response.data.categorias);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  const loadSubcategorias = useCallback(async (categoriaId) => {
    if (!categoriaId) {
      setSubcategorias([]);
      return;
    }
    try {
      const response = await catalogoService.getSubcategoriasPorCategoria(categoriaId);
      setSubcategorias(response.data.subcategorias);
    } catch (error) {
      console.error('Error al cargar subcategorías:', error);
    }
  }, []);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  // Cargar subcategorías cuando cambia categoriaId en URL
  useEffect(() => {
    const filtros = getFiltrosDesdeURL();
    if (filtros.categoriaId) {
      loadSubcategorias(filtros.categoriaId);
    } else {
      setSubcategorias([]);
    }
  }, [getFiltrosDesdeURL, loadSubcategorias]);

  // Cargar productos cuando cambian los filtros (via URL)
  useEffect(() => {
    const filtros = getFiltrosDesdeURL();
    fetchProductos(filtros);
  }, [getFiltrosDesdeURL, fetchProductos]);

  const handleAddToCart = useCallback(async (producto) => {
    try {
      await carritoService.agregarAlCarrito(producto.id, 1, producto);
      setMensaje({ tipo: 'success', texto: `${producto.nombre} agregado al carrito` });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setMensaje({ tipo: '', texto: '' });
      }, 3000);
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.message || 'Error al agregar al carrito' });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const filtrosActuales = getFiltrosDesdeURL();

  return (
    <Container className="py-4">
      <h1 className="mb-4">
        <i className="bi bi-grid me-2"></i>
        Catálogo de Productos
      </h1>

      {mensaje.texto && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
          {mensaje.texto}
        </Alert>
      )}

      {/* SOLO EL GRID DE PRODUCTOS - SIN SIDEBAR */}
      <Row>
        <Col md={12}>
          {loading ? (
            <LoadingSpinner message="Cargando productos..." />
          ) : productos.length > 0 ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="text-muted mb-0">
                  Mostrando {productos.length} de {paginacion.total} productos
                </p>
                <p className="text-muted mb-0">
                  Página {paginacion.pagina} de {paginacion.totalPaginas}
                </p>
              </div>
              <Row className="g-4">
                {productos.map((producto) => (
                  <Col key={producto.id} sm={6} lg={4}>
                    <ProductCard producto={producto} onAddToCart={handleAddToCart} />
                  </Col>
                ))}
              </Row>

              {/* Paginación - CONSERVADA EXACTAMENTE IGUAL, solo cambia cómo navega */}
              {paginacion.totalPaginas > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Button
                    variant="outline-primary"
                    disabled={paginacion.pagina === 1}
                    onClick={() => actualizarFiltros({ ...filtrosActuales, pagina: paginacion.pagina - 1 })}
                    className="me-2"
                  >
                    <i className="bi bi-chevron-left"></i> Anterior
                  </Button>
                  
                  <div className="d-flex align-items-center mx-3">
                    {Array.from({ length: Math.min(5, paginacion.totalPaginas) }, (_, i) => {
                      let pageNum;
                      if (paginacion.totalPaginas <= 5) {
                        pageNum = i + 1;
                      } else if (paginacion.pagina <= 3) {
                        pageNum = i + 1;
                      } else if (paginacion.pagina >= paginacion.totalPaginas - 2) {
                        pageNum = paginacion.totalPaginas - 4 + i;
                      } else {
                        pageNum = paginacion.pagina - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={paginacion.pagina === pageNum ? 'primary' : 'outline-primary'}
                          onClick={() => actualizarFiltros({ ...filtrosActuales, pagina: pageNum })}
                          className="me-2"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline-primary"
                    disabled={paginacion.pagina === paginacion.totalPaginas}
                    onClick={() => actualizarFiltros({ ...filtrosActuales, pagina: paginacion.pagina + 1 })}
                  >
                    Siguiente <i className="bi bi-chevron-right"></i>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <h4 className="mt-3">No se encontraron productos</h4>
              <p className="text-muted">Intenta cambiar los filtros de búsqueda</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CatalogoPage;