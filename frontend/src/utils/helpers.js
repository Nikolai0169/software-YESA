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

  const cleaned = String(value)
    .replace(/\s+/g, '')
    .replace(/\$/g, '')
    .replace(/[^0-9,.-]/g, '');

  if (!cleaned) return '$0';

  let normalized = cleaned;

  if (cleaned.includes(',') && cleaned.includes('.')) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');

    if (lastComma > lastDot) {
      normalized = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = cleaned.replace(/,/g, '');
    }
  } else if (cleaned.includes(',')) {
    const parts = cleaned.split(',');

    if (parts.length > 2 || (parts.length === 2 && parts[0].length <= 3 && parts[1].length === 3)) {
      normalized = cleaned.replace(/,/g, '');
    } else {
      normalized = cleaned.replace(',', '.');
    }
  } else if (cleaned.includes('.')) {
    const parts = cleaned.split('.');

    if (parts.length > 2 || (parts.length === 2 && parts[0].length <= 3 && parts[1].length === 3)) {
      normalized = cleaned.replace(/\./g, '');
    }
  }

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
