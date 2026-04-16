import React, { useState, useEffect, useMemo, useCallback } from 'react';
import usuarioService from '../services/usuarioService';
import { exportarUsuariosAPDF, exportarUsuariosAExcel } from '../utils/exportUtils';

function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    id: null,
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    rol: 'cliente',
    activo: true
  });
  const [filtros, setFiltros] = useState({
    busqueda: '',
    rol: 'todos',
    estado: 'todos'
  });
  
  const [orden, setOrden] = useState({ campo: 'nombre', direccion: 'asc' });

  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 25;

  const cargarUsuarios = useCallback(async () => {
    try {
      const data = await usuarioService.obtenerUsuarios('?limite=1000');
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      alert('Error al cargar usuarios');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        const dataActualizar = { ...usuarioActual };
        if (!dataActualizar.password) delete dataActualizar.password;
        await usuarioService.actualizarUsuario(usuarioActual.id, dataActualizar);
        alert('Usuario actualizado exitosamente');
      } else {
        if (!usuarioActual.password) {
          alert('La contraseña es requerida para nuevos usuarios');
          return;
        }
        await usuarioService.crearUsuario(usuarioActual);
        alert('Usuario creado exitosamente');
      }
      setShowModal(false);
      limpiarFormulario();
      cargarUsuarios();
    } catch (error) {
      console.error('❌ Error al guardar usuario:', error);
      alert(error.response?.data?.mensaje || 'Error al guardar usuario');
    }
  };

  const handleEditar = (usuario) => {
    setUsuarioActual({ ...usuario, password: '' });
    setEditando(true);
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await usuarioService.eliminarUsuario(id);
      alert('Usuario eliminado exitosamente');
      cargarUsuarios();
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  const handleToggleActivo = async (usuario) => {
    const nuevoEstado = !usuario.activo;
    try {
      await usuarioService.actualizarUsuario(usuario.id, {
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        rol: usuario.rol,
        activo: nuevoEstado
      });
      cargarUsuarios();
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      alert('Error al cambiar estado del usuario');
    }
  };

  const limpiarFormulario = () => {
    setUsuarioActual({
      id: null,
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      direccion: '',
      rol: 'cliente',
      activo: true
    });
    setEditando(false);
  };

  const limpiarFiltros = () => {
    setFiltros({ busqueda: '', rol: 'todos', estado: 'todos' });
    setOrden({ campo: 'nombre', direccion: 'asc' });
  };

  const usuariosFiltradosYOrdenados = useMemo(() => {
    let resultado = usuarios.filter(usuario => {
      const busquedaLower = filtros.busqueda.toLowerCase().trim();
      const pasaBusqueda = !busquedaLower || 
        usuario.nombre.toLowerCase().includes(busquedaLower) ||
        usuario.email.toLowerCase().includes(busquedaLower);
      const pasaRol = filtros.rol === 'todos' || usuario.rol === filtros.rol;
      const pasaEstado = filtros.estado === 'todos' ||
        (filtros.estado === 'activo' && usuario.activo) ||
        (filtros.estado === 'inactivo' && !usuario.activo);
      return pasaBusqueda && pasaRol && pasaEstado;
    });

    resultado.sort((a, b) => {
      let valA = a[orden.campo];
      let valB = b[orden.campo];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return orden.direccion === 'asc' ? -1 : 1;
      if (valA > valB) return orden.direccion === 'asc' ? 1 : -1;
      return 0;
    });
    return resultado;
  }, [usuarios, filtros, orden]);

  const totalPaginas = Math.ceil(usuariosFiltradosYOrdenados.length / registrosPorPagina);
  const usuariosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * registrosPorPagina;
    return usuariosFiltradosYOrdenados.slice(inicio, inicio + registrosPorPagina);
  }, [usuariosFiltradosYOrdenados, paginaActual, registrosPorPagina]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtros, orden]);

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.activo).length;
  const totalClientes = usuarios.filter(u => u.rol === 'cliente').length;

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Estilos para scroll vertical y encabezado fijo
  const tablaScrollStyles = {
    maxHeight: '500px',
    overflowY: 'auto',
    position: 'relative'
  };

  const theadStickyStyles = {
    position: 'sticky',
    top: 0,
    backgroundColor: '#f8f9fa',
    zIndex: 1
  };

  return (
    <div className="container mt-4">
      {/* Estilos embebidos para mejorar la apariencia del scroll */}
      <style>
        {`
          .tabla-con-scroll thead th {
            position: sticky;
            top: 0;
            background-color: #f8f9fa;
            z-index: 10;
            box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);
          }
          .tabla-con-scroll {
            overflow-y: auto;
            max-height: 500px;
          }
          /* Asegurar que la tabla ocupe todo el ancho */
          .tabla-con-scroll table {
            width: 100%;
            margin-bottom: 0;
          }
        `}
      </style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Usuarios</h2>
        <div>
          <div className="btn-group me-2">
            <button className="btn btn-success" onClick={() => exportarUsuariosAPDF(usuariosFiltradosYOrdenados)}>
              <i className="bi bi-file-earmark-pdf me-1"></i> Exportar
            </button>
            <button className="btn btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown"></button>
            <ul className="dropdown-menu">
              <li><button className="dropdown-item" onClick={() => exportarUsuariosAPDF(usuariosFiltradosYOrdenados)}>PDF</button></li>
              <li><button className="dropdown-item" onClick={() => exportarUsuariosAExcel(usuariosFiltradosYOrdenados)}>Excel</button></li>
            </ul>
          </div>
          <button className="btn btn-primary" onClick={() => { limpiarFormulario(); setShowModal(true); }}>
            <i className="bi bi-plus-circle"></i> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Total Usuarios</h5>
              <p className="card-text display-6">{totalUsuarios}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Usuarios Activos</h5>
              <p className="card-text display-6">{usuariosActivos}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-info shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Total Clientes</h5>
              <p className="card-text display-6">{totalClientes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Buscar por nombre o email:</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control" placeholder="Ej: Ana..." value={filtros.busqueda} onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})} />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label">Rol:</label>
              <select className="form-select" value={filtros.rol} onChange={(e) => setFiltros({...filtros, rol: e.target.value})}>
                <option value="todos">Todos</option>
                <option value="administrador">Administrador</option>
                <option value="auxiliar">Auxiliar</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Estado:</label>
              <select className="form-select" value={filtros.estado} onChange={(e) => setFiltros({...filtros, estado: e.target.value})}>
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Ordenar por nombre:</label>
              <select className="form-select" value={orden.direccion} onChange={(e) => setOrden({ campo: 'nombre', direccion: e.target.value })}>
                <option value="asc">Ascendente (A-Z)</option>
                <option value="desc">Descendente (Z-A)</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={limpiarFiltros}>
                <i className="bi bi-eraser me-1"></i> Limpiar filtros
              </button>
            </div>
          </div>
          <div className="mt-3">
            <span className="badge bg-secondary">
              <i className="bi bi-people-fill me-1"></i> {usuariosFiltradosYOrdenados.length} registro(s) encontrado(s)
            </span>
          </div>
        </div>
      </div>

      {/* Tabla con scroll vertical */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="tabla-con-scroll">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No hay usuarios para mostrar</td>
                  </tr>
                ) : (
                  usuariosPaginados.map(usuario => (
                    <tr key={usuario.id}>
                      <td className="fw-semibold">{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.telefono || '-'}</td>
                      <td>
                        <span className={`badge ${usuario.rol === 'administrador' ? 'bg-danger' : usuario.rol === 'auxiliar' ? 'bg-warning' : 'bg-info'}`}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${usuario.activo ? 'bg-success' : 'bg-secondary'}`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => handleEditar(usuario)}>Editar</button>
                          <button className={`btn ${usuario.activo ? 'btn-outline-warning' : 'btn-outline-success'}`} onClick={() => handleToggleActivo(usuario)}>
                            {usuario.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => handleEliminar(usuario.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="card mt-3 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Página {paginaActual} de {totalPaginas} - {usuariosFiltradosYOrdenados.length} registros</small>
              <div className="btn-group">
                <button className="btn btn-outline-primary btn-sm" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1}><i className="bi bi-chevron-bar-left"></i></button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => setPaginaActual(p => p-1)} disabled={paginaActual === 1}>Anterior</button>
                <button className="btn btn-primary btn-sm" disabled>{paginaActual}</button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => setPaginaActual(p => p+1)} disabled={paginaActual === totalPaginas}>Siguiente</button>
                <button className="btn btn-outline-primary btn-sm" onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas}><i className="bi bi-chevron-bar-right"></i></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal (sin cambios) */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editando ? 'Editar Usuario' : 'Nuevo Usuario'}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); limpiarFormulario(); }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre *</label>
                      <input type="text" className="form-control" value={usuarioActual.nombre} onChange={(e) => setUsuarioActual({...usuarioActual, nombre: e.target.value})} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input type="email" className="form-control" value={usuarioActual.email} onChange={(e) => setUsuarioActual({...usuarioActual, email: e.target.value})} required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Contraseña {editando ? '(dejar vacío para no cambiar)' : '*'}</label>
                      <input type="password" className="form-control" value={usuarioActual.password} onChange={(e) => setUsuarioActual({...usuarioActual, password: e.target.value})} required={!editando} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Teléfono</label>
                      <input type="text" className="form-control" value={usuarioActual.telefono} onChange={(e) => setUsuarioActual({...usuarioActual, telefono: e.target.value})} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Dirección</label>
                    <textarea className="form-control" rows="2" value={usuarioActual.direccion} onChange={(e) => setUsuarioActual({...usuarioActual, direccion: e.target.value})}></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Rol *</label>
                      <select className="form-select" value={usuarioActual.rol} onChange={(e) => setUsuarioActual({...usuarioActual, rol: e.target.value})} required>
                        <option value="cliente">Cliente</option>
                        <option value="auxiliar">Auxiliar</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Estado *</label>
                      <select className="form-select" value={usuarioActual.activo} onChange={(e) => setUsuarioActual({...usuarioActual, activo: e.target.value === 'true'})}>
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); limpiarFormulario(); }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">{editando ? 'Actualizar' : 'Crear'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsuariosPage;