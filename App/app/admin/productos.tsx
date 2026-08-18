import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Link, router, useFocusEffect } from 'expo-router';
import useAdminRole from '../../src/hooks/useAdminRole';
import { Colors } from '../../constants/theme';
import {
  getProductos,
  toggleProduct,
} from '../../src/services/adminService';

export default function ProductosAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const [productos, setProductos] = useState<{ id: number | string; nombre?: string; titulo?: string; precio?: number; price?: number; activo?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');

  const loadProductos = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadProductos();
  }, [loadProductos]);

  useFocusEffect(
    useCallback(() => {
      loadProductos();
    }, [loadProductos])
  );

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
              await loadProductos();
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

  const productosFiltrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase();
    if (!termino) return productos;
    return productos.filter((producto) => {
      const title = `${producto.nombre || producto.titulo || ''}`.toLowerCase();
      return title.includes(termino);
    });
  }, [productos, buscar]);

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
          <TouchableOpacity
            style={styles.smallButton}
            onPress={() => producto.id && router.push({ pathname: '/admin/producto-form', params: { id: String(producto.id) } })}
          >
            <Text style={styles.smallButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, active ? styles.toggleDeactivate : styles.toggleActivate]} onPress={() => confirmToggle(producto)}>
            <Text style={styles.smallButtonText}>{active ? 'Desactivar' : 'Activar'}</Text>
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
      <Text style={styles.title}>Productos</Text>
      <Text style={styles.subtitle}>Administra el catálogo de productos con acciones directas.</Text>

      <Link href="/admin/producto-form" asChild>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Crear nuevo producto</Text>
        </TouchableOpacity>
      </Link>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar productos..."
          value={buscar}
          onChangeText={setBuscar}
          placeholderTextColor="#9ca3af"
        />
        {buscar !== '' && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setBuscar('')}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {buscar !== '' && (
        <Text style={styles.filterInfo}>
          {productosFiltrados.length} de {productos.length} productos
        </Text>
      )}

      {loading ? <ActivityIndicator size="large" color="#7d2181" style={styles.loader} /> : null}
      {!loading && productosFiltrados.length === 0 ? (
        <Text style={styles.emptyText}>
          {buscar !== '' ? 'No se encontraron productos.' : 'No hay productos disponibles.'}
        </Text>
      ) : null}
      {!loading && productosFiltrados.length > 0 ? productosFiltrados.map(renderProducto) : null}
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
  primaryButton: {
    backgroundColor: Colors.light.primary,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    color: Colors.light.text,
    fontSize: 15,
  },
  clearButton: {
    backgroundColor: Colors.light.danger,
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  filterInfo: {
    fontSize: 13,
    color: Colors.light.icon,
    marginBottom: 12,
    marginLeft: 4,
  },
  loader: {
    marginTop: 30,
  },
  emptyText: {
    color: Colors.light.icon,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 15,
  },
  itemContainer: {
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
    marginBottom: 6,
  },
  itemSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 6,
  },
  itemStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusActive: {
    color: Colors.light.success,
  },
  statusInactive: {
    color: Colors.light.danger,
  },
  itemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  smallButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  toggleActivate: {
    backgroundColor: '#8b5cf6',
  },
  toggleDeactivate: {
    backgroundColor: '#a78bfa',
  },
  deleteButton: {
    backgroundColor: Colors.light.danger,
  },
  smallButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
