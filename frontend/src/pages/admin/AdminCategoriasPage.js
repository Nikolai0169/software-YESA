/**
 * ============================================
 * ADMIN CATEGORÍAS PAGE - UI REDISEÑADA
 * ============================================
 * Gestión CRUD de categorías sin paginación, con scroll y botones de texto.
 * Añadida funcionalidad de activar/desactivar todas.
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Dropdown, ButtonGroup, Row, Col, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { exportarCategoriasAPDF, exportarCategoriasAExcel } from '../../utils/exportUtils';

const AdminCategoriasPage = () => {
  useAuth();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [accionMasivaLoading, setAccionMasivaLoading] = useState(false);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos'
  });
  
  // Ordenamiento por nombre
  const [ordenNombre, setOrdenNombre] = useState('asc');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });
  
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  
  // Categorías filtradas y ordenadas
  const categoriasFiltradasYOrdenadas = useMemo(() => {
    let resultado = categorias.filter(cat => {
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const coincide = cat.nombre.toLowerCase().includes(busqueda) ||
                        (cat.descripcion && cat.descripcion.toLowerCase().includes(busqueda));
        if (!coincide) return false;
      }
      if (filtros.estado !== 'todos') {
        if (filtros.estado === 'activos' && !cat.activo) return false;
        if (filtros.estado === 'inactivos' && cat.activo) return false;
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
  }, [categorias, filtros.busqueda, filtros.estado, ordenNombre]);

  const loadCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/categorias');
      const categorias = response.data?.data?.categorias || response.data?.categorias || response.data?.data || [];
      setCategorias(Array.isArray(categorias) ? categorias : []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar las categorías' });
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  const handleShowModal = (categoria = null) => {
    if (categoria) {
      setEditando(categoria);
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || '',
        activo: categoria.activo
      });
    } else {
      setEditando(null);
      setFormData({ nombre: '', descripcion: '', activo: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData({ nombre: '', descripcion: '', activo: true });
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
        await api.put(`/admin/categorias/${editando.id}`, formData);
        setMensaje({ tipo: 'success', texto: 'Categoría actualizada exitosamente' });
      } else {
        await api.post('/admin/categorias', formData);
        setMensaje({ tipo: 'success', texto: 'Categoría creada exitosamente' });
      }
      handleCloseModal();
      loadCategorias();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al guardar la categoría' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      await api.delete(`/admin/categorias/${id}`);
      setMensaje({ tipo: 'success', texto: 'Categoría eliminada exitosamente' });
      loadCategorias();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      setMensaje({ tipo: 'danger', texto: error.response?.data?.message || 'Error al eliminar la categoría' });
    }
  };

  const handleToggleActivo = async (categoria) => {
    try {
      await api.put(`/admin/categorias/${categoria.id}`, {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        activo: !categoria.activo
      });
      setMensaje({ tipo: 'success', texto: `Categoría ${!categoria.activo ? 'activada' : 'desactivada'} exitosamente` });
      await loadCategorias();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cambiar el estado' });
    }
  };

  // NUEVA FUNCIÓN: activar/desactivar todas las categorías (las que están en la lista filtrada)
  const handleActivarDesactivarTodas = async (nuevoEstado) => {
    const categoriasAfectadas = categoriasFiltradasYOrdenadas;
    if (categoriasAfectadas.length === 0) {
      setMensaje({ tipo: 'warning', texto: 'No hay categorías para modificar' });
      return;
    }

    const estadoTexto = nuevoEstado ? 'activar' : 'desactivar';
    const confirmacion = window.confirm(`¿Estás seguro de ${estadoTexto} TODAS las ${categoriasAfectadas.length} categorías?`);
    if (!confirmacion) return;

    setAccionMasivaLoading(true);
    try {
      const peticiones = categoriasAfectadas.map(cat =>
        api.put(`/admin/categorias/${cat.id}`, {
          nombre: cat.nombre,
          descripcion: cat.descripcion,
          activo: nuevoEstado
        })
      );
      await Promise.all(peticiones);
      setMensaje({ tipo: 'success', texto: `Se han ${estadoTexto} correctamente ${categoriasAfectadas.length} categorías` });
      await loadCategorias();
    } catch (error) {
      console.error('Error en activación/desactivación masiva:', error);
      setMensaje({ tipo: 'danger', texto: `Error al ${estadoTexto} las categorías. Intente nuevamente.` });
    } finally {
      setAccionMasivaLoading(false);
    }
  };

  const totalCategorias = categorias.length;
  const categoriasActivas = categorias.filter(c => c.activo).length;
  const categoriasInactivas = totalCategorias - categoriasActivas;

  if (loading) {
    return <LoadingSpinner message="Cargando categorías..." />;
  }

  return (
    <Container className="py-4">
      <style>
        {`
          .tabla-categorias-scroll {
            overflow-y: auto;
            max-height: 500px;
          }
          .tabla-categorias-scroll thead th {
            position: sticky;
            top: 0;
            background-color: #f8f9fa;
            z-index: 10;
            box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);
          }
          .tabla-categorias-scroll th:last-child,
          .tabla-categorias-scroll td:last-child {
            min-width: 220px;
          }
        `}
      </style>

      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1><i className="bi bi-folder me-2"></i>Gestión de Categorías</h1>
          <p className="text-muted mb-0">Administra las categorías de productos</p>
        </div>
        <div className="d-flex gap-2">
          <Dropdown as={ButtonGroup} className="me-2">
            <Button variant="success" onClick={async () => {
              if (tipoExportacion === 'pdf') exportarCategoriasAPDF(categoriasFiltradasYOrdenadas);
              else await exportarCategoriasAExcel(categoriasFiltradasYOrdenadas);
            }}>
              <i className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`}></i>
              Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="success" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => { setTipoExportacion('pdf'); exportarCategoriasAPDF(categoriasFiltradasYOrdenadas); }}>
                <i className="bi bi-file-earmark-pdf me-2"></i> PDF
              </Dropdown.Item>
              <Dropdown.Item onClick={async () => { setTipoExportacion('excel'); await exportarCategoriasAExcel(categoriasFiltradasYOrdenadas); }}>
                <i className="bi bi-file-earmark-excel me-2"></i> Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Botón de acciones masivas */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-secondary" disabled={accionMasivaLoading || categoriasFiltradasYOrdenadas.length === 0}>
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
            <i className="bi bi-plus-circle me-1"></i> Nueva Categoría
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
          <Card className="text-white bg-primary shadow-sm"><Card.Body><Card.Title>Total Categorías</Card.Title><p className="display-6">{totalCategorias}</p></Card.Body></Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-success shadow-sm"><Card.Body><Card.Title>Categorías Activas</Card.Title><p className="display-6">{categoriasActivas}</p></Card.Body></Card>
        </Col>
        <Col md={4}>
          <Card className="text-white bg-secondary shadow-sm"><Card.Body><Card.Title>Categorías Inactivas</Card.Title><p className="display-6">{categoriasInactivas}</p></Card.Body></Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="mb-3"><i className="bi bi-funnel me-2"></i>Filtros</h5>
          <Row className="g-3 align-items-end">
            <Col md={5}>
              <Form.Label className="small mb-1">Buscar</Form.Label>
              <InputGroup>
                <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                <Form.Control type="text" placeholder="Nombre o descripción..." value={filtros.busqueda} onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })} />
              </InputGroup>
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
            <Col md={3}>
              <Button variant="outline-secondary" className="w-100" onClick={() => { setFiltros({ busqueda: '', estado: 'todos' }); setOrdenNombre('asc'); }}>
                <i className="bi bi-arrow-clockwise me-1"></i> Limpiar filtros
              </Button>
            </Col>
          </Row>
          <div className="mt-3">
            <Badge bg="secondary" className="p-2"><i className="bi bi-folder me-1"></i> {categoriasFiltradasYOrdenadas.length} categoría(s) encontrada(s)</Badge>
          </div>
        </Card.Body>
      </Card>

      {/* Tabla con scroll */}
      <Card className="baner-yesa-secondary">
        <Card.Body className="p-0">
          <div className="tabla-categorias-scroll">
            <Table responsive hover className="mb-0">
              <thead>
                <tr><th style={{ width: '70px' }}>ID</th><th>Nombre</th><th>Descripción</th><th style={{ width: '100px' }}>Estado</th><th style={{ width: '240px' }}>Acciones</th></tr>
              </thead>
              <tbody>
                {categoriasFiltradasYOrdenadas.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-4 text-muted">No hay categorías para mostrar</td></tr>
                ) : (
                  categoriasFiltradasYOrdenadas.map((cat) => (
                    <tr key={cat.id}>
                      <td className="align-middle">{cat.id}</td>
                      <td className="align-middle fw-bold">{cat.nombre}</td>
                      <td className="align-middle">{cat.descripcion || '-'}</td>
                      <td className="align-middle"><Badge bg={cat.activo ? 'success' : 'secondary'}>{cat.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                      <td className="align-middle">
                        <div className="d-flex gap-2">
                          <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(cat)}>Editar</Button>
                          <Button variant={cat.activo ? 'outline-warning' : 'outline-success'} size="sm" onClick={() => handleToggleActivo(cat)}>{cat.activo ? 'Desactivar' : 'Activar'}</Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(cat.id)}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        <Card.Footer className="text-light"><small><i className="bi bi-file-text me-1"></i> Mostrando <strong>{categoriasFiltradasYOrdenadas.length}</strong> categoría(s)</small></Card.Footer>
      </Card>

      {/* Modal (sin cambios) */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton><Modal.Title>{editando ? 'Editar Categoría' : 'Nueva Categoría'}</Modal.Title></Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3"><Form.Label>Nombre <span className="text-danger">*</span></Form.Label><Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej: Electrónica" /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Descripción</Form.Label><Form.Control as="textarea" rows={3} name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción (opcional)" /></Form.Group>
            <Form.Group className="mb-3"><Form.Check type="checkbox" name="activo" label="Categoría activa" checked={formData.activo} onChange={handleChange} /></Form.Group>
          </Modal.Body>
          <Modal.Footer><Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button><Button variant="primary" type="submit">{editando ? 'Actualizar' : 'Crear'}</Button></Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AdminCategoriasPage;