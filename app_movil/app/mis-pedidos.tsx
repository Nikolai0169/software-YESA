import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../src/context/authContext';
import pedidoService from '../src/services/pedidoService';

export default function MisPedidos() {
  const { isAuthenticated, isLoadingSession } = useAuth();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoadingSession) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadPedidos();
  }, [isAuthenticated, isLoadingSession]);

  const loadPedidos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await pedidoService.getMisPedidos();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Error cargando pedidos:', err);
      const errorInfo = err as { message?: string };
      setError(errorInfo?.message || 'No fue posible cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const renderPedido = ({ item }: any) => {
    const id = item.id || item._id || item.idPedido;
    const fecha = item.createdAt ? new Date(item.createdAt).toLocaleString() : item.fecha || '';
    const total = item.total || item.monto || 0;
    const estado = item.estado || 'pendiente';

    return (
      <View style={styles.item} key={String(id)}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemTitle}>Pedido #{id}</Text>
          <Text style={styles.itemSubtitle}>{fecha}</Text>
          <Text style={styles.itemSubtitle}>Estado: {estado}</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemTotal}>${Number(total).toFixed(2)}</Text>
          <Link href={`/pedidos/${id}`} asChild>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewText}>Ver</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  };

  if (isLoadingSession) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7d2181" />
        <Text style={styles.subtitle}>Verificando sesión...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Debes iniciar sesión</Text>
        <Text style={styles.subtitle}>Inicia sesión para ver tu historial de pedidos.</Text>
        <Link href="/login" style={styles.link}>Ir a Cuenta</Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis pedidos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#7d2181" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : pedidos.length === 0 ? (
        <Text style={styles.empty}>No tienes pedidos aún.</Text>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(p: any) => String(p.id || p._id || p.idPedido)}
          renderItem={renderPedido}
          contentContainerStyle={styles.list}
        />
      )}

      <Link href="/" style={styles.link}>Volver a tienda</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f7fb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: '#111827' },
  subtitle: { color: '#6b7280', marginBottom: 12 },
  link: { color: '#0a84ff', marginTop: 12 },
  error: { color: '#ef4444' },
  empty: { color: '#6b7280' },
  list: { paddingBottom: 40 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10 },
  itemLeft: { flex: 1 },
  itemRight: { alignItems: 'flex-end' },
  itemTitle: { fontWeight: '700', color: '#111827' },
  itemSubtitle: { color: '#6b7280' },
  itemTotal: { fontWeight: '700', marginBottom: 8 },
  viewButton: { backgroundColor: '#7d2181', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  viewText: { color: '#fff', fontWeight: '700' }
});
