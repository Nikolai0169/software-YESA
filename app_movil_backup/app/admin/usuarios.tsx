import { View, Text, StyleSheet } from 'react-native';

export default function UsuariosAdmin() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios</Text>
      <Text>Gestión básica de usuarios para YESA.</Text>
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
