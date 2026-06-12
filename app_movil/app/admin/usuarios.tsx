import React, { useEffect, useState, useMemo } from 'react';
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
import useAdminRole from '../../src/hooks/useAdminRole';
import { getUsuarios, toggleUsuario, deleteUsuario } from '../../src/services/adminService';

export default function UsuariosAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const [usuarios, setUsuarios] = useState<{ id: number | string; nombre?: string; email?: string; activo?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [buscarDebounced, setBuscarDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setBuscarDebounced(buscar.trim()), 300);
    return () => clearTimeout(timer);
  }, [buscar]);

  useEffect(() => {
    loadUsuarios(buscarDebounced);
  }, [buscarDebounced]);

  async function loadUsuarios(termino = '') {
    setLoading(true);
    try {
      const data = await getUsuarios({ buscar: termino, limite: 1000 });
      setUsuarios(Array.isArray(data) ? (data as any) : []);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando usuarios:', err.message || error);
      Alert.alert('Error', 'No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  }

  // Filtrar usuarios según búsqueda local como respaldo
  const usuariosFiltrados = useMemo(() => {
    const termino = buscarDebounced.toLowerCase();
    if (termino === '') return usuarios;
    return usuarios.filter((user) => {
      const nombre = String(user.nombre || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      return nombre.includes(termino) || email.includes(termino);
    });
  }, [usuarios, buscar]);

  function confirmToggle(usuario: { id: number | string; nombre?: string; email?: string; activo?: boolean }) {
    const active = usuario.activo !== false;
    const action = active ? 'desactivar' : 'activar';
    Alert.alert(
      'Confirmar acción',
      `¿Quieres ${action} al usuario "${usuario.nombre || usuario.email || 'Sin nombre'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              await toggleUsuario(usuario.id);
              loadUsuarios(buscarDebounced);
            } catch (error: unknown) {
              const err = error as Error;
              console.error('Error actualizando usuario:', err.message || error);
              Alert.alert('Error', 'No se pudo actualizar el usuario.');
            }
          },
        },
      ]
    );
  }

  function confirmDelete(usuario: { id: number | string; nombre?: string; email?: string }) {
    Alert.alert(
      'Eliminar usuario',
      `¿Estás seguro de eliminar al usuario "${usuario.nombre || usuario.email || 'Sin nombre'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUsuario(usuario.id);
              loadUsuarios(buscarDebounced);
            } catch (error: unknown) {
              const err = error as Error;
              console.error('Error eliminando usuario:', err.message || error);
              Alert.alert('Error', 'No se pudo eliminar el usuario.');
            }
          },
        },
      ]
    );
  }

  const renderUsuario = (usuario: { id: number | string; nombre?: string; email?: string; activo?: boolean }) => {
    const active = usuario.activo !== false;
    return (
      <View key={String(usuario.id)} style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{usuario.nombre || usuario.email}</Text>
          <Text style={styles.itemSubtitle}>{usuario.email}</Text>
          <Text style={[styles.itemStatus, active ? styles.statusActive : styles.statusInactive]}>
            {active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
        <View style={styles.controls}> 
          <TouchableOpacity style={styles.smallButton} onPress={() => confirmToggle(usuario)}>
            <Text style={styles.smallButtonText}>{active ? 'Desactivar' : 'Activar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, styles.deleteButton]} onPress={() => confirmDelete(usuario)}>
            <Text style={styles.smallButtonText}>Eliminar</Text>
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
      <Text style={styles.title}>Usuarios</Text>
      <Text style={styles.subtitle}>Supervisa y controla el estado de los usuarios registrados.</Text>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={buscar}
          onChangeText={setBuscar}
          placeholderTextColor="#9ca3af"
        />
        {buscar !== '' && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setBuscar('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Información de filtrado */}
      {buscarDebounced !== '' && (
        <Text style={styles.filterInfo}>
          {usuariosFiltrados.length} de {usuarios.length} usuarios
        </Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#7d2181" style={styles.loader} />
      ) : usuariosFiltrados.length === 0 ? (
        <Text style={styles.emptyText}>
          {buscarDebounced !== '' ? 'No se encontraron usuarios.' : 'No hay usuarios registrados.'}
        </Text>
      ) : (
        usuariosFiltrados.map(renderUsuario)
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f7fb',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
    fontSize: 15,
  },
  clearButton: {
    backgroundColor: '#ef4444',
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
    color: '#6b7280',
    marginBottom: 12,
    marginLeft: 4,
  },
  loader: {
    marginTop: 30,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
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
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
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
  controls: {
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