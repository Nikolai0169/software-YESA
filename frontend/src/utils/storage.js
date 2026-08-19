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
  localStorage.setItem(key, JSON.stringify(sanitizedValue));
};

export const setSanitizedStorageString = (key, value) => {
  localStorage.setItem(key, sanitizeStorageValue(value));
};

export const getStorageJson = (key, fallback = null) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? sanitizeStorageValue(JSON.parse(rawValue)) : fallback;
  } catch (error) {
    return fallback;
  }
};
