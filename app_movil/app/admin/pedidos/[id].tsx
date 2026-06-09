import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import useAdminRole from '../../../src/hooks/useAdminRole';
import { useLocalSearchParams, Link } from 'expo-router';
import { getPedido } from '../../../src/services/adminService';

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

type PedidoDetalle = {
  total?: number;
  monto?: number;
  estado?: string;
  createdAt?: string;
  fecha?: string;
  items?: { nombre?: string; title?: string; cantidad?: number; quantity?: number }[];
  detalle?: { nombre?: string; title?: string; cantidad?: number; quantity?: number }[];
  usuario?: { nombre?: string; email?: string };
  cliente?: { nombre?: string; email?: string };
};

export default function PedidoDetalleAdmin() {
  const { id } = useLocalSearchParams();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [loading, setLoading] = useState(true);

  const { isChecking, isAuthorized } = useAdminRole();

  useEffect(() => {
    if (id) {
      loadPedido();
    }
  }, [id]);

  async function loadPedido() {
    setLoading(true);
    try {
      const data = await getPedido(id);
      setPedido((data as PedidoDetalle) || null);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando el pedido:', err.message || error);
      Alert.alert('Error', 'No se pudo cargar el pedido.');
    } finally {
      setLoading(false);
    }
  }

  if (isChecking || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d2181" />
      </View>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (!pedido) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pedido no encontrado</Text>
        <Link href="/admin/pedidos" style={styles.link}>
          Volver a pedidos
        </Link>
      </View>
    );
  }

  const total = pedido.total || pedido.monto || 0;
  const cliente = pedido.usuario || pedido.cliente || {};
  const estado = pedido.estado || 'desconocido';
  const fecha = pedido.createdAt || pedido.fecha || '';
  const items = Array.isArray(pedido.items) ? pedido.items : pedido.detalle || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pedido #{id}</Text>
      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>Cliente</Text>
        <Text style={styles.metaValue}>{cliente.nombre || cliente.email || 'Desconocido'}</Text>
      </View>
      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>Estado</Text>
        <Text style={[styles.metaValue, { color: getStatusColor(estado) }]}>{estado}</Text>
      </View>
      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>Total</Text>
        <Text style={styles.metaValue}>{Number(total).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</Text>
      </View>
      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>Fecha</Text>
        <Text style={styles.metaValue}>{fecha ? new Date(fecha).toLocaleString('es-CO') : '-'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Artículos</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>No hay artículos registrados en este pedido.</Text>
      ) : (
        items.map((item: { nombre?: string; title?: string; cantidad?: number; quantity?: number }, index: number) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.nombre || item.title || `Artículo ${index + 1}`}</Text>
            <Text style={styles.itemQuantity}>x{item.cantidad || item.quantity || 1}</Text>
          </View>
        ))
      )}

      <Link href="/admin/pedidos" style={styles.link}>
        Volver a pedidos
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 14,
    color: '#1f2937',
  },
  metaBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  metaLabel: {
    color: '#6b7280',
    marginBottom: 4,
    fontSize: 13,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
    color: '#111827',
  },
  emptyText: {
    color: '#6b7280',
    marginBottom: 18,
  },
  itemRow: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  itemQuantity: {
    color: '#6b7280',
    marginTop: 6,
  },
  link: {
    color: '#7d2181',
    marginTop: 22,
    fontSize: 16,
    fontWeight: '700',
  },
});
