const esHostLocal = (value) => {
  if (!value) return true;

  const host = String(value)
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
    .split('/')[0]
    .split(':')[0];

  return ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(host);
};

const construirBaseUrl = (req) => {
  if (!req) {
    const configuredBaseUrl = process.env.BACKEND_URL;
    if (configuredBaseUrl && !esHostLocal(configuredBaseUrl)) {
      return configuredBaseUrl.replace(/\/+$/, '');
    }

    return 'http://localhost:5000';
  }

  const configuredBaseUrl = process.env.BACKEND_URL;
  if (configuredBaseUrl && !esHostLocal(configuredBaseUrl)) {
    return configuredBaseUrl.replace(/\/+$/, '');
  }

  const protocol = req.protocol || req.headers?.['x-forwarded-proto'] || 'http';
  const forwardedHost = req.headers?.['x-forwarded-host'] || req.headers?.host || req.get?.('host');
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;

  if (host) {
    return `${protocol}://${host}`.replace(/\/+$/, '');
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

  const limpia = imagen.replace(/^\/+/, '');
  const baseUrl = construirBaseUrl(req);

  if (limpia.startsWith('uploads/')) return `${baseUrl}/${limpia}`;
  return `${baseUrl}/uploads/${limpia}`;
};

module.exports = {
  construirBaseUrl,
  normalizarRutaImagen,
};
