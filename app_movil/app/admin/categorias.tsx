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
} from '../../src/services/adminService';

export default function CategoriasAdmin() {
  const [categorias, setCategorias] = useState<{ id: number | string; nombre?: string; titulo?: string; activo?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');

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
        <TouchableOpacity
          style={[styles.itemButton, active ? styles.buttonInactive : styles.buttonActive]}
          onPress={() => confirmToggle(categoria)}
        >
          <Text style={styles.itemButtonText}>{active ? 'Desactivar' : 'Activar'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Categorías</Text>
      <Text style={styles.subtitle}>Crea, visualiza y activa/desactiva categorías desde el panel móvil.</Text>

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
    backgroundColor: '#f8f7fb',
  },
  content: {
    padding: 18,
    paddingBottom: 30,
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
    marginBottom: 18,
  },
  input: {
    flex: 1,
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
    color: '#fff',
    fontWeight: '700',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 36,
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
    color: '#111827',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  itemButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  buttonActive: {
    backgroundColor: '#10b981',
  },
  buttonInactive: {
    backgroundColor: '#ef4444',
  },
});
