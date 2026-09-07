const quitarBarrasFinales = (value) => {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') end -= 1;
  return value.slice(0, end);
};

const quitarBarrasIniciales = (value) => {
  let start = 0;
  while (start < value.length && value[start] === '/') start += 1;
  return value.slice(start);
};

const esHostLocal = (value) => {
  if (!value) return true;

  const stringValue = String(value);
  let host = stringValue;
  if (stringValue.startsWith('https://')) {
    host = stringValue.slice(8);
  } else if (stringValue.startsWith('http://')) {
    host = stringValue.slice(7);
  }
  const normalizedHost = quitarBarrasFinales(host)
    .split('/')[0]
    .split(':')[0];

  return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(normalizedHost);
};

const construirBaseUrl = (req) => {
  if (!req) {
    const configuredBaseUrl = process.env.BACKEND_URL;
    if (configuredBaseUrl && !esHostLocal(configuredBaseUrl)) {
      return quitarBarrasFinales(configuredBaseUrl);
    }

    return 'http://localhost:5000';
  }

  const configuredBaseUrl = process.env.BACKEND_URL;
  if (configuredBaseUrl && !esHostLocal(configuredBaseUrl)) {
    return quitarBarrasFinales(configuredBaseUrl);
  }

  const protocol = req.protocol || req.headers?.['x-forwarded-proto'] || 'http';
  const forwardedHost = req.headers?.['x-forwarded-host'] || req.headers?.host || req.get?.('host');
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;

  if (host) {
    return quitarBarrasFinales(`${protocol}://${host}`);
  }

  return 'http://localhost:5000';
};

const normalizarRutaImagen = (imagen, req) => {
  if (!imagen) return imagen;

  if (imagen.startsWith('http')) {
    try {
      const url = new URL(imagen);
      if (!esHostLocal(url.host)) return imagen;
      imagen = url.pathname;
    } catch {
      return imagen;
    }
  }

  const limpia = quitarBarrasIniciales(imagen);
  const baseUrl = construirBaseUrl(req);

  if (limpia.startsWith('uploads/')) return `${baseUrl}/${limpia}`;
  return `${baseUrl}/uploads/${limpia}`;
};

module.exports = {
  construirBaseUrl,
  normalizarRutaImagen,
};
