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
import { Link } from 'expo-router';
import useAdminRole from '../../src/hooks/useAdminRole';
import { getPedidos } from '../../src/services/adminService';
import { Colors } from '../../constants/theme';

const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return Colors.light.warning;
    case 'pagado':
      return '#06b6d4';
    case 'enviado':
      return '#3b82f6';
    case 'entregado':
      return Colors.light.success;
    case 'cancelado':
      return Colors.light.danger;
    default:
      return Colors.light.icon;
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

  useEffect(() => {
    loadPedidos();
  }, []);

  async function loadPedidos() {
    setLoading(true);
    try {
      const data = await getPedidos({ limite: 50 });
      setPedidos(Array.isArray(data) ? (data as any) : []);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando pedidos:', err.message || error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos.');
    } finally {
      setLoading(false);
    }
  }

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
        <ActivityIndicator size="large" color={Colors.light.primary} />
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

      {loading ? (
        <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
      ) : pedidos.length === 0 ? (
        <Text style={styles.emptyText}>No hay pedidos disponibles en este momento.</Text>
      ) : (
        pedidos.map(renderPedido)
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
  subtitle: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 18,
  },
  loader: {
    marginTop: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.icon,
    marginTop: 24,
    fontSize: 15,
  },
  itemContainer: {
    backgroundColor: Colors.light.surface,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
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
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  backButtonText: {
    textAlign: 'center',
    color: Colors.light.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});
