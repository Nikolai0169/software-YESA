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

  const raw = typeof value === 'string'
    ? value.trim().replace(/\$/g, '').replace(/\s+/g, '').replace(/[^0-9,.-]/g, '')
    : String(value);

  const normalized = (() => {
    if (raw.includes(',') && raw.includes('.')) {
      const lastComma = raw.lastIndexOf(',');
      const lastDot = raw.lastIndexOf('.');

      if (lastComma > lastDot) {
        return raw.replace(/\./g, '').replace(/,/g, '.');
      }

      return raw.replace(/,/g, '');
    }

    if (raw.includes(',')) {
      const parts = raw.split(',');

      if (parts.length > 1 && parts[parts.length - 1].length === 3 && parts[0].length <= 3) {
        return parts.join('');
      }

      return raw.replace(/,/g, '.');
    }

    if (raw.includes('.')) {
      const parts = raw.split('.');

      if (parts.length > 1 && parts[parts.length - 1].length === 3 && parts[0].length <= 3) {
        return parts.join('');
      }

      return raw;
    }

    return raw;
  })();

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
  return `${process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000'}/${imagePath.replace(/^\//, '')}`;
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

const toFiniteNumber = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

export const normalizePersonalizacionDesign = (design = {}) => {
  const legacyOffset = design.textureOffset && typeof design.textureOffset === 'object'
    ? design.textureOffset
    : {};
  const textureOffsetX = toFiniteNumber(
    design.textureOffsetX ?? legacyOffset.x,
    0
  );
  const textureOffsetY = toFiniteNumber(
    design.textureOffsetY ?? legacyOffset.y,
    0
  );

  return {
    ...design,
    textureOffsetX,
    textureOffsetY,
    textureOffset: { x: textureOffsetX, y: textureOffsetY },
    textureScale: toFiniteNumber(design.textureScale, 1),
    zoom: toFiniteNumber(design.zoom, 1),
    overlayTextFontSize: toFiniteNumber(design.overlayTextFontSize, 24),
  };
};
