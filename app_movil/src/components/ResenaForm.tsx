import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../api/apiClient';

interface Props {
  productoId: string;
  onResenaCreada: () => void;
}

export default function ResenaForm({ productoId, onResenaCreada }: Props) {
  const [visible, setVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [comentario, setComentario] = useState('');
  const [calificacion, setCalificacion] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleEnviar = async () => {
    if (!comentario.trim()) {
      Alert.alert('Error', 'El comentario no puede estar vacío.');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(`/resena/producto/${productoId}`, {
        productoId,
        nombre: nombre.trim() || 'Anónimo',
        calificacion,
        comentario: comentario.trim(),
      });
      Alert.alert('¡Gracias!', 'Tu reseña fue enviada correctamente.');
      setNombre('');
      setComentario('');
      setCalificacion(5);
      setVisible(false);
      onResenaCreada();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo enviar la reseña.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) {
    return (
      <TouchableOpacity style={styles.toggleButton} onPress={() => setVisible(true)}>
        <Text style={styles.toggleButtonText}>✍️ Escribir una reseña</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu reseña</Text>
      <Text style={styles.label}>Nombre (opcional)</Text>
      <TextInput style={styles.input} placeholder="Tu nombre" value={nombre} onChangeText={setNombre} />
      <Text style={styles.label}>Calificación</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setCalificacion(star)}>
            <Text style={{ fontSize: 32, color: star <= calificacion ? '#f59e0b' : '#d1d5db' }}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Comentario *</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Cuéntanos tu experiencia..."
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={4}
      />
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setVisible(false)} disabled={loading}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleEnviar} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Enviar reseña</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleButton: { marginTop: 12, marginBottom: 4, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#7c3aed', alignItems: 'center' },
  toggleButtonText: { color: '#7c3aed', fontWeight: '700', fontSize: 15 },
  container: { marginTop: 12, backgroundColor: '#fff', borderRadius: 18, padding: 18, elevation: 2 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 14, color: '#111827' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 15, color: '#111827', backgroundColor: '#f9fafb' },
  textarea: { height: 100, textAlignVertical: 'top' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#d1d5db' },
  cancelText: { color: '#6b7280', fontWeight: '600' },
  submitButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: '#7c3aed' },
  submitText: { color: '#fff', fontWeight: '700' },
});