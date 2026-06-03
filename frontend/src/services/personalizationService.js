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
    const updated = [...existing, designWithId];
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
    console.error('Error eliminando diseño guardado:', error);
    return getSavedDesigns();
  }
};

export const clearSavedDesigns = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (error) {
    console.error('Error eliminando todos los diseños guardados:', error);
    return getSavedDesigns();
  }
};
