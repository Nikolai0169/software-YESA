import React from 'react';

const SuccessBanner = ({ message, description, onClose, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`d-flex align-items-center justify-content-between rounded-3 border px-3 py-3 shadow-sm ${className}`}
      style={{
        backgroundColor: '#dff1e7',
        borderColor: '#c9e5d2',
        color: '#0f3d25',
      }}
      role="status"
      aria-live="polite"
    >
      <div className="d-flex align-items-center gap-2">
        <i className="bi bi-check-circle-fill fs-5" style={{ color: '#2e8b57' }}></i>
        <div>
          <div className="fw-medium">{message}</div>
          {description && <div className="small mt-1" style={{ color: '#4f6b58' }}>{description}</div>}
        </div>
      </div>
      <button
        type="button"
        className="btn p-0 border-0 bg-transparent ms-3"
        onClick={onClose}
        aria-label="Cerrar mensaje"
        style={{ color: '#5f6f63' }}
      >
        <i className="bi bi-x-lg fs-5"></i>
      </button>
    </div>
  );
};

export default SuccessBanner;