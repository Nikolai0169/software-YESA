const STORAGE_KEY = 'saved_personalization_designs';

export const getSavedDesigns = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error leyendo diseños guardados:', error);
    return [];
  }
};

export const saveDesignLocally = (design) => {
  try {
    const existing = getSavedDesigns();
    const designWithId = {
      id: design.id || `diseno_${Date.now()}`,
      savedAt: design.savedAt || new Date().toISOString(),
      ...design,
    };
    const found = existing.some((item) => item.id === designWithId.id);
    const updated = found
      ? existing.map((item) => (item.id === designWithId.id ? designWithId : item))
      : [...existing, designWithId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
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

export const setDesignToEdit = (design) => {
  try {
    localStorage.setItem(CURRENT_DESIGN_KEY, JSON.stringify(design));
  } catch (error) {
    console.error('Error al guardar diseño para edición:', error);
  }
};

export const getDesignToEdit = () => {
  try {
    const raw = localStorage.getItem(CURRENT_DESIGN_KEY);
    return raw ? JSON.parse(raw) : null;
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
