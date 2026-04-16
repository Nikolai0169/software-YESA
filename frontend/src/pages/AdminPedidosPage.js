import React, { useState, useEffect, useMemo, useCallback } from 'react';
import pedidoService from '../services/pedidoService';
import { exportarPedidosAPDF, exportarPedidosAExcel } from '../utils/exportUtils';

function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos',
    fechaInicio: '',
    fechaFin: ''
  });
  
  // Ordenamiento (por fecha descendente)
  const [orden, setOrden] = useState({ campo: 'createdAt', direccion: 'desc' });

  const cargarPedidos = useCallback(async () => {
    try {
      const data = await pedidoService.obtenerTodosPedidos('?limite=1000');
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error al cargar pedidos:', error);
      alert('Error al cargar pedidos');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    console.log('🔄 Cambiando estado del pedido:', pedidoId, 'a', nuevoEstado);
    try {
      await pedidoService.actualizarEstadoPedido(pedidoId, nuevoEstado);
      alert('Estado del pedido actualizado');
      cargarPedidos();
      if (showDetalleModal && pedidoSeleccionado?.id === pedidoId) {
        const pedidoActualizado = await pedidoService.obtenerPedidoPorId(pedidoId);
        setPedidoSeleccionado(pedidoActualizado);
      }
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      alert('Error al cambiar estado del pedido');
    }
  };

  const handleVerDetalle = async (pedidoId) => {
    console.log('👁️ Viendo detalle del pedido:', pedidoId);
    try {
      const pedido = await pedidoService.obtenerPedidoPorId(pedidoId);
      setPedidoSeleccionado(pedido);
      setShowDetalleModal(true);
    } catch (error) {
      console.error('❌ Error al cargar detalle:', error);
      alert('Error al cargar detalle del pedido');
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerBadgeEstado = (estado) => {
    const badges = {
      pendiente: 'bg-warning',
      pagado: 'bg-info',
      enviado: 'bg-primary',
      entregado: 'bg-success',
      cancelado: 'bg-danger'
    };
    return badges[estado] || 'bg-secondary';
  };

  // Filtrar y ordenar pedidos (sin paginación)
  const pedidosFiltradosYOrdenados = useMemo(() => {
    let resultado = pedidos.filter(pedido => {
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        const nombreCliente = pedido.Usuario?.nombre?.toLowerCase() || '';
        const emailCliente = pedido.Usuario?.email?.toLowerCase() || '';
        if (!nombreCliente.includes(busqueda) && !emailCliente.includes(busqueda)) return false;
      }
      if (filtros.estado !== 'todos' && pedido.estado !== filtros.estado) return false;
      if (filtros.fechaInicio) {
        const fechaPedido = new Date(pedido.createdAt);
        const fechaInicio = new Date(filtros.fechaInicio);
        fechaInicio.setHours(0, 0, 0, 0);
        if (fechaPedido < fechaInicio) return false;
      }
      if (filtros.fechaFin) {
        const fechaPedido = new Date(pedido.createdAt);
        const fechaFin = new Date(filtros.fechaFin);
        fechaFin.setHours(23, 59, 59, 999);
        if (fechaPedido > fechaFin) return false;
      }
      return true;
    });

    // Ordenamiento por fecha (descendente por defecto)
    resultado.sort((a, b) => {
      let valA = a[orden.campo];
      let valB = b[orden.campo];
      if (orden.campo === 'createdAt') {
        valA = new Date(valA);
        valB = new Date(valB);
      }
      if (valA < valB) return orden.direccion === 'asc' ? -1 : 1;
      if (valA > valB) return orden.direccion === 'asc' ? 1 : -1;
      return 0;
    });
    return resultado;
  }, [pedidos, filtros, orden]);

  // Estadísticas
  const totalPedidos = pedidos.length;
  const pedidosPendiente = pedidos.filter(p => p.estado === 'pendiente').length;
  const pedidosPagado = pedidos.filter(p => p.estado === 'pagado').length;
  const pedidosEnviado = pedidos.filter(p => p.estado === 'enviado').length;
  const pedidosEntregado = pedidos.filter(p => p.estado === 'entregado').length;
  const pedidosCancelado = pedidos.filter(p => p.estado === 'cancelado').length;

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Estilos para scroll en tabla */}
      <style>
        {`
          .tabla-pedidos-scroll {
            overflow-y: auto;
            max-height: 550px;
          }
          .tabla-pedidos-scroll thead th {
            position: sticky;
            top: 0;
            background-color: #f8f9fa;
            z-index: 10;
            box-shadow: 0 2px 2px -1px rgba(0,0,0,0.1);
          }
          .tabla-pedidos-scroll th:last-child,
          .tabla-pedidos-scroll td:last-child {
            min-width: 200px;
          }
        `}
      </style>

      {/* Cabecera */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Pedidos</h2>
        <div className="btn-group">
          <button className="btn btn-success" onClick={() => exportarPedidosAPDF(pedidosFiltradosYOrdenados)}>
            <i className="bi bi-file-earmark-pdf me-1"></i> Exportar
          </button>
          <button className="btn btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown"></button>
          <ul className="dropdown-menu">
            <li><button className="dropdown-item" onClick={() => exportarPedidosAPDF(pedidosFiltradosYOrdenados)}>PDF</button></li>
            <li><button className="dropdown-item" onClick={() => exportarPedidosAExcel(pedidosFiltradosYOrdenados)}>Excel</button></li>
          </ul>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row mb-4">
        <div className="col-md-2">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Total Pedidos</h6>
              <p className="display-6">{totalPedidos}</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-white bg-warning shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Pendientes</h6>
              <p className="display-6">{pedidosPendiente}</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-white bg-info shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Pagados</h6>
              <p className="display-6">{pedidosPagado}</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-white bg-primary shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Enviados</h6>
              <p className="display-6">{pedidosEnviado}</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-white bg-success shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Entregados</h6>
              <p className="display-6">{pedidosEntregado}</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card text-white bg-danger shadow-sm">
            <div className="card-body">
              <h6 className="card-title">Cancelados</h6>
              <p className="display-6">{pedidosCancelado}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="mb-3"><i className="bi bi-funnel me-2"></i>Filtros</h5>
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small">Buscar cliente</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre o email..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-2">
              <label className="form-label small">Estado</label>
              <select 
                className="form-select"
                value={filtros.estado}
                onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <option value="todos">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small">Fecha inicio</label>
              <input type="date" className="form-control" value={filtros.fechaInicio} onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Fecha fin</label>
              <input type="date" className="form-control" value={filtros.fechaFin} onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label small">Ordenar por fecha</label>
              <select className="form-select" value={orden.direccion} onChange={(e) => setOrden({ campo: 'createdAt', direccion: e.target.value })}>
                <option value="desc">Más reciente primero</option>
                <option value="asc">Más antiguo primero</option>
              </select>
            </div>
            <div className="col-md-1 d-flex gap-2">
              <button className="btn btn-outline-secondary w-100" onClick={() => setFiltros({ busqueda: '', estado: 'todos', fechaInicio: '', fechaFin: '' })}>
                <i className="bi bi-eraser"></i>
              </button>
            </div>
          </div>
          <div className="mt-3">
            <span className="badge bg-secondary">
              <i className="bi bi-receipt me-1"></i> {pedidosFiltradosYOrdenados.length} pedido(s) encontrado(s)
            </span>
          </div>
        </div>
      </div>

      {/* Tabla con scroll vertical */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="tabla-pedidos-scroll">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>ID</th>
                  <th>Cliente</th>
                  <th style={{ width: '160px' }}>Fecha</th>
                  <th style={{ width: '120px' }}>Total</th>
                  <th style={{ width: '100px' }}>Estado</th>
                  <th style={{ width: '220px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltradosYOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No hay pedidos para mostrar</td>
                  </tr>
                ) : (
                  pedidosFiltradosYOrdenados.map(pedido => (
                    <tr key={pedido.id}>
                      <td className="align-middle">#{pedido.id}</td>
                      <td className="align-middle">
                        {pedido.Usuario?.nombre || 'Usuario desconocido'}<br/>
                        <small className="text-muted">{pedido.Usuario?.email}</small>
                      </td>
                      <td className="align-middle">{formatearFecha(pedido.createdAt)}</td>
                      <td className="align-middle"><strong>{formatearPrecio(pedido.total)}</strong></td>
                      <td className="align-middle">
                        <span className={`badge ${obtenerBadgeEstado(pedido.estado)}`}>{pedido.estado}</span>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex gap-2 flex-wrap">
                          <button className="btn btn-outline-primary btn-sm" onClick={() => handleVerDetalle(pedido.id)}>Ver detalle</button>
                          
                          {pedido.estado === 'pendiente' && (
                            <>
                              <button className="btn btn-outline-info btn-sm" onClick={() => handleCambiarEstado(pedido.id, 'pagado')}>Pagar</button>
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleCambiarEstado(pedido.id, 'cancelado')}>Cancelar</button>
                            </>
                          )}
                          {pedido.estado === 'pagado' && (
                            <button className="btn btn-outline-primary btn-sm" onClick={() => handleCambiarEstado(pedido.id, 'enviado')}>Enviar</button>
                          )}
                          {pedido.estado === 'enviado' && (
                            <button className="btn btn-outline-success btn-sm" onClick={() => handleCambiarEstado(pedido.id, 'entregado')}>Entregar</button>
                          )}
                          {pedido.estado === 'cancelado' && (
                            <button className="btn btn-outline-secondary btn-sm" disabled>Cancelado</button>
                          )}
                          {pedido.estado === 'entregado' && (
                            <button className="btn btn-outline-secondary btn-sm" disabled>Completado</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer text-muted">
          <small><i className="bi bi-file-text me-1"></i> Mostrando <strong>{pedidosFiltradosYOrdenados.length}</strong> pedido(s)</small>
        </div>
      </div>

      {/* MODAL DETALLE PEDIDO (sin cambios funcionales) */}
      {showDetalleModal && pedidoSeleccionado && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle del Pedido #{pedidoSeleccionado.id}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowDetalleModal(false); setPedidoSeleccionado(null); }}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6>Información del Cliente</h6>
                    <p><strong>Nombre:</strong> {pedidoSeleccionado.Usuario?.nombre}<br/><strong>Email:</strong> {pedidoSeleccionado.Usuario?.email}<br/><strong>Teléfono:</strong> {pedidoSeleccionado.telefono}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Información del Pedido</h6>
                    <p><strong>Fecha:</strong> {formatearFecha(pedidoSeleccionado.createdAt)}<br/><strong>Estado:</strong> <span className={`badge ${obtenerBadgeEstado(pedidoSeleccionado.estado)}`}>{pedidoSeleccionado.estado}</span><br/><strong>Total:</strong> {formatearPrecio(pedidoSeleccionado.total)}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h6>Dirección de Envío</h6>
                  <p>{pedidoSeleccionado.direccionEnvio}</p>
                </div>
                {pedidoSeleccionado.notas && (
                  <div className="mb-4">
                    <h6>Notas</h6>
                    <p className="text-muted">{pedidoSeleccionado.notas}</p>
                  </div>
                )}
                <h6>Productos</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
                    <tbody>
                      {pedidoSeleccionado.DetallePedidos?.map((detalle, index) => (
                        <tr key={index}>
                          <td>{detalle.Producto?.nombre || 'Producto no disponible'}</td>
                          <td>{detalle.cantidad}</td>
                          <td>{formatearPrecio(detalle.precioUnitario)}</td>
                          <td><strong>{formatearPrecio(detalle.subtotal)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr><th colSpan="3" className="text-end">TOTAL:</th><th>{formatearPrecio(pedidoSeleccionado.total)}</th></tr></tfoot>
                  </table>
                </div>
                <div className="mt-4">
                  <h6>Cambiar Estado del Pedido</h6>
                  <div className="btn-group flex-wrap">
                    <button className={`btn ${pedidoSeleccionado.estado === 'pendiente' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'pendiente')} disabled={pedidoSeleccionado.estado === 'pendiente'}>Pendiente</button>
                    <button className={`btn ${pedidoSeleccionado.estado === 'pagado' ? 'btn-info' : 'btn-outline-info'}`} onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'pagado')} disabled={pedidoSeleccionado.estado === 'pagado'}>Pagado</button>
                    <button className={`btn ${pedidoSeleccionado.estado === 'enviado' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'enviado')} disabled={pedidoSeleccionado.estado === 'enviado'}>Enviado</button>
                    <button className={`btn ${pedidoSeleccionado.estado === 'entregado' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'entregado')} disabled={pedidoSeleccionado.estado === 'entregado'}>Entregado</button>
                    <button className={`btn ${pedidoSeleccionado.estado === 'cancelado' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => handleCambiarEstado(pedidoSeleccionado.id, 'cancelado')} disabled={pedidoSeleccionado.estado === 'cancelado'}>Cancelado</button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowDetalleModal(false); setPedidoSeleccionado(null); }}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPedidosPage;