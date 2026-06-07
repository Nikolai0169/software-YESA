import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';
import {
  deleteProduct,
  getProductos,
  toggleProduct,
} from '../../src/services/adminService';

export default function ProductosAdmin() {
  const [productos, setProductos] = useState<{ id: number | string; nombre?: string; titulo?: string; precio?: number; price?: number; activo?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductos();
  }, []);

  async function loadProductos() {
    setLoading(true);
    try {
      const data = await getProductos();
      setProductos(Array.isArray(data) ? (data as any) : []);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando productos:', err.message || error);
      Alert.alert('Error', 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }

  function confirmToggle(producto: { id: number | string; nombre?: string; titulo?: string; activo?: boolean }) {
    const active = producto.activo !== false;
    const action = active ? 'desactivar' : 'activar';
    Alert.alert(
      'Confirmar acción',
      `¿Quieres ${action} el producto “${producto.nombre || producto.titulo || 'Sin nombre'}”?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              await toggleProduct(producto.id);
              loadProductos();
            } catch (error: unknown) {
              const err = error as Error;
              console.error('Error actualizando producto:', err.message || error);
              Alert.alert('Error', 'No se pudo actualizar el producto.');
            }
          },
        },
      ]
    );
  }

  function confirmDelete(producto: { id: number | string; nombre?: string; titulo?: string }) {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de eliminar “${producto.nombre || producto.titulo || 'este producto'}”? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(producto.id);
              loadProductos();
            } catch (error: unknown) {
              const err = error as Error;
              console.error('Error eliminando producto:', err.message || error);
              Alert.alert('Error', 'No se pudo eliminar el producto.');
            }
          },
        },
      ]
    );
  }

  const renderProducto = (producto: { id: number | string; nombre?: string; titulo?: string; precio?: number; price?: number; activo?: boolean }) => {
    const title = producto.nombre || producto.titulo || `Producto ${producto.id}`;
    const price = producto.precio || producto.price || 0;
    const active = producto.activo !== false;
    return (
      <View key={String(producto.id)} style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemSubtitle}>Precio: {Number(price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Text>
          <Text style={[styles.itemStatus, active ? styles.statusActive : styles.statusInactive]}>
            {active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.smallButton} onPress={() => confirmToggle(producto)}>
            <Text style={styles.smallButtonText}>{active ? 'Desactivar' : 'Activar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, styles.deleteButton]} onPress={() => confirmDelete(producto)}>
            <Text style={styles.smallButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Productos</Text>
      <Text style={styles.subtitle}>Administra el catálogo de productos con acciones directas.</Text>

      <Link href="/admin/producto-form" asChild>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Crear nuevo producto</Text>
        </TouchableOpacity>
      </Link>

      {loading ? (
        <ActivityIndicator size="large" color="#7d2181" style={styles.loader} />
      ) : productos.length === 0 ? (
        <Text style={styles.emptyText}>No hay productos disponibles.</Text>
      ) : (
        productos.map(renderProducto)
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
  primaryButton: {
    backgroundColor: '#7d2181',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 18,
  },
  primaryButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  loader: {
    marginTop: 30,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 15,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  itemStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusActive: {
    color: '#10b981',
  },
  statusInactive: {
    color: '#ef4444',
  },
  itemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  smallButton: {
    backgroundColor: '#7d2181',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
