import React, { useState, useEffect } from 'react';

function MisConsultasPage() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consultaActiva, setConsultaActiva] = useState(null);

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/support/mis-consultas`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setConsultas(data.data || []);
        }
      } catch (err) {
        console.error('Error al cargar consultas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, []);

  const estadoBadge = (estado) => {
    const map = { pendiente: 'warning', revisado: 'info', respondido: 'success', cerrado: 'secondary' };
    const textos = { pendiente: 'Pendiente', revisado: 'Revisado', respondido: 'Respondido', cerrado: 'Cerrado' };
    return <span className={`badge bg-${map[estado] || 'secondary'}`}>{textos[estado] || estado}</span>;
  };

  const formatearFecha = (valor) => {
    if (!valor) return 'Sin fecha';
    return new Date(valor).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
            <div>
              <h3 className="mb-1">
                <i className="bi bi-chat-dots-fill me-2" style={{ color: '#0dcaf0' }}></i>
                Mis consultas
              </h3>
              <p className="text-muted mb-0">
                Revisa el historial de tus mensajes enviados, su estado y la respuesta del equipo.
              </p>
            </div>
            <span className="badge bg-info-subtle text-info-emphasis rounded-pill px-3 py-2">
              {consultas.length} {consultas.length === 1 ? 'mensaje' : 'mensajes'}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Cargando tus consultas...</p>
            </div>
          ) : consultas.length === 0 ? (
            <div className="card shadow-sm text-center py-5 border-0">
              <div className="card-body">
                <i className="bi bi-chat-slash fs-1 text-muted"></i>
                <p className="text-muted mt-3 mb-2">Aún no has enviado ninguna consulta.</p>
                <p className="text-muted small mb-0">
                  Puedes escribirnos desde el botón <strong>FAQ</strong> de la barra de navegación.
                </p>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {consultas.map((c) => {
                const abierta = consultaActiva === c.id;
                return (
                  <div key={c.id} className="card shadow-sm border-0">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <h5 className="mb-0">{c.asunto}</h5>
                            {estadoBadge(c.estado)}
                          </div>
                          <p className="text-muted small mb-2">
                            <i className="bi bi-calendar3 me-1"></i>
                            Enviado el {formatearFecha(c.createdAt)}
                          </p>
                          <p className="mb-0">{c.mensaje}</p>
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setConsultaActiva(abierta ? null : c.id)}
                        >
                          {abierta ? 'Ocultar detalles' : 'Ver detalles'}
                        </button>
                      </div>

                      {abierta && (
                        <div className="mt-3 border-top pt-3">
                          <div className="row g-3">
                            <div className="col-md-6">
                              <div className="small text-muted mb-1">Detalle del mensaje</div>
                              <div className="fw-semibold">{c.asunto}</div>
                              <p className="mb-0 mt-2">{c.mensaje}</p>
                            </div>
                            <div className="col-md-6">
                              <div className="small text-muted mb-1">Estado</div>
                              <div className="mb-2">{estadoBadge(c.estado)}</div>
                              <div className="small text-muted">Correo registrado</div>
                              <div className="fw-semibold">{c.email || 'No disponible'}</div>
                            </div>
                          </div>

                          {c.respuesta ? (
                            <div className="alert alert-success mt-3 mb-0 py-3">
                              <div className="fw-semibold mb-2">
                                <i className="bi bi-reply-fill me-1"></i>
                                Respuesta del equipo
                              </div>
                              <p className="mb-2">{c.respuesta}</p>
                              {c.fechaRespuesta && (
                                <small className="text-muted d-block">
                                  <i className="bi bi-clock me-1"></i>
                                  Respondido el {formatearFecha(c.fechaRespuesta)}
                                </small>
                              )}
                            </div>
                          ) : (
                            <div className="alert alert-light border mt-3 mb-0 py-3">
                              <i className="bi bi-hourglass-split me-1"></i>
                              {c.estado === 'pendiente' || c.estado === 'revisado'
                                ? 'Tu consulta sigue siendo atendida. Pronto recibiras una respuesta.'
                                : 'Aún no hay una respuesta registrada para este contacto.'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MisConsultasPage;