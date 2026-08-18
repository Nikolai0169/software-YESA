import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../../constants/theme';
import useAdminRole from '../../src/hooks/useAdminRole';
import {
  getCategorias,
  getSubcategorias,
  getProductos,
  getUsuarios,
  getPedidos,
} from '../../src/services/adminService';
import cotizacionesService from '../../src/services/cotizacionesService';

export default function DashboardAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const [stats, setStats] = useState<{
    categorias: number;
    subcategorias: number;
    productos: number;
    usuarios: number;
    pedidos: number;
    pedidosPendientes: number;
    cotizaciones: number;
    cotizacionesPendientes: number;
  }>({
    categorias: 0,
    subcategorias: 0,
    productos: 0,
    usuarios: 0,
    pedidos: 0,
    pedidosPendientes: 0,
    cotizaciones: 0,
    cotizacionesPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [categorias, subcategorias, productos, usuarios, pedidos, cotizaciones] = await Promise.all([
          getCategorias(),
          getSubcategorias(),
          getProductos(),
          getUsuarios(),
          getPedidos({ limite: 20 }),
          cotizacionesService.getCotizaciones(),
        ]);

        const pedidosList = Array.isArray(pedidos) ? pedidos : [];
        const cotizacionesList = Array.isArray(cotizaciones) ? cotizaciones : [];
        const pendingPedidos = pedidosList.filter((pedido) => pedido.estado === 'pendiente').length;
        const pendingCotizaciones = cotizacionesList.filter((cotizacion) => {
          const status = String(cotizacion.estado || '').toLowerCase();
          return status === 'pendiente' || cotizacion.precio === null || cotizacion.precio === undefined || Number(cotizacion.precio) <= 0;
        }).length;

        setStats({
          categorias: categorias.length,
          subcategorias: subcategorias.length,
          productos: productos.length,
          usuarios: usuarios.length,
          pedidos: pedidos.length,
          pedidosPendientes: pendingPedidos,
          cotizaciones: cotizacionesList.length,
          cotizacionesPendientes: pendingCotizaciones,
        });
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Error cargando estadísticas del panel admin:', err.message || error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (isChecking || loading) {
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
      <Text style={styles.title}>Panel de administración</Text>
      <Text style={styles.subtitle}>
        Control centralizado de categorías, productos, usuarios y pedidos.
      </Text>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Categorías</Text>
          <Text style={styles.cardValue}>{stats.categorias}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Subcategorías</Text>
          <Text style={styles.cardValue}>{stats.subcategorias}</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Productos</Text>
          <Text style={styles.cardValue}>{stats.productos}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Usuarios</Text>
          <Text style={styles.cardValue}>{stats.usuarios}</Text>
        </View>
      </View>

      <View style={styles.smallCardsRow}>
        <View style={styles.smallCard}>
          <Text style={styles.smallCardLabel}>Pedidos totales</Text>
          <Text style={styles.smallCardValue}>{stats.pedidos}</Text>
        </View>
        <View style={styles.smallCard}> 
          <Text style={styles.smallCardLabel}>Pendientes</Text>
          <Text style={styles.smallCardValue}>{stats.pedidosPendientes}</Text>
        </View>
      </View>

      <View style={styles.smallCardsRow}>
        <View style={styles.smallCard}>
          <Text style={styles.smallCardLabel}>Cotizaciones totales</Text>
          <Text style={styles.smallCardValue}>{stats.cotizaciones}</Text>
        </View>
        <View style={styles.smallCard}> 
          <Text style={styles.smallCardLabel}>Pendientes</Text>
          <Text style={styles.smallCardValue}>{stats.cotizacionesPendientes}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <Link href="/admin/categorias" asChild>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Administrar categorías</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/admin/subcategorias" asChild>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Administrar subcategorías</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/admin/productos" asChild>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Administrar productos</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/admin/cotizaciones" asChild>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Ver cotizaciones</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/admin/usuarios" asChild>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Administrar usuarios</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/admin/pedidos" asChild>
        <TouchableOpacity style={styles.actionSecondaryButton}>
          <Text style={styles.actionSecondaryText}>Ver pedidos</Text>
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
    paddingBottom: 32,
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
    color: Colors.light.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardLabel: {
    fontSize: 13,
    color: Colors.light.icon,
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  smallCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  smallCard: {
    flex: 1,
    backgroundColor: Colors.light.surfaceSoft,
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
  },
  smallCardLabel: {
    fontSize: 13,
    color: Colors.light.primaryLight,
    marginBottom: 8,
  },
  smallCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primaryDark,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  actionSecondaryButton: {
    borderColor: Colors.light.primary,
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  actionSecondaryText: {
    color: '#7d2181',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
});
