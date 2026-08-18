import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../src/context/authContext';
import pedidoService from '../src/services/pedidoService';
import { formatCurrency } from '../src/utils/formatters';

export default function MisPedidos() {
  const { isAuthenticated, isLoadingSession } = useAuth();
  const [pedidos, setPedidos] = useState([]);
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
    } catch (err) {
      console.error('Error cargando pedidos:', err);
      setError((err && err.message) || 'No fue posible cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarPedido = async (pedidoId: string | number) => {
    Alert.alert(
      'Cancelar pedido',
      '¿Deseas cancelar este pedido? Esta acción no se puede deshacer.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await pedidoService.cancelarPedido(String(pedidoId));
              Alert.alert('Éxito', 'El pedido fue cancelado correctamente.');
              await loadPedidos();
            } catch (err: any) {
              console.error('Error cancelando pedido:', err);
              Alert.alert('No se pudo cancelar', err?.message || 'Ocurrió un error al cancelar el pedido.');
            }
          },
        },
      ]
    );
  };

  const renderPedido = ({ item }: any) => {
    const id = item.id || item._id || item.idPedido;
    const fecha = item.createdAt ? new Date(item.createdAt).toLocaleString() : item.fecha || '';
    const total = item.total || item.monto || 0;
    const estado = String(item.estado || 'pendiente').toLowerCase();
    const puedeCancelar = estado === 'pendiente';

    return (
      <View style={styles.item} key={String(id)}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemTitle}>Pedido #{id}</Text>
          <Text style={styles.itemSubtitle}>{fecha}</Text>
          <Text style={styles.itemSubtitle}>Estado: {estado}</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemTotal}>{formatCurrency(Number(total))}</Text>
          <View style={styles.actionsRow}>
            <Link href={`/pedidos/${id}`} asChild>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewText}>Ver</Text>
              </TouchableOpacity>
            </Link>
            {puedeCancelar ? (
              <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelarPedido(id)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
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

      {loading && <ActivityIndicator size="large" color="#7d2181" />}
      {!loading && Boolean(error) && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && pedidos.length === 0 && <Text style={styles.empty}>No tienes pedidos aún.</Text>}
      {!loading && !error && pedidos.length > 0 && (
        <FlatList
          data={pedidos}
          keyExtractor={(p) => String(p.id || p._id || p.idPedido)}
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
  actionsRow: { flexDirection: 'row', gap: 8 },
  viewButton: { backgroundColor: '#7d2181', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  viewText: { color: '#fff', fontWeight: '700' },
  cancelButton: { backgroundColor: '#ef4444', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  cancelText: { color: '#fff', fontWeight: '700' }
});
