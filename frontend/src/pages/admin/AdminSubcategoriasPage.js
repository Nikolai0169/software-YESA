/**
 * ============================================
 * ADMIN SUBCATEGORÍAS PAGE - CON ACCIÓN MASIVA
 * ============================================
 * Gestión CRUD de subcategorías sin paginación, scroll, botones de texto,
 * y ahora con activar/desactivar todas (según filtros).
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Dropdown, ButtonGroup, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { exportarSubcategoriasAPDF, exportarSubcategoriasAExcel } from '../../utils/exportUtils';

const AdminSubcategoriasPage = () => {
  useAuth();
  const navigate = useNavigate();
  const [subcategorias, setSubcategorias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  const [accionMasivaLoading, setAccionMasivaLoading] = useState(false);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoriaId: 'todas',
    estado: 'todos'
  });
  
  // Ordenamiento por nombre
  const [ordenNombre, setOrdenNombre] = useState('asc');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoriaId: '',
    activo: true
  });
  
  // Subcategorías filtradas y ordenadas
  const subcategoriasFiltradasYOrdenadas = useMemo(() => {
    let resultado = subcategorias.filter(sub => {
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const categoria = categorias.find(c => c.id === sub.categoriaId);
        const coincide = sub.nombre.toLowerCase().includes(busqueda) ||
                        (sub.descripcion && sub.descripcion.toLowerCase().includes(busqueda)) ||
                        (categoria && categoria.nombre.toLowerCase().includes(busqueda));
        if (!coincide) return false;
      }
      if (filtros.categoriaId !== 'todas' && sub.categoriaId !== parseInt(filtros.categoriaId)) return false;
      if (filtros.estado !== 'todos') {
        if (filtros.estado === 'activos' && !sub.activo) return false;
        if (filtros.estado === 'inactivos' && sub.activo) return false;
      }
      return true;
    });
    
    resultado.sort((a, b) => {
      const nombreA = a.nombre.toLowerCase();
      const nombreB = b.nombre.toLowerCase();
      if (nombreA < nombreB) return ordenNombre === 'asc' ? -1 : 1;
      if (nombreA > nombreB) return ordenNombre === 'asc' ? 1 : -1;
      return 0;
    });
    return resultado;
  }, [subcategorias, filtros, categorias, ordenNombre]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [subcatResponse, catResponse] = await Promise.all([
        api.get('/admin/subcategorias'),
        api.get('/admin/categorias')
      ]);
      const subcategorias = subcatResponse.data?.data?.subcategorias || subcatResponse.data?.subcategorias || subcatResponse.data?.data || [];
      const categorias = catResponse.data?.data?.categorias || catResponse.data?.categorias || catResponse.data?.data || [];
      setSubcategorias(Array.isArray(subcategorias) ? subcategorias : []);
      setCategorias(Array.isArray(categorias) ? categorias : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los datos' });
      setSubcategorias([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShowModal = (subcategoria = null) => {
    if (subcategoria) {
      setEditando(subcategoria);
      setFormData({
        nombre: subcategoria.nombre,
        descripcion: subcategoria.descripcion || '',
        categoriaId: subcategoria.categoriaId,
        activo: subcategoria.activo
      });
    } else {
      setEditando(null);
      setFormData({ nombre: '', descripcion: '', categoriaId: '', activo: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData({ nombre: '', descripcion: '', categoriaId: '', activo: true });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/admin/subcategorias/${editando.id}`, formData);
        setMensaje({ tipo: 'success', texto: 'Subcategoría actualizada exitosamente' });
      } else {
        await api.post('/admin/subcategorias', formData);
        setMensaje({ tipo: 'success', texto: 'Subcategoría creada exitosamente' });
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error al guardar subcategoría:', error);
      setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al guardar la subcategoría' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta subcategoría?')) return;
    try {
      await api.delete(`/admin/subcategorias/${id}`);
      setMensaje({ tipo: 'success', texto: 'Subcategoría eliminada exitosamente' });
      loadData();
    } catch (error) {
      console.error('Error al eliminar subcategoría:', error);
      setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al eliminar la subcategoría' });
    }
  };

  const handleToggleActivo = async (subcategoria) => {
    try {
      await api.put(`/admin/subcategorias/${subcategoria.id}`, {
        nombre: subcategoria.nombre,
        descripcion: subcategoria.descripcion,
        categoriaId: subcategoria.categoriaId,
        activo: !subcategoria.activo
      });
      setMensaje({ tipo: 'success', texto: `Subcategoría ${!subcategoria.activo ? 'activada' : 'desactivada'} exitosamente` });
      await loadData();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar el estado' });
    }
  };

  // ACCIÓN MASIVA: activar o desactivar todas las subcategorías filtradas
  const handleActivarDesactivarTodas = async (nuevoEstado) => {
    const subcategoriasAfectadas = subcategoriasFiltradasYOrdenadas;
    if (subcategoriasAfectadas.length === 0) {
      setMensaje({ tipo: 'warning', texto: 'No hay subcategorías para modificar' });
      return;
    }
    const estadoTexto = nuevoEstado ? 'activar' : 'desactivar';
    const confirmacion = window.confirm(`¿Estás seguro de ${estadoTexto} TODAS las ${subcategoriasAfectadas.length} subcategorías?`);
    if (!confirmacion) return;

    setAccionMasivaLoading(true);
    try {
      const peticiones = subcategoriasAfectadas.map(sub =>
        api.put(`/admin/subcategorias/${sub.id}`, {
          nombre: sub.nombre,
          descripcion: sub.descripcion,
          categoriaId: sub.categoriaId,
          activo: nuevoEstado
        })
      );
      await Promise.all(peticiones);
      setMensaje({ tipo: 'success', texto: `Se han ${estadoTexto} correctamente ${subcategoriasAfectadas.length} subcategorías` });
      await loadData();
    } catch (error) {
      console.error('Error en acción masiva:', error);
      setMensaje({ tipo: 'danger', texto: `Error al ${estadoTexto} las subcategorías. Intente nuevamente.` });
    } finally {
      setAccionMasivaLoading(false);
    }
  };

  const totalSubcategorias = subcategorias.length;
  const subcategoriasActivas = subcategorias.filter(s => s.activo).length;
  const subcategoriasInactivas = totalSubcategorias - subcategoriasActivas;

  if (loading) {
    return <LoadingSpinner message="Cargando subcategorías..." />;
  }

  return (
    <Container className="py-4">
      <style>
        {`
          .tabla-subcategorias-scroll {
            overflow-y: auto;
            max-height: 500px;
          }
          .tabla-subcategorias-scroll thead th {
            position: sticky;
            top: 0;
            background-color: #f8f9fa;
            z-index: 10;
            box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);
          }
          .tabla-subcategorias-scroll th:last-child,
          .tabla-subcategorias-scroll td:last-child {
            min-width: 220px;
          }
        `}
      </style>

      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1><i className="bi bi-folder2 me-2"></i>Gestión de Subcategorías</h1>
          <p className="text-muted mb-0">Administra las subcategorías de productos</p>
        </div>
        <div className="d-flex gap-2">
          <Dropdown as={ButtonGroup} className="me-2">
            <Button variant="success" onClick={async () => {
              if (tipoExportacion === 'pdf') exportarSubcategoriasAPDF(subcategoriasFiltradasYOrdenadas, categorias);
              else await exportarSubcategoriasAExcel(subcategoriasFiltradasYOrdenadas, categorias);
            }}>
              <i className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`}></i>
              Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="success" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => { setTipoExportacion('pdf'); exportarSubcategoriasAPDF(subcategoriasFiltradasYOrdenadas, categorias); }}>
                <i className="bi bi-file-earmark-pdf me-2"></i> PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={async () => { setTipoExportacion('excel'); await exportarSubcategoriasAExcel(subcategoriasFiltradasYOrdenadas, categorias); }}>
                <i className="bi bi-file-earmark-excel me-2"></i> Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Acción masiva */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-secondary" disabled={accionMasivaLoading || subcategoriasFiltradasYOrdenadas.length === 0}>
              {accionMasivaLoading ? 'Procesando...' : <><i className="bi bi-arrow-repeat me-1"></i>Acción masiva</>}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleActivarDesactivarTodas(true)}>
                <i className="bi bi-check-circle text-success me-2"></i>Activar todas
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleActivarDesactivarTodas(false)}>
                <i className="bi bi-x-circle text-danger me-2"></i>Desactivar todas
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-circle me-1"></i> Nueva Subcategoría
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')} className="me-2">
            <i className="bi bi-arrow-left me-1"></i> Volver
          </Button>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Tarjetas de estadísticas */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-white bg-primary shadow-sm"><Card.Body><Card.Title>Total Subcategorías</Card.Title><p className="display-6">{totalSubcategorias}</p></Card.Body></Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-success shadow-sm"><Card.Body><Card.Title>Subcategorías Activas</Card.Title><p className="display-6">{subcategoriasActivas}</p></Card.Body></Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-secondary shadow-sm"><Card.Body><Card.Title>Subcategorías Inactivas</Card.Title><p className="display-6">{subcategoriasInactivas}</p></Card.Body></Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3"><i className="bi bi-funnel me-2"></i>Filtros</h5>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="small mb-1">Buscar</Form.Label>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                <Form.Control type="text" placeholder="Nombre, descripción o categoría..." value={filtros.busqueda} onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })} />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Label className="small mb-1">Categoría</Form.Label>
              <Form.Select value={filtros.categoriaId} onChange={(e) => setFiltros({ ...filtros, categoriaId: e.target.value })}>
                <option value="todas">Todas</option>
                {categorias.filter(c => c.activo).map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small mb-1">Estado</Form.Label>
              <Form.Select value={filtros.estado} onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small mb-1">Ordenar por nombre</Form.Label>
              <Form.Select value={ordenNombre} onChange={(e) => setOrdenNombre(e.target.value)}>
                <option value="asc">Ascendente (A-Z)</option>
                <option value="desc">Descendente (Z-A)</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button variant="outline-secondary" className="w-100" onClick={() => { setFiltros({ busqueda: '', categoriaId: 'todas', estado: 'todos' }); setOrdenNombre('asc'); }}>
                <i className="bi bi-arrow-clockwise me-1"></i> Limpiar
              </Button>
            </Col>
          </Row>
          <div className="mt-3">
            <Badge bg="secondary" className="p-2"><i className="bi bi-folder2 me-1"></i> {subcategoriasFiltradasYOrdenadas.length} subcategoría(s) encontrada(s)</Badge>
          </div>
        </Card.Body>
      </Card>

      {/* Tabla con scroll */}
      <Card className="baner-yesa-secondary">
        <Card.Body className="p-0">
          <div className="tabla-subcategorias-scroll">
            <Table responsive hover className="mb-0">
              <thead>
                <tr><th style={{ width: '70px' }}>ID</th><th>Nombre</th><th style={{ width: '150px' }}>Categoría</th><th>Descripción</th><th style={{ width: '100px' }}>Estado</th><th style={{ width: '240px' }}>Acciones</th></tr>
              </thead>
              <tbody>
                {subcategoriasFiltradasYOrdenadas.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">No hay subcategorías para mostrar</td></tr>
                ) : (
                  subcategoriasFiltradasYOrdenadas.map((sub) => {
                    const categoriaPadre = categorias.find(c => c.id === sub.categoriaId);
                    return (
                      <tr key={sub.id}>
                        <td className="align-middle">{sub.id}</td>
                        <td className="align-middle fw-bold">{sub.nombre}</td>
                        <td className="align-middle"><Badge bg="info">{categoriaPadre?.nombre || 'N/A'}</Badge></td>
                        <td className="align-middle">{sub.descripcion || '-'}</td>
                        <td className="align-middle"><Badge bg={sub.activo ? 'success' : 'secondary'}>{sub.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                        <td className="align-middle">
                          <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(sub)}>Editar</Button>
                            <Button variant={sub.activo ? 'outline-warning' : 'outline-success'} size="sm" onClick={() => handleToggleActivo(sub)}>{sub.activo ? 'Desactivar' : 'Activar'}</Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(sub.id)}>Eliminar</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="text-light"><small><i className="bi bi-file-text me-1"></i> Mostrando <strong>{subcategoriasFiltradasYOrdenadas.length}</strong> subcategoría(s)</small></Card.Footer>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton><Modal.Title>{editando ? 'Editar Subcategoría' : 'Nueva Subcategoría'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Categoría <span className="text-danger">*</span></Form.Label><Form.Select name="categoriaId" value={formData.categoriaId} onChange={handleChange} required><option value="">Seleccionar categoría...</option>{categorias.filter(c => c.activo).map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}</Form.Select></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Nombre <span className="text-danger">*</span></Form.Label><Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Televisores" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Descripción</Form.Label><Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción (opcional)" /></Form.Group>
            <Form.Group className="mb-3"><Form.Check type="checkbox" name="activo" label="Subcategoría activa" checked={formData.activo} onChange={handleChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button><Button variant="primary" type="submit">{editando ? 'Actualizar' : 'Crear'}</Button></Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminSubcategoriasPage;