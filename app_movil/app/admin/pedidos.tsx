import React, { useEffect, useMemo, useState } from 'react';
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
import { Link } from 'expo-router';
import useAdminRole from '../../src/hooks/useAdminRole';
import { getPedidos } from '../../src/services/adminService';

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return '#f59e0b';
    case 'pagado':
      return '#06b6d4';
    case 'enviado':
      return '#3b82f6';
    case 'entregado':
      return '#10b981';
    case 'cancelado':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

export default function PedidosAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const [pedidos, setPedidos] = useState<{
    id?: number | string;
    numero?: number | string;
    estado?: string;
    total?: number;
    monto?: number;
    email?: string;
    usuario?: { nombre?: string };
    cliente?: { nombre?: string };
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [buscarDebounced, setBuscarDebounced] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setBuscarDebounced(buscar.trim()), 300);
    return () => clearTimeout(timer);
  }, [buscar]);

  useEffect(() => {
    loadPedidos(buscarDebounced);
  }, [buscarDebounced]);

  async function loadPedidos(termino = '') {
    setLoading(true);
    try {
      const data = await getPedidos({ buscar: termino, limite: 1000 });
      setPedidos(Array.isArray(data) ? (data as any) : []);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando pedidos:', err.message || error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  }

  const pedidosFiltrados = useMemo(() => {
    const termino = buscarDebounced.toLowerCase();
    if (!termino) return pedidos;
    return pedidos.filter((pedido) => {
      const cliente = String(pedido.usuario?.nombre || pedido.cliente?.nombre || pedido.email || '').toLowerCase();
      const estado = String(pedido.estado || '').toLowerCase();
      return cliente.includes(termino) || estado.includes(termino);
    });
  }, [pedidos, buscarDebounced]);

  const renderPedido = (pedido: { id?: number | string; numero?: number | string; estado?: string; total?: number; monto?: number; email?: string; usuario?: { nombre?: string }; cliente?: { nombre?: string } }) => {
    const numero = pedido.id || pedido.numero || '---';
    const estado = pedido.estado || 'desconocido';

    return (
      <Link key={String(numero)} href={`/admin/pedidos/${numero}`} asChild>
        <TouchableOpacity style={styles.itemContainer}>
          <View>
            <Text style={styles.itemTitle}>Pedido #{numero}</Text>
            <Text style={styles.itemSubtitle}>Cliente: {pedido.usuario?.nombre || pedido.cliente?.nombre || pedido.email || 'Anónimo'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(estado) }]}> 
            <Text style={styles.statusText}>{estado}</Text>
          </View>
        </TouchableOpacity>
      </Link>
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
      <Text style={styles.title}>Pedidos</Text>
      <Text style={styles.subtitle}>Consulta el histórico de pedidos y accede a cada detalle.</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente o estado"
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

      {loading ? (
        <ActivityIndicator size="large" color="#7d2181" style={styles.loader} />
      ) : pedidosFiltrados.length === 0 ? (
        <Text style={styles.emptyText}>{buscarDebounced !== '' ? 'No se encontraron pedidos.' : 'No hay pedidos disponibles en este momento.'}</Text>
      ) : (
        pedidosFiltrados.map(renderPedido)
      )}

      <Link href="/admin/dashboard" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver al dashboard</Text>
        </TouchableOpacity>
      </Link>
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
  loader: {
    marginTop: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 24,
    fontSize: 15,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
  statusBadge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  backButton: {
    marginTop: 18,
    backgroundColor: '#7d2181',
    paddingVertical: 16,
    borderRadius: 16,
  },
  backButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
