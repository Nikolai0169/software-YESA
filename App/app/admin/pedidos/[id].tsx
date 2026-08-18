import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import useAdminRole from '../../../src/hooks/useAdminRole';
import { useLocalSearchParams, Link } from 'expo-router';
import { getPedido, updatePedidoEstado } from '../../../src/services/adminService';

const getStatusColor = (estado: string = '') => {
  switch (estado.toLowerCase()) {
    case 'pendiente':
      return '#f59e0b';
    case 'en_proceso':
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

const statusOptions = [
  { value: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
  { value: 'en_proceso', label: 'En Proceso', color: '#06b6d4' },
  { value: 'enviado', label: 'Enviado', color: '#3b82f6' },
  { value: 'entregado', label: 'Entregado', color: '#10b981' },
  { value: 'cancelado', label: 'Cancelado', color: '#ef4444' },
];

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

type PedidoDetalle = {
  id?: number | string;
  total?: number;
  monto?: number;
  estado?: string;
  createdAt?: string;
  fecha?: string;
  direccionEnvio?: string;
  telefono?: string;
  metodoPago?: string;
  notas?: string;
  notasAdicionales?: string;
  observaciones?: string;
  detalles?: Array<any>;
  detallesPersonalizados?: Array<any>;
  items?: Array<any>;
  detalle?: Array<any>;
  usuario?: { nombre?: string; email?: string };
  cliente?: { nombre?: string; email?: string };
};

function normalizePedidoItems(pedido: PedidoDetalle) {
  let source: any[] = [];
  if (Array.isArray(pedido.detalles)) {
    source = pedido.detalles;
  } else if (Array.isArray(pedido.items)) {
    source = pedido.items;
  } else if (Array.isArray(pedido.detalle)) {
    source = pedido.detalle;
  }

  return source.map((item: any) => {
    const cantidad = item?.cantidad ?? item?.quantity ?? 1;
    const precio = Number(item?.precioUnitario ?? item?.precio ?? item?.producto?.precio ?? 0);
    return {
      nombre: item?.producto?.nombre || item?.nombre || item?.producto?.titulo || 'Producto',
      cantidad,
      precio,
      subtotal: Number(item?.subtotal ?? (precio * cantidad)),
    };
  });
}

export default function PedidoDetalleAdmin() {
  const { id } = useLocalSearchParams();
  const pedidoId = Array.isArray(id) ? id[0] : id;
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingState, setUpdatingState] = useState(false);
  const requestIdRef = useRef(0);

  const { isChecking, isAuthorized } = useAdminRole();

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
      const data = await getPedido(pedidoId);
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const pedidoData = (data as any)?.data?.pedido || (data as any)?.pedido || (data as any) || null;
      const normalizedPedido = (pedidoData as PedidoDetalle) || null;

      if (normalizedPedido?.id && String(normalizedPedido.id) !== String(pedidoId)) {
        setPedido(null);
        return;
      }

      setPedido(normalizedPedido);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando el pedido:', err.message || error);
      if (currentRequestId === requestIdRef.current) {
        Alert.alert('Error', 'No se pudo cargar el pedido.');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  async function handleChangeStatus(nextState: string) {
    if (!pedidoId || updatingState) {
      return;
    }

    setUpdatingState(true);
    try {
      const response = await updatePedidoEstado(pedidoId, nextState);
      const updatedPedido = (response as any)?.data?.pedido || (response as any)?.pedido || null;

      if (updatedPedido) {
        setPedido((prev) => prev ? { ...prev, ...updatedPedido, estado: nextState } : updatedPedido);
      } else {
        setPedido((prev) => prev ? { ...prev, estado: nextState } : prev);
      }

      Alert.alert('Éxito', 'Estado del pedido actualizado.');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error actualizando estado:', err.message || error);
      Alert.alert('Error', 'No se pudo actualizar el estado del pedido.');
    } finally {
      setUpdatingState(false);
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
  const pedidoNumero = pedido.id || pedidoId;
  const cliente = pedido.usuario || pedido.cliente || {};
  const estado = String(pedido.estado || 'desconocido').toLowerCase();
  const fecha = pedido.createdAt || pedido.fecha || '';
  const items = normalizePedidoItems(pedido);

  const personalizados = Array.isArray(pedido.detallesPersonalizados)
    ? pedido.detallesPersonalizados.map((detalle: any) => ({
        nombre: detalle?.cotizacion?.nombre || detalle?.nombre || 'Personalizado',
        cantidad: detalle?.cantidad ?? detalle?.quantity ?? 1,
        precio: Number(detalle?.precioUnitario ?? detalle?.precio ?? detalle?.cotizacion?.precio ?? 0),
        subtotal: Number(detalle?.subtotal ?? (Number(detalle?.precioUnitario ?? detalle?.precio ?? detalle?.cotizacion?.precio ?? 0) * (detalle?.cantidad ?? detalle?.quantity ?? 1))),
      }))
    : [];
  const notas = pedido.notas || pedido.notasAdicionales || pedido.observaciones || '';

  const allItems = [...items, ...personalizados];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Pedido #{pedidoNumero}</Text>
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

      <View style={styles.actionsBox}>
        <Text style={styles.sectionTitle}>Cambiar estado del pedido</Text>
        <View style={styles.statusButtonsRow}>
          {statusOptions.map((option) => {
            const isActive = estado === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusButton,
                  isActive ? styles.statusButtonActive : styles.statusButtonInactive,
                  { borderColor: option.color },
                ]}
                onPress={() => handleChangeStatus(option.value)}
                disabled={isActive || updatingState}
              >
                <Text style={[styles.statusButtonText, isActive && { color: '#fff' }]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Artículos</Text>
      {allItems.length === 0 ? (
        <Text style={styles.emptyText}>No hay artículos registrados en este pedido.</Text>
      ) : (
        allItems.map((item: { nombre?: string; cantidad?: number; quantity?: number; precio?: number; subtotal?: number }, index: number) => (
          <View key={`${item.nombre || 'item'}-${index}`} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.nombre || `Artículo ${index + 1}`}</Text>
            <Text style={styles.itemQuantity}>Cantidad: {item.cantidad || item.quantity || 1}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.subtotal || item.precio)}</Text>
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
  actionsBox: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginTop: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonActive: {
    backgroundColor: '#7d2181',
    borderColor: '#7d2181',
  },
  statusButtonInactive: {
    backgroundColor: '#fff',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
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
