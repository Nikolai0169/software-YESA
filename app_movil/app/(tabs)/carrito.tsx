import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useCarrito } from '../../src/context/carritoContext';

export default function Carrito() {
  const { totalItems, total, loading } = useCarrito();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito</Text>
      {loading ? (
        <Text style={styles.message}>Cargando carrito...</Text>
      ) : (
        <>
          <Text style={styles.summary}>Productos: {totalItems}</Text>
          <Text style={styles.summary}>Total: ${total.toFixed(2)}</Text>
        </>
      )}
      <Link href="/checkout" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ir a checkout</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/" style={styles.link}>
        Volver a tienda
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  message: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 20,
  },
  summary: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#7d2181',
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  link: {
    color: '#0a84ff',
    fontSize: 16,
    textAlign: 'center',
  },
});
