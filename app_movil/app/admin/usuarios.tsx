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
import { getUsuarios, toggleUsuario, deleteUsuario } from '../../src/services/adminService';

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState<{ id: number | string; nombre?: string; email?: string; activo?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    setLoading(true);
    try {
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? (data as any) : []);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando usuarios:', err.message || error);
      Alert.alert('Error', 'No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  }

  function confirmToggle(usuario: { id: number | string; nombre?: string; email?: string; activo?: boolean }) {
    const active = usuario.activo !== false;
    const action = active ? 'desactivar' : 'activar';
    Alert.alert(
      'Confirmar acción',
      `¿Quieres ${action} al usuario “${usuario.nombre || usuario.email || 'Sin nombre'}”?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              await toggleUsuario(usuario.id);
              loadUsuarios();
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
      `¿Estás seguro de eliminar al usuario “${usuario.nombre || usuario.email || 'Sin nombre'}”?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUsuario(usuario.id);
              loadUsuarios();
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Usuarios</Text>
      <Text style={styles.subtitle}>Supervisa y controla el estado de los usuarios registrados.</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#7d2181" style={styles.loader} />
      ) : usuarios.length === 0 ? (
        <Text style={styles.emptyText}>No se encontraron usuarios.</Text>
      ) : (
        usuarios.map(renderUsuario)
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
    marginBottom: 6,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 18,
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
