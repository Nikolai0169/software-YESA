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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Subcategorías</Text>
      <Text style={styles.subtitle}>Esta gestión está disponible solo desde el panel web.</Text>
      <View style={styles.webOnlyBox}>
        <Text style={styles.webOnlyText}>
          La administración de subcategorías no está habilitada en la aplicación móvil. Por favor usa el panel web para crear, editar o activar/desactivar subcategorías.
        </Text>
      </View>
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
});
