import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Checkout() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Link href="/pedido-confirmado" style={styles.link}>
        Confirmar pedido simulado
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
