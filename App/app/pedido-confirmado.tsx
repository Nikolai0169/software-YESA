import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function PedidoConfirmado() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedido confirmado</Text>
      <Link href="/" style={styles.link}>
        Volver a inicio
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
    marginBottom: 16,
  },
  link: {
    color: '#0a84ff',
    fontSize: 16,
  },
});
