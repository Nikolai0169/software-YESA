import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrito } from '../src/context/carritoContext';
import { useAuth } from '../src/context/authContext';
import pedidoService from '../src/services/pedidoService';

export default function Checkout() {
  const router = useRouter();
  const { items, vaciarCarrito } = useCarrito();
  const { user, isAuthenticated, isLoadingSession } = useAuth();
  const [direccion, setDireccion] = useState(user?.direccion || '');
  const [telefono, setTelefono] = useState(user?.telefono || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setDireccion(user.direccion || '');
      setTelefono(user.telefono || '');
    }
  }, [user]);

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      Alert.alert('Necesitas iniciar sesión', 'Inicia sesión para completar la compra.');
      router.push('/login');
      return;
    }

    if (!direccion.trim() || !telefono.trim()) {
      setError('La dirección y el teléfono son obligatorios para completar el pedido.');
      return;
    }

    if (!items || items.length === 0) {
      setError('No hay productos en el carrito para crear el pedido.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await pedidoService.crearPedido({
        direccionEnvio: direccion.trim(),
        telefono: telefono.trim(),
        metodoPago: 'efectivo',
        notasAdicionales: 'Pedido generado desde app móvil',
        items: items.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
        })),
      });

      await vaciarCarrito();
      router.replace('/pedido-confirmado');
    } catch (err: unknown) {
      console.error('Error al crear pedido:', err);
      const message = (err as any)?.message || 'No fue posible completar el pedido.';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingSession) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7d2181" />
        <Text style={styles.subtitle}>Verificando sesión...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.label}>Dirección de envío</Text>
      <TextInput
        style={styles.input}
        value={direccion}
        onChangeText={setDireccion}
        placeholder="Dirección"
      />
      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Teléfono"
        keyboardType="phone-pad"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirmar pedido</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  error: {
    color: '#b91c1c',
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#7d2181',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 12,
    fontSize: 16,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  link: {
    color: '#0a84ff',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#7d2181',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 8,
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700'
  }
});
