import { View, Text, StyleSheet } from 'react-native';

export default function ProductosAdmin() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Productos</Text>
      <Text>Gestión básica de productos para YESA.</Text>
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
});
