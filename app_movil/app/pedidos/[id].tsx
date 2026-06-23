import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import pedidoService from '../../src/services/pedidoService';

const getStatusColor = (estado: string = '') => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return '#f59e0b';
    case 'pagado':
    case 'confirmado':
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

const formatCurrency = (value: number | string | undefined) => {
  const numericValue = Number(value || 0);
  return numericValue.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  });
};

const formatDate = (value: string | undefined) => {
  if (!value) return '-';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('es-CO');
};

export default function PedidoDetalle() {
  const { id } = useLocalSearchParams();
  const pedidoId = Array.isArray(id) ? id[0] : id;
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (pedidoId) {
      loadPedido();
    }
  }, [pedidoId]);

  async function loadPedido() {
    if (!pedidoId) {
      setPedido(null);
      setLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setPedido(null);
    setLoading(true);

    try {
      const response = await pedidoService.getPedidoById(pedidoId);
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const pedidoData = response?.data?.pedido || response?.pedido || response || null;
      const normalizedPedido = pedidoData || null;

      if (normalizedPedido && normalizedPedido.id && String(normalizedPedido.id) !== String(pedidoId)) {
        setPedido(null);
        return;
      }

      setPedido(normalizedPedido);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando el pedido:', err.message || error);
      if (currentRequestId === requestIdRef.current) {
        Alert.alert('Error', 'No se pudo cargar el detalle del pedido.');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d2181" />
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pedido no encontrado</Text>
        <Link href="/mis-pedidos" style={styles.link}>
          Volver a mis pedidos
        </Link>
      </View>
    );
  }

  const total = pedido.total || pedido.monto || 0;
  const pedidoNumero = pedido.id || pedidoId;
  const cliente = pedido.usuario || pedido.cliente || {};
  const estado = String(pedido.estado || 'desconocido').toLowerCase();
  const fecha = pedido.createdAt || pedido.fecha || '';
  const items = Array.isArray(pedido.detalles)
    ? pedido.detalles.map((detalle: any) => ({
        nombre: detalle?.producto?.nombre || detalle?.nombre || detalle?.producto?.titulo || 'Producto',
        cantidad: detalle?.cantidad ?? detalle?.quantity ?? 1,
        precio: Number(detalle?.precioUnitario ?? detalle?.precio ?? detalle?.producto?.precio ?? 0),
        subtotal: Number(detalle?.subtotal ?? (Number(detalle?.precioUnitario ?? detalle?.precio ?? detalle?.producto?.precio ?? 0) * (detalle?.cantidad ?? detalle?.quantity ?? 1))),
      }))
    : Array.isArray(pedido.items)
      ? pedido.items.map((item: any) => ({
          nombre: item?.producto?.nombre || item?.nombre || item?.producto?.titulo || 'Producto',
          cantidad: item?.cantidad ?? item?.quantity ?? 1,
          precio: Number(item?.precioUnitario ?? item?.precio ?? item?.producto?.precio ?? 0),
          subtotal: Number(item?.subtotal ?? (Number(item?.precioUnitario ?? item?.precio ?? item?.producto?.precio ?? 0) * (item?.cantidad ?? item?.quantity ?? 1))),
        }))
      : Array.isArray(pedido.detalle)
        ? pedido.detalle.map((item: any) => ({
            nombre: item?.producto?.nombre || item?.nombre || item?.producto?.titulo || 'Producto',
            cantidad: item?.cantidad ?? item?.quantity ?? 1,
            precio: Number(item?.precioUnitario ?? item?.precio ?? item?.producto?.precio ?? 0),
            subtotal: Number(item?.subtotal ?? (Number(item?.precioUnitario ?? item?.precio ?? item?.producto?.precio ?? 0) * (item?.cantidad ?? item?.quantity ?? 1))),
          }))
        : [];
  const notas = pedido.notas || pedido.notasAdicionales || pedido.observaciones || '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pedido #{pedidoNumero}</Text>

      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>Cliente</Text>
        <Text style={styles.metaValue}>{cliente.nombre || cliente.email || 'Cliente'}</Text>
      </View>

      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>Estado</Text>
        <Text style={[styles.metaValue, { color: getStatusColor(estado) }]}>{estado}</Text>
      </View>

      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>Total</Text>
        <Text style={styles.metaValue}>{formatCurrency(total)}</Text>
      </View>

      <View style={styles.metaBox}>
        <Text style={styles.metaLabel}>Fecha</Text>
        <Text style={styles.metaValue}>{formatDate(fecha)}</Text>
      </View>

      {pedido.direccionEnvio ? (
        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>Dirección de envío</Text>
          <Text style={styles.metaValue}>{pedido.direccionEnvio}</Text>
        </View>
      ) : null}

      {pedido.telefono ? (
        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>Teléfono</Text>
          <Text style={styles.metaValue}>{pedido.telefono}</Text>
        </View>
      ) : null}

      {pedido.metodoPago ? (
        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>Método de pago</Text>
          <Text style={styles.metaValue}>{pedido.metodoPago}</Text>
        </View>
      ) : null}

      {notas ? (
        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>Notas</Text>
          <Text style={styles.metaValue}>{notas}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Artículos</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>No hay artículos registrados en este pedido.</Text>
      ) : (
        items.map((item: any, index: number) => (
          <View key={`${item.nombre || 'item'}-${index}`} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.nombre || `Artículo ${index + 1}`}</Text>
            <Text style={styles.itemQuantity}>Cantidad: {item.cantidad || item.quantity || 1}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.subtotal || item.precio)}</Text>
          </View>
        ))
      )}

      <Link href="/mis-pedidos" style={styles.link}>
        Volver a mis pedidos
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
    color: '#111827',
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
  itemPrice: {
    color: '#7d2181',
    marginTop: 6,
    fontWeight: '700',
  },
  link: {
    color: '#7d2181',
    marginTop: 22,
    fontSize: 16,
    fontWeight: '700',
  },
});
