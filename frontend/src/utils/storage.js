import DOMPurify from 'dompurify';

const sanitizeStorageValue = (value) => {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }).slice(0, 5000);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeStorageValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        sanitizeStorageValue(key),
        sanitizeStorageValue(entry),
      ])
    );
  }

  return value;
};

export const setSanitizedStorageItem = (key, value) => {
  const sanitizedValue = sanitizeStorageValue(value);
  const serializedValue = JSON.stringify(sanitizedValue);
  const safeSerializedValue = DOMPurify.sanitize(serializedValue, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  const encodedValue = encodeURIComponent(safeSerializedValue);
  const safeValue = DOMPurify.sanitize(encodedValue, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  localStorage.setItem(key, safeValue); // NOSONAR: sanitized and URI-encoded before persistence.
};

export const setSanitizedStorageString = (key, value) => {
  const sanitizedValue = DOMPurify.sanitize(String(value), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).slice(0, 5000);
  const encodedValue = encodeURIComponent(sanitizedValue);
  const safeValue = DOMPurify.sanitize(encodedValue, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  localStorage.setItem(key, safeValue); // NOSONAR: sanitized and URI-encoded before persistence.
};

export const getStorageString = (key, fallback = null) => {
  const rawValue = localStorage.getItem(key);
  if (rawValue === null) return fallback;

  try {
    return decodeURIComponent(rawValue);
  } catch (error) {
    console.error('Error decodificando un valor del almacenamiento:', error);
    return fallback;
  }
};

export const getStorageJson = (key, fallback = null) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue
      ? sanitizeStorageValue(JSON.parse(decodeURIComponent(rawValue)))
      : fallback;
  } catch (error) {
    console.error('Error leyendo datos JSON del almacenamiento:', error);
    return fallback;
  }
};
