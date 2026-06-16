import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  createSubcategoria,
  getCategorias,
  getSubcategorias,
  toggleSubcategoria,
  updateSubcategoria,
} from '../../src/services/adminService';
import useAdminRole from '../../src/hooks/useAdminRole';

export default function SubcategoriasAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const [subcategorias, setSubcategorias] = useState<{
    id: number | string;
    nombre?: string;
    categoriaId?: number | string;
    categoria?: { id?: number | string; nombre?: string; titulo?: string };
    activo?: boolean;
  }[]>([]);
  const [editingSubcategoria, setEditingSubcategoria] = useState<{
    id: number | string;
    nombre: string;
    categoriaId: string;
  } | null>(null);
  const [categorias, setCategorias] = useState<{ id: number | string; nombre?: string; titulo?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  useEffect(() => {
    loadSubcategorias();
  }, []);

  async function loadSubcategorias() {
    setLoading(true);
    try {
      const [subs, cats] = await Promise.all([getSubcategorias(), getCategorias()]);
      setSubcategorias(Array.isArray(subs) ? (subs as any) : []);
      setCategorias(Array.isArray(cats) ? (cats as any) : []);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando subcategorías:', err.message || error);
      Alert.alert('Error', 'No se pudieron cargar las subcategorías.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSubcategoria() {
    if (!nombre.trim() || !categoriaId.trim()) {
      Alert.alert('Validación', 'Completa el nombre y la categoría.');
      return;
    }

    try {
      await createSubcategoria({ nombre: nombre.trim(), categoriaId: parseInt(categoriaId, 10) });
      setNombre('');
      setCategoriaId('');
      loadSubcategorias();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creando subcategoría:', err.message || error);
      Alert.alert('Error', 'No se pudo crear la subcategoría.');
    }
  }

  async function handleSaveSubcategoria() {
    if (!editingSubcategoria) return;
    if (!editingSubcategoria.nombre.trim() || !editingSubcategoria.categoriaId.trim()) {
      Alert.alert('Validación', 'Completa el nombre y la categoría.');
      return;
    }

    try {
      await updateSubcategoria(editingSubcategoria.id, {
        nombre: editingSubcategoria.nombre.trim(),
        categoriaId: parseInt(editingSubcategoria.categoriaId, 10),
      });
      setEditingSubcategoria(null);
      loadSubcategorias();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error actualizando subcategoría:', err.message || error);
      Alert.alert('Error', 'No se pudo actualizar la subcategoría.');
    }
  }

  function handleEditSubcategoria(subcategoria: { id: number | string; nombre?: string; categoriaId?: number | string; categoria?: { id?: number | string } }) {
    setEditingSubcategoria({
      id: subcategoria.id,
      nombre: subcategoria.nombre || '',
      categoriaId: String(subcategoria.categoriaId ?? subcategoria.categoria?.id ?? ''),
    });
  }

  function cancelEditSubcategoria() {
    setEditingSubcategoria(null);
  }

  function confirmToggle(subcategoria: { id: number | string; nombre?: string; activo?: boolean }) {
    const active = subcategoria.activo !== false;
    const action = active ? 'desactivar' : 'activar';
    Alert.alert(
      'Confirmar acción',
      `¿Quieres ${action} la subcategoría “${subcategoria.nombre || 'Sin nombre'}”?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              await toggleSubcategoria(subcategoria.id);
              loadSubcategorias();
            } catch (error: unknown) {
              const err = error as Error;
              console.error('Error actualizando subcategoría:', err.message || error);
              Alert.alert('Error', 'No se pudo actualizar la subcategoría.');
            }
          },
        },
      ]
    );
  }

  const renderSubcategoria = (subcategoria: { id: number | string; nombre?: string; categoriaId?: number | string; categoria?: { nombre?: string; titulo?: string }; activo?: boolean }) => {
    const category = categorias.find((item) => String(item.id) === String(subcategoria.categoriaId)) || subcategoria.categoria || {};
    const title = subcategoria.nombre || `Subcategoría ${subcategoria.id}`;
    const active = subcategoria.activo !== false;
    return (
      <View key={String(subcategoria.id)} style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemSubtitle}>{category.nombre || category.titulo || 'Categoría desconocida'}</Text>
          <Text style={styles.itemStatus}>{active ? 'Activo' : 'Inactivo'}</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity style={[styles.itemButton, styles.editButton]} onPress={() => handleEditSubcategoria(subcategoria)}>
            <Text style={styles.itemButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.itemButton, active ? styles.buttonInactive : styles.buttonActive]}
            onPress={() => confirmToggle(subcategoria)}
          >
            <Text style={styles.itemButtonText}>{active ? 'Desactivar' : 'Activar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d2181" />
      </View>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  async function handleCreateSubcategoriaMobile() {
    if (!nombre.trim() || !categoriaId.trim()) {
      Alert.alert('Validación', 'Completa el nombre y la categoría.');
      return;
    }

    try {
      await createSubcategoria({ nombre: nombre.trim(), categoriaId: parseInt(categoriaId, 10) });
      setNombre('');
      setCategoriaId('');
      loadSubcategorias();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creando subcategoría:', err.message || error);
      Alert.alert('Error', 'No se pudo crear la subcategoría.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Subcategorías</Text>
      <Text style={styles.subtitle}>Crea, edita y activa/desactiva subcategorías desde la app móvil.</Text>

      {editingSubcategoria ? (
        <View style={styles.editSection}>
          <Text style={styles.sectionTitle}>Editar subcategoría</Text>
          <View style={styles.formRow}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de subcategoría"
              value={editingSubcategoria.nombre}
              onChangeText={(text) => setEditingSubcategoria({ ...editingSubcategoria, nombre: text })}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.formRow}>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => Alert.alert('Categoría', 'Selecciona la categoría en la lista inferior')}
            >
              <Text style={styles.selectorText}>
                {categorias.find((c) => String(c.id) === String(editingSubcategoria.categoriaId))?.nombre || 'Seleccionar categoría'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.editButtonsRow}>
            <TouchableOpacity style={[styles.addButton, styles.saveButton]} onPress={handleSaveSubcategoria}>
              <Text style={styles.addButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, styles.cancelButton]} onPress={cancelEditSubcategoria}>
              <Text style={styles.addButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Nueva subcategoría"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (categorias.length === 0) {
              Alert.alert('Sin categorías', 'Crea primero una categoría antes de agregar subcategorías.');
              return;
            }
            if (!categoriaId && categorias.length === 1) setCategoriaId(String(categorias[0].id));
            handleCreateSubcategoriaMobile();
          }}
        >
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7d2181" style={styles.loader} />
      ) : subcategorias.length === 0 ? (
        <Text style={styles.emptyText}>No hay subcategorías registradas.</Text>
      ) : (
        categorias.length > 0 ? (
          categorias.map((cat) => {
            const subs = subcategorias.filter((s) => String(s.categoriaId) === String(cat.id) || String(s.categoria?.id) === String(cat.id));
            return (
              <View key={String(cat.id)} style={styles.categoryCard}>
                <Text style={styles.categoryTitle}>{cat.nombre || cat.titulo || `Categoría ${cat.id}`}</Text>
                {subs.length === 0 ? (
                  <Text style={styles.emptyTextSmall}>No hay subcategorías en esta categoría.</Text>
                ) : (
                  subs.map((s) => (
                    <View key={String(s.id)} style={styles.itemContainer}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>{s.nombre || `Sub ${s.id}`}</Text>
                        <Text style={styles.itemStatus}>{s.activo !== false ? 'Activo' : 'Inactivo'}</Text>
                      </View>
                      <View style={styles.itemActions}>
                        <TouchableOpacity style={[styles.itemButton, styles.editButton]} onPress={() => handleEditSubcategoria(s)}>
                          <Text style={styles.itemButtonText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.itemButton, s.activo !== false ? styles.buttonInactive : styles.buttonActive]}
                          onPress={() => confirmToggle(s)}
                        >
                          <Text style={styles.itemButtonText}>{s.activo !== false ? 'Desactivar' : 'Activar'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            );
          })
        ) : (
          subcategorias.map((s) => (
            <View key={String(s.id)} style={styles.itemContainer}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{s.nombre || `Sub ${s.id}`}</Text>
                <Text style={styles.itemSubtitle}>{s.categoria?.nombre || 'Categoría desconocida'}</Text>
                <Text style={styles.itemStatus}>{s.activo !== false ? 'Activo' : 'Inactivo'}</Text>
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={[styles.itemButton, styles.editButton]} onPress={() => handleEditSubcategoria(s)}>
                  <Text style={styles.itemButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.itemButton, s.activo !== false ? styles.buttonInactive : styles.buttonActive]}
                  onPress={() => confirmToggle(s)}
                >
                  <Text style={styles.itemButtonText}>{s.activo !== false ? 'Desactivar' : 'Activar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )
      )}

      {categorias.length > 0 ? (
        <View style={styles.categoriesList}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          {categorias.map((c) => (
            <TouchableOpacity
              key={String(c.id)}
              style={[styles.categoryBadge, String(c.id) === String(categoriaId) ? styles.categoryBadgeActive : null]}
              onPress={() => setCategoriaId(String(c.id))}
            >
              <Text style={[styles.categoryBadgeText, String(c.id) === String(categoriaId) ? styles.categoryBadgeTextActive : null]}>{c.nombre || c.titulo}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fb',
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f7fb',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 18,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#7d2181',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  loader: {
    marginTop: 30,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 24,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemStatus: {
    fontSize: 13,
    color: '#4b5563',
  },
  itemButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    minWidth: 88,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#6b7280',
  },
  itemButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  buttonActive: {
    backgroundColor: '#10b981',
  },
  buttonInactive: {
    backgroundColor: '#ef4444',
  },
  editSection: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  webOnlyBox: {
    backgroundColor: '#fff4e5',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#fbbf24',
    padding: 18,
    marginTop: 18,
  },
  webOnlyText: {
    color: '#92400e',
    fontSize: 15,
    lineHeight: 22,
  },
  selector: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 12,
  },
  selectorText: {
    color: '#111827',
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#7d2181',
    marginBottom: 8,
  },
  emptyTextSmall: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 6,
  },
  categoriesList: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryBadgeActive: {
    backgroundColor: '#7d2181',
  },
  categoryBadgeText: {
    color: '#111827',
    fontWeight: '700',
  },
  categoryBadgeTextActive: {
    color: '#ffffff',
  },
});
