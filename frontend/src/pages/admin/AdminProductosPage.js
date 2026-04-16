/**
 * ============================================
 * ADMIN PRODUCTOS PAGE - CON ACCIÓN MASIVA
 * ============================================
 * Gestión CRUD de productos sin paginación, con scroll, botones de texto,
 * y ahora con activar/desactivar todas (según filtros).
 */

import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { exportarProductosAPDF, exportarProductosAExcel } from '../../utils/exportUtils';

const ProductImage = memo(({ imagen, nombre }) => {
  const [imgSrc, setImgSrc] = useState(imagen || '/producto-default.jpg');
  const hasError = useRef(false);
  const handleImageError = useCallback(() => {
    if (!hasError.current) {
      hasError.current = true;
      setImgSrc('/producto-default.jpg');
    }
  }, []);
  return <img src={imgSrc} alt={nombre} style={{ width: '50px', height: '50px', objectFit: 'cover' }} className="rounded" onError={handleImageError} />;
});
ProductImage.displayName = 'ProductImage';

const AdminProductosPage = () => {
  const { isAdmin, isAuxiliar } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [accionMasivaLoading, setAccionMasivaLoading] = useState(false);
  
  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSubcategoria, setFiltroSubcategoria] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [ordenNombre, setOrdenNombre] = useState('asc');
  
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', stock: '', categoriaId: '', subcategoriaId: '', imagen: '', activo: true
  });
  
  // Productos filtrados y ordenados
  const productosFiltradosYOrdenados = useMemo(() => {
    let resultado = productos.filter(prod => {
      const coincideBusqueda = busqueda === '' || 
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = filtroCategoria === '' || prod.categoriaId === parseInt(filtroCategoria);
      const coincideSubcategoria = filtroSubcategoria === '' || prod.subcategoriaId === parseInt(filtroSubcategoria);
      const min = precioMin === '' ? 0 : parseFloat(precioMin);
      const max = precioMax === '' ? Infinity : parseFloat(precioMax);
      const coincidePrecio = prod.precio >= min && prod.precio <= max;
      return coincideBusqueda && coincideCategoria && coincideSubcategoria && coincidePrecio;
    });
    resultado.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase(), nombreB = b.nombre.toLowerCase();
      if (nombreA < nombreB) return ordenNombre === 'asc' ? -1 : 1;
      if (nombreA > nombreB) return ordenNombre === 'asc' ? 1 : -1;
      return 0;
    });
    return resultado;
  }, [productos, busqueda, filtroCategoria, filtroSubcategoria, precioMin, precioMax, ordenNombre]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodResponse, catResponse, subcatResponse] = await Promise.all([
        api.get('/admin/productos?limite=1000'),
        api.get('/admin/categorias'),
        api.get('/admin/subcategorias')
      ]);
      setProductos(Array.isArray(prodResponse.data?.data?.productos || prodResponse.data?.productos || prodResponse.data?.data || []) ? prodResponse.data?.data?.productos || prodResponse.data?.productos || prodResponse.data?.data || [] : []);
      setCategorias(Array.isArray(catResponse.data?.data?.categorias || catResponse.data?.categorias || catResponse.data?.data || []) ? catResponse.data?.data?.categorias || catResponse.data?.categorias || catResponse.data?.data || [] : []);
      setSubcategorias(Array.isArray(subcatResponse.data?.data?.subcategorias || subcatResponse.data?.subcategorias || subcatResponse.data?.data || []) ? subcatResponse.data?.data?.subcategorias || subcatResponse.data?.subcategorias || subcatResponse.data?.data || [] : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los datos' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleShowModal = (producto = null) => {
    if (producto) {
      setEditando(producto);
      setFormData({
        nombre: producto.nombre, descripcion: producto.descripcion || '', precio: producto.precio, stock: producto.stock,
        categoriaId: producto.categoriaId, subcategoriaId: producto.subcategoriaId || '', imagen: producto.imagen || '', activo: producto.activo
      });
    } else {
      setEditando(null);
      setFormData({ nombre: '', descripcion: '', precio: '', stock: '', categoriaId: '', subcategoriaId: '', imagen: '', activo: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData({ nombre: '', descripcion: '', precio: '', stock: '', categoriaId: '', subcategoriaId: '', imagen: '', activo: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value, ...(name === 'categoriaId' ? { subcategoriaId: '' } : {}) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData, precio: parseFloat(formData.precio), stock: parseInt(formData.stock), subcategoriaId: formData.subcategoriaId || null };
      if (editando) await api.put(`/admin/productos/${editando.id}`, dataToSend);
      else await api.post('/admin/productos', dataToSend);
      setMensaje({ tipo: 'success', texto: editando ? 'Producto actualizado' : 'Producto creado' });
      handleCloseModal();
      loadData();
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al guardar' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/admin/productos/${id}`);
      setMensaje({ tipo: 'success', texto: 'Producto eliminado' });
      loadData();
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: 'Error al eliminar' });
    }
  };

  const handleToggleActivo = async (producto) => {
    try {
      await api.put(`/admin/productos/${producto.id}`, {
        nombre: producto.nombre, descripcion: producto.descripcion, precio: parseFloat(producto.precio), stock: parseInt(producto.stock),
        categoriaId: producto.categoriaId, subcategoriaId: producto.subcategoriaId || null, imagen: producto.imagen, activo: !producto.activo
      });
      setProductos(prev => prev.map(p => p.id === producto.id ? { ...p, activo: !p.activo } : p));
      setMensaje({ tipo: 'success', texto: `Producto ${!producto.activo ? 'activado' : 'desactivado'}` });
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar estado' });
    }
  };

  // ACCIÓN MASIVA
  const handleActivarDesactivarTodas = async (nuevoEstado) => {
    const productosAfectados = productosFiltradosYOrdenados;
    if (productosAfectados.length === 0) {
      setMensaje({ tipo: 'warning', texto: 'No hay productos para modificar' });
      return;
    }
    const estadoTexto = nuevoEstado ? 'activar' : 'desactivar';
    if (!window.confirm(`¿${estadoTexto} TODOS los ${productosAfectados.length} productos?`)) return;

    setAccionMasivaLoading(true);
    try {
      const peticiones = productosAfectados.map(prod =>
        api.put(`/admin/productos/${prod.id}`, {
          nombre: prod.nombre, descripcion: prod.descripcion, precio: parseFloat(prod.precio), stock: parseInt(prod.stock),
          categoriaId: prod.categoriaId, subcategoriaId: prod.subcategoriaId || null, imagen: prod.imagen, activo: nuevoEstado
        })
      );
      await Promise.all(peticiones);
      setMensaje({ tipo: 'success', texto: `Se han ${estadoTexto} ${productosAfectados.length} productos` });
      await loadData();
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: `Error al ${estadoTexto} los productos` });
    } finally {
      setAccionMasivaLoading(false);
    }
  };

  const formatearPrecio = (precio) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(precio);
  const subcategoriasFiltradas = useMemo(() => subcategorias.filter(sub => sub.categoriaId === parseInt(formData.categoriaId)), [subcategorias, formData.categoriaId]);

  const totalProductos = productos.length;
  const productosActivos = productos.filter(p => p.activo).length;
  const stockBajo = productos.filter(p => p.stock <= 5 && p.stock > 0).length;

  if (loading) return <LoadingSpinner message="Cargando productos..." />;

  return (
    <Container className="py-4">
      <style>{`
        .tabla-productos-scroll { overflow-y: auto; max-height: 550px; }
        .tabla-productos-scroll thead th { position: sticky; top: 0; background-color: #f8f9fa; z-index: 10; box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1); }
        .tabla-productos-scroll th:last-child, .tabla-productos-scroll td:last-child { min-width: 220px; }
      `}</style>

      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h1><i className="bi bi-box-seam me-2"></i>Gestión de Productos</h1><p className="text-muted">Administra el inventario de productos</p></div>
        <div className="d-flex gap-2">
          <Dropdown as={ButtonGroup} className="me-2">
            <Button variant="success" onClick={async () => { if (tipoExportacion === 'pdf') exportarProductosAPDF(productosFiltradosYOrdenados); else await exportarProductosAExcel(productosFiltradosYOrdenados); }}>
              <i className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`}></i> Exportar
            </Button>
            <Dropdown.Toggle split variant="success" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => { setTipoExportacion('pdf'); exportarProductosAPDF(productosFiltradosYOrdenados); }}>PDF</Dropdown.Item>
              <Dropdown.Item onClick={async () => { setTipoExportacion('excel'); await exportarProductosAExcel(productosFiltradosYOrdenados); }}>Excel</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Acción masiva */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-secondary" disabled={accionMasivaLoading || productosFiltradosYOrdenados.length === 0}>
              {accionMasivaLoading ? 'Procesando...' : <><i className="bi bi-arrow-repeat me-1"></i>Acción masiva</>}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleActivarDesactivarTodas(true)}><i className="bi bi-check-circle text-success me-2"></i>Activar todas</Dropdown.Item>
              <Dropdown.Item onClick={() => handleActivarDesactivarTodas(false)}><i className="bi bi-x-circle text-danger me-2"></i>Desactivar todas</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Button variant="primary" onClick={() => handleShowModal()}><i className="bi bi-plus-circle me-1"></i> Nuevo Producto</Button>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}><i className="bi bi-arrow-left me-1"></i> Volver</Button>
        </div>
      </div>

      {mensaje.texto && <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>{mensaje.texto}</Alert>}

      {/* Tarjetas */}
      <Row className="mb-4">
        <Col md={4}><Card className="text-white bg-primary shadow-sm"><Card.Body><Card.Title>Total Productos</Card.Title><p className="display-6">{totalProductos}</p></Card.Body></Card></Col>
        <Col md={4}><Card className="text-white bg-success shadow-sm"><Card.Body><Card.Title>Productos Activos</Card.Title><p className="display-6">{productosActivos}</p></Card.Body></Card></Col>
        <Col md={4}><Card className="text-white bg-warning shadow-sm"><Card.Body><Card.Title>Stock Bajo (≤5)</Card.Title><p className="display-6">{stockBajo}</p></Card.Body></Card></Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3"><i className="bi bi-funnel me-2"></i>Filtros</h5>
          <Row className="g-3 align-items-end">
            <Col md={3}><Form.Label className="small">Buscar</Form.Label><InputGroup><InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text><Form.Control placeholder="Nombre o descripción..." value={busqueda} onChange={e => setBusqueda(e.target.value)} /></InputGroup></Col>
            <Col md={2}><Form.Label className="small">Categoría</Form.Label><Form.Select value={filtroCategoria} onChange={e => { setFiltroCategoria(e.target.value); setFiltroSubcategoria(''); }}><option value="">Todas</option>{categorias.filter(c => c.activo).map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}</Form.Select></Col>
            <Col md={2}><Form.Label className="small">Subcategoría</Form.Label><Form.Select value={filtroSubcategoria} onChange={e => setFiltroSubcategoria(e.target.value)} disabled={!filtroCategoria}><option value="">Todas</option>{filtroCategoria && subcategorias.filter(s => s.categoriaId === parseInt(filtroCategoria) && s.activo).map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}</Form.Select></Col>
            <Col md={2}><Form.Label className="small">Precio min</Form.Label><Form.Control type="number" placeholder="0" value={precioMin} onChange={e => setPrecioMin(e.target.value)} min="0" /></Col>
            <Col md={2}><Form.Label className="small">Precio max</Form.Label><Form.Control type="number" placeholder="Ilimitado" value={precioMax} onChange={e => setPrecioMax(e.target.value)} min="0" /></Col>
            <Col md={1}><Button variant="outline-secondary" className="w-100" onClick={() => { setBusqueda(''); setFiltroCategoria(''); setFiltroSubcategoria(''); setPrecioMin(''); setPrecioMax(''); setOrdenNombre('asc'); }}><i className="bi bi-eraser"></i></Button></Col>
          </Row>
          <Row className="mt-3"><Col md={3}><Form.Label className="small">Ordenar por nombre</Form.Label><Form.Select value={ordenNombre} onChange={e => setOrdenNombre(e.target.value)}><option value="asc">Ascendente (A-Z)</option><option value="desc">Descendente (Z-A)</option></Form.Select></Col><Col md={9} className="text-end"><Badge bg="secondary" className="p-2"><i className="bi bi-box-seam me-1"></i> {productosFiltradosYOrdenados.length} producto(s)</Badge></Col></Row>
        </Card.Body>
      </Card>

      {/* Tabla con scroll */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <div className="tabla-productos-scroll">
            <Table responsive className="mb-0">
              <thead><tr><th style={{ width: '60px' }}>ID</th><th style={{ width: '70px' }}>Imagen</th><th>Producto</th><th style={{ width: '150px' }}>Categoría</th><th style={{ width: '120px' }}>Precio</th><th style={{ width: '80px' }}>Stock</th><th style={{ width: '100px' }}>Estado</th><th style={{ width: '220px' }}>Acciones</th></tr></thead>
              <tbody>
                {productosFiltradosYOrdenados.length === 0 ? <tr><td colSpan="8" className="text-center py-4 text-muted">No hay productos</td></tr> :
                  productosFiltradosYOrdenados.map(prod => (
                    <tr key={prod.id}>
                      <td className="align-middle">{prod.id}</td>
                      <td><ProductImage imagen={prod.imagen} nombre={prod.nombre} /></td>
                      <td className="fw-bold">{prod.nombre}</td>
                      <td><Badge bg="info">{prod.categoria?.nombre || 'N/A'}</Badge>{prod.subcategoria && <><br /><small className="text-muted">{prod.subcategoria.nombre}</small></>}</td>
                      <td>{formatearPrecio(prod.precio)}</td>
                      <td><Badge bg={prod.stock > 10 ? 'success' : prod.stock > 0 ? 'warning' : 'danger'}>{prod.stock}</Badge></td>
                      <td><Badge bg={prod.activo ? 'success' : 'secondary'}>{prod.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                      <td><div className="d-flex gap-2"><Button variant="outline-primary" size="sm" onClick={() => handleShowModal(prod)}>Editar</Button><Button variant={prod.activo ? 'outline-warning' : 'outline-success'} size="sm" onClick={() => handleToggleActivo(prod)}>{prod.activo ? 'Desactivar' : 'Activar'}</Button><Button variant="outline-danger" size="sm" onClick={() => handleDelete(prod.id)}>Eliminar</Button></div></td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="text-muted"><small><i className="bi bi-file-text me-1"></i> Mostrando <strong>{productosFiltradosYOrdenados.length}</strong> producto(s)</small></Card.Footer>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton><Modal.Title>{editando ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Nombre *</Form.Label><Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required /></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>Precio *</Form.Label><Form.Control type="number" name="precio" value={formData.precio} onChange={handleChange} required min="0" step="0.01" /></Form.Group></Col></Row>
            <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Categoría *</Form.Label><Form.Select name="categoriaId" value={formData.categoriaId} onChange={handleChange} required><option value="">Seleccionar...</option>{categorias.filter(c => c.activo).map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}</Form.Select></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>Subcategoría</Form.Label><Form.Select name="subcategoriaId" value={formData.subcategoriaId} onChange={handleChange} disabled={!formData.categoriaId}><option value="">Seleccionar...</option>{subcategoriasFiltradas.filter(s => s.activo).map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}</Form.Select></Form.Group></Col></Row>
            <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Stock *</Form.Label><Form.Control type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" /></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>URL Imagen</Form.Label><Form.Control type="text" name="imagen" value={formData.imagen} onChange={handleChange} placeholder="https://..." /></Form.Group></Col></Row>
            <Form.Group className="mb-3"><Form.Label>Descripción</Form.Label><Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} /></Form.Group>
            <Form.Group><Form.Check type="checkbox" name="activo" label="Producto activo" checked={formData.activo} onChange={handleChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button><Button variant="primary" type="submit">{editando ? 'Actualizar' : 'Crear'}</Button></Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminProductosPage;