import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';

const modelos3D = [
  {
    id: '1',
    nombre: 'Modelo Cama YESA',
    descripcion: 'Vista de producto 3D en ángulo frontal con detalles de terminación y materiales.',
    imagen: 'https://via.placeholder.com/480x320.png?text=Modelo+3D+YESA+1',
  },
  {
    id: '2',
    nombre: 'Modelo Armario YESA',
    descripcion: 'Visualización de la estructura y dimensiones del producto en el catálogo.',
    imagen: 'https://via.placeholder.com/480x320.png?text=Modelo+3D+YESA+2',
  },
  {
    id: '3',
    nombre: 'Modelo Silla YESA',
    descripcion: 'Vista detallada de composición y acabado del producto.',
    imagen: 'https://via.placeholder.com/480x320.png?text=Modelo+3D+YESA+3',
  },
];

export default function ModalScreen() {
  const [selectedModel, setSelectedModel] = useState(modelos3D[0]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Visor de modelos 3D</Text>
      <Text style={styles.subtitle}>
        En la app móvil puedes explorar una vista previa de los modelos 3D disponibles. El visor presenta una vista de referencia y permite navegar entre productos.
      </Text>

      <View style={styles.previewContainer}>
        <Image source={{ uri: selectedModel.imagen }} style={styles.previewImage} resizeMode="cover" />
        <Text style={styles.previewTitle}>{selectedModel.nombre}</Text>
        <Text style={styles.previewDescription}>{selectedModel.descripcion}</Text>
      </View>

      <Text style={styles.sectionTitle}>Otros modelos</Text>
      {modelos3D.map((modelo) => (
        <TouchableOpacity
          key={modelo.id}
          style={[styles.modelCard, modelo.id === selectedModel.id && styles.modelCardSelected]}
          onPress={() => setSelectedModel(modelo)}
        >
          <Text style={styles.modelName}>{modelo.nombre}</Text>
          <Text style={styles.modelMeta}>Toca para ver detalles</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Nota</Text>
        <Text style={styles.noteText}>
          Estas vistas son de solo lectura. Para ver los detalles completos de un producto, abre su página dedicada en el catálogo.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f8f5ff',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 20,
    lineHeight: 22,
  },
  previewContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginBottom: 20,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: 220,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginHorizontal: 16,
    color: '#111827',
  },
  previewDescription: {
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    color: '#4b5563',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  modelCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  modelCardSelected: {
    backgroundColor: '#7c3aed',
  },
  modelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modelMeta: {
    marginTop: 4,
    color: '#4b5563',
  },
  noteBox: {
    marginTop: 24,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#fff7ed',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  noteText: {
    color: '#92400e',
    lineHeight: 22,
  },
});
