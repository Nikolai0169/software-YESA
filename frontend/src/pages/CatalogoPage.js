/**
 * ============================================
 * CATALOGO PAGE - SIN FILTROS (SOLO PRODUCTOS)
 * ============================================
 * Catálogo de productos limpio, sin filtros visuales.
 * Los filtros se manejan desde la navbar global.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import catalogoService from '../services/catalogoService';
import carritoService from '../services/carritoService';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const CatalogoPage = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [paginacion, setPaginacion] = useState({ total: 0, pagina: 1, totalPaginas: 1 });
  const timeoutRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Leer filtros desde URL (para compatibilidad con navbar)
  const getFiltrosDesdeURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      categoriaId: params.get('categoriaId') || '',
      subcategoriaId: params.get('subcategoriaId') || '',
      buscar: params.get('buscar') || '',
      pagina: parseInt(params.get('pagina')) || 1,
    };
  }, [location.search]);

  // Actualizar URL (sin recargar)
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

  // Limpiar filtros (resetea URL)
  const limpiarFiltros = () => {
    actualizarFiltros({ categoriaId: '', subcategoriaId: '', buscar: '', pagina: 1 });
  };

  return (
    <>
      <style>
        {`
        :root {
          --yesa-purple: #7d2181;
          --yesa-magenta: #ff0080;
          --yesa-gold: #ffd700;
          --yesa-surface: rgba(255, 255, 255, 0.12);
          --yesa-surface-soft: rgba(255, 255, 255, 0.08);
          --yesa-text: #1f2937;
          --yesa-bg: #f8f2ff;
          --yesa-gray: #6b7280;
        }
          .hero-simple {
            background: linear-gradient(135deg, var(--yesa-purple) 0%, var(--yesa-magenta) 100%);
            border-radius: 0 0 2rem 2rem;
            padding: 2rem 1rem;
            margin-bottom: 2rem;
            color: white;
            text-align: center;
          }
          .product-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.8rem;
          }
          @media (min-width: 1200px) {
            .product-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }
          @media (min-width: 768px) and (max-width: 1199px) {
            .product-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
          .pagination-custom .page-item .page-link {
            border-radius: 2rem;
            margin: 0 0.25rem;
            border: none;
            background: #f1f3f5;
            color: #2c3e50;
            font-weight: 500;
          }
          .pagination-custom .page-item.active .page-link {
          background: linear-gradient(135deg, var(--yesa-purple) 0%, var(--yesa-magenta) 100%);
            color: white;
          }
        `}
      </style>

      <Container fluid className="px-4 px-lg-5 py-4">
        {/* Banner simple */}
        <div className="hero-simple">
          <h1 className="display-4 fw-bold mb-2">
            <i className="bi bi-grid-3x3-gap-fill me-2"></i>
            Catálogo YESA
          </h1>
          <p className="lead mb-0">Descubre nuestra colección</p>
        </div>

        {/* Mensaje flotante */}
        {mensaje.texto && (
          <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })} className="shadow-sm">
            {mensaje.texto}
          </Alert>
        )}

        {/* Grid de productos */}
        {loading ? (
          <LoadingSpinner message="Cargando productos..." />
        ) : productos.length > 0 ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <p className="text-muted mb-0">
                <i className="bi bi-grid-3x3-gap-fill me-1"></i>
                {paginacion.total} productos encontrados
              </p>
              <p className="text-muted mb-0">
                Página {paginacion.pagina} de {paginacion.totalPaginas}
              </p>
            </div>

            <div className="product-grid">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} onAddToCart={handleAddToCart} />
              ))}
            </div>

            {/* Paginación */}
            {paginacion.totalPaginas > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <div className="pagination-custom d-flex flex-wrap justify-content-center gap-1">
                  <Button
                    variant="outline-secondary"
                    disabled={paginacion.pagina === 1}
                    onClick={() => actualizarFiltros({ ...filtrosActuales, pagina: paginacion.pagina - 1 })}
                    className="rounded-pill btn-yesa-secondary"
                  >
                    <i className="bi bi-chevron-left"></i> Anterior
                  </Button>
                  
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
                        className={`rounded-pill ${paginacion.pagina === pageNum ? 'active' : ''}`}
                        style={{ minWidth: '42px' }}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline-secondary"
                    disabled={paginacion.pagina === paginacion.totalPaginas}
                    onClick={() => actualizarFiltros({ ...filtrosActuales, pagina: paginacion.pagina + 1 })}
                    className="rounded-pill btn-yesa-secondary"
                  >
                    Siguiente <i className="bi bi-chevron-right"></i>
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-5 bg-light rounded-4">
            <i className="bi bi-emoji-frown display-1 text-muted"></i>
            <h4 className="mt-3">No hay productos</h4>
            <p className="text-muted">Prueba con otros filtros desde la barra de navegación</p>
            <Button variant="outline-primary" onClick={limpiarFiltros} className="rounded-pill">
              <i className="bi bi-arrow-repeat me-1"></i> Ver todos
            </Button>
          </div>
        )}
      </Container>
    </>
  );
};

export default CatalogoPage;