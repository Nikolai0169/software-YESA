/**
 * ============================================
 * UTILIDADES - FORMATOS
 * ============================================
 * Funciones auxiliares para formatear datos
 */

/**
 * Formatear precio en pesos colombianos
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '$0';

  const normalized = typeof value === 'string'
    ? (() => {
        const raw = value.replace(/\s+/g, '').replace(/[^0-9.,-]/g, '');
        if (!raw) return '';
        const hasComma = raw.includes(',');
        const hasDot = raw.includes('.');

        if (hasComma && hasDot) {
          const lastComma = raw.lastIndexOf(',');
          const lastDot = raw.lastIndexOf('.');
          if (lastDot > lastComma) {
            return raw.replace(/,/g, '');
          }
          return raw.replace(/\./g, '').replace(/,/g, '.');
        }

        if (hasComma) {
          return raw.replace(/,/g, '.');
        }

        if (hasDot) {
          const parts = raw.split('.');
          if (parts.length > 2) {
            return `${parts.slice(0, -1).join('')}.${parts[parts.length - 1]}`;
          }
          return raw;
        }

        return raw;
      })()
    : String(value);

  const numero = Number(normalized);
  if (Number.isNaN(numero)) return '$0';

  const hasDecimals = !Number.isInteger(numero);

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(numero);
};

/**
 * Formatear fecha
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Obtener URL completa de la imagen
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:5000/${imagePath}`;
};

/**
 * Validar email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validar teléfono colombiano
 */
export const isValidPhone = (phone) => {
  const re = /^3\d{9}$/;
  return re.test(phone);
};

/**
 * Obtener badge de estado de pedido
 */
export const getEstadoBadge = (estado) => {
  const badges = {
    pendiente: 'warning',
    enviado: 'info',
    entregado: 'success',
    cancelado: 'danger',
  };
  return badges[estado] || 'secondary';
};

/**
 * Obtener texto de estado de pedido
 */
export const getEstadoTexto = (estado) => {
  const textos = {
    pendiente: 'Pendiente',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };
  return textos[estado] || estado;
};
