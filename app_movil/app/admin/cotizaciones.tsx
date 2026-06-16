import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import useAdminRole from '../../src/hooks/useAdminRole';
import { Colors } from '../../constants/theme';

export default function CotizacionesAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cotizaciones</Text>
      <Text style={styles.subtitle}>
        Aquí verás las cotizaciones de productos personalizados y podrás asignar precios por diseño.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Próximamente</Text>
        <Text style={styles.cardText}>
          Esta pantalla está disponible para mostrar cotizaciones en el panel de administración.
          Puedes usarla para gestionar precios, revisar subtotales y aprobar presupuestos.
        </Text>
      </View>

      <Link href="/admin/dashboard" asChild>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver al panel admin</Text>
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
  loadingText: {
    fontSize: 16,
    color: Colors.light.icon,
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
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: Colors.light.icon,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 16,
  },
  backButtonText: {
    color: Colors.light.surface,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});
