import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function PedidosAdmin() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos</Text>
      <Text>Lista de pedidos del panel admin.</Text>
      <Link href="/admin/pedidos/1" style={styles.link}>
        Ver pedido ejemplo
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  link: {
    color: '#0a84ff',
    fontSize: 16,
    marginTop: 12,
  },
});
