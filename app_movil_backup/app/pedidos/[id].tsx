import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';

export default function PedidoDetalle() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedido #{id}</Text>
      <Text>Detalle del pedido del cliente.</Text>
      <Link href="/mis-pedidos" style={styles.link}>
        Volver a mis pedidos
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
