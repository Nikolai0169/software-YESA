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
  createCategoria,
  getCategorias,
  toggleCategoria,
  updateCategoria,
} from '../../src/services/adminService';
import useAdminRole from '../../src/hooks/useAdminRole';
import { Colors } from '../../constants/theme';

export default function CategoriasAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const [categorias, setCategorias] = useState<{ id: number | string; nombre?: string; titulo?: string; activo?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoria, setEditingCategoria] = useState<{ id: number | string; nombre: string } | null>(null);

  useEffect(() => {
    loadCategorias();
  }, []);

  async function loadCategorias() {
    setLoading(true);
    try {
      const data = await getCategorias();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando categorías:', err.message || error);
      Alert.alert('Error', 'No se pudo cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCategoria() {
    if (!newCategoryName.trim()) {
      Alert.alert('Validación', 'Debes escribir el nombre de la categoría.');
      return;
    }

    try {
      await createCategoria({ nombre: newCategoryName.trim() });
      setNewCategoryName('');
      loadCategorias();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creando categoría:', err.message || error);
      Alert.alert('Error', 'No se pudo crear la categoría.');
    }
  }

  async function handleSaveCategoria() {
    if (!editingCategoria?.nombre.trim()) {
      Alert.alert('Validación', 'Debes escribir el nombre de la categoría.');
      return;
    }

    try {
      await updateCategoria(editingCategoria.id, { nombre: editingCategoria.nombre.trim() });
      setEditingCategoria(null);
      loadCategorias();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error actualizando categoría:', err.message || error);
      Alert.alert('Error', 'No se pudo actualizar la categoría.');
    }
  }

  function handleEditCategoria(categoria: { id: number | string; nombre?: string; titulo?: string }) {
    setEditingCategoria({ id: categoria.id, nombre: categoria.nombre || categoria.titulo || '' });
  }

  function cancelEditCategoria() {
    setEditingCategoria(null);
  }

  function confirmToggle(categoria: { id: number | string; nombre?: string; titulo?: string; activo?: boolean }) {
    const active = categoria.activo !== false;
    const action = active ? 'desactivar' : 'activar';
    Alert.alert(
      'Confirmar acción',
      `¿Quieres ${action} la categoría “${categoria.nombre || categoria.titulo || 'Sin nombre'}”?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              await toggleCategoria(categoria.id);
              loadCategorias();
            } catch (error: unknown) {
              const err = error as Error;
              console.error('Error actualizando categoría:', err.message || error);
              Alert.alert('Error', 'No se pudo actualizar la categoría.');
            }
          },
        },
      ]
    );
  }

  const renderCategoria = (categoria: { id: number | string; nombre?: string; titulo?: string; activo?: boolean }) => {
    const title = categoria.nombre || categoria.titulo || `Categoría ${categoria.id}`;
    const active = categoria.activo !== false;
    return (
      <View key={String(categoria.id)} style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemSubtitle}>{active ? 'Activo' : 'Inactivo'}</Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity style={[styles.itemButton, styles.editButton]} onPress={() => handleEditCategoria(categoria)}>
            <Text style={styles.itemButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.itemButton, styles.itemButtonSpacing, active ? styles.buttonInactive : styles.buttonActive]}
            onPress={() => confirmToggle(categoria)}
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
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Categorías</Text>
      <Text style={styles.subtitle}>Crea, visualiza y activa/desactiva categorías desde el panel móvil.</Text>

      {editingCategoria ? (
        <View style={styles.editSection}>
          <Text style={styles.sectionTitle}>Editar categoría</Text>
          <View style={styles.formRow}>
            <TextInput
              style={styles.input}
              placeholder="Nombre de categoría"
              value={editingCategoria.nombre}
              onChangeText={(text) => setEditingCategoria({ ...editingCategoria, nombre: text })}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.editButtonsRow}>
            <TouchableOpacity style={[styles.addButton, styles.saveButton]} onPress={handleSaveCategoria}>
              <Text style={styles.addButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, styles.cancelButton]} onPress={cancelEditCategoria}>
              <Text style={styles.addButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Nueva categoría"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleCreateCategoria}>
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7d2181" style={styles.loader} />
      ) : categorias.length === 0 ? (
        <Text style={styles.emptyText}>No hay categorías registradas.</Text>
      ) : (
        categorias.map(renderCategoria)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 18,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    color: Colors.light.icon,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 36,
  },
  itemContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.05,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  itemButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    minWidth: 88,
    flexShrink: 0,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemButtonSpacing: {
    marginLeft: 8,
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
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 10,
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: Colors.light.primaryLight,
  },
  cancelButton: {
    backgroundColor: Colors.light.icon,
  },
});
