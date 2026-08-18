import { normalizePersonalizacionDesign } from '../utils/helpers';

const STORAGE_KEY = 'saved_personalization_designs';
const ALLOWED_UPLOAD_PATH = /^\/uploads\/[A-Za-z0-9._/-]+$/;
const URL_FIELDS = new Set(['textureUrl', 'texture', 'imagen', 'composedTextureUrl']);

const sanitizeForStorage = (value, fieldName = '') => {
  if (typeof value === 'string') {
    const sanitized = value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 5000);
    if (URL_FIELDS.has(fieldName)) {
      return ALLOWED_UPLOAD_PATH.test(sanitized) ? sanitized : null;
    }
    return sanitized;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeForStorage(entry, fieldName));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, sanitizeForStorage(entry, key)])
    );
  }
  return value;
};

const writeSanitizedStorageValue = (key, value) => {
  const sanitizedValue = sanitizeForStorage(value);
  const encodedValue = encodeURIComponent(JSON.stringify(sanitizedValue));
  localStorage.setItem(key, encodedValue);
};

const decodeDesignFromStorage = (value) => normalizePersonalizacionDesign(
  sanitizeForStorage(JSON.parse(decodeURIComponent(value)))
);

export const getSavedDesigns = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const savedDesigns = raw ? sanitizeForStorage(JSON.parse(decodeURIComponent(raw))) : [];
    return Array.isArray(savedDesigns)
      ? savedDesigns.map((design) => normalizePersonalizacionDesign(design))
      : [];
  } catch (error) {
    console.error('Error leyendo diseños guardados:', error);
    return [];
  }
};

export const saveDesignLocally = (design) => {
  try {
    const existing = getSavedDesigns();
    const designWithId = normalizePersonalizacionDesign({
      id: design.id || `diseno_${Date.now()}`,
      savedAt: design.savedAt || new Date().toISOString(),
      ...design,
    });
    const found = existing.some((item) => item.id === designWithId.id);
    const updated = found
      ? existing.map((item) => (item.id === designWithId.id ? designWithId : item))
      : [...existing, designWithId];
    writeSanitizedStorageValue(STORAGE_KEY, updated);
    return designWithId;
  } catch (error) {
    console.error('Error guardando diseño localmente:', error);
    throw error;
  }
};

export const deleteSavedDesign = (designId) => {
  try {
    const existing = getSavedDesigns();
    const filtered = existing.filter((design) => design.id !== designId);
    writeSanitizedStorageValue(STORAGE_KEY, filtered);
    return filtered;
  } catch (error) {
    console.error('Error al eliminar diseño guardado:', error);
    return getSavedDesigns();
  }
};

export const clearSavedDesigns = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (error) {
    console.error('Error al eliminar todos los diseños guardados:', error);
    return getSavedDesigns();
  }
};

const CURRENT_DESIGN_KEY = 'current_personalization_design';
const PENDING_DESIGN_KEY = 'pending_personalization_design';

export const setDesignToEdit = (design) => {
  try {
    writeSanitizedStorageValue(CURRENT_DESIGN_KEY, normalizePersonalizacionDesign(design));
  } catch (error) {
    console.error('Error al guardar diseño para edición:', error);
  }
};

export const getDesignToEdit = () => {
  try {
    const raw = localStorage.getItem(CURRENT_DESIGN_KEY);
    return raw ? decodeDesignFromStorage(raw) : null;
  } catch (error) {
    console.error('Error al leer diseño para edición:', error);
    return null;
  }
};

export const clearDesignToEdit = () => {
  try {
    localStorage.removeItem(CURRENT_DESIGN_KEY);
  } catch (error) {
    console.error('Error al eliminar diseño para edición:', error);
  }
};

export const setPendingDesignToEdit = (design) => {
  try {
    writeSanitizedStorageValue(PENDING_DESIGN_KEY, normalizePersonalizacionDesign(design));
  } catch (error) {
    console.error('Error al guardar diseño pendiente para edición:', error);
  }
};

export const getPendingDesignToEdit = () => {
  try {
    const raw = localStorage.getItem(PENDING_DESIGN_KEY);
    return raw ? decodeDesignFromStorage(raw) : null;
  } catch (error) {
    console.error('Error al leer diseño pendiente para edición:', error);
    return null;
  }
};

export const clearPendingDesignToEdit = () => {
  try {
    localStorage.removeItem(PENDING_DESIGN_KEY);
  } catch (error) {
    console.error('Error al eliminar diseño pendiente para edición:', error);
  }
};
