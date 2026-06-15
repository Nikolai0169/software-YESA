import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MisConsultasPage() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/support/mis-consultas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setConsultas(data.data);
      } catch (err) {
        console.error('Error al cargar consultas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultas();
  }, []);

  const estadoBadge = (estado) => {
    const map = { pendiente: 'warning', revisado: 'info', respondido: 'success' };
    return <span className={`badge bg-${map[estado] || 'secondary'}`}>{estado}</span>;
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="d-flex align-items-center mb-4">
            <h3 className="mb-0">
              <i className="bi bi-chat-dots-fill me-2" style={{ color: '#0dcaf0' }}></i>
              Mis Consultas de Soporte
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Cargando consultas...</p>
            </div>
          ) : consultas.length === 0 ? (
            <div className="card shadow-sm text-center py-5">
              <div className="card-body">
                <i className="bi bi-chat-slash fs-1 text-muted"></i>
                <p className="text-muted mt-3">No has enviado ninguna consulta aún.</p>
                <p className="text-muted small">
                  Puedes contactar soporte desde el botón <strong>FAQ</strong> en la barra de navegación.
                </p>
              </div>
            </div>
          ) : (
            consultas.map((c) => (
              <div key={c.id} className="card shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 fw-bold">{c.asunto}</h6>
                    {estadoBadge(c.estado)}
                  </div>
                  <p className="text-muted small mb-2">
                    <i className="bi bi-clock me-1"></i>
                    {new Date(c.createdAt).toLocaleDateString('es-CO', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                  <p className="mb-0">{c.mensaje}</p>

                  {c.estado === 'respondido' && c.respuesta && (
                    <div className="alert alert-success py-2 mt-3 mb-0">
                      <strong><i className="bi bi-reply-fill me-1"></i>Respuesta del equipo:</strong>
                      <p className="mb-0 mt-1">{c.respuesta}</p>
                      {c.fechaRespuesta && (
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-clock me-1"></i>
                          {new Date(c.fechaRespuesta).toLocaleDateString('es-CO', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </small>
                      )}
                    </div>
                  )}

                  {c.estado === 'pendiente' && (
                    <p className="text-muted small mt-2 mb-0">
                      <i className="bi bi-hourglass-split me-1"></i>
                      Tu consulta está en revisión. Te responderemos pronto.
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MisConsultasPage;