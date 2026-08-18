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
import { router, useFocusEffect } from 'expo-router';
import useAdminRole from '../../src/hooks/useAdminRole';
import { getUsuarios, toggleUsuario } from '../../src/services/adminService';
import { Colors } from '../../constants/theme';

function handleEdit(usuario: { id: number | string; nombre?: string; apellido?: string; email?: string; telefono?: string; direccion?: string; rol?: string }) {
  router.push({
    pathname: '/admin/usuarios/crear',
    params: {
      mode: 'edit',
      id: String(usuario.id),
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      rol: usuario.rol || 'cliente',
    },
  });
}

export default function UsuariosAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const [usuarios, setUsuarios] = useState<{ id: number | string; nombre?: string; apellido?: string; email?: string; activo?: boolean; telefono?: string; direccion?: string; rol?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');

  const loadUsuarios = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  useFocusEffect(
    useCallback(() => {
      loadUsuarios();
    }, [loadUsuarios])
  );

  // Filtrar usuarios según búsqueda
  const usuariosFiltrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase();
    if (termino === '') return usuarios;
    return usuarios.filter((user) => {
      const nombre = String(user.nombre || '').toLowerCase();
      const apellido = String(user.apellido || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      return nombre.includes(termino) || apellido.includes(termino) || email.includes(termino);
    });
  }, [usuarios, buscar]);

  function confirmToggle(usuario: { id: number | string; nombre?: string; apellido?: string; email?: string; activo?: boolean }) {
    const active = usuario.activo !== false;
    const action = active ? 'desactivar' : 'activar';
    Alert.alert(
      'Confirmar acción',
      `¿Quieres ${action} al usuario "${getNombreCompleto(usuario)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí',
          onPress: async () => {
            try {
              await toggleUsuario(usuario.id);
              await loadUsuarios();
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

  const getNombreCompleto = (usuario: { nombre?: string; apellido?: string; email?: string }) => {
    const nombre = String(usuario.nombre || '').trim();
    const apellido = String(usuario.apellido || '').trim();
    const fullName = [nombre, apellido].filter(Boolean).join(' ');
    return fullName || usuario.email || 'Sin nombre';
  };

  const renderUsuario = (usuario: { id: number | string; nombre?: string; apellido?: string; email?: string; activo?: boolean; telefono?: string; direccion?: string; rol?: string }) => {
    const active = usuario.activo !== false;
    return (
      <View key={String(usuario.id)} style={styles.itemContainer}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{getNombreCompleto(usuario)}</Text>
          <Text style={styles.itemSubtitle}>{usuario.email}</Text>
          <Text style={[styles.itemStatus, active ? styles.statusActive : styles.statusInactive]}>
            {active ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
        <View style={styles.controls}> 
          <TouchableOpacity style={styles.smallButton} onPress={() => handleEdit(usuario)}>
            <Text style={styles.smallButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, active ? styles.toggleDeactivate : styles.toggleActivate]} onPress={() => confirmToggle(usuario)}>
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
      <Text style={styles.title}>Usuarios</Text>
      <Text style={styles.subtitle}>Supervisa y controla el estado de los usuarios registrados.</Text>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/admin/usuarios/crear')}>
          <Text style={styles.primaryButtonText}>Crear usuario</Text>
        </TouchableOpacity>
      </View>

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
      {buscar !== '' && (
        <Text style={styles.filterInfo}>
          {usuariosFiltrados.length} de {usuarios.length} usuarios
        </Text>
      )}

      {loading ? <ActivityIndicator size="large" color="#7d2181" style={styles.loader} /> : null}
      {!loading && usuariosFiltrados.length === 0 ? (
        <Text style={styles.emptyText}>
          {buscar !== '' ? 'No se encontraron usuarios.' : 'No hay usuarios registrados.'}
        </Text>
      ) : null}
      {!loading && usuariosFiltrados.length > 0 ? usuariosFiltrados.map(renderUsuario) : null}
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
    marginBottom: 6,
    color: Colors.light.text,
  },
  headerActions: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.icon,
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
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 4,
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
  controls: {
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