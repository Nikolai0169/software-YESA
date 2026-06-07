import { View, Text, StyleSheet } from 'react-native';

export default function DashboardAdmin() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard Admin</Text>
      <Text>Panel administrativo básico de YESA.</Text>
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
