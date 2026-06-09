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
import useAdminRole from '../../src/hooks/useAdminRole';
import {
  getCategorias,
  getSubcategorias,
  getProductos,
  getUsuarios,
  getPedidos,
} from '../../src/services/adminService';

export default function DashboardAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const [stats, setStats] = useState<{
    categorias: number;
    subcategorias: number;
    productos: number;
    usuarios: number;
    pedidos: number;
    pedidosPendientes: number;
  }>({
    categorias: 0,
    subcategorias: 0,
    productos: 0,
    usuarios: 0,
    pedidos: 0,
    pedidosPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const [categorias, subcategorias, productos, usuarios, pedidos] = await Promise.all([
          getCategorias(),
          getSubcategorias(),
          getProductos(),
          getUsuarios(),
          getPedidos({ limite: 20 }),
        ]);

        const pending = Array.isArray(pedidos)
          ? pedidos.filter((pedido) => pedido.estado === 'pendiente').length
          : 0;

        setStats({
          categorias: categorias.length,
          subcategorias: subcategorias.length,
          productos: productos.length,
          usuarios: usuarios.length,
          pedidos: pedidos.length,
          pedidosPendientes: pending,
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
        <ActivityIndicator size="large" color="#7d2181" />
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

      <Text style={styles.sectionTitle}>Acciones rápidas</Text>
      <Link href="/admin/categorias" asChild>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Administrar categorías</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/admin/productos" asChild>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Administrar productos</Text>
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
    backgroundColor: '#f8f7fb',
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
    color: '#1f2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    color: '#6b7280',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#7d2181',
  },
  smallCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#fdf4ff',
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
  },
  smallCardLabel: {
    fontSize: 13,
    color: '#9333ea',
    marginBottom: 8,
  },
  smallCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6d28d9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#7d2181',
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
    borderColor: '#7d2181',
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
